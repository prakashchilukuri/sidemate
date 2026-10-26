"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bot,
  Phone,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Play,
  Square,
  ExternalLink,
  Plus,
  Sparkles,
  Megaphone,
  CreditCard,
  PhoneCall,
  Calendar,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Clock,
  Volume2,
  Activity,
  Layers,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { INITIAL_CALLS, INITIAL_AI_EMPLOYEES, type AIEmployee, type EmployeeStatus } from "@/lib/demo-data";
import { audioEngine, ALL_VOICES } from "@/lib/audio-engine";

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<"today" | "7d" | "30d">("7d");
  const [employees, setEmployees] = useState<AIEmployee[]>(INITIAL_AI_EMPLOYEES);
  const [playingCallId, setPlayingCallId] = useState<string | null>(null);

  // Fetch employees from backend on mount
  useEffect(() => {
    fetch("/api/ai-employees")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
          setEmployees(resData.data);
        }
      })
      .catch((err) => console.error("Error fetching AI employees:", err));

    return () => {
      audioEngine.stopAll();
    };
  }, []);

  const metricsByRange = {
    today: {
      calls: "142",
      callsTrend: "+18.2%",
      reached: "98",
      reachedTrend: "+14.0%",
      qualified: "46",
      qualifiedTrend: "+22.5%",
      meetings: "18",
      meetingsTrend: "+28.0%",
      avgDuration: "2m 12s",
      connectedRate: "69.0%",
      hoursSaved: "5.8 hrs",
      pipelineValue: "₹4.2 Lakhs",
    },
    "7d": {
      calls: "1,284",
      callsTrend: "+12.5%",
      reached: "843",
      reachedTrend: "+8.2%",
      qualified: "318",
      qualifiedTrend: "+16.4%",
      meetings: "142",
      meetingsTrend: "+23.4%",
      avgDuration: "2m 45s",
      connectedRate: "68.4%",
      hoursSaved: "48.5 hrs",
      pipelineValue: "₹28.5 Lakhs",
    },
    "30d": {
      calls: "5,410",
      callsTrend: "+24.8%",
      reached: "3,720",
      reachedTrend: "+19.1%",
      qualified: "1,240",
      qualifiedTrend: "+21.0%",
      meetings: "580",
      meetingsTrend: "+25.5%",
      avgDuration: "2m 38s",
      connectedRate: "70.2%",
      hoursSaved: "196 hrs",
      pipelineValue: "₹1.18 Crore",
    },
  };

  const currentMetrics = metricsByRange[dateRange];

  const chartBars = [
    { day: "Mon", calls: 180, meetings: 24 },
    { day: "Tue", calls: 240, meetings: 32 },
    { day: "Wed", calls: 210, meetings: 28 },
    { day: "Thu", calls: 290, meetings: 38 },
    { day: "Fri", calls: 260, meetings: 34 },
    { day: "Sat", calls: 70, meetings: 12 },
    { day: "Sun", calls: 50, meetings: 8 },
  ];

  const maxCalls = Math.max(...chartBars.map((b) => b.calls));

  // Toggle call audio playback
  const handleToggleCallAudio = (callId: string, snippet: string) => {
    if (playingCallId === callId) {
      audioEngine.stopAll();
      setPlayingCallId(null);
      return;
    }

    setPlayingCallId(callId);
    audioEngine.playVoice(
      "ananya",
      snippet,
      "office",
      20,
      () => setPlayingCallId(callId),
      () => setPlayingCallId(null)
    );
  };

  const getStatusBadge = (status: EmployeeStatus) => {
    switch (status) {
      case "Live":
      case "Active":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Working
          </span>
        );
      case "Ready":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            Ready
          </span>
        );
      case "Building":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Needs Training
          </span>
        );
      case "Paused":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Paused
          </span>
        );
      case "Draft":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ─────────────────────────────────────────────────────────────────────────
         PAGE HEADER
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Voice Operations & Intelligence
            </h1>
            <Badge variant="outline" className="text-xs border-indigo-500/30 text-indigo-400 bg-indigo-500/10">
              <Sparkles className="mr-1 h-3 w-3" /> Live Multilingual Telephony
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Manage your autonomous voice callers, monitor live customer conversations, and track booked appointments across Andhra & Telangana.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time range selector */}
          <div className="inline-flex rounded-xl border border-border bg-card p-0.5 text-xs">
            {(["today", "7d", "30d"] as const).map((r) => {
              const labels: Record<string, string> = {
                today: "Today",
                "7d": "7 Days",
                "30d": "30 Days",
              };
              const isSelected = dateRange === r;
              return (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  className={`rounded-lg px-3 py-1.5 font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {labels[r]}
                </button>
              );
            })}
          </div>

          <Link href="/dashboard/ai-employees/new">
            <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md">
              <Plus className="h-4 w-4" />
              New Employee
            </Button>
          </Link>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────
         TOP GRID: QUICK ACTIONS (2 COLS) + YOUR AI EMPLOYEES (1 COL)
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Quick Actions (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Quick Actions
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Action 1: New Employee */}
            <Link
              href="/dashboard/ai-employees/new"
              className="p-4 rounded-2xl border border-border bg-card hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all group shadow-xs flex flex-col justify-between"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-foreground group-hover:text-indigo-400 transition-colors">
                  New Employee
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Add an AI teammate</p>
              </div>
            </Link>

            {/* Action 2: New Campaign */}
            <Link
              href="/dashboard/campaigns"
              className="p-4 rounded-2xl border border-border bg-card hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all group shadow-xs flex flex-col justify-between"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Megaphone className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-foreground group-hover:text-purple-400 transition-colors">
                  New Campaign
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Bulk-call a contact list</p>
              </div>
            </Link>

            {/* Action 3: Add Credits */}
            <Link
              href="/dashboard/billing"
              className="p-4 rounded-2xl border border-border bg-card hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group shadow-xs flex flex-col justify-between"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <CreditCard className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-foreground group-hover:text-emerald-400 transition-colors">
                  Add Credits (₹)
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Top up via UPI & Cards</p>
              </div>
            </Link>

            {/* Action 4: Call Simulator */}
            <Link
              href="/dashboard/calls"
              className="p-4 rounded-2xl border border-border bg-card hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-all group shadow-xs flex flex-col justify-between"
            >
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <PhoneCall className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-foreground group-hover:text-cyan-400 transition-colors">
                  Call Simulator
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Audition voice & lines</p>
              </div>
            </Link>

            {/* Action 5: Customer Leads */}
            <Link
              href="/dashboard/leads"
              className="p-4 rounded-2xl border border-border bg-card hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all group shadow-xs flex flex-col justify-between"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-foreground group-hover:text-indigo-400 transition-colors">
                  View Leads
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Results & follow-ups</p>
              </div>
            </Link>

            {/* Action 6: Call Recordings */}
            <Link
              href="/dashboard/conversations"
              className="p-4 rounded-2xl border border-border bg-card hover:border-pink-500/40 hover:bg-pink-500/5 transition-all group shadow-xs flex flex-col justify-between"
            >
              <div className="w-9 h-9 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-foreground group-hover:text-pink-400 transition-colors">
                  Call Log & Notes
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">Every conversation</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Your AI Employees Roster (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Your AI Employees
            </h2>
            <Link
              href="/dashboard/ai-employees"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              View all <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <Card className="border-border bg-card shadow-xs overflow-hidden">
            <div className="divide-y divide-border">
              {employees.slice(0, 4).map((emp) => (
                <Link
                  key={emp.id}
                  href={`/dashboard/ai-employees/new?id=${emp.id}`}
                  className="p-3.5 flex items-center justify-between hover:bg-muted/40 transition-colors block group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-500/20">
                      {emp.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-xs text-foreground group-hover:text-indigo-400 transition-colors">
                        {emp.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                        {emp.role}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-extrabold text-foreground">{emp.totalCalls}</div>
                      <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Calls
                      </div>
                    </div>
                    {getStatusBadge(emp.status)}
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>

            <div className="p-3 bg-muted/20 border-t border-border text-center">
              <Link
                href="/dashboard/ai-employees/new"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Add another employee
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────
         SECTION: NEEDS YOUR ATTENTION (3 ACTIONABLE CARDS)
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Needs Your Attention
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Attention 1: Wallet Balance */}
          <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <CreditCard className="h-3.5 w-3.5" />
              </div>
              <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">
                Healthy Balance
              </Badge>
            </div>
            <div>
              <h3 className="font-bold text-xs text-foreground">Wallet Balance: ₹4,850.00</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                840 talk-time minutes available for upcoming campaigns. No payment interruptions.
              </p>
            </div>
            <Link
              href="/dashboard/billing"
              className="text-xs font-bold text-emerald-400 hover:underline inline-flex items-center gap-1 pt-1"
            >
              Add credits & view invoices &rarr;
            </Link>
          </div>

          {/* Attention 2: Campaign Ready */}
          <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 hover:border-amber-500/40 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <AlertTriangle className="h-3.5 w-3.5" />
              </div>
              <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">
                Scheduled
              </Badge>
            </div>
            <div>
              <h3 className="font-bold text-xs text-foreground">Hyderabad Open Plots Campaign is Ready</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                450 customer contacts loaded and verified for 10:00 AM dispatch.
              </p>
            </div>
            <Link
              href="/dashboard/campaigns"
              className="text-xs font-bold text-amber-400 hover:underline inline-flex items-center gap-1 pt-1"
            >
              Review contacts & schedule &rarr;
            </Link>
          </div>

          {/* Attention 3: Optimization / Coaching */}
          <div className="p-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 hover:border-indigo-500/40 transition-all space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Lightbulb className="h-3.5 w-3.5" />
              </div>
              <Badge variant="outline" className="text-[10px] text-indigo-400 border-indigo-500/30">
                Optimization
              </Badge>
            </div>
            <div>
              <h3 className="font-bold text-xs text-foreground">Coach Suresh on Square Yard Pricing</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                4 customers asked about HMDA loan approvals — review automated rebuttal.
              </p>
            </div>
            <Link
              href="/dashboard/ai-employees/new?id=emp-2"
              className="text-xs font-bold text-indigo-400 hover:underline inline-flex items-center gap-1 pt-1"
            >
              Open & refine script &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────
         SECTION: RECENT SUMMARY (LEFT) & AT A GLANCE (RIGHT)
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Recent Summary Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Recent Summary
          </h2>

          <Card className="h-full border-indigo-500/30 bg-gradient-to-b from-indigo-950/20 to-purple-950/10 shadow-sm flex flex-col justify-between">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Your AI Team Lately</h3>
                  <span className="text-[10px] text-muted-foreground">Operational yield past {dateRange}</span>
                </div>
              </div>

              <div className="space-y-3 text-xs leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="text-indigo-400 mt-0.5">⚡</span>
                  <span className="text-foreground">
                    Handled <strong className="text-indigo-400 font-bold">{currentMetrics.calls} customer conversations</strong> in natural Telugu and English.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  <span className="text-foreground">
                    Zero customer inquiries left unattended. Instant sub-15s callback rate.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="text-cyan-400 mt-0.5">⏱️</span>
                  <span className="text-foreground">
                    <strong className="text-cyan-400 font-bold">{currentMetrics.hoursSaved}</strong> of repetitive telecalling work automated.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="text-purple-400 mt-0.5">👥</span>
                  <span className="text-foreground">
                    <strong className="text-purple-400 font-bold">4 AI employees</strong> active on duty across sales, appointments & accounts.
                  </span>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="text-emerald-400 mt-0.5">💰</span>
                  <span className="text-foreground">
                    <strong className="text-emerald-400 font-bold">{currentMetrics.pipelineValue}</strong> estimated sales pipeline generated.
                  </span>
                </div>
              </div>
            </CardContent>

            <div className="p-3.5 bg-indigo-500/10 border-t border-indigo-500/20 text-xs font-semibold text-indigo-300 flex items-center justify-between">
              <span>840 minutes of call talk-time remaining</span>
              <Link href="/dashboard/billing" className="hover:underline text-[11px]">
                Recharge &rarr;
              </Link>
            </div>
          </Card>
        </div>

        {/* At A Glance 6 Metric Grid (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              At a Glance
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Metric 1 */}
            <Card className="border-border bg-card p-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                Calls Handled
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-foreground">{currentMetrics.calls}</span>
                <span className="text-[11px] font-bold text-emerald-400">{currentMetrics.callsTrend}</span>
              </div>
              <span className="text-[10px] text-muted-foreground block">telecom calls dialed</span>
            </Card>

            {/* Metric 2 */}
            <Card className="border-border bg-card p-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                Customers Reached
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-foreground">{currentMetrics.reached}</span>
                <span className="text-[11px] font-bold text-emerald-400">{currentMetrics.reachedTrend}</span>
              </div>
              <span className="text-[10px] text-muted-foreground block">live conversations held</span>
            </Card>

            {/* Metric 3 */}
            <Card className="border-border bg-card p-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                Qualified Leads
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-indigo-400">{currentMetrics.qualified}</span>
                <span className="text-[11px] font-bold text-indigo-400">{currentMetrics.qualifiedTrend}</span>
              </div>
              <span className="text-[10px] text-muted-foreground block">verified requirements in ₹</span>
            </Card>

            {/* Metric 4 */}
            <Card className="border-border bg-card p-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                Site Visits & Bookings
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-emerald-400">{currentMetrics.meetings}</span>
                <span className="text-[11px] font-bold text-emerald-400">{currentMetrics.meetingsTrend}</span>
              </div>
              <span className="text-[10px] text-muted-foreground block">confirmed appointments</span>
            </Card>

            {/* Metric 5 */}
            <Card className="border-border bg-card p-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                Avg Call Duration
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-foreground">{currentMetrics.avgDuration}</span>
                <span className="text-[11px] font-medium text-muted-foreground">optimal</span>
              </div>
              <span className="text-[10px] text-muted-foreground block">sub-350ms turnaround</span>
            </Card>

            {/* Metric 6 */}
            <Card className="border-border bg-card p-4 space-y-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                Connected Rate
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-foreground">{currentMetrics.connectedRate}</span>
                <span className="text-[11px] font-bold text-emerald-400">+4.2%</span>
              </div>
              <span className="text-[10px] text-muted-foreground block">smart retry cadence</span>
            </Card>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────
         SECTION: WEEKLY THROUGHPUT & CALL ACTIVITY TRENDS
      ────────────────────────────────────────────────────────────────────────── */}
      <Card className="border-border bg-card">
        <CardHeader className="flex-row items-center justify-between pb-2 border-b border-border">
          <div>
            <CardTitle className="text-sm font-bold text-foreground">
              Weekly Call Volume & Booking Throughput
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Total outbound phone calls completed vs confirmed appointments booked across AP & Telangana
            </CardDescription>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-sm bg-indigo-600" /> Phone Calls Made
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> Confirmed Bookings
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex h-44 items-end justify-between gap-3 border-b border-border pb-3">
            {chartBars.map((bar) => {
              const callHeight = (bar.calls / maxCalls) * 100;
              const meetingHeight = (bar.meetings / maxCalls) * 100;

              return (
                <div key={bar.day} className="flex flex-1 flex-col items-center gap-2 group">
                  <div className="flex h-32 w-full items-end justify-center gap-1.5">
                    <div
                      style={{ height: `${callHeight}%` }}
                      className="w-1/3 rounded-t-md bg-indigo-600/80 transition-all group-hover:bg-indigo-600"
                      title={`${bar.calls} calls placed`}
                    />
                    <div
                      style={{ height: `${meetingHeight}%` }}
                      className="w-1/3 rounded-t-md bg-emerald-500/80 transition-all group-hover:bg-emerald-500"
                      title={`${bar.meetings} visits booked`}
                    />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground">
                    {bar.day}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Peak Activity: <strong>290 calls</strong> (Thursday)</span>
            <span className="font-semibold text-indigo-400">Average 23.4% Visit Booking Rate</span>
          </div>
        </CardContent>
      </Card>

      {/* ─────────────────────────────────────────────────────────────────────────
         SECTION: RECENT CALL CONVERSATIONS & AUDIO STREAM
      ────────────────────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Recent Call Conversations & Telugu Notes
            </h2>
          </div>
          <Link
            href="/dashboard/conversations"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            View all recordings <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        <Card className="border-border bg-card shadow-xs overflow-hidden">
          <div className="divide-y divide-border">
            {INITIAL_CALLS.slice(0, 4).map((call) => {
              const isPlaying = playingCallId === call.id;

              return (
                <div
                  key={call.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20 font-bold text-xs mt-0.5">
                      <Phone className="h-4 w-4" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-foreground">{call.leadName}</span>
                        <span className="text-[11px] text-muted-foreground font-mono">{call.phone}</span>
                        <Badge
                          variant="outline"
                          className={`text-[9px] ${
                            call.outcome === "Meeting Booked"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                          }`}
                        >
                          {call.outcome}
                        </Badge>
                      </div>

                      <p className="text-xs text-muted-foreground italic line-clamp-1">
                        &ldquo;{call.transcriptSnippet}&rdquo;
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                        <span>Caller: <strong>{call.agentName}</strong></span>
                        <span>•</span>
                        <span>Duration: {call.duration}</span>
                        <span>•</span>
                        <span>{call.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Audio Play Button */}
                  <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                    <Button
                      size="sm"
                      onClick={() => handleToggleCallAudio(call.id, call.transcriptSnippet)}
                      className={`gap-1.5 h-8 text-xs font-semibold ${
                        isPlaying
                          ? "bg-rose-600 hover:bg-rose-700 text-white"
                          : "bg-muted text-foreground hover:bg-muted/80"
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Square className="h-3.5 w-3.5 fill-current" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5 fill-current" />
                          Play Audio
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
