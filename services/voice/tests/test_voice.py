import asyncio
import base64
import io
import json
import time
import wave

import httpx
import pytest
from fastapi.testclient import TestClient

from services.voice.main import Settings, SessionRequest, create_app
from services.voice.providers import ProviderError, VoiceProviders

KEY = "test-only-operator-key-32-characters-long"
AUTH = {"Authorization": "Bearer " + KEY}


def wav(seconds=0.3, rate=16000):
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as audio:
        audio.setnchannels(1)
        audio.setsampwidth(2)
        audio.setframerate(rate)
        audio.writeframes(b"\0\0" * int(rate * seconds))
    return base64.b64encode(buffer.getvalue()).decode()


class FakeProviders:
    def __init__(self):
        self.calls = 0
        self.history = []
        self.fail = None
        self.delay = 0

    async def transcribe(self, audio):
        self.calls += 1
        if self.delay:
            await asyncio.sleep(self.delay)
        if self.fail == "stt":
            raise ProviderError("Recognition unavailable.")
        return "" if self.fail == "empty" else "మీ సేవల గురించి చెప్పండి"

    async def reply(self, config, history, text):
        self.history = list(history)
        if self.fail == "llm":
            raise ProviderError("Dialogue unavailable.")
        return "మేము వ్యాపార సహాయం అందిస్తాము.", {"input_tokens": 12, "output_tokens": 8}

    async def synthesize(self, text, language):
        if self.fail == "tts":
            raise ProviderError("Speech unavailable.")
        return wav()


@pytest.fixture
def lab():
    fake = FakeProviders()
    settings = Settings(access_key=KEY, sarvam_key="test-sarvam", openrouter_key="test-openrouter")
    app = create_app(settings, fake)
    with TestClient(app) as client:
        yield client, fake, app


def session(client):
    response = client.post("/v1/voice/session", headers=AUTH, json={"language": "te-IN", "business_context": "SideMate provides business assistance."})
    assert response.status_code == 201
    value = response.json()
    return "/v1/voice/session/" + value["session_id"], {"Authorization": "Bearer " + value["token"]}


def send(client, path, headers, turn_id="turn-0001", audio=None):
    return client.post(path + "/turn", headers=headers, json={"turn_id": turn_id, "audio_base64": audio or wav()})


def test_authentication_and_missing_configuration(lab):
    client, _, _ = lab
    assert client.post("/v1/voice/session", json={}).status_code == 401
    assert client.get("/v1/voice/config").status_code == 401
    with TestClient(create_app(Settings(access_key=KEY, sarvam_key="", openrouter_key=""))) as missing:
        response = missing.post("/v1/voice/session", headers=AUTH, json={"business_context": "A test business"})
        assert response.status_code == 503
        assert "SARVAM_API_KEY" in response.text


def test_turn_context_timing_and_replay(lab):
    client, fake, _ = lab
    path, auth = session(client)
    first = send(client, path, auth)
    assert first.status_code == 200
    assert first.json()["transcript"] == "మీ సేవల గురించి చెప్పండి"
    assert set(first.json()["timings"]) == {"stt_ms", "llm_ms", "tts_ms", "total_ms"}
    assert send(client, path, auth).json() == first.json()
    assert fake.calls == 1
    assert send(client, path, auth, "turn-0002").status_code == 200
    assert len(fake.history) == 2
    assert send(client, path, auth).status_code == 409
    assert fake.calls == 2


def test_session_isolation_end_and_expiry(lab):
    client, fake, app = lab
    path, auth = session(client)
    _, other_auth = session(client)
    assert send(client, path, other_auth).status_code == 401
    assert send(client, path, AUTH).status_code == 401
    assert client.delete(path, headers=auth).status_code == 200
    assert send(client, path, auth).status_code == 410
    path, auth = session(client)
    app.state.sessions[path.split("/")[-1]].expires_at = time.time() - 1
    assert send(client, path, auth).status_code == 410
    assert fake.calls == 0


@pytest.mark.parametrize("audio", ["x" * 100, wav(0.1), wav(25.1), wav(rate=8000)])
def test_invalid_audio_never_calls_providers(lab, audio):
    client, fake, _ = lab
    path, auth = session(client)
    assert send(client, path, auth, audio=audio).status_code == 422
    assert fake.calls == 0


def test_size_limits(lab):
    client, fake, _ = lab
    path, auth = session(client)
    assert client.post(path + "/turn", headers=auth, content=b"x" * 1_100_001).status_code == 413
    assert fake.calls == 0


@pytest.mark.parametrize("stage,status", [("stt", 502), ("llm", 502), ("empty", 422)])
def test_failed_turns_do_not_fabricate_success(lab, stage, status):
    client, fake, app = lab
    path, auth = session(client)
    fake.fail = stage
    response = send(client, path, auth)
    assert response.status_code == status
    assert "reply" not in response.json()
    assert not app.state.sessions[path.split("/")[-1]].history
    assert send(client, path, auth).status_code == 409


def test_speech_failure_keeps_text_with_warning(lab):
    client, fake, _ = lab
    path, auth = session(client)
    fake.fail = "tts"
    result = send(client, path, auth).json()
    assert result["audio_base64"] is None
    assert result["reply"] and result["warning"]


