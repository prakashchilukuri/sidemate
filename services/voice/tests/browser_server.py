"""Loopback-only fixture for browser tests. Never use this app for live testing."""
from services.voice.main import Settings, create_app
from services.voice.tests.test_voice import FakeProviders, KEY

app = create_app(Settings(access_key=KEY, sarvam_key="test-only", openrouter_key="test-only"), FakeProviders())
