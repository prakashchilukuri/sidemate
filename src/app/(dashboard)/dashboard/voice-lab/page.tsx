import Link from "next/link";

export default function VoiceLabPage() {
  const labUrl = process.env.VOICE_LAB_URL || "http://localhost:8000/lab";
  return (
    <main className="mx-auto max-w-3xl space-y-6 p-8">
      <h1 className="text-3xl font-bold">Try SideMate’s voice demo</h1>
      <p className="text-slate-300">Listen to a Telugu or English sample. If you have a lab access key from your invitation, you can also ask the sample shop a question and hear SideMate’s reply.</p>
      <a href={labUrl} className="inline-block rounded-lg bg-indigo-500 px-5 py-3 font-semibold text-white">Open voice demo</a>
      <p><Link href="/dashboard" className="text-sm text-slate-400 underline">Back to dashboard</Link></p>
    </main>
  );
}