def test_capacity_and_attempt_limits(lab):
    client, fake, _ = lab
    path, auth = session(client)
    for index in range(12):
        assert send(client, path, auth, f"turn-{index:04d}").status_code == 200
    assert send(client, path, auth, "turn-9999").status_code == 429
    assert fake.calls == 12
    for _ in range(4):
        session(client)
    assert client.post("/v1/voice/session", headers=AUTH, json={"business_context": "A test business"}).status_code == 429


def test_concurrent_turn_and_cancellation(lab):
    client, fake, app = lab
    path, auth = session(client)
    fake.delay = 3
    import concurrent.futures
    with concurrent.futures.ThreadPoolExecutor() as pool:
        pending = pool.submit(send, client, path, auth)
        deadline = time.monotonic() + 2
        while not fake.calls and time.monotonic() < deadline:
            time.sleep(0.01)
        assert fake.calls == 1
        assert send(client, path, auth, "turn-other").status_code == 409
        assert client.delete(path, headers=auth).status_code == 200
        assert pending.result(timeout=3).status_code == 410
    assert not app.state.sessions[path.split("/")[-1]].history


def test_removed_simulations_and_static_lab(lab):
    client, _, _ = lab
    assert client.post("/v1/voice/summarize", json={}).status_code == 501
    assert client.post("/v1/voice/webhook/telephony", json={}).status_code == 501
    response = client.get("/lab")
    assert response.status_code == 200 and "Record message" in response.text
    assert "no-store" in response.headers["cache-control"]
    assert client.get("/static/lab.js").status_code == 200
    assert client.get("/health").json()["telephony_enabled"] is False


def test_real_adapters_wire_contracts():
    requests = []
    def handler(request):
        requests.append(request)
        if request.url.path == "/speech-to-text":
            assert request.headers["api-subscription-key"] == "sarvam-secret"
            assert b"saaras:v4" in request.content and b"RIFF" in request.content
            return httpx.Response(200, json={"transcript": "Hello"})
        payload = json.loads(request.content)
        if request.url.path == "/api/v1/chat/completions":
            assert request.url.host == "openrouter.ai"
            assert request.headers["authorization"] == "Bearer openrouter-secret"
            assert payload["messages"][-1]["content"] == "Hello"
            assert all(model.endswith(":free") for model in payload["models"])
            assert payload["provider"]["max_price"] == {"prompt": 0, "completion": 0, "request": 0}
            assert payload["reasoning"] == {"effort": "high", "exclude": True}
            return httpx.Response(200, json={"choices": [{"finish_reason": "stop", "message": {"content": "Welcome", "reasoning": "private reasoning never spoken"}}], "model": payload["models"][0], "usage": {"prompt_tokens": 10, "cost": 0}})
        assert payload["language_code"] == "te-IN"
        assert payload["speaker"] == "kavitha_te_conversation"
        return httpx.Response(200, json={"audios": [wav()]})
    async def run():
        async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as client:
            providers = VoiceProviders(client, Settings(sarvam_key="sarvam-secret", openrouter_key="openrouter-secret"))
            text = await providers.transcribe(base64.b64decode(wav()))
            reply, usage = await providers.reply(SessionRequest(business_context="Test company facts"), [], text)
            assert reply == "Welcome" and usage["input_tokens"] == 10
            assert await providers.synthesize(reply, "te-IN") == wav()
    asyncio.run(run())
    assert len(requests) == 3


@pytest.mark.parametrize("model", ["openai/gpt-6-luna", "openrouter/free", "unknown/model:free", "nvidia/nemotron-3-ultra-550b-a55b"])
def test_paid_or_unapproved_models_blocked_before_network(model):
    async def run():
        def forbidden(request):
            pytest.fail("Unapproved model reached the network")
        async with httpx.AsyncClient(transport=httpx.MockTransport(forbidden)) as client:
            provider = VoiceProviders(client, Settings(llm_model=model))
            with pytest.raises(ProviderError, match="approved free"):
                await provider.reply(SessionRequest(business_context="Test company facts"), [], "Hello")
    asyncio.run(run())


@pytest.mark.parametrize("choice", [
    {"finish_reason": "length", "message": {"content": "Partial"}},
    {"finish_reason": "stop", "message": {"content": None, "reasoning": "Only reasoning"}},
    {"finish_reason": "stop", "message": {"content": ""}},
])
def test_reasoning_only_and_truncated_replies_are_not_spoken(choice):
    async def run():
        async with httpx.AsyncClient(transport=httpx.MockTransport(lambda req: httpx.Response(200, json={"choices": [choice]}))) as client:
            provider = VoiceProviders(client, Settings())
            with pytest.raises(ProviderError, match="incomplete or invalid"):
                await provider.reply(SessionRequest(business_context="Test company facts"), [], "Hello")
    asyncio.run(run())


def test_provider_errors_redacted():
    async def run():
        async with httpx.AsyncClient(transport=httpx.MockTransport(lambda request: httpx.Response(401, text="secret-token-private-transcript"))) as client:
            provider = VoiceProviders(client, Settings())
            with pytest.raises(ProviderError) as caught:
                await provider.transcribe(b"test")
            assert "secret-token" not in str(caught.value)
    asyncio.run(run())
