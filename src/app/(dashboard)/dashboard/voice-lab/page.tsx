import Link from "next/link";

export default function VoiceLabPage() {
  const labUrl = process.env.VOICE_LAB_URL || "http://localhost:8000/lab";
  return (
    <main className="mx-auto max-w-3xl space-y-6 p-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-indigo-300">Internal preview</p>
      <h1 className="text-3xl font-bold">Telugu / English voice lab</h1>
      <p className="text-slate-300">Record a short message, hear the assistant reply, and inspect the transcript and response timings. This first milestone uses manual turns.</p>
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="mb-3 text-lg font-semibold">Before starting</h2>
        <p className="text-slate-300">Start the voice service and configure its Sarvam and OpenRouter credentials on the server. Dialogue uses an approved shortlist of free reasoning models. Open the lab and enter your separate lab access key. Provider API keys stay on the server.</p>
        <p className="mt-3 text-sm text-slate-400">The lab has its own access control. Sessions are temporary and support up to 12 turns over 15 minutes. Phone calls, bookings and payments are not connected.</p>
      </div>
      <a href={labUrl} target="_blank" rel="noopener noreferrer" className="inline-block rounded-lg bg-indigo-500 px-5 py-3 font-semibold text-white">Open voice lab</a>
      <p><Link href="/dashboard" className="text-sm text-slate-400 underline">Back to dashboard</Link></p>
    </main>
  );
}
