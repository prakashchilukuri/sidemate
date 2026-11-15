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
      const heading = document.createElement("h3"); heading.textContent = task.lead.name + " - " + (task.review?.disposition || "needs_review").replaceAll("_", " ");
      const info = document.createElement("p");
      info.textContent = `${task.lead.phone} | ${task.lead.source}\nEnquiry: ${task.lead.enquiry}\nConversation: ${task.conversation_status}\nReference: ${task.call_id}`;
      const details = document.createElement("details");
      const summary = document.createElement("summary"); summary.textContent = "Read conversation";
      const transcript = document.createElement("p");
      transcript.textContent = task.transcript.length ? task.transcript.map(t => (t.role === "user" ? "Caller: " : "SideMate: ") + t.content).join("\n\n") : "No conversation captured. Check the call status before following up.";
      details.append(summary, transcript); card.append(heading, info, details);
      const form = document.createElement("form");
      const note = document.createElement("p"); note.className = "hint";
      note.textContent = "Human review: record only what the caller stated. Saving does not schedule a call, send a message, or book an appointment.";
      form.append(note);
      const fields = {};
      for (const [key, label] of Object.entries({disposition:"Lead outcome", requirement:"Customer requirement", budget:"Budget (leave blank if unknown)", timeline:"Timeline or preferred callback time", owner:"Sales owner", next_action:"Next action for the salesperson"})) {
        const wrapper = document.createElement("label"); wrapper.textContent = label;
        const input = document.createElement(key === "disposition" ? "select" : "input");
        if (key === "disposition") {
          for (const value of ["needs_review", "qualified", "not_interested", "callback_requested", "information_requested"]) {
            const option = document.createElement("option"); option.value = value; option.textContent = value.replaceAll("_", " "); input.append(option);
          }
        } else { input.maxLength = ({requirement:1000,budget:200,timeline:200,owner:120,next_action:1000})[key]; }
        input.value = task.review?.[key] || (key === "disposition" ? "needs_review" : "");
        input.required = ["owner", "next_action"].includes(key);
        wrapper.append(input); form.append(wrapper); fields[key] = input;
      }
      const save = document.createElement("button"); save.type = "submit"; save.textContent = "Save review";
      const message = document.createElement("p"); message.setAttribute("role", "status");
      form.append(save, message);
      form.addEventListener("submit", async event => {
        event.preventDefault(); save.disabled = true; message.textContent = "Saving...";
        try {
          const values = Object.fromEntries(Object.entries(fields).map(([k,v])=>[k,v.value.trim()]));
          const result = await request("/v1/voice/sales-tasks/" + encodeURIComponent(task.call_id) + "/review", {version:task.version || 0,...values});
          task.version = result.version; task.review = result.review;
          heading.textContent = task.lead.name + " - " + result.review.disposition.replaceAll("_", " ");
          message.textContent = "Review saved. Follow-up remains a task for your sales team.";
        } catch(error) { message.textContent = error.message; }
        finally { save.disabled = false; }
      });
      card.append(form); el("tasks").append(card);
    }
  } catch (error) { el("tasks-status").textContent = error.message; }
  finally { el("load-tasks").disabled = false; }
});
