import base64
import json
import struct
from urllib.parse import urlsplit

import httpx
import pytest
from fastapi.testclient import TestClient

from services.voice.main import Settings, create_app
from services.voice.tests.test_voice import FakeProviders, KEY, wav


@pytest.mark.parametrize("from_lead", [False, True])
def test_callback_dials_once_and_persists_voice_outcome(monkeypatch, tmp_path, from_lead):
    operator_key = "callback-operator-only-test-key-32"
    config = {
        "EXOTEL_ACCOUNT_SID": "test-account",
        "EXOTEL_API_KEY": "test-api-key",
        "EXOTEL_API_TOKEN": "test-api-token",
        "EXOTEL_OPERATOR_KEY": operator_key,
        "EXOTEL_CALLER_ID": "04000000000",
        "EXOTEL_TEST_NUMBER": "+919000000000",
        "EXOTEL_STREAM_ORIGIN": "wss://voice.example.com",
    }
    for name, value in config.items():
        monkeypatch.setenv(name, value)

    stream = []

    def carrier(request):
        assert request.url.host == "api.in.exotel.com"
        if request.method == "GET":
            return httpx.Response(200, json={"Call": {"Sid": "CA-test", "Status": "completed"}})
        assert request.url.path.endswith("/Calls/connect")
        body = request.content.decode()
        assert '+919000000000' in body and 'bidirectional' in body
        assert 'name="Record"\r\n\r\nfalse' in body
        stream.append(urlsplit(body[body.index("wss://"):].splitlines()[0]))
        return httpx.Response(200, json={"Call": {"Sid": "CA-test", "Status": "queued"}})

    class Voice(FakeProviders):
        async def synthesize(self, text, language, sample_rate=24000):
            return wav(rate=sample_rate)

    settings = Settings(access_key=KEY, sarvam_key="test-sarvam", openrouter_key="test-openrouter")
    transport = httpx.MockTransport(carrier)
    db_path = tmp_path / "calls.sqlite3"
    auth = {"Authorization": f"Bearer {operator_key}"}
    endpoint = "/v1/voice/callbacks"
    payload = {"phone": config["EXOTEL_TEST_NUMBER"], "request_id": "test-call-1",
               "language": "te-IN", "business_context": "The shop opens at 9 AM and closes at 6 PM."}
    submit_endpoint = "/v1/voice/leads" if from_lead else endpoint
    if from_lead:
        payload.update(name="Pilot customer", source="test-form", enquiry="Opening hours",
                       consent_to_call=True)
    with TestClient(create_app(settings, Voice(), db_path, transport)) as client:
        assert client.post(submit_endpoint, json=payload, headers={"Authorization": f"Bearer {KEY}"}).status_code == 401
        assert client.post(submit_endpoint, json={**payload, "phone": "+919000000001"}, headers=auth).status_code == 403
        if from_lead:
            for invalid in (False, "true"):
                assert client.post(submit_endpoint, json={**payload, "consent_to_call": invalid}, headers=auth).status_code == 422
            assert not stream
        for _ in range(2):
            assert client.post(submit_endpoint, json=payload, headers=auth).status_code == 202
        if from_lead:
            assert client.post(submit_endpoint, json={**payload, "enquiry": "Changed enquiry"}, headers=auth).status_code == 409
        assert len(stream) == 1
        path = f"{stream[0].path}?{stream[0].query}"
        with client.websocket_connect(path) as ws:
            ws.send_json({"event": "start", "start": {
                "account_sid": "test-account", "call_sid": "CA-test", "stream_sid": "MZ-test",
                "media_format": {"encoding": "audio/x-raw", "sample_rate": "16000", "bit_rate": "16"},
            }})

            def receive_reply():
                assert len(base64.b64decode(ws.receive_json()["media"]["payload"])) == 3200
                ws.receive_json()
                ws.receive_json()
                mark = ws.receive_json()["mark"]
                ws.send_json({"event": "mark", "stream_sid": "MZ-test", "mark": mark})

            receive_reply()
            for frame in [struct.pack("<h", 1000) * 1600] * 3 + [bytes(3200)] * 7:
                ws.send_json({"event": "media", "stream_sid": "MZ-test",
                              "media": {"payload": base64.b64encode(frame).decode()}})
            receive_reply()
            ws.send_json({"event": "stop", "stream_sid": "MZ-test"})
            assert ws.receive()["type"] == "websocket.close"

    with TestClient(create_app(settings, Voice(), db_path, transport)) as client:
        result = client.get(endpoint + "/test-call-1", headers=auth).json()
        assert result["carrier_status"] == "completed"
        assert result["conversation_status"] == "ended"
        assert [entry["role"] for entry in result["transcript"]] == ["user", "assistant"]
        assert client.get("/v1/voice/sales-tasks").status_code == 401
        tasks = client.get("/v1/voice/sales-tasks", headers=auth).json()["items"]
        assert len(tasks) == (1 if from_lead else 0)
        if from_lead:
            assert tasks[0]["status"] == "needs_review"
            assert tasks[0]["lead"]["name"] == "Pilot customer"
            assert tasks[0]["transcript"] == result["transcript"]
            review_url = "/v1/voice/sales-tasks/test-call-1/review"
            review = {"version": 0, "disposition": "qualified", "requirement": "2BHK",
                      "budget": "", "timeline": "", "owner": "Pilot salesperson",
                      "next_action": "Ask about budget"}
            assert client.post(review_url, json=review).status_code == 401
            assert client.post(review_url, json={**review, "requirement": " "}, headers=auth).status_code == 422
            assert client.post(review_url, json={**review, "owner": " "}, headers=auth).status_code == 422
            assert client.post(review_url.replace("test-call-1", "missing-call"), json=review, headers=auth).status_code == 404
            saved = client.post(review_url, json=review, headers=auth)
            assert saved.status_code == 200 and saved.json()["version"] == 1
            assert client.post(review_url, json=review, headers=auth).status_code == 409
    if from_lead:
        with TestClient(create_app(settings, Voice(), db_path, transport)) as client:
            persisted = client.get("/v1/voice/sales-tasks", headers=auth).json()["items"][0]
            assert persisted["review"]["requirement"] == "2BHK"
            assert persisted["review"]["budget"] == ""
            assert persisted["version"] == 1
