"""Single-business Exotel callback pilot with a durable call log."""

import asyncio
import base64
import hmac
import io
import json
import math
import os
import re
import secrets
import sqlite3
import struct
import wave
from contextlib import closing
from pathlib import Path
from urllib.parse import urlsplit

import httpx
from fastapi import HTTPException, Request, WebSocket, WebSocketDisconnect

from .providers import ProviderError

RATE = 16000
FRAME_BYTES = 3200
FINAL = {"completed", "busy", "no-answer", "failed", "canceled"}


def setup_callbacks(app, settings, session_model, read_model, db_path=None):
    from pydantic import Field

    class CallbackRequest(session_model):
        request_id: str = Field(pattern=r"^[a-zA-Z0-9_-]{8,64}$")
        phone: str = Field(pattern=r"^\+91[6-9][0-9]{9}$")

    class LeadRequest(CallbackRequest):
        name: str = Field(min_length=1, max_length=120)
        source: str = Field(min_length=1, max_length=120)
        enquiry: str = Field(min_length=1, max_length=1000)
        consent_to_call: bool = Field(strict=True)

    account = os.getenv("EXOTEL_ACCOUNT_SID", "")
    api_key = os.getenv("EXOTEL_API_KEY", "")
    api_token = os.getenv("EXOTEL_API_TOKEN", "")
    caller_id = os.getenv("EXOTEL_CALLER_ID", "")
    test_number = os.getenv("EXOTEL_TEST_NUMBER", "")
    operator_key = os.getenv("EXOTEL_OPERATOR_KEY", "")
    origin = os.getenv("EXOTEL_STREAM_ORIGIN", "").rstrip("/")
    parsed = urlsplit(origin)
    enabled = bool(
        re.fullmatch(r"[A-Za-z0-9_-]+", account)
        and all((api_key, api_token, caller_id, test_number))
        and len(operator_key) >= 32 and operator_key != settings.access_key
        and parsed.scheme == "wss" and parsed.hostname and not parsed.username
        and not (parsed.path or parsed.query or parsed.fragment)
    )
    base_url = f"https://api.in.exotel.com/v1/Accounts/{account}/Calls"
    db_path = db_path or os.getenv("EXOTEL_CALLBACK_DB") or Path(__file__).with_name("callbacks.sqlite3")

    def connect():
        db = sqlite3.connect(db_path)
        db.row_factory = sqlite3.Row
        db.execute("""CREATE TABLE IF NOT EXISTS callbacks (
            id TEXT PRIMARY KEY, token TEXT NOT NULL, phone TEXT NOT NULL, config TEXT NOT NULL,
            sid TEXT, carrier_status TEXT NOT NULL, conversation_status TEXT NOT NULL,
            history TEXT NOT NULL, created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
        )""")
        db.execute("""CREATE TABLE IF NOT EXISTS pilot_leads (
            id TEXT PRIMARY KEY, payload TEXT NOT NULL,
            created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
        )""")
        db.execute("""CREATE TABLE IF NOT EXISTS sales_tasks (
            call_id TEXT PRIMARY KEY, status TEXT NOT NULL, transcript TEXT NOT NULL,
            conversation_status TEXT NOT NULL
        )""")
        return db

    def read(call_id):
        with closing(connect()) as db:
            return db.execute("SELECT * FROM callbacks WHERE id = ?", (call_id,)).fetchone()

    def view(row):
        return {"id": row["id"], "carrier_call_id": row["sid"], "carrier_status": row["carrier_status"],
                "conversation_status": row["conversation_status"], "transcript": json.loads(row["history"])}

    def save_conversation(call_id, status, history):
        with closing(connect()) as db, db:
            db.execute("UPDATE callbacks SET conversation_status = ?, history = ? WHERE id = ?",
                       (status, json.dumps(history, ensure_ascii=False), call_id))
            db.execute("""INSERT INTO sales_tasks
                SELECT id, 'needs_review', ?, ? FROM pilot_leads WHERE id = ?
                ON CONFLICT(call_id) DO UPDATE SET transcript=excluded.transcript,
                    conversation_status=excluded.conversation_status""",
                (json.dumps(history, ensure_ascii=False), status, call_id))

    def operator(request):
        if not enabled:
            raise HTTPException(503, "Callback pilot is not configured.")
        expected = f"Bearer {operator_key}".encode()
        if not hmac.compare_digest(request.headers.get("authorization", "").encode(), expected):
            raise HTTPException(401, "Invalid callback operator key.")

    @app.post("/v1/voice/callbacks", status_code=202)
    async def start_callback(request: Request):
        operator(request)
        payload = await read_model(request, CallbackRequest, 30_000)
        return await dispatch(payload)

    @app.post("/v1/voice/leads", status_code=202)
    async def intake_lead(request: Request):
        operator(request)
        payload = await read_model(request, LeadRequest, 30_000)
        if not payload.consent_to_call:
            raise HTTPException(422, "Explicit permission to call is required.")
        if payload.phone != test_number:
            raise HTTPException(403, "Use the configured test handset number.")
        if settings.missing():
            raise HTTPException(503, "Callback pilot is not configured.")
        encoded = payload.model_dump_json()
        with closing(connect()) as db, db:
            db.execute("INSERT OR IGNORE INTO pilot_leads (id, payload) VALUES (?, ?)",
                       (payload.request_id, encoded))
            existing = db.execute("SELECT payload FROM pilot_leads WHERE id = ?",
                                  (payload.request_id,)).fetchone()
            if existing["payload"] != encoded:
                raise HTTPException(409, "Request ID belongs to a different lead.")
        result = await dispatch(payload)
        return {"lead_id": payload.request_id, "call": result}

    @app.get("/v1/voice/sales-tasks")
    async def sales_tasks(request: Request):
        operator(request)
        with closing(connect()) as db:
            rows = db.execute("""SELECT t.*, l.payload FROM sales_tasks t
                JOIN pilot_leads l ON l.id=t.call_id ORDER BY l.created_at DESC LIMIT 100""").fetchall()
        return {"items": [{"call_id": r["call_id"], "status": r["status"],
                           "conversation_status": r["conversation_status"],
                           "lead": {k: json.loads(r["payload"])[k]
                                    for k in ("name", "phone", "source", "enquiry")},
                           "transcript": json.loads(r["transcript"])} for r in rows]}

    async def dispatch(payload):
        if settings.missing():
            raise HTTPException(503, "Callback pilot is not configured.")
        if payload.phone != test_number:
            raise HTTPException(403, "Use the configured test handset number.")
        config = session_model(language=payload.language, business_context=payload.business_context).model_dump_json()
        token = secrets.token_urlsafe(32)
        with closing(connect()) as db, db:
            inserted = db.execute(
                """INSERT OR IGNORE INTO callbacks
                   (id, token, phone, config, carrier_status, conversation_status, history)
                   VALUES (?, ?, ?, ?, 'submitting', 'waiting', '[]')""",
                (payload.request_id, token, payload.phone, config),
            ).rowcount
        if not inserted:
            row = read(payload.request_id)
            if row["phone"] != payload.phone or row["config"] != config:
                raise HTTPException(409, "Request ID belongs to a different callback.")
            return view(row)

        stream_url = f"{origin}/v1/voice/callbacks/{payload.request_id}/media?token={token}&sample-rate={RATE}"
        fields = {"From": payload.phone, "CallerId": caller_id, "StreamUrl": stream_url,
                  "StreamType": "bidirectional", "Record": "false", "TimeLimit": "180"}
        status, sid = "submission-unknown", None
        try:
            response = await app.state.http.post(f"{base_url}/connect", auth=(api_key, api_token),
                                                 files={key: (None, value) for key, value in fields.items()})
            if 400 <= response.status_code < 500:
                status = "rejected"
            else:
                response.raise_for_status()
                call = response.json()["Call"]
                if re.fullmatch(r"[A-Za-z0-9_-]+", call["Sid"]):
                    sid, status = call["Sid"], call["Status"]
                    if status not in FINAL | {"queued", "in-progress", "ringing"}:
                        status = "submission-unknown"
        except (httpx.HTTPError, ValueError, KeyError, TypeError):
            # The carrier might have accepted the call. Keep the ID reserved.
            pass
        with closing(connect()) as db, db:
            db.execute("""UPDATE callbacks SET sid = COALESCE(sid, ?),
                          carrier_status = CASE WHEN sid IS NULL THEN ? ELSE carrier_status END WHERE id = ?""",
                       (sid, status, payload.request_id))
        return view(read(payload.request_id))

    @app.get("/v1/voice/callbacks/{call_id}")
    async def callback_status(call_id: str, request: Request):
        operator(request)
        row = read(call_id)
        if row is None:
            raise HTTPException(404, "Callback not found.")
        if enabled and row["sid"] and row["carrier_status"] not in FINAL:
            try:
                response = await app.state.http.get(f"{base_url}/{row['sid']}.json", auth=(api_key, api_token))
                response.raise_for_status()
                call = response.json()["Call"]
                if call["Sid"] != row["sid"]:
                    raise ValueError()
                if call["Status"] not in FINAL | {"queued", "in-progress", "ringing"}:
                    raise ValueError()
                with closing(connect()) as db, db:
                    db.execute("UPDATE callbacks SET carrier_status = ? WHERE id = ? AND carrier_status = ?",
                               (call["Status"], call_id, row["carrier_status"]))
            except (httpx.HTTPError, ValueError, KeyError, TypeError):
                raise HTTPException(502, "Exotel status is temporarily unavailable.") from None
            row = read(call_id)
        return view(row)

    @app.websocket("/v1/voice/callbacks/{call_id}/media")
    async def media(socket: WebSocket, call_id: str):
        row = read(call_id) if enabled else None
        if (not row or not row["token"] or settings.missing()
            or not hmac.compare_digest(socket.query_params.get("token", "").encode(), row["token"].encode())):
            await socket.close(code=1008)
            return
        await socket.accept()
        config = session_model.model_validate_json(row["config"])
        provider = app.state.providers
        history = []
        response_task = None
        stream_id = None
        playback_mark = None
        pending = bytearray()
        silence = 0
        outcome = "disconnected"

        async def speak(text):
            nonlocal playback_mark
            wav = await provider.synthesize(text, config.language, sample_rate=RATE)
            with wave.open(io.BytesIO(base64.b64decode(wav, validate=True)), "rb") as audio:
                if (audio.getframerate(), audio.getnchannels(), audio.getsampwidth()) != (RATE, 1, 2):
                    raise ValueError("Unexpected TTS audio format.")
                pcm = audio.readframes(audio.getnframes())
            playback_mark = secrets.token_hex(8)
            for offset in range(0, len(pcm), FRAME_BYTES):
                frame = pcm[offset:offset + FRAME_BYTES].ljust(FRAME_BYTES, b"\x00")
                await socket.send_json({"event": "media", "stream_sid": stream_id,
                                        "media": {"payload": base64.b64encode(frame).decode()}})
            await socket.send_json({"event": "mark", "stream_sid": stream_id, "mark": {"name": playback_mark}})

        async def answer(pcm):
            nonlocal outcome
            try:
                buffer = io.BytesIO()
                with wave.open(buffer, "wb") as audio:
                    audio.setparams((1, 2, RATE, 0, "NONE", "not compressed"))
                    audio.writeframes(pcm)
                text = await provider.transcribe(buffer.getvalue())
                if not text.strip():
                    await speak("దయచేసి మళ్లీ చెప్పండి." if config.language == "te-IN" else "Please say that again.")
                    return
                reply, _ = await provider.reply(config, history, text)
                history.extend([{"role": "user", "content": text}, {"role": "assistant", "content": reply}])
                save_conversation(call_id, "speaking", history)
                await speak(reply)
            except (ProviderError, ValueError, wave.Error, EOFError):
                outcome = "voice-error"

        claimed = False
        try:
            async with asyncio.timeout(185):
                while True:
                    message = await socket.receive_json()
                    if outcome == "voice-error":
                        break
                    event = message["event"]
                    if event == "connected":
                        continue
                    if event == "start" and not claimed:
                        start = message["start"]
                        fmt = start["media_format"]
                        if (start["account_sid"] != account or not re.fullmatch(r"[A-Za-z0-9_-]+", start["call_sid"])
                            or fmt["encoding"] != "audio/x-raw" or int(fmt["sample_rate"]) != RATE or int(fmt["bit_rate"]) != 16):
                            raise ValueError("Invalid stream start.")
                        with closing(connect()) as db, db:
                            claimed = bool(db.execute("""UPDATE callbacks SET sid = ?, carrier_status = 'in-progress', token = '',
                                conversation_status = 'speaking' WHERE id = ? AND conversation_status = 'waiting'
                                AND token = ? AND (sid IS NULL OR sid = ?)
                                AND created_at >= CAST(strftime('%s', 'now') AS INTEGER) - 300
                                AND carrier_status IN ('submitting', 'submission-unknown', 'queued', 'ringing', 'in-progress')""",
                                (start["call_sid"], call_id, row["token"], start["call_sid"])).rowcount)
                        if not claimed:
                            raise ValueError("Call already attached.")
                        stream_id = start["stream_sid"]
                        await speak("నమస్కారం. నేను సైడ్‌మేట్ వాయిస్ అసిస్టెంట్‌ని. మీకు ఎలా సహాయం చేయగలను?"
                                    if config.language == "te-IN" else "Hello, this is the SideMate automated assistant. How can I help?")
                        continue
                    if not claimed or message.get("stream_sid") != stream_id:
                        raise ValueError("Unexpected stream.")
                    if event == "stop":
                        if outcome != "voice-error":
                            outcome = "ended"
                        break
                    if event == "mark" and message["mark"]["name"] == playback_mark:
                        playback_mark = None
                    if event != "media" or playback_mark or (response_task and not response_task.done()):
                        continue
                    if len(message["media"]["payload"]) > 134_000:
                        raise ValueError("Audio frame too large.")
                    frame = base64.b64decode(message["media"]["payload"], validate=True)
                    if not frame or len(frame) % 2:
                        raise ValueError("Invalid audio frame.")
                    rms = math.sqrt(sum(value * value for (value,) in struct.iter_unpack("<h", frame)) / (len(frame) // 2))
                    if rms >= 250:
                        silence = 0
                    elif pending:
                        silence += len(frame)
                    else:
                        continue
                    pending.extend(frame)
                    if silence >= RATE * 2 * 0.7 or len(pending) >= RATE * 2 * 12:
                        utterance = bytes(pending[:RATE * 2 * 12])
                        pending.clear()
                        silence = 0
                        response_task = asyncio.create_task(answer(utterance))
            await socket.close(code=1011 if outcome == "voice-error" else 1000)
        except WebSocketDisconnect:
            pass
        except TimeoutError:
            if outcome != "voice-error":
                outcome = "timed-out"
            await socket.close(code=1000)
        except (KeyError, TypeError, ValueError, ProviderError, wave.Error, EOFError, struct.error):
            outcome = "voice-error"
            await socket.close(code=1011)
        finally:
            if response_task:
                response_task.cancel()
                await asyncio.gather(response_task, return_exceptions=True)
            if claimed:
                save_conversation(call_id, outcome, history)

    return enabled
