// Downsample microphone PCM to the server's bounded mono 16 kHz WAV contract.
export function encodeWav(chunks, sampleRate) {
  const length = chunks.reduce((n, chunk) => n + chunk.length, 0);
  const input = new Float32Array(length);
  let offset = 0;
  for (const chunk of chunks) { input.set(chunk, offset); offset += chunk.length; }
  const frames = Math.floor(length * 16000 / sampleRate);
  const buffer = new ArrayBuffer(44 + frames * 2);
  const view = new DataView(buffer);
  const ascii = (at, text) => [...text].forEach((char, i) => view.setUint8(at + i, char.charCodeAt(0)));
  ascii(0, "RIFF"); view.setUint32(4, 36 + frames * 2, true); ascii(8, "WAVE");
  ascii(12, "fmt "); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, 1, true); view.setUint32(24, 16000, true);
  view.setUint32(28, 32000, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  ascii(36, "data"); view.setUint32(40, frames * 2, true);
  for (let i = 0; i < frames; i++) {
    const start = Math.floor(i * sampleRate / 16000);
    const end = Math.min(length, Math.max(start + 1, Math.floor((i + 1) * sampleRate / 16000)));
    let sum = 0;
    for (let j = start; j < end; j++) sum += input[j];
    const value = Math.max(-1, Math.min(1, sum / (end - start)));
    view.setInt16(44 + i * 2, value < 0 ? value * 32768 : value * 32767, true);
  }
  return new Uint8Array(buffer);
}

export function toBase64(bytes) {
  let result = "";
  for (let i = 0; i < bytes.length; i += 8192) result += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(result);
}
