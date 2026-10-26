"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Play,
  Pause,
  Bot,
  ExternalLink,
  Volume2,
  Radio,
  PhoneCall,
  Clock,
  Sparkles,
  RotateCcw,
  Square,
  FileText,
  User,
  SlidersHorizontal,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EmptyState, LoadingState, ErrorState } from "@/components/ui/state-view";
import { INITIAL_CALLS, type CallRecord, type AIEmployee } from "@/lib/demo-data";

export default function CallsPage() {
  const [calls, setCalls] = useState<CallRecord[]>(INITIAL_CALLS);
  const [employees, setEmployees] = useState<AIEmployee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState("All");
  const [sentimentFilter, setSentimentFilter] = useState("All");
  const [viewState, setViewState] = useState<"normal" | "loading" | "empty" | "error">("normal");

  // Audio Playback Player Modal State
  const [audioModalCall, setAudioModalCall] = useState<CallRecord | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // Dialer Sandbox Modal State
  const [dialerModalOpen, setDialerModalOpen] = useState(false);
  const [dialerForm, setDialerForm] = useState({
    leadName: "Rajesh Goud",
    company: "Fortune Heights, Hyderabad",
    phoneNumber: "+91 98480 12345",
    agentName: "Ananya Rao (అనన్య)",
  });
  const [dialingStatus, setDialingStatus] = useState<"idle" | "connecting" | "connected" | "ended">("idle");
  const [callDurationSec, setCallDurationSec] = useState(0);

  // Fetch calls & employees on mount
  useEffect(() => {
    fetch("/api/calls")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data)) {
          setCalls(resData.data);
        }
      })
      .catch((err) => console.error("Error fetching calls:", err));

    fetch("/api/ai-employees")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data)) {
          setEmployees(resData.data);
          if (resData.data.length > 0) {
            setDialerForm((prev) => ({ ...prev, agentName: resData.data[0].name }));
          }
        }
      })
      .catch((err) => console.error("Error fetching employees:", err));
  }, []);

  // Playback timer simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setPlaybackProgress((prev) => {
          if (prev >= 100) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 2 * playbackSpeed;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio, playbackSpeed]);

  // Live dialer timer simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (dialingStatus === "connected") {
      timer = setInterval(() => {
        setCallDurationSec((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [dialingStatus]);

  const handleStartSandboxCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setDialingStatus("connecting");
    setCallDurationSec(0);

    setTimeout(async () => {
      setDialingStatus("connected");

      // Save call to backend
      try {
        const res = await fetch("/api/calls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leadName: dialerForm.leadName,
            company: dialerForm.company,
            phone: dialerForm.phoneNumber,
            agentName: dialerForm.agentName,
            duration: "0m 45s",
            mode: "sandbox",
          }),
        });
        const resJson = await res.json();
        if (resJson.success && resJson.data) {
          setCalls((prev) => [resJson.data, ...prev]);
        }
      } catch (err) {
        console.error("Dialer error:", err);
      }
    }, 2000);
  };

  const handleEndSandboxCall = () => {
    setDialingStatus("ended");
    setTimeout(() => {
      setDialerModalOpen(false);
      setDialingStatus("idle");
      setCallDurationSec(0);
    }, 1500);
  };

  const filteredCalls = calls.filter((call) => {
    const matchesSearch =
      call.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      call.phone.includes(searchQuery) ||
      call.agentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOutcome = outcomeFilter === "All" || call.outcome === outcomeFilter;
    const matchesSentiment = sentimentFilter === "All" || call.sentiment === sentimentFilter;
    return matchesSearch && matchesOutcome && matchesSentiment;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Call History & Audio
            </h1>
            <Badge variant="default" size="sm">
              {calls.length} Total Calls
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted">
            Listen to phone call audio recordings, check customer interest, and review Telugu notes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => setDialerModalOpen(true)}
            className="gap-1.5"
          >
            <PhoneCall className="h-4 w-4" />
            Make a Test Call
          </Button>

          <Link href="/dashboard/conversations">
            <Button variant="secondary" size="sm" className="gap-1.5 text-xs shadow-xs">
              <FileText className="h-3.5 w-3.5" />
              Transcripts & Summaries
            </Button>
          </Link>
        </div>
      </div>

      {/* Live Call Banner */}
      <div className="rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/50 dark:bg-indigo-950/30 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white">
              <Radio className="h-4 w-4 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground">
                  Autonomous Telephony Active
                </p>
                <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                  Sub-350ms Latency
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                SideMate voice engine listening on SIP trunks with autonomous sentiment classification.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div>
              Avg Latency: <span className="font-semibold text-foreground">290ms</span>
            </div>
            <div>
              Synthesis Audio: <span className="font-semibold text-foreground">24kHz PCM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by prospect, company, phone, or agent..."
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Outcome Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">Outcome:</span>
            <select
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value)}
              className="rounded-md border bg-background px-2.5 py-1 text-xs"
            >
              <option value="All">All Outcomes</option>
              <option value="Qualified">Qualified</option>
              <option value="Meeting Booked">Meeting Booked</option>
              <option value="Callback">Callback</option>
              <option value="Voicemail">Voicemail</option>
              <option value="Not Interested">Not Interested</option>
            </select>
          </div>

          {/* Sentiment Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted-foreground">Sentiment:</span>
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="rounded-md border bg-background px-2.5 py-1 text-xs"
            >
              <option value="All">All Sentiments</option>
              <option value="Positive">Positive</option>
              <option value="Neutral">Neutral</option>
              <option value="Negative">Negative</option>
            </select>
          </div>
        </div>
      </div>

      {/* Calls Table */}
      <Card className="shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b text-muted-foreground uppercase tracking-wider font-semibold">
              <tr>
                <th className="p-3">Prospect</th>
                <th className="p-3">Company</th>
                <th className="p-3">AI Employee</th>
                <th className="p-3">Duration</th>
                <th className="p-3">Outcome</th>
                <th className="p-3">Sentiment</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3 text-right">Playback & Transcript</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredCalls.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-muted-foreground">
                    No calls match your active filter.
                  </td>
                </tr>
              ) : (
                filteredCalls.map((call) => (
                  <tr key={call.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium text-foreground">
                      {call.leadName}
                      <div className="text-[11px] text-muted-foreground">{call.phone}</div>
                    </td>
                    <td className="p-3 text-muted-foreground">{call.company}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <Bot className="h-3.5 w-3.5 text-indigo-600" />
                        <span>{call.agentName}</span>
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-foreground">{call.duration}</td>
                    <td className="p-3">
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          call.outcome === "Qualified" || call.outcome === "Meeting Booked"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200"
                            : call.outcome === "Callback"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200"
                            : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {call.outcome}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                          call.sentiment === "Positive"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : call.sentiment === "Negative"
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            call.sentiment === "Positive"
                              ? "bg-emerald-500"
                              : call.sentiment === "Negative"
                              ? "bg-rose-500"
                              : "bg-gray-400"
                          }`}
                        />
                        {call.sentiment}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">{call.timestamp}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setAudioModalCall(call);
                            setIsPlayingAudio(false);
                            setPlaybackProgress(0);
                          }}
                          className="h-7 text-xs gap-1 hover:border-indigo-600"
                          title="Listen to Call Recording"
                        >
                          <Play className="h-3 w-3 fill-current text-indigo-600" />
                          Listen
                        </Button>

                        <Link href={`/dashboard/conversations?callId=${call.id}`}>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            title="View Turn-by-Turn Transcript"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ===================================================================== */}
      {/* MODAL 1: AUDIO RECORDING WAVEFORM PLAYER */}
      {/* ===================================================================== */}
      {audioModalCall && (
        <Modal
          open={!!audioModalCall}
          onOpenChange={(open) => !open && setAudioModalCall(null)}
          title={`Call Recording: ${audioModalCall.leadName}`}
          description={`Autonomous call with ${audioModalCall.agentName} • Duration: ${audioModalCall.duration}`}
        >
          <div className="space-y-5 text-xs">
            {/* Call Metadata Strip */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-muted/40 text-center">
              <div>
                <span className="text-[10px] text-muted-foreground block uppercase">Company</span>
                <span className="font-semibold text-xs">{audioModalCall.company}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block uppercase">Outcome</span>
                <span className="font-semibold text-xs text-emerald-600">{audioModalCall.outcome}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block uppercase">Sentiment</span>
                <span className="font-semibold text-xs">{audioModalCall.sentiment}</span>
              </div>
            </div>

            {/* Dynamic Waveform Visualizer */}
            <div className="p-5 rounded-xl border bg-card space-y-3">
              <div className="flex items-center justify-between text-muted-foreground text-[11px]">
                <span className="flex items-center gap-1.5 text-indigo-600 font-medium">
                  <Volume2 className="h-3.5 w-3.5" />
                  Call Audio & Speaking Details
                </span>
                <span>
                  {Math.floor((audioModalCall.durationSeconds * playbackProgress) / 100)}s /{" "}
                  {audioModalCall.duration}
                </span>
              </div>

              {/* Simulated Waveform Equalizer Bars */}
              <div className="h-16 flex items-center justify-between gap-1 px-2 bg-muted/30 rounded-lg overflow-hidden">
                {[30, 45, 70, 90, 60, 40, 85, 95, 55, 35, 75, 80, 45, 65, 90, 85, 40, 70, 95, 60, 50, 80, 65, 90, 45, 75, 85, 30].map(
                  (val, idx) => {
                    const isActive = (idx / 28) * 100 <= playbackProgress;
                    return (
                      <div
                        key={idx}
                        className={`w-full rounded-full transition-all duration-200 ${
                          isActive
                            ? "bg-indigo-600"
                            : "bg-muted-foreground/30"
                        } ${isPlayingAudio ? "animate-pulse" : ""}`}
                        style={{ height: `${isPlayingAudio ? Math.max(15, (val * (idx % 2 === 0 ? 1.2 : 0.8))) : val}%` }}
                      />
                    );
                  }
                )}
              </div>

              {/* Scrubbing Bar */}
              <input
                type="range"
                min={0}
                max={100}
                value={playbackProgress}
                onChange={(e) => setPlaybackProgress(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />

              {/* Player Controls */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className="h-8 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {isPlayingAudio ? (
                      <>
                        <Pause className="h-3.5 w-3.5 fill-current" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5 fill-current" />
                        Play Audio
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPlaybackProgress(0)}
                    className="h-8 text-xs text-muted-foreground"
                    title="Restart Audio"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </div>

                {/* Speed Controls */}
                <div className="flex items-center gap-1 text-xs">
                  {[0.75, 1.0, 1.25, 1.5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setPlaybackSpeed(s)}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                        playbackSpeed === s
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-card text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Transcript Snippet */}
            <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
              <span className="font-semibold text-xs text-foreground block">
                Preview Transcript Extract
              </span>
              <p className="text-muted-foreground italic text-xs leading-relaxed">
                &ldquo;{audioModalCall.transcriptSnippet}&rdquo;
              </p>
            </div>

            <div className="pt-3 border-t flex items-center justify-between">
              <Link href={`/dashboard/conversations?callId=${audioModalCall.id}`}>
                <Button size="sm" variant="outline" className="gap-1 text-xs">
                  <FileText className="h-3.5 w-3.5" />
                  View Full Transcript & AI Summary
                </Button>
              </Link>

              <Button size="sm" onClick={() => setAudioModalCall(null)} className="text-xs">
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: OUTBOUND DIALER SANDBOX */}
      {/* ===================================================================== */}
      <Modal
        open={dialerModalOpen}
        onOpenChange={setDialerModalOpen}
        title="Outbound Telephony Sandbox Dialer"
        description="Initiate an autonomous test call to preview conversation flow, voice quality, and latency."
      >
        <form onSubmit={handleStartSandboxCall} className="space-y-4 text-xs">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-900 dark:text-amber-200 text-xs">
            ⚠️ <strong>Test Mode:</strong> Makes a test phone call with your AI voice agent. Call recording, conversation notes, and audio playback will be saved to your dashboard.
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-medium">Target Prospect Name</label>
              <Input
                required
                value={dialerForm.leadName}
                onChange={(e) => setDialerForm({ ...dialerForm, leadName: e.target.value })}
                disabled={dialingStatus !== "idle"}
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium">Company Name</label>
              <Input
                required
                value={dialerForm.company}
                onChange={(e) => setDialerForm({ ...dialerForm, company: e.target.value })}
                disabled={dialingStatus !== "idle"}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-medium">Destination Telephone</label>
              <Input
                required
                value={dialerForm.phoneNumber}
                onChange={(e) => setDialerForm({ ...dialerForm, phoneNumber: e.target.value })}
                disabled={dialingStatus !== "idle"}
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium">Assigned AI Employee</label>
              <select
                value={dialerForm.agentName}
                onChange={(e) => setDialerForm({ ...dialerForm, agentName: e.target.value })}
                disabled={dialingStatus !== "idle"}
                className="w-full rounded-md border bg-background px-3 py-2 text-xs"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name} ({emp.role})
                  </option>
                ))}
                {employees.length === 0 && (
                  <>
                    <option value="Ananya Rao">Ananya Rao (Telugu Real Estate Caller)</option>
                    <option value="Suresh Kumar">Suresh Kumar (Telugu Wholesale Caller)</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Dialing Status Animation */}
          {dialingStatus !== "idle" && (
            <div className="p-4 rounded-xl border bg-card text-center space-y-2 animate-in fade-in">
              {dialingStatus === "connecting" && (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                  <span className="font-medium text-xs">
                    Connecting phone call to {dialerForm.phoneNumber}...
                  </span>
                </div>
              )}

              {dialingStatus === "connected" && (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 text-emerald-600 font-semibold text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    Call in Progress ({Math.floor(callDurationSec / 60)}:{(callDurationSec % 60).toString().padStart(2, "0")})
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {dialerForm.agentName} is speaking in Telugu with {dialerForm.leadName}.
                  </span>
                  <Button
                    type="button"
                    onClick={handleEndSandboxCall}
                    className="mt-2 bg-rose-600 hover:bg-rose-700 text-white h-8 text-xs"
                  >
                    End Call & Save Notes
                  </Button>
                </div>
              )}

              {dialingStatus === "ended" && (
                <div className="text-emerald-600 font-medium text-xs">
                  ✓ Call finished. Audio recording and notes saved.
                </div>
              )}
            </div>
          )}

          <div className="pt-3 border-t flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialerModalOpen(false)}
              disabled={dialingStatus === "connecting" || dialingStatus === "connected"}
            >
              Cancel
            </Button>
            {dialingStatus === "idle" && (
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Initiate Sandbox Call
              </Button>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
}
