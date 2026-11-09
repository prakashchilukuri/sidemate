# Browser voice milestone

This is a restricted internal, **turn-based** lab. It sends real requests to Sarvam recognition, OpenRouter Chat Completions and Sarvam synthesis when credentials are configured. No runtime fake provider or fallback reply is enabled. Test doubles exist only under `tests/`.

## Run locally

From the repository root with Python 3.11+:

```powershell
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r services/voice/requirements.txt
Copy-Item services/voice/.env.example services/voice/.env
```

Edit `services/voice/.env` locally. Set `SARVAM_API_KEY`, `OPENROUTER_API_KEY`, and a separate random `VOICE_LAB_ACCESS_KEY` of at least 32 characters. Generate the latter with `python -c "import secrets; print(secrets.token_urlsafe(32))"`. Do not paste provider keys into the browser or commit them.

```powershell
.venv/Scripts/python.exe -m uvicorn services.voice.main:app --host 127.0.0.1 --port 8000 --workers 1
```

Open http://localhost:8000/lab in a current Chrome/Edge browser. Enter the lab key, choose Telugu or English, enter approved business facts, and start. Click Record, speak, then Send recording. Stop playback is manual; automatic interruption detection is a later milestone. HTTPS or localhost is required for microphone access.

The Next.js entry page is `/dashboard/voice-lab`; `VOICE_LAB_URL` configures its link at build time. The lab can also run independently. Existing dashboard authentication is still demo code; this lab does not trust it.

For Docker Compose, set the three keys in the repository-root `.env`, then run `docker compose up --build voice-service`. The voice port binds only to localhost. Do not publish this lab as a customer service. The Docker build excludes `.env` files. `docker compose` itself was not exercised in this implementation session.

## Actual behavior

- WAV capture uses AudioWorklet; browser downsamples to mono 16-bit 16 kHz PCM. Server independently validates format, duration and byte limits.
- Each utterance is uploaded after recording, then recognition, dialogue and synthesis execute sequentially. This is **not** streaming audio or a latency benchmark.
- Recognition preserves the original language. Reply language and voice are selected at session creation.
- Each session has a random bearer token, a 15-minute lifetime, 12 attempted turns and a single in-flight request. Up to five sessions are retained. Limits are per process, not a production billing or abuse-control system.
- Only the latest successful result is replayable by turn ID without another provider call. Earlier used IDs are rejected. Failed turns consume an attempt and cannot be replayed under the same ID. Concurrent turns return 409.
- End-session cancels local processing, releases microphone/playback resources and clears server history. Already-started provider requests may still be billable. Session state is in memory and is lost on restart; use exactly one worker.
- The transcript stores real recognized/generated text. TTS failure preserves text with an explicit warning. STT/LLM failures return errors. Model prompting prohibits unsupported action confirmations but still needs live adversarial and native-language evaluation.
- Timings measure server-side elapsed recognition/model/synthesis time. They exclude user recording time and browser playback latency. Token counts are provider-reported, not an INR bill.
- Transcript export contains text, measured timing and usage, with no audio or credentials. Nothing is put in browser localStorage. Provider processing/retention follows provider settings; local session cleanup does not mean zero provider retention.
- Telephony and summary endpoints return 501. The old unauthenticated WebSocket simulator has been removed.

## Models and API contracts

Defaults: `saaras:v4`, `nvidia/nemotron-3.5-super-vl:free` (OpenRouter, reasoning high), `bulbul:v4-flash`. Voices: `kavitha_te_conversation` and `simran_en_customer`. All model/voice IDs can be configured server-side. Compatibility and account availability must be tested with actual credentials before release.

- https://docs.sarvam.ai/api-reference/speech-to-text/transcribe
- https://docs.sarvam.ai/api-reference/text-to-speech/convert
- https://docs.sarvam.ai/api/api-guides-tutorials/text-to-speech/voices
- https://openrouter.ai/docs/guides/best-practices/reasoning-tokens

## Verification

```powershell
.venv/Scripts/python.exe -m pytest services/voice/tests -q
node --test services/voice/tests/audio.test.mjs
```

Optional browser integration test: install Playwright in your development environment, run the unconfigured real app on localhost:8000, and run `.venv/Scripts/python.exe -m uvicorn services.voice.tests.browser_server:app --host 127.0.0.1 --port 8127` in another terminal. Run `node services/voice/tests/browser.test.cjs` with Edge installed (or set `BROWSER_CHANNEL=chrome`). `PLAYWRIGHT_MODULE` can point to an existing Playwright package. The test uses a fake microphone and provider doubles, and must never be treated as a live-provider test. Stop the fixture server afterward.

Python tests exercise real FastAPI routes and HTTP adapters using controlled provider responses, including authentication, isolation, expiry, invalid input, duplicate submissions, failure reporting and cancellation. These tests do not establish actual speech quality or provider account access.

Still required: credentialed Telugu/English sessions, native-speaker evaluation, streaming STT/TTS, automatic turn detection and barge-in, durable accounts/data, phone integration and validated business actions.

## Free-only OpenRouter routing

Dialogue is restricted to Nemotron 3.5 Super VL, Nemotron 3 Ultra 550B and Gemma 4 31B, with explicit `:free` IDs. The configured primary is tried first; OpenRouter may fall back only within this shortlist. Each request sets prompt/completion/request price ceilings to zero, requires supported parameters and enables high reasoning effort. Only final message content is spoken; reasoning fields are excluded. Actual returned model and reported USD cost are recorded in turn usage. Free routes have capacity/rate limits and may fail; paid or unlisted IDs are rejected locally. Sarvam speech remains independently billed.

To run an opt-in live text check with synthetic facts: `python -m services.voice.tests.live_openrouter`. This uses OpenRouter only, not Sarvam audio. The internal integration tests use fake credentials and make no provider calls.
