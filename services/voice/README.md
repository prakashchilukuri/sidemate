# SideMate Voice AI Microservice (FastAPI)

## Architecture Overview
The SideMate Voice AI service is a lightweight, asynchronous Python microservice designed for sub-350ms turnaround conversational voice sessions.

### Pipeline Stages
1. **Audio Ingestion**: Bidirectional streaming WebSocket (`/ws/voice/{session_id}`) receiving 24kHz PCM / Opus frames.
2. **VAD (Voice Activity Detection)**: Real-time speech frame boundary detection using Silero VAD.
3. **STT (Speech-to-Text)**: Streaming transcription (Whisper / Deepgram nova-2).
4. **LLM Orchestration**: SideMate dynamic prompt evaluation utilizing the employee's configured goals, knowledge sources, FAQs, and qualification checklist.
5. **TTS (Text-to-Speech)**: Low-latency streaming synthesis (Cartesia / ElevenLabs / OpenAI Audio).
6. **Telephony Bridge**: SIP trunking connector (Twilio / Telnyx / FreeSWITCH).

---

## Local Development

### 1. Python Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Docker Execution
```bash
docker build -t sidemate-voice .
docker run -p 8000:8000 sidemate-voice
```

---

## REST & WebSocket API Reference

| Endpoint | Protocol | Description |
| :--- | :--- | :--- |
| `GET /health` | HTTP | Service health check and latency status |
| `POST /v1/voice/session` | HTTP | Allocates new voice call session and returns WebSocket stream URL |
| `POST /v1/voice/webhook/telephony` | HTTP | Webhook receiver for carrier status events (ringing, answered, ended) |
| `POST /v1/voice/summarize` | HTTP | Extracts AI executive summaries, qualification status, and action items |
| `WS /ws/voice/{session_id}` | WebSocket | Real-time bidirectional audio stream and telemetry |
