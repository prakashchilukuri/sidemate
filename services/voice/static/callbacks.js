const el = (id) => document.getElementById(id);
const endpoint = "/v1/voice/callbacks";
const finished = new Set(["completed", "busy", "no-answer", "failed", "canceled", "rejected"]);
let attempt;
let busy = false;

async function request(path, body) {
  const response = await fetch(path, {
    method: body ? "POST" : "GET",
    headers: { Authorization: "Bearer " + el("key").value.trim(), "Content-Type": "application/json" },
    body: body && JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.detail || "The callback service is unavailable.");
    error.status = response.status;
    throw error;
  }
  return data;
}

async function run(operation, submitting = false) {
  if (busy) return;
  busy = true;
  el("dial").disabled = true;
  el("refresh").disabled = true;
  el("error").textContent = "";
  try {
    const call = await operation();
    attempt.status = call.carrier_status;
    el("dial").textContent = finished.has(attempt.status) ? "Place another test call" : "Retry same request";
    el("status").textContent = "Phone status: " + call.carrier_status + " · Conversation: " + call.conversation_status;
    el("transcript").replaceChildren(...call.transcript.map(({ role, content }) => {
      const entry = document.createElement("div");
      entry.className = "turn";
      entry.textContent = (role === "user" ? "Caller: " : "SideMate: ") + content;
      return entry;
    }));
  } catch (error) {
    el("error").textContent = error.message;
    if (submitting && [401, 403, 422, 503].includes(error.status)) {
      attempt = undefined;
      el("dial").textContent = "Place test call";
      el("status").textContent = "Check the call setup and try again.";
    } else {
      el("status").textContent = "Refresh the outcome to check the call.";
    }
  } finally {
    busy = false;
    el("dial").disabled = !!attempt?.status && attempt.status !== "submission-unknown" && !finished.has(attempt.status);
    el("refresh").disabled = !attempt;
  }
}

el("callback").addEventListener("submit", (event) => {
  event.preventDefault();
  if (busy) return;
  if (!attempt || finished.has(attempt.status)) {
    attempt = { request_id: crypto.randomUUID(), phone: el("phone").value.trim(),
      language: el("language").value, business_context: el("business").value.trim() };
  }
  el("status").textContent = "Sending the call request…";
  run(() => request(endpoint, attempt), true);
});

el("refresh").addEventListener("click", () => run(() => request(endpoint + "/" + attempt.request_id)));
