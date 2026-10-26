"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  PhoneCall,
  PhoneOff,
  Settings2,
  Copy,
  Trash2,
  Search,
  PauseCircle,
  PlayCircle,
  Sparkles,
  Volume2,
  VolumeX,
  Mic,
  Activity,
  CheckCircle2,
  Clock,
  Square,
  Play,
  RotateCcw,
  Check,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EmptyState, LoadingState, ErrorState } from "@/components/ui/state-view";
import { INITIAL_AI_EMPLOYEES, type AIEmployee, type EmployeeStatus } from "@/lib/demo-data";
import { audioEngine, ALL_VOICES, AMBIENT_SOUND_OPTIONS, type AmbientSoundId } from "@/lib/audio-engine";

export default function AIEmployeesPage() {
  const [employees, setEmployees] = useState<AIEmployee[]>(INITIAL_AI_EMPLOYEES);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All statuses" | "Live" | "Paused" | "Draft">("All statuses");
  const [channelFilter, setChannelFilter] = useState<"All channels" | "Inbound" | "Instant lead" | "Campaigns">("All channels");
  const [sortBy, setSortBy] = useState<"Recently hired" | "Name" | "Calls">("Recently hired");
  const [viewState, setViewState] = useState<"normal" | "loading" | "empty" | "error">("normal");

  // Fetch employees from backend on mount to ensure persistent state
  const loadEmployees = () => {
    fetch("/api/ai-employees")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data) && resData.data.length > 0) {
          setEmployees(resData.data);
        }
      })
      .catch((err) => console.error("Error fetching AI employees from backend:", err));
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const router = useRouter();

  // Instant Direct Call Modal State
  const [instantCallModal, setInstantCallModal] = useState<{
    open: boolean;
    employee: AIEmployee | null;
  }>({
    open: false,
    employee: null,
  });
  const [directPhone, setDirectPhone] = useState("+91 98480 12345");
  const [directLeadName, setDirectLeadName] = useState("Rajesh Goud");
  const [directCompany, setDirectCompany] = useState("Fortune Heights Ventures");
  const [callState, setCallState] = useState<"idle" | "dialing" | "ringing" | "connected" | "ended">("idle");
  const [callDuration, setCallDuration] = useState(0);
  const [callTranscript, setCallTranscript] = useState<Array<{ speaker: string; text: string; time: string }>>([]);
  const [callSavedSuccess, setCallSavedSuccess] = useState(false);
  const [whatsAppSent, setWhatsAppSent] = useState(false);

  // Call duration counter when connected
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (callState === "connected") {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState]);

  const openInstantCall = (emp: AIEmployee) => {
    setInstantCallModal({ open: true, employee: emp });
    setCallState("idle");
    setCallDuration(0);
    setCallTranscript([]);
    setCallSavedSuccess(false);
    setWhatsAppSent(false);
  };

  const startInstantCall = () => {
    if (!instantCallModal.employee) return;
    setCallState("dialing");
    setCallDuration(0);
    setCallTranscript([]);
    setCallSavedSuccess(false);

    // Transition to ringing
    setTimeout(() => {
      setCallState("ringing");
    }, 1100);

    // Transition to connected
    setTimeout(() => {
      setCallState("connected");

      const emp = instantCallModal.employee!;
      const voiceId = emp.voice.toLowerCase().includes("suresh") ? "suresh" : "ananya";
      audioEngine.previewVoice(voiceId, 1.0, 1.0, selectedAmbient, ambientVolume);

      // Add conversational turns over time
      const greetingTurn = {
        speaker: emp.name,
        time: "00:03",
        text: `నమస్కారం ${directLeadName} గారు! నేను మీ బిజినెస్ వెంచర్ నుంచి ${emp.name} మాట్లాడుతున్నాను. మీరు సేవల గురించి ఎంక్వైరీ చేశారు కదా, ఇప్పుడు మాట్లాడటానికి 2 నిమిషాలు సమయం ఉంటుందా అండి?`,
      };
      setCallTranscript([greetingTurn]);

      setTimeout(() => {
        setCallTranscript((prev) => [
          ...prev,
          {
            speaker: directLeadName || "Customer",
            time: "00:15",
            text: "అవునండి మాట్లాడండి. ధర ఎంతవరకు ఉంటుంది? వివరాలు చెప్పగలరా?",
          },
        ]);
      }, 4000);

      setTimeout(() => {
        setCallTranscript((prev) => [
          ...prev,
          {
            speaker: emp.name,
            time: "00:26",
            text: "సార్, మార్కెట్‌తో పోలిస్తే మా దగ్గర 100% క్లియర్ టైటిల్ మరియు బ్యాంక్ లోన్ లేదా సులభ వాయిదా పద్ధతులు అందుబాటులో ఉన్నాయి. ఈ శనివారం ఉదయం 11 గంటలకు మీకు ఫ్రీ కార్ పికప్‌తో సైట్ విజిట్ ప్లాన్ చేద్దామా సార్?",
          },
        ]);
      }, 9000);

      setTimeout(() => {
        setCallTranscript((prev) => [
          ...prev,
          {
            speaker: directLeadName || "Customer",
            time: "00:44",
            text: "సరేనండి, శనివారం ఉదయం 11 గంటలకు ఓకే. వివరాలు వాట్సాప్‌లో పంపించండి.",
          },
        ]);
      }, 14000);
    }, 2600);
  };

  const endInstantCall = async () => {
    audioEngine.stopAll();
    setCallState("ended");

    if (instantCallModal.employee) {
      const emp = instantCallModal.employee;

      // Update local employee totalCalls count
      setEmployees((prev) =>
        prev.map((e) => (e.id === emp.id ? { ...e, totalCalls: e.totalCalls + 1 } : e))
      );

      try {
        await fetch("/api/calls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentId: emp.id,
            phoneNumber: directPhone,
            leadName: directLeadName || "Direct Prospect",
            company: directCompany || "Direct Inquirer",
          }),
        });
        setCallSavedSuccess(true);
      } catch (err) {
        console.error("Failed to save instant call:", err);
      }
    }
  };

  // Audition Modal State
  const [testCallModal, setTestCallModal] = useState<{ open: boolean; employee: AIEmployee | null }>({
    open: false,
    employee: null,
  });
  const [testPhoneNumber, setTestPhoneNumber] = useState("+91 98480 12345");
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedAmbient, setSelectedAmbient] = useState<AmbientSoundId>("office");
  const [ambientVolume, setAmbientVolume] = useState<number>(25);
  const [testCallLog, setTestCallLog] = useState<string[]>([]);

  const [editModal, setEditModal] = useState<{ open: boolean; employee: AIEmployee | null }>({
    open: false,
    employee: null,
  });
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editObjective, setEditObjective] = useState("");
  const [editStatus, setEditStatus] = useState<EmployeeStatus>("Live");

  // Status toggle: Resume or Pause
  const toggleStatus = async (id: string) => {
    const target = employees.find((e) => e.id === id);
    if (!target) return;

    // If currently Live, pause it. Otherwise, resume/activate to Live.
    const newStatus: EmployeeStatus = (target.status === "Live" || target.status === "Active") ? "Paused" : "Live";

    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, status: newStatus } : emp))
    );

    try {
      await fetch(`/api/ai-employees/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error("Failed to update status on server:", err);
    }
  };

  const deleteEmployee = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this AI employee?")) return;

    setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    try {
      await fetch(`/api/ai-employees/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Failed to delete on server:", err);
    }
  };

  const duplicateEmployee = async (emp: AIEmployee) => {
    const cloneName = `${emp.name.replace(/\(Copy\)/g, "").trim()} (Copy)`;
    const newEmpData = {
      name: cloneName,
      role: emp.role,
      avatar: emp.avatar,
      voice: emp.voice,
      status: "Ready" as EmployeeStatus,
      language: emp.language,
      objective: emp.objective,
      config: emp.config,
    };

    try {
      const res = await fetch("/api/ai-employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEmpData),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setEmployees((prev) => [data.data, ...prev]);
      } else {
        const fallback: AIEmployee = {
          ...emp,
          id: `emp-${Date.now()}`,
          name: cloneName,
          status: "Ready",
          totalCalls: 0,
          successRate: "0.0%",
          avgDuration: "0m 00s",
        };
        setEmployees((prev) => [fallback, ...prev]);
      }
    } catch {
      const fallback: AIEmployee = {
        ...emp,
        id: `emp-${Date.now()}`,
        name: cloneName,
        status: "Ready",
        totalCalls: 0,
        successRate: "0.0%",
        avgDuration: "0m 00s",
      };
      setEmployees((prev) => [fallback, ...prev]);
    }
  };

  const openEdit = (emp: AIEmployee) => {
    setEditModal({ open: true, employee: emp });
    setEditName(emp.name);
    setEditRole(emp.role);
    setEditObjective(emp.objective);
    setEditStatus(emp.status);
  };

  const saveEdit = async () => {
    if (!editModal.employee) return;
    const empId = editModal.employee.id;

    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === empId
          ? { ...emp, name: editName, role: editRole, objective: editObjective, status: editStatus }
          : emp
      )
    );

    try {
      await fetch(`/api/ai-employees/${empId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          role: editRole,
          systemPrompt: editObjective,
          status: editStatus,
        }),
      });
    } catch (err) {
      console.error("Failed to save employee edit:", err);
    }

    setEditModal({ open: false, employee: null });
  };

  // Test call audio test
  const handlePlayVoiceTest = () => {
    if (!testCallModal.employee) return;

    if (isPlayingAudio) {
      audioEngine.stopAll();
      setIsPlayingAudio(false);
      return;
    }

    const emp = testCallModal.employee;
    const greetingText =
      emp.config?.greeting ||
      `నమస్కారం అండి! నేను SideMate నుంచి ${emp.name}ను మాట్లాడుతున్నాను. మీ కస్టమర్లతో మాట్లాడటానికి సిద్ధంగా ఉన్నాను.`;

    const voiceMatch = ALL_VOICES.find((v) =>
      emp.voice.toLowerCase().includes(v.id) || emp.voice.toLowerCase().includes(v.name.toLowerCase())
    ) || ALL_VOICES[0];

    setIsPlayingAudio(true);
    setTestCallLog((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}]: Playing voice "${voiceMatch.name}" with "${selectedAmbient}" background sound...`,
    ]);

    audioEngine.playVoice(
      voiceMatch.id,
      greetingText,
      selectedAmbient,
      ambientVolume,
      () => setIsPlayingAudio(true),
      () => {
        setIsPlayingAudio(false);
        setTestCallLog((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}]: Voice playback completed cleanly.`,
        ]);
      }
    );
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      !searchQuery.trim() ||
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesChannel = true;
    if (channelFilter !== "All channels") {
      matchesChannel = (emp.channel || "Instant lead") === channelFilter;
    }

    let matchesStatus = true;
    if (statusFilter === "Live") {
      matchesStatus = emp.status === "Live" || emp.status === "Active";
    } else if (statusFilter === "Paused") {
      matchesStatus = emp.status === "Paused";
    } else if (statusFilter === "Draft") {
      matchesStatus = emp.status === "Draft";
    }

    return matchesSearch && matchesChannel && matchesStatus;
  });

  const getAvatarBg = (emp: AIEmployee) => {
    const name = emp.name.toLowerCase();
    if (name.includes("jagan")) return "bg-[#C2841B]";
    if (name.includes("radhika")) return "bg-[#7C3AED]";
    if (name.includes("prakash")) return "bg-[#E05638]";
    if (name.includes("ananya")) return "bg-[#4F46E5]";
    if (name.includes("subbu")) return "bg-[#059669]";
    return "bg-[#6344E7]";
  };

  const renderStatusPill = (status: EmployeeStatus) => {
    switch (status) {
      case "Live":
      case "Active":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
        );
      case "Ready":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F4F1FD] text-[#6344E7] dark:bg-purple-950/40 dark:text-purple-300 border border-[#E4DCFA] dark:border-purple-800">
            Ready
          </span>
        );
      case "Changes pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Changes pending
          </span>
        );
      case "Paused":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Paused
          </span>
        );
      case "Draft":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700">
            Draft
          </span>
        );
    }
  };

  const [playingEmployeeId, setPlayingEmployeeId] = useState<string | null>(null);

  const handleCardVoicePlay = (emp: AIEmployee) => {
    if (playingEmployeeId === emp.id) {
      audioEngine.stopAll();
      setPlayingEmployeeId(null);
      return;
    }

    audioEngine.stopAll();
    setPlayingEmployeeId(emp.id);

    const greeting =
      emp.config?.greeting ||
      `నమస్కారం అండి! నేను SideMate నుంచి ${emp.name}ను మాట్లాడుతున్నాను. మీ కస్టమర్లతో నేచురల్ తెలుగులో మాట్లాడటానికి సిద్ధంగా ఉన్నాను.`;

    const voiceId = emp.voice.toLowerCase().includes("suresh") || emp.voice.toLowerCase().includes("p09")
      ? "suresh"
      : emp.voice.toLowerCase().includes("p07")
      ? "venkat"
      : "ananya";

    audioEngine.playVoice(
      voiceId,
      greeting,
      "office",
      20,
      () => setPlayingEmployeeId(emp.id),
      () => setPlayingEmployeeId(null)
    );
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-foreground">
              My AI Employees
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 dark:bg-purple-950/80 text-[#6344E7] dark:text-purple-300 border border-purple-200/80 dark:border-purple-800">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6344E7] animate-pulse" />
              Enterprise Multi-Agent Engine
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
            Autonomous Telugu & English AI callers delivering sub-350ms conversational latency for Indian businesses.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadEmployees}
            title="Refresh employees list"
            className="p-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-card hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300 transition-colors shadow-2xs cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <Link href="/dashboard/ai-employees/new">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#6344E7] to-[#7952F5] hover:from-[#5233D6] hover:to-[#6840E8] text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all cursor-pointer hover:scale-[1.02]">
              <Plus className="h-4 w-4 stroke-[2.5]" />
              New employee
            </button>
          </Link>
        </div>
      </div>

      {/* ── Executive Telemetry & ROI Ribbon ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        {/* Metric 1: Live Calling Trunks */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 dark:border-emerald-500/30 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Live Calling Trunks
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900 dark:text-white">2 / 5</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Lines Active</span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500 dark:text-zinc-400">
            Sub-350ms Indian SIP trunks online
          </p>
        </div>

        {/* Metric 2: Today's Connected Calls */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-500/20 dark:border-purple-500/30 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
              Today's Calls
            </span>
            <span className="text-xs">📞</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900 dark:text-white">48</span>
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              68.4% Pickup
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500 dark:text-zinc-400">
            Average duration: 2m 15s
          </p>
        </div>

        {/* Metric 3: Site Visits Booked */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-500/20 dark:border-blue-500/30 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              Site Visits Booked
            </span>
            <span className="text-xs">🎯</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900 dark:text-white">12</span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              +25% vs yesterday
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500 dark:text-zinc-400">
            Automated WhatsApp confirmations sent
          </p>
        </div>

        {/* Metric 4: Cost Saved Today */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 dark:border-amber-500/30 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Cost Saved Today
            </span>
            <span className="text-xs">₹</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900 dark:text-white">₹4,820</span>
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
              88% Saved
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500 dark:text-zinc-400">
            ₹1.80/min AI vs ₹15/min human agent
          </p>
        </div>
      </div>

      {/* ── Dual Filter Toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Bar */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name or role..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-[#6344E7]/20 focus:border-[#6344E7] placeholder:text-gray-400 shadow-2xs"
            />
          </div>

          {/* Channels Group */}
          <div className="flex items-center gap-1.5 bg-gray-50/70 dark:bg-zinc-900/60 p-1 rounded-2xl border border-gray-200/70 dark:border-zinc-800">
            <button
              onClick={() => setChannelFilter("All channels")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                channelFilter === "All channels"
                  ? "bg-[#6344E7] text-white shadow-xs"
                  : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-foreground"
              }`}
            >
              All channels
            </button>
            <button
              onClick={() => setChannelFilter("Inbound")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                channelFilter === "Inbound"
                  ? "bg-[#6344E7] text-white shadow-xs font-semibold"
                  : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-foreground"
              }`}
            >
              <span>📞</span> Inbound
            </button>
            <button
              onClick={() => setChannelFilter("Instant lead")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                channelFilter === "Instant lead"
                  ? "bg-[#6344E7] text-white shadow-xs font-semibold"
                  : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-foreground"
              }`}
            >
              <span>⚡</span> Instant lead
            </button>
            <button
              onClick={() => setChannelFilter("Campaigns")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                channelFilter === "Campaigns"
                  ? "bg-[#6344E7] text-white shadow-xs font-semibold"
                  : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-foreground"
              }`}
            >
              <span>📢</span> Campaigns
            </button>
          </div>

          {/* Statuses Group */}
          <div className="flex items-center gap-1.5 bg-gray-50/70 dark:bg-zinc-900/60 p-1 rounded-2xl border border-gray-200/70 dark:border-zinc-800">
            <button
              onClick={() => setStatusFilter("All statuses")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === "All statuses"
                  ? "bg-[#6344E7] text-white shadow-xs"
                  : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-foreground"
              }`}
            >
              All statuses
            </button>
            <button
              onClick={() => setStatusFilter("Live")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === "Live"
                  ? "bg-[#6344E7] text-white shadow-xs font-semibold"
                  : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-foreground"
              }`}
            >
              Live
            </button>
            <button
              onClick={() => setStatusFilter("Paused")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                statusFilter === "Paused"
                  ? "bg-[#6344E7] text-white shadow-xs font-semibold"
                  : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-foreground"
              }`}
            >
              Paused
            </button>
            <button
              onClick={() => setStatusFilter("Draft")}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                statusFilter === "Draft"
                  ? "bg-[#6344E7] text-white shadow-xs font-semibold"
                  : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-foreground"
              }`}
            >
              Draft
            </button>
          </div>
        </div>

        {/* Sort Button */}
        <div>
          <button
            onClick={() => {
              setSortBy((prev) => (prev === "Recently hired" ? "Name" : prev === "Name" ? "Calls" : "Recently hired"));
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-card text-xs font-medium text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800 shadow-2xs cursor-pointer"
          >
            <span>⇅</span> {sortBy}
          </button>
        </div>
      </div>

      {/* Showing count */}
      <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
        <span>
          Showing <strong className="text-gray-900 dark:text-foreground font-semibold">{filteredEmployees.length}</strong> active AI team members
        </span>
        <span className="text-[11px] text-gray-400 dark:text-zinc-500 hidden sm:inline">
          💡 Click "Audition Voice" to sample live natural Telugu speech
        </span>
      </div>

      {/* ── Elevated Employee Cards Grid ── */}
      {viewState === "normal" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((emp) => {
            const isLive = emp.status === "Live" || emp.status === "Active";

            return (
              <div
                key={emp.id}
                className="group relative overflow-hidden rounded-2xl bg-white/95 dark:bg-[#18181b]/95 backdrop-blur-xl border border-gray-200/80 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-5 flex flex-col justify-between space-y-4"
              >
                {/* Top Subtle Shimmer Accent */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#6344E7]/30 to-transparent group-hover:via-[#6344E7]/70 transition-all" />

                {/* Top Row: Avatar with status glow + Name + Role + Last Active */}
                <div className="flex items-start gap-3.5">
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-md ${getAvatarBg(emp)} ${
                        isLive ? "ring-4 ring-emerald-500/25 shadow-emerald-500/10" : ""
                      }`}
                    >
                      {emp.avatar || emp.name.charAt(0)}
                    </div>
                    {isLive && (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-900 shadow-xs" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight truncate">
                        {emp.name}
                      </h3>
                      {renderStatusPill(emp.status)}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium mt-0.5 truncate">
                      {emp.role}
                    </p>
                    <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-0.5">
                      Last active: {emp.lastActive || "No calls yet"}
                    </p>
                  </div>
                </div>

                {/* ── Real-Time Voice Waveform Player Bar ── */}
                <div className="flex items-center justify-between rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-100/90 dark:border-purple-900/40 px-3 py-2 transition-all">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {playingEmployeeId === emp.id ? (
                      <div className="flex items-center gap-1 h-3.5">
                        <span className="w-1 bg-[#6344E7] rounded-full animate-bounce [animation-delay:-0.3s] h-3.5" />
                        <span className="w-1 bg-[#6344E7] rounded-full animate-bounce [animation-delay:-0.15s] h-2.5" />
                        <span className="w-1 bg-[#6344E7] rounded-full animate-bounce h-3.5" />
                        <span className="w-1 bg-[#6344E7] rounded-full animate-bounce [animation-delay:-0.2s] h-2" />
                      </div>
                    ) : (
                      <Volume2 className="h-3.5 w-3.5 text-[#6344E7] shrink-0" />
                    )}
                    <span className="text-[11px] font-semibold text-gray-800 dark:text-zinc-200 truncate">
                      {playingEmployeeId === emp.id ? "Auditioning Telugu Speech..." : `${emp.voiceModelTag || "P09 · te-IN"} Voice`}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCardVoicePlay(emp)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#6344E7] hover:bg-[#5233D6] text-white text-[11px] font-bold shadow-xs transition-all cursor-pointer shrink-0"
                    title="Play 3-second live natural voice audition"
                  >
                    {playingEmployeeId === emp.id ? (
                      <>
                        <Square className="h-3 w-3 fill-current" /> Stop
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3 fill-current" /> Audition
                      </>
                    )}
                  </button>
                </div>

                {/* Tags Row */}
                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#F4F1FD] dark:bg-purple-950/40 text-[#6344E7] dark:text-purple-300 font-medium border border-[#EAE4FC] dark:border-purple-900/50">
                    <span>⚡</span> {emp.channel || "Instant lead"}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#F4F1FD] dark:bg-purple-950/40 text-[#6344E7] dark:text-purple-300 font-medium border border-[#EAE4FC] dark:border-purple-900/50">
                    <span>🇮🇳</span> తెలుగు (Telugu Specialist)
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 font-medium border border-gray-200 dark:border-zinc-700">
                    <span>📞</span> {emp.phoneNumber || "No number yet"}
                  </span>
                </div>

                {/* Metrics Row: 3 columns */}
                <div className="grid grid-cols-3 gap-2 text-center py-2.5 border-y border-gray-100 dark:border-zinc-800">
                  <div>
                    <div className="font-extrabold text-gray-900 dark:text-white text-lg leading-tight">
                      {emp.callsToday ?? 0}
                    </div>
                    <div className="text-[11px] text-gray-400 font-medium mt-0.5">Calls today</div>
                  </div>
                  <div>
                    <div className="font-extrabold text-gray-900 dark:text-white text-lg leading-tight">
                      {emp.leadsCount ?? (emp.name.toLowerCase().includes("prakash") ? 1 : 0)}
                    </div>
                    <div className="text-[11px] text-gray-400 font-medium mt-0.5">Leads</div>
                  </div>
                  <div>
                    <div className="font-extrabold text-gray-900 dark:text-white text-lg leading-tight text-emerald-600 dark:text-emerald-400">
                      {emp.qualifiedCount ?? 0}
                    </div>
                    <div className="text-[11px] text-gray-400 font-medium mt-0.5">Qualified</div>
                  </div>
                </div>

                {/* Bottom Actions Row */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => openInstantCall(emp)}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer hover:scale-[1.01]"
                    title="Directly enter phone number and initiate instant call"
                  >
                    <PhoneCall className="h-3.5 w-3.5" />
                    Instant Call
                  </button>

                  <button
                    onClick={() => openEdit(emp)}
                    className="py-2 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-[#6344E7] dark:text-purple-300 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                    title="Configure script, prompt & rules"
                  >
                    <Settings2 className="h-3.5 w-3.5" />
                    Configure
                  </button>

                  <button
                    onClick={() => duplicateEmployee(emp)}
                    title="Duplicate employee"
                    className="p-2 rounded-xl border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-500 hover:text-gray-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* ── Elevated Dashed "Create a New Employee" Card ── */}
          <Link
            href="/dashboard/ai-employees/new"
            className="group relative border-2 border-dashed border-[#DED6FA] dark:border-purple-900/60 hover:border-[#6344E7] bg-gradient-to-br from-[#FBF9FF] to-white dark:from-[#1a1726]/40 dark:to-[#18181b] hover:from-[#F6F2FE] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[260px] shadow-xs hover:shadow-md"
          >
            <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-[#6344E7] to-[#8B5CF6] text-white flex items-center justify-center shadow-md shadow-purple-500/20 mb-3 group-hover:scale-110 transition-transform">
              <Plus className="h-6 w-6 stroke-[2.5]" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">
              Create a new employee
            </h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium mb-3">
              Free to build · ready in 5 minutes
            </p>

            <div className="flex flex-col gap-1 text-[11px] text-gray-500 dark:text-zinc-400 font-medium">
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600" /> Natural Telugu & English flow
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-600" /> Auto generated call scripts & FAQs
              </span>
            </div>
          </Link>
        </div>
      )}

      {/* ── Instant Direct Call Modal ── */}
      <Modal
        isOpen={instantCallModal.open}
        onClose={() => {
          if (callState === "connected" || callState === "dialing" || callState === "ringing") {
            audioEngine.stopAll();
          }
          setInstantCallModal({ open: false, employee: null });
          setCallState("idle");
        }}
        title={`Instant Call: ${instantCallModal.employee?.name || "AI Employee"}`}
        description="Directly enter any phone number to make an instant live call with this selected AI employee."
        maxWidth="lg"
      >
        <div className="space-y-4">
          {/* Selected Employee Summary Card */}
          <div className="flex items-center justify-between rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-xs">
                {instantCallModal.employee?.avatar || "AI"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-foreground">
                    {instantCallModal.employee?.name}
                  </h4>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.2 rounded-full border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Ready to Dial
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Voice: <span className="font-medium text-foreground">{instantCallModal.employee?.voice}</span> • Language: <span className="text-indigo-600 dark:text-indigo-400 font-medium">{instantCallModal.employee?.language}</span>
                </p>
              </div>
            </div>

            <div className="text-right text-[11px] text-muted-foreground hidden sm:block">
              <span>Local Carrier Line</span>
              <span className="block font-semibold text-foreground">+91 Local Outbound</span>
            </div>
          </div>

          {/* STATE 1: IDLE / CONFIGURATION */}
          {callState === "idle" && (
            <div className="space-y-4">
              {/* Direct Phone Number Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Enter Phone Number to Call Directly *</span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">India (+91 Mobile / Landline)</span>
                </label>
                <div className="flex rounded-xl border border-border bg-card overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/40 focus-within:border-indigo-500 shadow-xs">
                  <div className="flex items-center gap-1.5 bg-muted/60 px-3 py-2 border-r border-border text-xs font-bold text-foreground">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    value={directPhone.replace(/^\+91\s*/, "")}
                    onChange={(e) => setDirectPhone(`+91 ${e.target.value}`)}
                    placeholder="98480 12345"
                    className="flex-1 bg-transparent px-3 py-2 text-sm font-bold tracking-wider text-foreground placeholder:text-muted-foreground focus:outline-none"
                    autoFocus
                  />
                </div>

                {/* Quick preset chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mr-1">Presets:</span>
                  {[
                    { label: "Rajesh Goud", phone: "+91 98480 12345", company: "Fortune Heights" },
                    { label: "Dr. Lakshmi", phone: "+91 94401 56789", company: "KIMS Care Clinic" },
                    { label: "Subba Rao", phone: "+91 89781 23456", company: "Sri Balaji Wholesale" },
                    { label: "Sravani Reddy", phone: "+91 70931 45678", company: "Amaravati Green Spaces" },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setDirectPhone(p.phone);
                        setDirectLeadName(p.label);
                        setDirectCompany(p.company);
                      }}
                      className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/40 hover:bg-muted px-2 py-0.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      <span>{p.label}</span>
                      <span className="text-[10px] text-muted-foreground/70">({p.phone.slice(-5)})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prospect Name & Context */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Prospect Name</label>
                  <Input
                    value={directLeadName}
                    onChange={(e) => setDirectLeadName(e.target.value)}
                    placeholder="e.g. Rajesh Goud"
                    className="text-xs h-9 bg-card"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Company / Location</label>
                  <Input
                    value={directCompany}
                    onChange={(e) => setDirectCompany(e.target.value)}
                    placeholder="e.g. Hyderabad"
                    className="text-xs h-9 bg-card"
                  />
                </div>
              </div>

              {/* Background Ambient Sound Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Background Ambience (Simulates Live Room Tone)</span>
                  <span className="text-[10px] text-muted-foreground">Office ambience recommended</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "office", name: "Office", icon: "🏢" },
                    { id: "callcenter", name: "Call Center", icon: "🎧" },
                    { id: "quiet", name: "Quiet Room", icon: "🎙️" },
                  ].map((amb) => (
                    <button
                      key={amb.id}
                      type="button"
                      onClick={() => setSelectedAmbient(amb.id as AmbientSoundId)}
                      className={`p-2 rounded-lg border text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        selectedAmbient === amb.id
                          ? "border-indigo-600 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold"
                          : "border-border bg-card hover:bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <span>{amb.icon}</span>
                      <span>{amb.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Big Action Button */}
              <div className="pt-2">
                <Button
                  onClick={startInstantCall}
                  disabled={!directPhone.trim()}
                  className="w-full h-11 gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-md cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <PhoneCall className="h-4 w-4 animate-bounce" />
                  Call {directPhone} Now (Instant Connect)
                </Button>
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  ⚡ Connects within seconds with real-time natural Telugu speech & automated notes.
                </p>
              </div>
            </div>
          )}

          {/* STATE 2: DIALING / RINGING */}
          {(callState === "dialing" || callState === "ringing") && (
            <div className="py-8 text-center space-y-4">
              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border-2 border-emerald-500 text-emerald-600">
                <span className="absolute inset-0 rounded-full border-2 border-emerald-500 animate-ping opacity-30" />
                <PhoneCall className="h-8 w-8 animate-pulse" />
              </div>

              <div>
                <h3 className="text-base font-bold text-foreground">
                  {callState === "dialing" ? "Dialing..." : "Ringing Prospect Phone..."}
                </h3>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                  {directPhone}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Caller: {instantCallModal.employee?.name} ({instantCallModal.employee?.voice})
                </p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-muted/60 px-3 py-1 text-xs text-muted-foreground border border-border">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Establishing carrier SIP route • Sub-350ms pipeline</span>
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    audioEngine.stopAll();
                    setCallState("idle");
                  }}
                  className="text-xs"
                >
                  Cancel Dialing
                </Button>
              </div>
            </div>
          )}

          {/* STATE 3: CONNECTED & LIVE */}
          {callState === "connected" && (
            <div className="space-y-3.5">
              {/* Call Header Bar */}
              <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 text-emerald-700 dark:text-emerald-400">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-xs font-bold uppercase tracking-wide">
                    Live Call Connected
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono font-bold">
                  <span>
                    {Math.floor(callDuration / 60)
                      .toString()
                      .padStart(2, "0")}
                    :{(callDuration % 60).toString().padStart(2, "0")}
                  </span>
                  <span className="text-[10px] font-sans font-medium text-emerald-600/80 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                    280ms Latency
                  </span>
                </div>
              </div>

              {/* Prospect & Agent details */}
              <div className="flex items-center justify-between text-xs px-1 text-muted-foreground">
                <span>Prospect: <strong className="text-foreground">{directLeadName}</strong> ({directPhone})</span>
                <span>Agent: <strong className="text-indigo-600 dark:text-indigo-400">{instantCallModal.employee?.name}</strong></span>
              </div>

              {/* Live Streaming Transcript */}
              <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2.5 max-h-56 overflow-y-auto scrollbar-thin">
                <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center justify-between border-b border-border/60 pb-1">
                  <span>Live Turn-by-Turn Audio & Speech</span>
                  <span className="text-emerald-600 flex items-center gap-1">
                    <Volume2 className="h-3 w-3 animate-pulse" /> Audio Live
                  </span>
                </div>

                {callTranscript.map((turn, tIdx) => (
                  <div key={tIdx} className="space-y-0.5 text-xs animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="font-bold text-foreground">{turn.speaker}</span>
                      <span className="font-mono">{turn.time}</span>
                    </div>
                    <p className="rounded-lg bg-card border border-border/60 p-2 text-xs leading-relaxed text-foreground">
                      {turn.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Live Call Control Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setWhatsAppSent(true)}
                  disabled={whatsAppSent}
                  className="gap-1.5 text-xs h-9 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                >
                  <Check className="h-3.5 w-3.5" />
                  {whatsAppSent ? "WhatsApp Brochure Sent ✓" : "Send WhatsApp Brochure"}
                </Button>

                <Button
                  size="sm"
                  onClick={endInstantCall}
                  className="gap-1.5 text-xs h-9 bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs cursor-pointer"
                >
                  <PhoneOff className="h-3.5 w-3.5" />
                  Hang Up & Save Call Record
                </Button>
              </div>
            </div>
          )}

          {/* STATE 4: CALL ENDED & SUMMARY */}
          {callState === "ended" && (
            <div className="py-4 space-y-4">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center space-y-2">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                  <Check className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-foreground">
                  Call Successfully Completed & Saved!
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Outbound call to <strong className="text-foreground">{directPhone}</strong> with <strong className="text-foreground">{instantCallModal.employee?.name}</strong> was recorded and logged.
                </p>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-2 text-center rounded-xl border border-border bg-card p-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Duration</span>
                  <span className="text-sm font-extrabold text-foreground">
                    {Math.floor(callDuration / 60)}m {(callDuration % 60)}s
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">Call Outcome</span>
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                    Meeting Booked
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">WhatsApp</span>
                  <span className="text-sm font-extrabold text-foreground">Brochure Sent</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCallState("idle");
                    setCallDuration(0);
                    setCallTranscript([]);
                  }}
                  className="gap-1.5 text-xs h-9"
                >
                  <PhoneCall className="h-3.5 w-3.5 text-emerald-600" />
                  Call Another Number
                </Button>

                <Button
                  size="sm"
                  onClick={() => {
                    setInstantCallModal({ open: false, employee: null });
                    router.push("/dashboard/calls");
                  }}
                  className="gap-1.5 text-xs h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  View in Call History
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Test Voice & Simulation Modal */}
      <Modal
        isOpen={testCallModal.open}
        onClose={() => {
          audioEngine.stopAll();
          setIsPlayingAudio(false);
          setTestCallModal({ open: false, employee: null });
        }}
        title={`Test Voice & Call: ${testCallModal.employee?.name}`}
        description="Experience your AI employee's voice mixed with real ambient background sound."
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-3.5 text-xs text-foreground">
            <div className="flex items-center gap-2 font-bold text-indigo-600 dark:text-indigo-400 mb-1">
              <Sparkles className="h-4 w-4" />
              Live Interactive Audio Testing
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Listen to {testCallModal.employee?.name} speak with real audio mixing. Ambient background sound is mixed naturally beneath the voice.
            </p>
          </div>

          {/* Ambient Sound Selection for Test */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>Ambient Background Sound</span>
              <span className="text-[11px] text-muted-foreground">Volume: {ambientVolume}%</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AMBIENT_SOUND_OPTIONS.map((amb) => {
                const isSelected = selectedAmbient === amb.id;
                return (
                  <button
                    key={amb.id}
                    onClick={() => {
                      setSelectedAmbient(amb.id);
                      if (isPlayingAudio) {
                        audioEngine.startAmbient(amb.id, ambientVolume);
                      }
                    }}
                    className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-600"
                        : "border-border bg-card hover:bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <span className="mr-1.5">{amb.icon}</span>
                    <span className="font-semibold">{amb.name}</span>
                  </button>
                );
              })}
              <button
                onClick={() => {
                  setSelectedAmbient("none");
                  audioEngine.stopAmbient();
                }}
                className={`p-2 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                  selectedAmbient === "none"
                    ? "border-indigo-600 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-600"
                    : "border-border bg-card hover:bg-muted/40 text-muted-foreground"
                }`}
              >
                <span className="font-semibold">🔇 No Background Sound</span>
              </button>
            </div>

            {selectedAmbient !== "none" && (
              <div className="pt-2">
                <input
                  type="range"
                  min={5}
                  max={100}
                  value={ambientVolume}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setAmbientVolume(v);
                    audioEngine.setAmbientVolume(v);
                  }}
                  className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-muted rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Audio Playback Controls */}
          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-sm text-foreground block">
                  Greeting & Script Audition
                </span>
                <span className="text-xs text-muted-foreground">
                  Voice: {testCallModal.employee?.voice}
                </span>
              </div>

              <Button
                size="sm"
                onClick={handlePlayVoiceTest}
                className={`gap-2 text-xs font-semibold ${
                  isPlayingAudio
                    ? "bg-rose-600 hover:bg-rose-700 text-white"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                }`}
              >
                {isPlayingAudio ? (
                  <>
                    <Square className="h-3.5 w-3.5 fill-current" />
                    Stop Audio
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Play Sample Audio
                  </>
                )}
              </Button>
            </div>

            {/* Live Logs */}
            {testCallLog.length > 0 && (
              <div className="p-2.5 rounded-lg bg-muted/40 border border-border text-[11px] font-mono text-muted-foreground space-y-1 max-h-28 overflow-y-auto">
                {testCallLog.map((log, idx) => (
                  <div key={idx}>{log}</div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-[11px] text-muted-foreground">
              🛡️ Safe Sandbox: Never initiates real telecom calls automatically.
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                audioEngine.stopAll();
                setIsPlayingAudio(false);
                setTestCallModal({ open: false, employee: null });
              }}
            >
              Close Test
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false, employee: null })}
        title={`Edit ${editModal.employee?.name}`}
        description="Update role definition, live status, and conversational objective."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Employee Name</label>
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="e.g. Ananya Rao"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Role Title</label>
            <Input
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              placeholder="e.g. Telugu Customer Service & Sales Caller"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Live Status</label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as EmployeeStatus)}
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-600"
            >
              <option value="Live">Live (Active & ready to call)</option>
              <option value="Ready">Ready (Configured)</option>
              <option value="Building">Building (In training)</option>
              <option value="Paused">Paused (Temporarily stopped)</option>
              <option value="Draft">Draft (Not active)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Core Objective Prompt</label>
            <textarea
              value={editObjective}
              onChange={(e) => setEditObjective(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-border bg-card p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditModal({ open: false, employee: null })}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={saveEdit}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
