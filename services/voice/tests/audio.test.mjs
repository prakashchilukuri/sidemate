import test from "node:test";
import assert from "node:assert/strict";
import { encodeWav, toBase64 } from "../static/audio.mjs";

test("48 kHz capture becomes a valid mono 16 kHz WAV with preserved duration", () => {
  const wave = encodeWav([new Float32Array(24000).fill(0.5), new Float32Array(24000).fill(-0.5)], 48000);
  const view = new DataView(wave.buffer);
  assert.equal(new TextDecoder().decode(wave.slice(0, 4)), "RIFF");
  assert.equal(view.getUint16(22, true), 1);
  assert.equal(view.getUint32(24, true), 16000);
  assert.equal(view.getUint32(40, true), 32000);
  assert.equal(view.getInt16(44, true), 16383);
  assert.equal(view.getInt16(44 + 8000 * 2, true), -16384);
  assert.deepEqual(new Uint8Array(Buffer.from(toBase64(wave), "base64")), wave);
});

test("clamps out-of-range samples instead of wrapping PCM", () => {
  const view = new DataView(encodeWav([new Float32Array([2, -2])], 16000).buffer);
  assert.equal(view.getInt16(44, true), 32767);
  assert.equal(view.getInt16(46, true), -32768);
});
