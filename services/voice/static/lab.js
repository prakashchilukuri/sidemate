import { encodeWav, toBase64 } from "./audio.mjs";
const el = (id) => document.getElementById(id);
let session = null, recording = null, busy = false, timer = null, expiry = null, audioUrl = null;
let controller = null, generation = 0, turns = [];
const status = (message) => { el("status").textContent = message; };
const error = (message = "") => { el("error").textContent = message; };

el("language").addEventListener("change", () => {
  const telugu = el("language").value === "te-IN";
  el("prompt").lang = telugu ? "te" : "en";
  el("prompt").textContent = telugu ? "మీ దుకాణం ఎప్పుడు తెరుస్తారు?" : "What time does your shop open?";
});

const players = document.querySelectorAll("audio");
for (const player of players) {
  player.addEventListener("play", () => {
    for (const other of players) if (other !== player) other.pause();
  });
}

function controls() {
  el("start").disabled = busy || !!session;
  el("end").disabled = !session;
  el("record").disabled = !session || busy;
  el("record").textContent = recording ? "Send recording" : "Record message";
  for (const id of ["access", "context", "language"]) el(id).disabled = !!session || busy;
  el("export").disabled = turns.length === 0;
}

async function api(path, token, options = {}) {
  const response = await fetch(path, { ...options, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, cache: "no-store" });
  const result = await response.json();
  if (!response.ok) throw new Error(typeof result.detail === "string" ? result.detail : "Request failed.");
  return result;
}

function stopPlayback() {
  el("player").pause();
  el("player").removeAttribute("src");
  el("player").load();
  el("player").hidden = true;
  el("stop-audio").disabled = true;
  if (audioUrl) URL.revokeObjectURL(audioUrl);
  audioUrl = null;
}

async function releaseMic() {
  clearTimeout(timer);
  const old = recording;
  recording = null;
  if (old) {
    old.node.disconnect(); old.source.disconnect(); old.mute.disconnect();
    old.stream.getTracks().forEach((track) => track.stop());
    await old.context.close();
  }
  return old;
}

async function endSession(message = "Session ended. Export your transcript before starting another.") {
  const old = session;
  session = null; generation++; busy = false;
  clearTimeout(expiry); controller?.abort(); stopPlayback();
  await releaseMic();
  el("session-label").textContent = "Not connected";
  controls(); status(message);
  if (old) {
    try { await api(`/v1/voice/session/${old.session_id}`, old.token, { method: "DELETE" }); }
    catch { error("Could not confirm server cleanup. The session will expire automatically."); }
  }
}

function appendTurn(role, text, metrics = "") {
  const container = el("transcript");
  container.querySelector(".empty")?.remove();
  const item = document.createElement("div"); item.className = `turn ${role}`;
  const name = document.createElement("strong"); name.textContent = role === "user" ? "You" : "SideMate";
  const content = document.createElement("div"); content.textContent = text;
  item.append(name, content);
  if (metrics) { const detail = document.createElement("small"); detail.textContent = metrics; item.append(detail); }
  container.append(item); container.scrollTop = container.scrollHeight;
}

el("start").addEventListener("click", async () => {
  error();
  el("setup-error").textContent = "";
  const key = el("access").value.trim();
  const context = el("context").value.trim();
  if (key.length < 32) {
    el("setup-error").textContent = "Enter the full lab access key from your invitation.";
    el("access").focus();
    return;
  }
  if (context.length < 10) {
    el("setup-error").textContent = "Add a short description of the sample business.";
    el("context").closest("details").open = true;
    el("context").focus();
    return;
  }
  busy = true; controls(); status("Starting your conversation…");
  try {
    const config = await api("/v1/voice/config", key);
    if (config.missing.length) throw new Error(`Server configuration needed: ${config.missing.join(", ")}`);
    session = await api("/v1/voice/session", key, { method: "POST", body: JSON.stringify({ language: el("language").value, business_context: context }) });
    el("access").value = "";
    turns = []; el("transcript").replaceChildren();
    el("models").textContent = `${config.models.stt} → ${config.models.llm} → ${config.models.tts}`;
    el("session-label").textContent = "Session ready";
    expiry = setTimeout(() => endSession("Session expired. Start a new session."), Math.max(0, session.expires_at * 1000 - Date.now()));
    status("Select Record message, ask your question, then select Send recording.");
  } catch (e) {
    el("setup-error").textContent = e.message === "Invalid lab access key."
      ? "Invalid lab access key. Check the key from your invitation and try again."
      : e.message;
    status("Session did not start.");
  } finally {
    busy = false;
    controls();
    if (session) el("record").focus();
    else el("access").focus();
  }
});

