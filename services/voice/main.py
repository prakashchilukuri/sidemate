"""Restricted single-worker voice lab. No telephony or booking simulations."""
import asyncio
import base64
import binascii
import hashlib
import hmac
import io
import os
import secrets
import time
import wave
from contextlib import asynccontextmanager
from dataclasses import dataclass, field
from pathlib import Path
from typing import Literal

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field, ValidationError

from .providers import FREE_REASONING_MODELS, ProviderError, VoiceProviders

load_dotenv(Path(__file__).with_name(".env"))
STATIC = Path(__file__).with_name("static")
MAX_BODY = 1_100_000
MAX_TURNS = 12
SESSION_SECONDS = 900


@dataclass
class Settings:
    access_key: str = field(default_factory=lambda: os.getenv("VOICE_LAB_ACCESS_KEY", ""))
    sarvam_key: str = field(default_factory=lambda: os.getenv("SARVAM_API_KEY", ""))
    openrouter_key: str = field(default_factory=lambda: os.getenv("OPENROUTER_API_KEY", ""))
    stt_model: str = field(default_factory=lambda: os.getenv("VOICE_STT_MODEL", "saaras:v4"))
    llm_model: str = field(default_factory=lambda: os.getenv("VOICE_LLM_MODEL", FREE_REASONING_MODELS[0]))
    tts_model: str = field(default_factory=lambda: os.getenv("VOICE_TTS_MODEL", "bulbul:v4-flash"))
    telugu_voice: str = field(default_factory=lambda: os.getenv("VOICE_TELUGU_SPEAKER", "kavitha_te_conversation"))
    english_voice: str = field(default_factory=lambda: os.getenv("VOICE_ENGLISH_SPEAKER", "simran_en_customer"))

    def missing(self):
        values = (("VOICE_LAB_ACCESS_KEY (32+ characters)", self.access_key if len(self.access_key) >= 32 else ""),
                  ("SARVAM_API_KEY", self.sarvam_key), ("OPENROUTER_API_KEY", self.openrouter_key))
        missing = [name for name, value in values if not value]
        if self.llm_model not in FREE_REASONING_MODELS:
            missing.append("VOICE_LLM_MODEL must be an approved free reasoning model")
        return missing


class SessionRequest(BaseModel):
    language: Literal["te-IN", "en-IN"] = "te-IN"
    business_context: str = Field(min_length=10, max_length=6000)


class TurnRequest(BaseModel):
    turn_id: str = Field(pattern=r"^[a-zA-Z0-9_-]{8,64}$")
    audio_base64: str = Field(min_length=60, max_length=1_070_000)


@dataclass
class Session:
    token: str
    config: SessionRequest
    expires_at: float
    history: list = field(default_factory=list)
    attempts: int = 0
    task: asyncio.Task | None = None
    last_id: str | None = None
    last_hash: str | None = None
    last_result: dict | None = None
    seen_ids: set = field(default_factory=set)
    closed: bool = False


async def read_model(request, model, limit):
    data = bytearray()
    async for chunk in request.stream():
        data.extend(chunk)
        if len(data) > limit:
            raise HTTPException(413, "Request is too large.")
    try:
        return model.model_validate_json(data)
    except (ValidationError, ValueError):
        raise HTTPException(422, "Invalid request fields.") from None


def decode_wav(encoded):
    try:
        data = base64.b64decode(encoded, validate=True)
        with wave.open(io.BytesIO(data), "rb") as audio:
            if audio.getnchannels() != 1 or audio.getsampwidth() != 2 or audio.getframerate() != 16000:
                raise ValueError()
            frames = audio.getnframes()
            duration = frames / 16000
            if not 0.2 <= duration <= 25 or len(audio.readframes(frames)) != frames * 2:
                raise ValueError()
        return data, duration
    except (binascii.Error, wave.Error, EOFError, ValueError):
        raise HTTPException(422, "Use a complete mono 16-bit, 16 kHz WAV between 0.2 and 25 seconds.") from None


def bearer(request):
    header = request.headers.get("authorization", "")
    return header[7:] if header.startswith("Bearer ") else ""


