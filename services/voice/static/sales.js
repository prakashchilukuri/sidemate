const el = (id) => document.getElementById(id);
const endpoint = "/v1/voice/leads";
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
    const result = await operation();
    const call = result.call || result;
    attempt.status = call.carrier_status;
    el("dial").textContent = finished.has(attempt.status) ? "Submit another lead" : "Retry same request";
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
      el("dial").textContent = "Submit lead and call";
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
      language: el("language").value, business_context: el("business").value.trim(), name: el("name").value.trim(), source: el("source").value.trim(), enquiry: el("enquiry").value.trim(), consent_to_call: el("consent").checked };
  }
  el("status").textContent = "Sending the call request…";
  run(() => request(endpoint, attempt), true);
});

el("refresh").addEventListener("click", () => run(() => request("/v1/voice/callbacks/" + attempt.request_id)));

el("load-tasks").addEventListener("click", async () => {
  el("load-tasks").disabled = true;
  el("tasks").replaceChildren();
  el("tasks-status").textContent = "Loading tasks...";
  try {
    const data = await request("/v1/voice/sales-tasks");
    el("tasks-status").textContent = data.items.length ? `${data.items.length} task(s) need review.` : "No tasks yet. Refresh after a lead conversation ends.";
    for (const task of data.items) {
      const card = document.createElement("article"); card.className = "turn";
      const heading = document.createElement("h3"); heading.textContent = task.lead.name + " - Needs review";
      const info = document.createElement("p");
      info.textContent = `${task.lead.phone} | ${task.lead.source}\nEnquiry: ${task.lead.enquiry}\nConversation: ${task.conversation_status}\nReference: ${task.call_id}`;
      const details = document.createElement("details");
      const summary = document.createElement("summary"); summary.textContent = "Read conversation";
      const transcript = document.createElement("p");
      transcript.textContent = task.transcript.length ? task.transcript.map(t => (t.role === "user" ? "Caller: " : "SideMate: ") + t.content).join("\n\n") : "No conversation captured. Check the call status before following up.";
      details.append(summary, transcript); card.append(heading, info, details); el("tasks").append(card);
    }
  } catch (error) { el("tasks-status").textContent = error.message; }
  finally { el("load-tasks").disabled = false; }
});
