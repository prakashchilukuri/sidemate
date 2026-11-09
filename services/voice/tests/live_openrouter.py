"""Opt-in smoke test. Sends only synthetic business facts to free model endpoints."""
import asyncio
import argparse
import json
import time
import httpx
from services.voice.main import Settings, SessionRequest
from services.voice.providers import ProviderError, VoiceProviders

async def run(model=None, telugu_only=False):
    settings = Settings()
    if model:
        settings.llm_model = model
    results = []
    async with httpx.AsyncClient(timeout=55) as client:
        provider = VoiceProviders(client, settings)
        for language, question in (("en-IN", "What time do you open?"), ("te-IN", "మీరు ఎన్ని గంటలకు తెరుస్తారు?")):
            if telugu_only and language != "te-IN":
                continue
            started = time.perf_counter()
            try:
                reply, usage = await provider.reply(SessionRequest(language=language, business_context="Test Shop opens at 9 AM and closes at 6 PM. This is synthetic test data."), [], question)
                results.append({"language": language, "success": True, "reply": reply, "usage": usage, "elapsed_seconds": round(time.perf_counter()-started,2)})
            except ProviderError as error:
                results.append({"language": language, "success": False, "error": error.message, "elapsed_seconds": round(time.perf_counter()-started,2)})
            print(json.dumps(results[-1], ensure_ascii=True), flush=True)
    return results

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--model")
    parser.add_argument("--telugu-only", action="store_true")
    args = parser.parse_args()
    asyncio.run(run(args.model, args.telugu_only))