def create_app(settings=None, providers=None):
    settings = settings or Settings()
    sessions = {}

    @asynccontextmanager
    async def lifespan(app):
        async with httpx.AsyncClient(timeout=httpx.Timeout(25, connect=5)) as client:
            app.state.providers = providers or VoiceProviders(client, settings)
            async def reap_expired():
                while True:
                    await asyncio.sleep(30)
                    for key, session in list(sessions.items()):
                        if session.closed or session.expires_at <= time.time():
                            session.closed = True
                            if session.task and not session.task.done():
                                session.task.cancel()
                            session.history.clear()
                            session.last_result = None
                            del sessions[key]
            reaper = asyncio.create_task(reap_expired())
            try:
                yield
            finally:
                tasks = [reaper, *[s.task for s in sessions.values() if s.task and not s.task.done()]]
                for task in tasks:
                    task.cancel()
                await asyncio.gather(*tasks, return_exceptions=True)

    app = FastAPI(title="SideMate Voice Lab", version="0.2.0", lifespan=lifespan)
    app.state.sessions = sessions

    @app.middleware("http")
    async def security_headers(request, call_next):
        response = await call_next(request)
        response.headers["Cache-Control"] = "no-store"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["Referrer-Policy"] = "no-referrer"
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; media-src 'self' blob:; frame-ancestors 'none'; base-uri 'none'"
        return response

    def operator(request):
        if len(settings.access_key) < 32:
            raise HTTPException(503, "Configure VOICE_LAB_ACCESS_KEY with at least 32 characters.")
        if not hmac.compare_digest(bearer(request), settings.access_key):
            raise HTTPException(401, "Invalid lab access key.")

    def get_session(request, session_id):
        session = sessions.get(session_id)
        if not session or not hmac.compare_digest(bearer(request), session.token):
            raise HTTPException(401, "Invalid session credentials.")
        if session.closed or session.expires_at <= time.time():
            session.closed = True
            if session.task and not session.task.done():
                session.task.cancel()
            session.history.clear()
            session.last_result = None
            raise HTTPException(410, "Session ended or expired. Start a new session.")
        return session

    @app.get("/health")
    async def health():
        return {"status": "ok", "mode": "turn-based-lab", "providers_configured": not settings.missing(),
                "telephony_enabled": False}

    @app.get("/lab")
    async def lab():
        return FileResponse(STATIC / "index.html")

    @app.get("/v1/voice/config")
    async def config(request: Request):
        operator(request)
        return {"missing": settings.missing(), "models": {"stt": settings.stt_model, "llm": settings.llm_model, "tts": settings.tts_model},
                "llm_provider": "openrouter", "free_reasoning_models": FREE_REASONING_MODELS,
                "max_turns": MAX_TURNS, "session_seconds": SESSION_SECONDS, "max_audio_seconds": 25}

    @app.post("/v1/voice/session", status_code=201)
    async def create_session(request: Request):
        operator(request)
        config = await read_model(request, SessionRequest, 30_000)
        if settings.missing():
            raise HTTPException(503, "Missing server configuration: " + ", ".join(settings.missing()))
        for key, session in list(sessions.items()):
            if session.closed or session.expires_at <= time.time():
                if session.task and not session.task.done():
                    session.task.cancel()
                del sessions[key]
        if len(sessions) >= 5:
            raise HTTPException(429, "Lab capacity reached. End an existing session or wait for expiry.")
        session_id = secrets.token_urlsafe(24)
        session = Session(secrets.token_urlsafe(32), config, time.time() + SESSION_SECONDS)
        sessions[session_id] = session
        return {"session_id": session_id, "token": session.token, "expires_at": session.expires_at,
                "max_turns": MAX_TURNS, "mode": "turn-based-lab"}

    @app.post("/v1/voice/session/{session_id}/turn")
    async def turn(request: Request, session_id: str):
        session = get_session(request, session_id)
        payload = await read_model(request, TurnRequest, MAX_BODY)
        audio, duration = decode_wav(payload.audio_base64)
        digest = hashlib.sha256(audio).hexdigest()
        get_session(request, session_id)
        if session.task and not session.task.done():
            raise HTTPException(409, "A turn is already running.")
        if payload.turn_id == session.last_id:
            if digest != session.last_hash:
                raise HTTPException(409, "Turn ID was already used with different audio.")
            if session.last_result is not None:
                return session.last_result
            raise HTTPException(409, "This turn already failed. Record a new turn.")
        if session.attempts >= MAX_TURNS:
            raise HTTPException(429, "Session turn limit reached. Start a new session.")
        if payload.turn_id in session.seen_ids:
            raise HTTPException(409, "This earlier turn was already processed. Record a new turn.")
        session.attempts += 1
        session.seen_ids.add(payload.turn_id)
        session.last_id, session.last_hash, session.last_result = payload.turn_id, digest, None

        async def process():
            start = time.perf_counter()
            timings = {}
            provider = app.state.providers
            text = await provider.transcribe(audio)
            timings["stt_ms"] = round((time.perf_counter() - start) * 1000)
            if not text.strip():
                raise ProviderError("No speech was recognized. Please record again.", 422)
            marker = time.perf_counter()
            reply, usage = await provider.reply(session.config, session.history, text)
            timings["llm_ms"] = round((time.perf_counter() - marker) * 1000)
            marker = time.perf_counter()
            warning, audio_out = None, None
            try:
                audio_out = await provider.synthesize(reply, session.config.language)
            except ProviderError:
                warning = "The reply was generated, but speech generation failed. Read the reply below."
            timings["tts_ms"] = round((time.perf_counter() - marker) * 1000)
            timings["total_ms"] = round((time.perf_counter() - start) * 1000)
            if session.closed or session.expires_at <= time.time():
                raise ProviderError("Session ended before the response completed.", 410)
            session.history.extend([{"role": "user", "content": text}, {"role": "assistant", "content": reply}])
            result = {"turn_id": payload.turn_id, "transcript": text, "reply": reply, "audio_base64": audio_out,
                      "audio_mime_type": "audio/wav", "warning": warning, "timings": timings, "llm_usage": usage,
                      "input_audio_seconds": round(duration, 2), "turns_remaining": MAX_TURNS - session.attempts}
            session.last_result = result
            return result

        session.task = asyncio.create_task(process())
        try:
            return await asyncio.wait_for(session.task, timeout=115)
        except asyncio.TimeoutError:
            raise HTTPException(504, "Voice providers timed out. Record a new turn.") from None
        except asyncio.CancelledError:
            raise HTTPException(410, "Session was ended.") from None
        except ProviderError as error:
            raise HTTPException(error.status, error.message) from None

    @app.delete("/v1/voice/session/{session_id}")
    async def end_session(request: Request, session_id: str):
        session = get_session(request, session_id)
        session.closed = True
        if session.task and not session.task.done():
            session.task.cancel()
        session.history.clear()
        session.last_result = None
        return {"status": "ended"}

    @app.post("/v1/voice/summarize")
    @app.post("/v1/voice/webhook/telephony")
    async def not_implemented():
        return JSONResponse({"detail": "Not implemented in the browser voice milestone."}, status_code=501)

    app.mount("/static", StaticFiles(directory=STATIC), name="static")
    return app


app = create_app()
