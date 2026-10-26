"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  MessageSquare,
  Bot,
  User,
  Play,
  Pause,
  Copy,
  Download,
  CheckCircle2,
  Sparkles,
  Search,
  PhoneCall,
  Volume2,
  Calendar,
  Check,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  INITIAL_CONVERSATION_DETAILS,
  INITIAL_CALLS,
  type ConversationDetail,
  type CallRecord,
} from "@/lib/demo-data";

function ConversationsContent() {
  const searchParams = useSearchParams();
  const queryCallId = searchParams?.get("callId");

  const [calls, setCalls] = useState<CallRecord[]>(INITIAL_CALLS);
  const [selectedCallId, setSelectedCallId] = useState<string>(queryCallId || "call-1");
  const [conversation, setConversation] = useState<ConversationDetail>(
    INITIAL_CONVERSATION_DETAILS[queryCallId || "call-1"] || INITIAL_CONVERSATION_DETAILS["call-1"]
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [copied, setCopied] = useState(false);

  // Fetch calls list on mount
  useEffect(() => {
    fetch("/api/calls")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data)) {
          setCalls(resData.data);
        }
      })
      .catch((err) => console.error("Error fetching calls:", err));
  }, []);

  // Sync selectedCallId if query param changes
  useEffect(() => {
    if (queryCallId) {
      setSelectedCallId(queryCallId);
    }
  }, [queryCallId]);

  // Fetch conversation detail when selectedCallId changes
  useEffect(() => {
    fetch(`/api/conversations/${selectedCallId}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && resData.data) {
          setConversation(resData.data);
        } else {
          setConversation(
            INITIAL_CONVERSATION_DETAILS[selectedCallId] || INITIAL_CONVERSATION_DETAILS["call-1"]
          );
        }
      })
      .catch(() => {
        setConversation(
          INITIAL_CONVERSATION_DETAILS[selectedCallId] || INITIAL_CONVERSATION_DETAILS["call-1"]
        );
      });
  }, [selectedCallId]);

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

  const handleCopySummary = () => {
    navigator.clipboard.writeText(conversation.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTranscript = () => {
    const lines = [
      `SideMate Autonomous Call Transcript`,
      `Prospect: ${conversation.leadName} (${conversation.company})`,
      `AI Agent: ${conversation.agentName}`,
      `Date & Time: ${conversation.date}`,
      `Outcome: ${conversation.outcome}`,
      `\n=== EXECUTIVE AI SUMMARY ===`,
      conversation.summary,
      `\n=== TURN-BY-TURN TRANSCRIPT ===`,
      ...conversation.transcript.map((t) => `[${t.time}] ${t.speaker}: ${t.text}`),
    ].join("\n");

    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transcript_${conversation.leadName.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredCallList = calls.filter((c) =>
    c.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Call Recordings & Telugu Notes
            </h1>
            <Badge variant="default" size="sm">
              Telugu & English Audio
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted">
            Listen to word-for-word customer call recordings, read Telugu summaries, and see customer requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopySummary}
            className="gap-1.5 text-xs shadow-xs"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied Summary" : "Copy AI Summary"}
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleDownloadTranscript}
            className="gap-1.5 text-xs shadow-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Download Transcript (.txt)
          </Button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Call Selection List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <Card className="shadow-xs overflow-hidden">
            <div className="p-3 border-b bg-muted/20">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter calls by prospect..."
                  className="pl-8 h-8 text-xs bg-background"
                />
              </div>
            </div>

            <div className="divide-y divide-border max-h-[700px] overflow-y-auto">
              {filteredCallList.map((call) => {
                const isSelected = selectedCallId === call.id;
                return (
                  <button
                    key={call.id}
                    onClick={() => setSelectedCallId(call.id)}
                    className={`w-full p-3.5 text-left text-xs transition-colors flex flex-col gap-1.5 ${
                      isSelected
                        ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-l-4 border-l-indigo-600"
                        : "hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground truncate max-w-[140px]">
                        {call.leadName}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[9px] ${
                          call.outcome === "Qualified" || call.outcome === "Meeting Booked"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {call.outcome}
                      </Badge>
                    </div>

                    <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                      <span>{call.company}</span>
                      <span>{call.duration}</span>
                    </div>

                    <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1">
                      <span className="flex items-center gap-1">
                        <Bot className="h-3 w-3 text-indigo-600" />
                        {call.agentName}
                      </span>
                      <span>{call.timestamp}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column: Transcript & AI Summary (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Header Card with Audio Playback Strip */}
          <Card className="shadow-xs border-indigo-100 dark:border-indigo-950">
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-base text-foreground">
                      {conversation.leadName}
                    </h2>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">{conversation.company}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                    <span>AI Voice Agent: <strong>{conversation.agentName}</strong></span>
                    <span>•</span>
                    <span>Date: {conversation.date}</span>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className={`text-xs ${
                    conversation.outcome === "Qualified" || conversation.outcome === "Meeting Booked"
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {conversation.outcome}
                </Badge>
              </div>

              {/* Integrated Audio Waveform Bar */}
              <div className="p-3 bg-muted/30 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                      className="h-7 text-xs gap-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      {isPlayingAudio ? (
                        <>
                          <Pause className="h-3 w-3 fill-current" /> Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 fill-current" /> Play Call
                        </>
                      )}
                    </Button>
                    <span className="text-muted-foreground text-[11px]">
                      Audio Sync ({playbackProgress}%)
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {[0.75, 1.0, 1.25, 1.5].map((s) => (
                      <button
                        key={s}
                        onClick={() => setPlaybackSpeed(s)}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
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

                {/* Equalizer animation */}
                <div className="h-6 flex items-center justify-between gap-1 overflow-hidden px-1">
                  {[40, 60, 80, 50, 70, 95, 45, 65, 85, 30, 90, 75, 55, 80, 60, 40, 85, 95, 70, 50, 80, 60, 40, 85, 95, 30].map(
                    (val, idx) => {
                      const isActive = (idx / 26) * 100 <= playbackProgress;
                      return (
                        <div
                          key={idx}
                          className={`w-full rounded-full transition-all duration-200 ${
                            isActive ? "bg-indigo-600" : "bg-muted-foreground/30"
                          } ${isPlayingAudio ? "animate-pulse" : ""}`}
                          style={{ height: `${isPlayingAudio ? Math.max(20, (val * (idx % 2 === 0 ? 1.2 : 0.8))) : val}%` }}
                        />
                      );
                    }
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Executive Summary Card */}
          <Card className="bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900 shadow-xs">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-indigo-950 dark:text-indigo-200">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  Autonomous AI Summary & Takeaways
                </CardTitle>
                <Badge variant="outline" className="text-[10px] bg-indigo-100 text-indigo-800 border-indigo-200">
                  Synthesized in 210ms
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <p className="text-foreground leading-relaxed">
                {conversation.summary}
              </p>

              {/* Action items & Next steps */}
              <div className="pt-2 border-t border-indigo-200/50 dark:border-indigo-900/50 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-foreground">Qualification Status</span>
                    <span className="text-muted-foreground text-[11px]">
                      ICP Verified • Team scale &gt; 10 reps • CRM infrastructure active
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-foreground">Follow-Up Action</span>
                    <span className="text-muted-foreground text-[11px]">
                      Calendar invitation dispatched for 20-minute product demonstration
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Turn-by-Turn Speech Transcript */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-indigo-600" />
                Turn-by-Turn Speech Separation ({conversation.transcript.length} turns)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {conversation.transcript.map((turn, idx) => {
                const isAI = turn.speaker === "AI Employee";
                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${isAI ? "items-start" : "items-end"}`}
                  >
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1 px-1">
                      <span className="font-semibold flex items-center gap-1">
                        {isAI ? (
                          <>
                            <Bot className="h-3 w-3 text-indigo-600" />
                            {conversation.agentName} (AI)
                          </>
                        ) : (
                          <>
                            <User className="h-3 w-3 text-foreground" />
                            {conversation.leadName} (Prospect)
                          </>
                        )}
                      </span>
                      <span>•</span>
                      <span>{turn.time}</span>
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs ${
                        isAI
                          ? "bg-muted text-foreground rounded-tl-xs border"
                          : "bg-indigo-600 text-white rounded-tr-xs"
                      }`}
                    >
                      {turn.text}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ConversationsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-2 h-2 bg-indigo-600 rounded-full animate-ping" />
            Loading SideMate Conversation Transcripts...
          </div>
        </div>
      }
    >
      <ConversationsContent />
    </Suspense>
  );
}