el("record").addEventListener("click", async () => {
  if (recording) { await sendRecording(); return; }
  if (!session || busy) return;
  const currentGeneration = generation;
  busy = true; controls(); error(); stopPlayback();
  for (const player of players) player.pause();
  let stream, context;
  try {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error("Microphone access requires localhost or HTTPS and a supported browser.");
    stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true } });
    if (currentGeneration !== generation) { stream.getTracks().forEach((t) => t.stop()); return; }
    context = new AudioContext();
    await context.resume(); await context.audioWorklet.addModule("/static/capture.js");
    if (currentGeneration !== generation) { stream.getTracks().forEach((t) => t.stop()); await context.close(); return; }
    const source = context.createMediaStreamSource(stream);
    const node = new AudioWorkletNode(context, "sidemate-capture");
    const mute = context.createGain(); mute.gain.value = 0;
    const chunks = []; let samples = 0;
    node.port.onmessage = ({ data }) => {
      if (samples + data.length <= context.sampleRate * 24) { chunks.push(data); samples += data.length; }
    };
    source.connect(node).connect(mute).connect(context.destination);
    recording = { stream, context, node, source, mute, chunks, sampleRate: context.sampleRate };
    timer = setTimeout(sendRecording, 24000);
    status("Listening… Click Send recording when finished (24 seconds maximum).");
  } catch (e) {
    stream?.getTracks().forEach((t) => t.stop());
    if (context && context.state !== "closed") await context.close();
    error(e.name === "NotAllowedError" ? "Microphone permission was denied. Allow it in your browser and try again." : e.message);
  } finally { busy = false; controls(); }
});

async function sendRecording() {
  if (!recording || !session || busy) return;
  busy = true; controls();
  const currentGeneration = generation, currentSession = session;
  const audio = await releaseMic();
  if (currentGeneration !== generation) return;
  status("Recognizing your message and preparing a spoken reply…");
  const waiting = setTimeout(() => {
    if (currentGeneration === generation) status("Still preparing your reply. You can end the session if you need to leave.");
  }, 6000);
  controller = new AbortController();
  try {
    const wav = encodeWav(audio.chunks, audio.sampleRate);
    if (wav.length < 6444) throw new Error("Recording was too short. Speak for at least 0.2 seconds.");
    const result = await api(`/v1/voice/session/${currentSession.session_id}/turn`, currentSession.token, {
      method: "POST", signal: controller.signal,
      body: JSON.stringify({ turn_id: crypto.randomUUID(), audio_base64: toBase64(wav) })
    });
    if (currentGeneration !== generation) return;
    const { audio_base64: speech, ...record } = result;
    turns.push(record);
    appendTurn("user", result.transcript);
    const t = result.timings;
    appendTurn("assistant", result.reply, `${result.llm_usage.model || "Dialogue"} · Recognition ${t.stt_ms} ms · Model ${t.llm_ms} ms · Speech ${t.tts_ms} ms · Total ${t.total_ms} ms`);
    if (speech) {
      const bytes = Uint8Array.from(atob(speech), (char) => char.charCodeAt(0));
      audioUrl = URL.createObjectURL(new Blob([bytes], { type: "audio/wav" }));
      el("player").src = audioUrl; el("player").hidden = false; el("stop-audio").disabled = false;
      try { await el("player").play(); } catch {
        if (currentGeneration === generation) error("Press Play below to hear SideMate’s reply.");
      }
    }
    if (currentGeneration !== generation) return;
    if (result.warning) error(result.warning);
    status(`${result.turns_remaining} turns remaining. Record another message when ready.`);
    if (!result.turns_remaining) status("Turn limit reached. End the session and export your transcript.");
  } catch (e) {
    if (currentGeneration === generation && e.name !== "AbortError") { error(e.message); status("Turn did not complete. You can record a new message."); }
  } finally {
    clearTimeout(waiting);
    if (currentGeneration === generation) { busy = false; controls(); }
  }
}

el("end").addEventListener("click", () => endSession());
el("stop-audio").addEventListener("click", stopPlayback);
el("export").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify({ exported_at: new Date().toISOString(), mode: "turn-based-lab", turns }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob), a = document.createElement("a");
  a.href = url; a.download = "sidemate-voice-transcript.json"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
});
window.addEventListener("pagehide", () => {
  recording?.stream.getTracks().forEach((track) => track.stop());
  if (session) fetch(`/v1/voice/session/${session.session_id}`, { method: "DELETE", headers: { Authorization: `Bearer ${session.token}` }, keepalive: true }).catch(() => {});
});
