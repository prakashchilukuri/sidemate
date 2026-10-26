"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Phone,
  ArrowRight,
  CheckCircle2,
  Play,
  Pause,
  Sparkles,
  Volume2,
  Check,
  ChevronRight,
  Sliders,
  DollarSign,
  Headphones,
  Zap,
  Megaphone,
  PhoneCall,
  Clock,
  ShieldCheck,
  Building2,
  Users,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden bg-[#06050c] text-white min-h-screen">
      {/* ── Radiant Cosmic Ambient Mesh Glows ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[650px] bg-gradient-to-b from-indigo-600/25 via-purple-600/15 to-transparent blur-[160px] pointer-events-none -z-10" />
      <div className="absolute top-[600px] -right-32 w-[600px] h-[600px] bg-cyan-500/15 blur-[180px] pointer-events-none -z-10" />
      <div className="absolute top-[1600px] -left-32 w-[700px] h-[700px] bg-purple-600/15 blur-[180px] pointer-events-none -z-10" />
      <div className="absolute top-[2800px] right-0 w-[600px] h-[600px] bg-indigo-600/15 blur-[180px] pointer-events-none -z-10" />

      {/* ── Modern Architectural Grid Pattern ── */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none -z-10" />

      <HeroSection />
      <LogoCloudSection />
      <EnhanceSection />
      <InteractiveLiveDemoSection />
      <MidnightShowcaseSection />
      <VoiceAuditionSection />
      <RoiCalculatorSection />
      <ComparisonSection />
      <PricingSection />
      <FaqSection />
      <CTASection />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   1. HERO SECTION (ULTRA LUXURY OBSIDIAN & ELECTRIC GRADIENTS)
───────────────────────────────────────────────────────────────────────────── */
function HeroSection() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<"realestate" | "clinic" | "wholesale">("realestate");
  const [activeStep, setActiveStep] = useState(2);

  const scenarios = {
    realestate: {
      badge: "Real Estate · Hyderabad",
      title: "Fortune Heights Luxury Plots",
      agent: "Ananya Rao",
      teluguAgent: "అనన్య రావు",
      lead: "Rajesh Goud",
      phone: "+91 98480 23145",
      location: "Mokila / Shankarpally, Hyd",
      intent: "Book Weekend Site Visit with Free Cab Pickup",
      turn1_ai: "నమస్కారం రాజేష్ గారు! నేను ఫార్చ్యూన్ హైట్స్ నుంచి అనన్యను మాట్లాడుతున్నాను. మీరు నిన్న మా శంకరపల్లి ఓపెన్ ప్లాట్స్ గురించి ఎంక్వైరీ చేశారు కదా—వివరాలు చెప్పడానికి ఇప్పుడు మాట్లాడవచ్చా అండి?",
      turn1_lead: "హలో అనన్య గారు. HMDA, RERA అప్రూవల్స్ ఉన్నాయా? గజం ధర ఎంత ఉంది?",
      turn2_ai: "తప్పకుండా సార్! 100% క్లియర్ టైటిల్ తో HMDA & RERA అప్రూవల్స్ ఉన్నాయి. గజం ధర ₹18,500 నుంచి ప్రారంభమవుతుంది. శనివారం ఉదయం 11 గంటలకు ఫ్రీ కార్ పికప్ తో సైట్ విజిట్ ప్లాన్ చేద్దామా సార్?",
      outcome: "Site visit confirmed for Saturday 11:00 AM · WhatsApp location & brochure sent",
      whatsappMsg: "📍 Mokila Site Location + HMDA Brochure PDF sent to Rajesh (+91 98480 •••••)",
    },
    clinic: {
      badge: "Healthcare · Vijayawada",
      title: "KIMS Care Super Specialty",
      agent: "Dr. Kavitha",
      teluguAgent: "డాక్టర్ కవిత",
      lead: "Lakshmi Prasanna",
      phone: "+91 94401 88231",
      location: "MG Road, Vijayawada",
      intent: "Confirm Doctor Consultation Slot & Token",
      turn1_ai: "నమస్తే మేడమ్! కిమ్స్ కేర్ క్లినిక్ నుంచి మాట్లాడుతున్నాము. డాక్టర్ నరసింహారావు గారి కన్సల్టేషన్ రేపు సాయంత్రం 5 గంటలకు కన్ఫర్మ్ చేయమంటారా అండి?",
      turn1_lead: "అవునండి, డాక్టర్ గారు అందుబాటులో ఉంటారా? పాత ఈసీజీ రిపోర్ట్స్ తీసుకురావాలా?",
      turn2_ai: "అవునండి మేడమ్, డాక్టర్ గారు రేపు క్లినిక్ లోనే ఉంటారు. మీ పాత ప్రిస్క్రిప్షన్ మరియు ఈసీజీ రిపోర్ట్స్ తప్పకుండా తీసుకురండి. టోకెన్ #14 కన్ఫర్మ్ చేశాను.",
      outcome: "Doctor appointment token #14 confirmed · Instant SMS & WhatsApp notification",
      whatsappMsg: "🩺 Token #14 confirmed for Tomorrow 5:00 PM · Dr. Narasimha Rao (Cardiology)",
    },
    wholesale: {
      badge: "FMCG Wholesale · Guntur / Vizag",
      title: "Sri Balaji Traders & Mills",
      agent: "Venkat Reddy",
      teluguAgent: "వెంకట్ రెడ్డి",
      lead: "Suresh Kumar",
      phone: "+91 89190 77412",
      location: "Main Market, Vizag",
      intent: "Repeat Bulk Rice & Dal Supply Order",
      turn1_ai: "హలో సురేష్ గారు! శ్రీ బాలాజీ హోల్‌సేల్ డీలర్స్ నుంచి. ఈ వారం బాస్మతి రైస్ కొత్త స్టాక్ వచ్చింది క్వింటాల్ కి ₹3,800 చొప్పున. మీ షాపుకి 20 బ్యాగులు బుక్ చేయమంటారా?",
      turn1_lead: "ధర కొంచెం తగ్గించండి వెంకట్ గారు, 30 బ్యాగులు తీసుకుంటాను.",
      turn2_ai: "30 బ్యాగుల ఆర్డర్ కి క్వింటాల్ కి ₹3,650 చొప్పున బెస్ట్ హోల్‌సేల్ రేట్ ఇస్తాను సార్. రేపు ఉదయం 10 గంటలకి డెలివరీ ట్రక్ లో లోడ్ చేయమంటారా?",
      outcome: "Bulk order worth ₹1,09,500 booked · GST invoice generated automatically",
      whatsappMsg: "📦 Order Confirmed: 30 Bags Basmati Rice @ ₹3,650/qtl · Delivery Tomorrow 10 AM",
    },
  };

  const active = scenarios[selectedScenario];

  // Realistic synthesized audio simulation via Web Audio API + SpeechSynthesis
  const togglePlayAudio = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const textToSpeak = active.turn1_ai;
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 0.95;
        utterance.pitch = 1.05;
        // Search for Telugu voice or fallback gracefully
        const voices = window.speechSynthesis.getVoices();
        const teluguVoice = voices.find((v) => v.lang.includes("te") || v.lang.includes("TE"));
        if (teluguVoice) utterance.voice = teluguVoice;
        utterance.onend = () => setIsPlaying(false);
        utterance.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => setIsPlaying(false), 5000);
      }
    } else {
      setIsPlaying(false);
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    }
  };

  return (
    <section className="relative pt-24 pb-16 sm:pt-28 sm:pb-24 lg:pt-32 lg:pb-28 overflow-hidden isolate">
      {/* ── Multi-Layered Radiant Nebula Lighting ── */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] bg-gradient-to-b from-indigo-500/25 via-purple-600/15 to-transparent blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-32 left-1/4 w-[500px] h-[350px] bg-cyan-500/15 blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-48 right-1/4 w-[500px] h-[350px] bg-purple-500/15 blur-[120px] pointer-events-none -z-10" />

      {/* ── High-Tech Radiant Grid Beam Floor ── */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(120,119,198,0.2),transparent_100%)] pointer-events-none -z-10" />

      {/* ══════════════════════════════════════════════════════════════════
          HEADLINE STATEMENT: "Every lead gets a call."
      ══════════════════════════════════════════════════════════════════ */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 text-center mb-16 sm:mb-20">
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-[-0.04em] text-white leading-[1.05] mb-6">
          Every lead gets a call<span className="text-indigo-400">.</span>
        </h1>
        <p className="text-xl sm:text-3xl lg:text-[32px] leading-relaxed font-medium text-slate-400 max-w-4xl mx-auto">
          Voice agents that{" "}
          <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent font-semibold">
            sound like your best caller,
          </span>
          <br className="hidden sm:block" />
          in the language your customer thinks in.
        </p>

        {/* ── 3 Value Proposition Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md px-6 py-5 text-left hover:border-white/[0.15] transition-all">
            <h3 className="text-[15px] font-bold text-white mb-1.5">Speed to lead</h3>
            <p className="text-[13px] text-slate-400 leading-relaxed">Rings new enquiries in under 30 seconds</p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md px-6 py-5 text-left hover:border-white/[0.15] transition-all">
            <h3 className="text-[15px] font-bold text-white mb-1.5">Big lists, no queue</h3>
            <p className="text-[13px] text-slate-400 leading-relaxed">Hundreds of calls at once, retried for you</p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md px-6 py-5 text-left hover:border-white/[0.15] transition-all">
            <h3 className="text-[15px] font-bold text-white mb-1.5">Always on</h3>
            <p className="text-[13px] text-slate-400 leading-relaxed">Picks up your number, day and night</p>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          EXISTING HERO: Calling Cockpit + Live Demo
      ══════════════════════════════════════════════════════════════════ */}
      <div id="instant-leads" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 scroll-mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* ── Left Column: Clean, Light Value Prop (5 cols) ── */}
          <div className="lg:col-span-5 text-center lg:text-left space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Calling Simulation
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-[36px] font-bold tracking-tight text-white leading-tight">
              Turn every enquiry into a customer with{" "}
              <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-cyan-300 bg-clip-text text-transparent">
                24/7 autonomous voice AI.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal max-w-lg mx-auto lg:mx-0">
              SideMate dials new leads in under 30 seconds, converses in fluent Telugu &amp; English, and automatically schedules appointments on WhatsApp.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
              <Link
                href="/dashboard/ai-employees/new"
                className="inline-flex items-center justify-center h-11 px-6 rounded-full text-[13.5px] font-semibold bg-gradient-to-r from-indigo-500 to-cyan-500 hover:opacity-95 text-white shadow-lg shadow-indigo-500/25 gap-2 transition-all active:scale-95 cursor-pointer"
              >
                Start Free (500 Mins)
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={togglePlayAudio}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-full text-[13px] font-medium border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] text-white backdrop-blur-md transition-all cursor-pointer"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 fill-cyan-400 text-cyan-400 animate-pulse" />
                    <span>Pause Audio</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-cyan-400 text-cyan-400" />
                    <span>Hear Live Call</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Proof Pills */}
            <div className="flex items-center justify-center lg:justify-start gap-3 text-[12px] text-slate-400 font-medium pt-1">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                UPI &amp; Indian Cards
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                500 Mins Free
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                WhatsApp Sync
              </span>
            </div>

            {/* Live Trust Metrics Dock */}
            <div className="pt-4 border-t border-white/[0.08] flex items-center justify-center lg:justify-start gap-6 sm:gap-8">
              <div>
                <div className="text-lg sm:text-xl font-bold text-white">⚡ 280ms</div>
                <div className="text-[11px] text-slate-400">Telugu Latency</div>
              </div>
              <div className="h-7 w-[1px] bg-white/10" />
              <div>
                <div className="text-lg sm:text-xl font-bold text-emerald-400">₹5/min</div>
                <div className="text-[11px] text-slate-400">Starting Cost</div>
              </div>
              <div className="h-7 w-[1px] bg-white/10" />
              <div>
                <div className="text-lg sm:text-xl font-bold text-cyan-400">94.2%</div>
                <div className="text-[11px] text-slate-400">Conversion</div>
              </div>
            </div>
          </div>

          {/* ── Right Column: The Calling Cockpit (7 cols) ── */}
          <div className="lg:col-span-7 relative">
            {/* Subtle Ambient Halo behind Console */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500/20 via-purple-500/15 to-cyan-500/20 blur-2xl opacity-40 pointer-events-none -z-10" />

            {/* The Console Chassis */}
            <div className="relative rounded-2xl border border-white/[0.08] bg-[#0a0816]/90 backdrop-blur-xl shadow-2xl overflow-hidden">
              {/* Top Telecom Bar */}
              <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] bg-white/[0.02] px-4 sm:px-5 py-3 gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="h-3.5 w-[1px] bg-white/10" />
                  <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-300">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="font-semibold text-slate-200">TELUGU VOICE v2.4</span>
                  </div>
                </div>

                {/* Scenario Selector Pills */}
                <div className="flex items-center gap-1 bg-white/[0.05] p-1 rounded-xl border border-white/[0.08]">
                  {(["realestate", "clinic", "wholesale"] as const).map((sc) => (
                    <button
                      key={sc}
                      onClick={() => {
                        setSelectedScenario(sc);
                        if (isPlaying && typeof window !== "undefined" && "speechSynthesis" in window) {
                          window.speechSynthesis.cancel();
                          setIsPlaying(false);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                        selectedScenario === sc
                          ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30 scale-[1.02]"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {sc === "realestate" ? "🏡 Real Estate" : sc === "clinic" ? "🩺 Clinic" : "🌾 Wholesale"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Console Body: 2 Columns */}
              <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-white/[0.08]">
                {/* Left Sub-Column: Agent Dossier & Audio Spectrum (5 cols) */}
                <div className="md:col-span-5 p-4 sm:p-5 space-y-4 flex flex-col justify-between bg-gradient-to-b from-white/[0.02] to-transparent">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-cyan-500 text-white font-black text-base flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)] shrink-0">
                        {active.agent.charAt(0)}
                        {isPlaying && (
                          <span className="absolute -inset-1 rounded-2xl border-2 border-cyan-400 animate-ping opacity-60" />
                        )}
                        <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#0c0a1a]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-sm text-white truncate">{active.agent}</h4>
                          <span className="text-[10px] text-cyan-300 font-medium">({active.teluguAgent})</span>
                        </div>
                        <p className="text-[11px] text-slate-300 truncate">{active.title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Telugu + English
                          </span>
                          <span className="text-[9.5px] font-bold text-emerald-400 flex items-center gap-0.5">
                            <Zap className="h-2.5 w-2.5" /> 280ms
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Call Metadata */}
                    <div className="rounded-xl border border-white/[0.08] p-2.5 space-y-1.5 text-[11px] bg-white/[0.03]">
                      <div className="flex justify-between py-0.5 border-b border-white/[0.05]">
                        <span className="text-slate-400">Lead:</span>
                        <span className="font-semibold text-white">{active.lead}</span>
                      </div>
                      <div className="flex justify-between py-0.5 border-b border-white/[0.05]">
                        <span className="text-slate-400">Phone:</span>
                        <span className="font-mono text-cyan-300">{active.phone}</span>
                      </div>
                      <div className="flex justify-between py-0.5">
                        <span className="text-slate-400">Action:</span>
                        <span className="font-bold text-purple-300 truncate max-w-[130px]">{active.intent}</span>
                      </div>
                    </div>
                  </div>

                  {/* Animated Waveform Visualizer */}
                  <div className="space-y-2.5 pt-3 border-t border-white/[0.08]">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-200 flex items-center gap-1">
                        <Volume2 className={`h-3.5 w-3.5 ${isPlaying ? "text-cyan-400 animate-pulse" : "text-slate-400"}`} />
                        Telugu Audio Wave
                      </span>
                      <span className="font-mono text-cyan-300 text-[10px]">
                        {isPlaying ? "00:32" : "00:00"}
                      </span>
                    </div>

                    {/* Equalizer Frequency Bars */}
                    <div className="flex items-center justify-between gap-0.5 h-9 px-2.5 rounded-lg bg-black/40 border border-white/[0.08]">
                      {[35, 70, 95, 45, 100, 65, 50, 85, 60, 95, 40, 80, 65, 90, 50, 75, 100, 45, 65, 35, 80, 55].map((h, i) => (
                        <span
                          key={i}
                          className={`w-0.5 rounded-full transition-all duration-150 ${
                            isPlaying
                              ? "bg-gradient-to-t from-indigo-500 via-purple-500 to-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]"
                              : "bg-slate-700"
                          }`}
                          style={{
                            height: isPlaying ? `${Math.max(25, (h * (0.4 + (i % 3) * 0.3)).toFixed(0))}%` : "20%",
                          }}
                        />
                      ))}
                    </div>

                    <Button
                      onClick={togglePlayAudio}
                      className="w-full h-9 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-bold text-xs gap-1.5 shadow-[0_0_20px_rgba(99,102,241,0.5)] cursor-pointer"
                    >
                      {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
                      {isPlaying ? "Pause Telugu AI" : "▶ Simulate Call"}
                    </Button>
                  </div>
                </div>

                {/* Right Sub-Column: Live Dialogue Stream (7 cols) */}
                <div className="md:col-span-7 p-4 sm:p-5 space-y-3 bg-black/20 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.08]">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                        Live Neural Telecalling Stream
                      </span>
                      <span className="text-[9.5px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                        Sarvam AI 2.0
                      </span>
                    </div>

                    {/* AI Turn 1 */}
                    <div className="flex gap-2.5 text-xs leading-relaxed">
                      <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-[9px] shrink-0 flex items-center justify-center">
                        AI
                      </div>
                      <div className="flex-1 rounded-xl p-2.5 bg-indigo-500/[0.08] border border-indigo-500/20 text-white">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-[10px] text-indigo-300">{active.agent}</span>
                          <span className="text-[9px] text-slate-400 font-mono">00:04</span>
                        </div>
                        <p className="text-[11.5px] text-slate-200 font-normal leading-relaxed">{active.turn1_ai}</p>
                      </div>
                    </div>

                    {/* Lead Turn */}
                    <div className="flex gap-2.5 text-xs leading-relaxed">
                      <div className="w-6 h-6 rounded-lg bg-white/[0.05] border border-white/10 text-slate-400 font-bold text-[9px] shrink-0 flex items-center justify-center">
                        LD
                      </div>
                      <div className="flex-1 rounded-xl p-2.5 bg-white/[0.02] border border-white/[0.06] text-slate-200">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-[10px] text-slate-400">{active.lead}</span>
                          <span className="text-[9px] text-slate-500 font-mono">00:16</span>
                        </div>
                        <p className="text-[11.5px] text-slate-300 font-normal leading-relaxed">{active.turn1_lead}</p>
                      </div>
                    </div>

                    {/* AI Turn 2 */}
                    <div className="flex gap-2.5 text-xs leading-relaxed">
                      <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-bold text-[9px] shrink-0 flex items-center justify-center">
                        AI
                      </div>
                      <div className="flex-1 rounded-xl p-2.5 bg-indigo-500/[0.08] border border-indigo-500/20 text-white">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-[10px] text-indigo-300">{active.agent}</span>
                          <span className="text-[9px] text-slate-400 font-mono">00:29</span>
                        </div>
                        <p className="text-[11.5px] text-slate-200 font-normal leading-relaxed">{active.turn2_ai}</p>
                      </div>
                    </div>
                  </div>

                  {/* Instant Real-Time WhatsApp Dispatch Confirmation Card */}
                  <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/25 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                        WhatsApp Sync Dispatched
                      </span>
                      <span className="text-[9.5px] font-mono text-emerald-400/80">00:30</span>
                    </div>
                    <p className="text-[10.5px] text-emerald-200/90 font-medium leading-relaxed pl-4">
                      {active.whatsappMsg}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   2. LOGO CLOUD
───────────────────────────────────────────────────────────────────────────── */
function LogoCloudSection() {
  const logos = [
    { name: "Fortune Heights", badge: "Hyderabad Real Estate" },
    { name: "KIMS Care Clinics", badge: "Vijayawada Healthcare" },
    { name: "Sri Balaji Wholesale", badge: "Vizag FMCG Traders" },
    { name: "Amaravati Infra", badge: "Andhra Projects" },
    { name: "Tirupati Agro Seeds", badge: "Agri Distributor" },
    { name: "Elite Commercial", badge: "Madhapur Commercial" },
  ];

  return (
    <section className="border-y border-white/[0.08] bg-white/[0.01] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-5">
          Powering voice calling and bookings across Andhra Pradesh &amp; Telangana
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 items-center">
          {logos.map((logo, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-white/[0.03] transition-colors"
            >
              <span className="font-bold text-[13.5px] tracking-tight text-white">
                {logo.name}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                {logo.badge}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   3. "ONE BUTTON. NATIVE MANNERS." SCRIPT ENHANCER (OUTPERO STYLE IMAGE 3)
───────────────────────────────────────────────────────────────────────────── */
function EnhanceSection() {
  const [selectedLang, setSelectedLang] = useState<"telugu" | "hindi" | "tamil" | "english">("telugu");
  const [enhanced, setEnhanced] = useState(true);

  const samples = {
    telugu: {
      plain: "Hello, you made an inquiry about Shankarpally plots. Are you free on Saturday for a site visit?",
      enhancedText: "నమస్తే అండి! మీరు శంకరపల్లి ఓపెన్ ప్లాట్స్ గురించి ఎంక్వైరీ చేశారు కదా. మీకు శనివారం టైమ్ ఉంటుందా అండి సైట్ విజిట్ కోసం?",
      rules: [
        '"andi" on questions and names',
        'respectful "meeru", never "nuvvu"',
        'Opens with "Namaste andi"',
        "Money in lakh & crore (₹)",
        "Dates said the local way",
      ],
    },
    hindi: {
      plain: "Aapne enquiry ki thi. Kya aap Saturday free hain?",
      enhancedText: "नमस्ते जी! आपने हमारे प्रोजेक्ट के लिए enquiry की थी। क्या आप शनिवार को free हैं जी?",
      rules: [
        '"ji" on questions and names',
        '"aap", never "tum"',
        'Opens with "Namaste"',
        "Money in lakh & crore (₹)",
        "Dates said the local way",
      ],
    },
    tamil: {
      plain: "Neenga enquiry pannirundheenga. Saturday time irukkuma?",
      enhancedText: "வணக்கம் அய்யா! நீங்க நம்ம project பத்தி enquiry பண்ணியிருந்தீங்க. சனிக்கிழமை நேரம் இருக்குங்களா?",
      rules: [
        'Respectful "Ayya / Amma"',
        '"Neenga", polite formal register',
        'Opens with "Vanakkam"',
        "Pricing in lakhs & crores",
      ],
    },
    english: {
      plain: "You asked about our property. When can we talk?",
      enhancedText: "Good morning Sir! Thank you for inquiring about our Hyderabad residential plots. Would Saturday at 11 AM work for a quick site tour?",
      rules: [
        "Polite Indian business English",
        "Clear affirmative cadence",
        "WhatsApp confirmation sync",
      ],
    },
  };

  const current = samples[selectedLang];

  return (
    <section id="enhance" className="py-20 lg:py-28 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Description */}
          <div className="lg:col-span-5 space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-[11px] font-bold uppercase tracking-wider text-indigo-300">
              <Sparkles className="h-3 w-3 text-cyan-400" />
              ENHANCE
            </div>

            <h2 className="text-3xl sm:text-5xl font-black tracking-[-0.03em] text-white leading-[1.1]">
              One button.
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
                Native manners.
              </span>
            </h2>

            <p className="text-[15px] sm:text-[16px] text-slate-300 leading-relaxed font-normal">
              Write your sales pitch plainly. SideMate Enhance automatically injects cultural conversational etiquette: the respectful &ldquo;andi&rdquo; in Telugu, the &ldquo;ji&rdquo; in Hindi, polite forms of address, numbers in lakh and crore, and friendly local cadence.
            </p>

            <div>
              <Link
                href="#pricing"
                className="inline-flex items-center gap-2 text-[14px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Voices from ₹5/min
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Interactive Card */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-white/[0.12] bg-[#0e0c1e]/90 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-6 sm:p-8">
              {/* Top Bar: Tabs & Enhanced Switch */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-white/[0.08]">
                <div className="flex items-center gap-1 bg-white/[0.05] p-1 rounded-xl border border-white/[0.06]">
                  {(["telugu", "hindi", "tamil", "english"] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLang(lang)}
                      className={`px-3 py-1.5 text-[12.5px] font-semibold rounded-lg transition-all capitalize cursor-pointer ${
                        selectedLang === lang
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {lang === "telugu" ? "తెలుగు" : lang === "hindi" ? "हिन्दी" : lang === "tamil" ? "தமிழ்" : "English"}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setEnhanced(!enhanced)}
                  className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-bold tracking-wide transition-all cursor-pointer ${
                    enhanced
                      ? "bg-gradient-to-r from-indigo-500 via-purple-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)]"
                      : "bg-white/[0.08] text-slate-300 border border-white/[0.1]"
                  }`}
                >
                  <Sparkles className="h-3 w-3 text-cyan-300" />
                  {enhanced ? "Enhanced ✓" : "Click to Enhance"}
                </button>
              </div>

              {/* Script Box */}
              <div className="py-6">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {enhanced ? "AFTER ENHANCE" : "PLAIN SCRIPT"}
                </span>
                <p className="mt-2 text-lg sm:text-xl font-medium text-white leading-relaxed min-h-[72px]">
                  {enhanced ? (
                    <span>
                      <span className="bg-indigo-500/25 border border-indigo-500/40 text-cyan-300 px-2 py-0.5 rounded-md">
                        {current.enhancedText.slice(0, 15)}
                      </span>
                      {" " + current.enhancedText.slice(15)}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">{current.plain}</span>
                  )}
                </p>
              </div>

              {/* Rules Applied Badges */}
              <div className="pt-5 border-t border-white/[0.08]">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 mb-3">
                  <Sparkles className="h-3 w-3 text-cyan-400" />
                  Rules Enhance applies in {selectedLang.toUpperCase()}:
                </div>
                <div className="flex flex-wrap gap-2">
                  {current.rules.map((rule, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-[11.5px] font-medium bg-indigo-950/60 text-indigo-200 border border-indigo-500/30"
                    >
                      {rule}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   4. INTERACTIVE LIVE PRODUCT COCKPIT
───────────────────────────────────────────────────────────────────────────── */
function InteractiveLiveDemoSection() {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const dialogue = [
    {
      speaker: "Ananya Rao (SideMate Telugu AI)",
      avatar: "AR",
      isAI: true,
      time: "00:04",
      text: "నమస్కారం రాజేష్ గారు! నేను ఫార్చ్యూన్ హైట్స్ నుంచి అనన్యను మాట్లాడుతున్నాను. మీరు నిన్న మా శంకరపల్లి ఓపెన్ ప్లాట్స్ గురించి ఎంక్వైరీ చేశారు కదా—వివరాలు చెప్పడానికి ఇప్పుడు సమయం వీలవుతుందా అండి?",
    },
    {
      speaker: "Rajesh Goud (Property Buyer)",
      avatar: "RG",
      isAI: false,
      time: "00:15",
      text: "హలో అనన్య గారు. అవునండి మాట్లాడొచ్చు. ఆ వెంచర్ కి HMDA, RERA అప్రూవల్స్ ఉన్నాయా? గజం ధర ఎంత ఉంది?",
    },
    {
      speaker: "Ananya Rao (SideMate Telugu AI)",
      avatar: "AR",
      isAI: true,
      time: "00:28",
      text: "తప్పకుండా సార్! 100% క్లియర్ టైటిల్ తో HMDA మరియు RERA అప్రూవల్స్ పూర్తయ్యాయి. గజం ధర ₹18,500 నుంచి ప్రారంభమవుతుంది. 80% బ్యాంక్ లోన్ కూడా ఉంది. శనివారం ఉదయం 11 గంటలకు ఫ్రీ కార్ పికప్ తో సైట్ విజిట్ ప్లాన్ చేద్దామా సార్?",
    },
    {
      speaker: "Rajesh Goud (Property Buyer)",
      avatar: "RG",
      isAI: false,
      time: "00:46",
      text: "చాలా బాగుంది అనన్య గారు. శనివారం ఉదయం 11 గంటలకు ఓకే. పూర్తి బ్రోచర్ నా వాట్సాప్ నంబర్‌కి పంపించండి.",
    },
  ];

  return (
    <section id="interactive-cockpit" className="py-20 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <Badge className="mb-3 bg-indigo-500/20 text-indigo-300 border-indigo-500/40">
            Live Telugu Voice Preview
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Experience a real Telugu AI phone call in action
          </h2>
          <p className="mt-3 text-base text-slate-300">
            See how SideMate speaks natural Telugu, explains pricing in Indian Rupees (₹), and books site visits on the spot.
          </p>
        </div>

        {/* Cockpit Card in Obsidian Glass */}
        <div className="relative mx-auto max-w-5xl rounded-3xl border border-white/[0.12] bg-[#0c0a1a]/95 backdrop-blur-2xl shadow-[0_24px_80px_rgba(0,0,0,0.85)] overflow-hidden">
          {/* Window Top Controls */}
          <div className="flex items-center justify-between border-b border-white/[0.08] bg-white/[0.02] px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-rose-500/80" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              <span className="ml-3 text-xs font-mono text-slate-400 hidden sm:inline">
                telugu.sidemate.ai/live-stream/call_hyd_492
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 font-semibold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Telugu Call Active (01:24)
              </span>
            </div>
          </div>

          {/* Cockpit Body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
            {/* Left: Agent Dossier */}
            <div className="lg:col-span-5 p-6 space-y-6 flex flex-col justify-between">
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-lg flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                    AR
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#0c0a1a]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">Ananya Rao (అనన్య)</h3>
                    <p className="text-xs text-slate-400">Telugu Real Estate &amp; Sales Caller</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.06] text-slate-300 border border-white/[0.1]">
                        Telugu + English
                      </span>
                      <span className="text-[11px] text-emerald-400 font-semibold">98.4% Accuracy</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.08] p-4 space-y-2.5 text-xs bg-white/[0.02]">
                  <div className="flex justify-between py-1 border-b border-white/[0.04]">
                    <span className="text-slate-400">Target Lead:</span>
                    <span className="font-medium text-white">Rajesh Goud (Hyderabad)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/[0.04]">
                    <span className="text-slate-400">Campaign:</span>
                    <span className="font-medium text-white">Shankarpally Plots Phase 2</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Call Intent:</span>
                    <span className="font-semibold text-cyan-400">Book Weekend Site Visit</span>
                  </div>
                </div>
              </div>

              {/* Audio Player Controls */}
              <div className="pt-4 border-t border-white/[0.08] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                    <Volume2 className="h-4 w-4 text-cyan-400" />
                    Telugu Audio Stream
                  </span>
                  <span className="text-xs font-mono text-slate-400">00:46 / 01:24</span>
                </div>

                {/* Animated Audio Visualizer Bars */}
                <div className="flex items-center justify-between gap-1 h-10 px-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                  {[24, 48, 70, 92, 45, 60, 85, 30, 95, 40, 75, 60, 90, 35, 80, 50, 65, 40, 88, 30].map((h, i) => (
                    <span
                      key={i}
                      className={`w-1 rounded-full transition-all duration-150 ${
                        isPlayingAudio
                          ? "bg-gradient-to-t from-indigo-500 to-cyan-400 animate-pulse"
                          : "bg-slate-700"
                      }`}
                      style={{
                        height: isPlayingAudio ? `${Math.max(15, (h * Math.random()).toFixed(0))}%` : `${h * 0.4}%`,
                      }}
                    />
                  ))}
                </div>

                <Button
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:from-indigo-400 hover:to-purple-500 text-white font-medium text-xs gap-2 shadow-[0_0_20px_rgba(99,102,241,0.4)] cursor-pointer"
                >
                  {isPlayingAudio ? (
                    <>
                      <Pause className="h-4 w-4 fill-current" /> Pause Demo Audio
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-current text-white" /> Play Real Telugu Voice Demo
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Right: Live Transcript */}
            <div className="lg:col-span-7 p-6 space-y-4 max-h-[480px] overflow-y-auto scrollbar-thin">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Dialogue Stream</span>
                <span className="text-[11px] text-cyan-400 font-semibold">Automatic Telugu Transcription</span>
              </div>

              {dialogue.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 text-xs leading-relaxed ${item.isAI ? "justify-start" : "justify-start"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold text-[11px] ${
                      item.isAI
                        ? "bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-xs"
                        : "bg-slate-800 text-slate-200 border border-white/[0.1]"
                    }`}
                  >
                    {item.avatar}
                  </div>
                  <div
                    className={`flex-1 rounded-2xl p-3.5 ${
                      item.isAI
                        ? "bg-indigo-950/60 border border-indigo-500/30 text-white"
                        : "bg-white/[0.03] border border-white/[0.08] text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-[11px] text-white">{item.speaker}</span>
                      <span className="text-[10px] text-slate-400">{item.time}</span>
                    </div>
                    <p className="text-[13px] leading-relaxed text-slate-100">{item.text}</p>
                  </div>
                </div>
              ))}

              <div className="mt-4 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span><strong>Outcome:</strong> Site visit booked for Saturday 11:00 AM. Location coordinates &amp; brochure dispatched via WhatsApp.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   5. MIDNIGHT SHOWCASE CONTAINER (OUTPERO STYLE IMAGE 1)
───────────────────────────────────────────────────────────────────────────── */
function MidnightShowcaseSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl sm:rounded-[36px] bg-[#0c0a1a] border border-indigo-500/30 px-6 py-16 sm:px-16 sm:py-20 text-center overflow-hidden shadow-[0_24px_80px_rgba(15,10,40,0.8)]">
          {/* Subtle Glows */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-indigo-500/30 to-purple-600/20 blur-[120px] pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.08] border border-white/[0.12] text-xs font-semibold text-cyan-300">
              <Zap className="h-3.5 w-3.5 fill-cyan-300" />
              10-Minute Deployment
            </span>

            <h2 className="text-3xl sm:text-5xl font-black tracking-[-0.03em] text-white leading-tight">
              Your first employee can be live in 10 minutes.
            </h2>

            <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto">
              Try free for 500 minutes. ₹0 setup fee. No credit card required. Works seamlessly with Indian telephony and WhatsApp.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard/ai-employees/new"
                className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-white text-neutral-950 font-bold hover:bg-slate-100 text-[14px] shadow-lg gap-2 cursor-pointer transition-all active:scale-95"
              >
                Start free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#pricing"
                className="inline-flex items-center justify-center h-12 px-7 rounded-full border border-white/20 bg-white/[0.06] text-white hover:bg-white/[0.12] text-[14px] font-semibold cursor-pointer transition-all"
              >
                Talk to us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   6. VOICE AUDITION SECTION (LISTEN TO MULTIPLE ACCENTS)
───────────────────────────────────────────────────────────────────────────── */
function VoiceAuditionSection() {
  const [activeVoice, setActiveVoice] = useState("ananya");

  const voices = [
    {
      id: "ananya",
      name: "Ananya Rao",
      teluguName: "అనన్య రావు",
      tone: "Polite, Professional Real Estate Caller",
      dialect: "Coastal Andhra & Telangana Neutral",
      audioSample: "నమస్కారం అండి! మీరు మా ఫార్చ్యూన్ విల్లాస్ గురించి ఎంక్వైరీ చేశారు కదా...",
    },
    {
      id: "kavitha",
      name: "Dr. Kavitha",
      teluguName: "డా. కవిత",
      tone: "Warm, Reassuring Healthcare Receptionist",
      dialect: "Polite Vijayawada Telugu",
      audioSample: "నమస్తే అండి, కిమ్స్ కేర్ క్లినిక్ నుంచి మాట్లాడుతున్నాను. మీ డాక్టర్ అపాయింట్‌మెంట్ రేపు...",
    },
    {
      id: "venkat",
      name: "Venkat Reddy",
      teluguName: "వెంకట్ రెడ్డి",
      tone: "Energetic, Fast-Paced Wholesale Sales Executive",
      dialect: "Rayalaseema / Hyderabad Business Telugu",
      audioSample: "హలో సార్, శ్రీ బాలాజీ హోల్‌సేల్ డీలర్స్ నుంచి. ఈ వారం బాస్మతి రైస్ కొత్త స్టాక్ వచ్చింది...",
    },
    {
      id: "swathi",
      name: "Swathi",
      teluguName: "స్వాతి",
      tone: "Courteous Inbound Support & Order Help",
      dialect: "Clear Metro Telugu & English Blend",
      audioSample: "హాయ్ అండి, మీ ఆర్డర్ డెలివరీ స్టేటస్ కన్ఫర్మ్ చేయడానికి కాల్ చేశాను. లొకేషన్ పంపించమంటారా?",
    },
  ];

  return (
    <section id="voices" className="py-20 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <Badge className="mb-3 bg-indigo-500/20 text-indigo-300 border-indigo-500/40">
            Native Voices
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Choose your AI employee&apos;s personality &amp; accent
          </h2>
          <p className="mt-3 text-base text-slate-300">
            SideMate offers trained voice personas calibrated for respectful Indian business etiquette and fluent bilingual switching.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {voices.map((voice) => (
            <div
              key={voice.id}
              onClick={() => setActiveVoice(voice.id)}
              className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                activeVoice === voice.id
                  ? "border-cyan-400 bg-indigo-950/40 shadow-[0_0_30px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400"
                  : "border-white/[0.1] bg-[#0e0c1c]/80 hover:border-white/30"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-md">
                  {voice.name.charAt(0)}
                </div>
                {activeVoice === voice.id && (
                  <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400 ring-4 ring-cyan-400/30" />
                )}
              </div>

              <h4 className="font-bold text-base text-white">{voice.name}</h4>
              <p className="text-xs font-semibold text-cyan-400">{voice.teluguName}</p>
              <p className="text-xs text-slate-400 mt-2">{voice.tone}</p>

              <div className="mt-4 pt-4 border-t border-white/[0.08]">
                <p className="text-[12px] italic text-slate-300 line-clamp-2">
                  &ldquo;{voice.audioSample}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   7. ROI CALCULATOR SECTION
───────────────────────────────────────────────────────────────────────────── */
function RoiCalculatorSection() {
  const [dailyCalls, setDailyCalls] = useState(150);

  const humanCost = useMemo(() => {
    const agentsNeeded = Math.ceil(dailyCalls / 40);
    return agentsNeeded * 35000;
  }, [dailyCalls]);

  const aiCost = useMemo(() => {
    return Math.round(dailyCalls * 2.5 * 5 * 26);
  }, [dailyCalls]);

  const savings = humanCost - aiCost;
  const percentage = Math.round((savings / humanCost) * 100);

  return (
    <section id="roi-calculator" className="py-20 relative bg-white/[0.01] border-y border-white/[0.08]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <Badge className="mb-3 bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
            Cost &amp; Profit Calculator
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            See how much you save vs human telecallers
          </h2>
          <p className="mt-3 text-base text-slate-300">
            Human telecallers make 35–45 calls per day, require training, and have 40% churn. SideMate scales infinitely with zero attrition.
          </p>
        </div>

        <div className="mx-auto max-w-4xl rounded-3xl border border-white/[0.12] bg-[#0e0c1e]/90 backdrop-blur-2xl shadow-2xl p-8">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-cyan-400" />
                  Your Daily Lead Volume:
                </label>
                <span className="text-xl font-extrabold text-cyan-400">
                  {dailyCalls} calls / day
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="1000"
                step="10"
                value={dailyCalls}
                onChange={(e) => setDailyCalls(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>20 calls (Small Clinic)</span>
                <span>250 calls (Real Estate Project)</span>
                <span>1,000 calls (Enterprise FMCG)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-white/[0.08]">
              <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30">
                <span className="text-xs font-semibold text-rose-300">Human Telecaller Team</span>
                <p className="text-2xl font-black text-white mt-1">
                  ₹{humanCost.toLocaleString("en-IN")}<span className="text-xs font-normal text-slate-400">/mo</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  {Math.ceil(dailyCalls / 40)} telecallers @ ₹35k CTC + office space
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
                <span className="text-xs font-semibold text-indigo-300">SideMate Telugu AI</span>
                <p className="text-2xl font-black text-white mt-1">
                  ₹{aiCost.toLocaleString("en-IN")}<span className="text-xs font-normal text-slate-400">/mo</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  @ ₹5/min billed per second, 24/7 availability
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                <span className="text-xs font-semibold text-emerald-300">Your Monthly Savings</span>
                <p className="text-2xl font-black text-emerald-400 mt-1">
                  ₹{savings.toLocaleString("en-IN")}<span className="text-xs font-normal text-slate-300">/mo</span>
                </p>
                <p className="text-[11px] text-emerald-300 font-semibold mt-1">
                  Save {percentage}% + zero hiring churn
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   8. COMPARISON TABLE SECTION
───────────────────────────────────────────────────────────────────────────── */
function ComparisonSection() {
  const features = [
    { name: "Language & Manner", human: "Telugu & English", ivr: "Robotic recorded menu", sidemate: "Natural conversational Telugu with polite andi/ji" },
    { name: "Availability", human: "10:00 AM – 6:30 PM", ivr: "24/7 (Press 1, Press 2)", sidemate: "24/7 Instant calling in under 30 seconds" },
    { name: "Daily Capacity", human: "35–45 calls/day max", ivr: "High", sidemate: "10,000+ simultaneous calls" },
    { name: "Indian Rupee (₹) Pricing", human: "Manual explanation", ivr: "Cannot calculate", sidemate: "Instant EMI, Sq.Yard & Lakh/Crore calculations" },
    { name: "WhatsApp Automation", human: "Manual copy-pasting", ivr: "None", sidemate: "Automatic brochure & location dispatched" },
    { name: "Cost Per Call", human: "₹35 – ₹50 / lead", ivr: "₹4 / call (0% conversion)", sidemate: "₹7.50 / call (38% conversion rate)" },
  ];

  return (
    <section className="py-20 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <Badge className="mb-3 bg-indigo-500/20 text-indigo-300 border-indigo-500/40">
            Side-by-Side Comparison
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Why Indian businesses choose SideMate
          </h2>
        </div>

        <div className="mx-auto max-w-5xl rounded-3xl border border-white/[0.12] bg-[#0e0c1e]/90 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-white/[0.03] border-b border-white/[0.08]">
                <tr>
                  <th className="p-4 font-bold text-white">Feature</th>
                  <th className="p-4 font-semibold text-slate-400">Human Telecaller</th>
                  <th className="p-4 font-semibold text-slate-400">Legacy IVR</th>
                  <th className="p-4 font-bold text-cyan-300 bg-indigo-950/40 border-l border-indigo-500/30">SideMate Telugu AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {features.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02]">
                    <td className="p-4 font-medium text-white">{row.name}</td>
                    <td className="p-4 text-slate-300">{row.human}</td>
                    <td className="p-4 text-slate-400">{row.ivr}</td>
                    <td className="p-4 font-semibold text-cyan-200 bg-indigo-950/30 border-l border-indigo-500/30">{row.sidemate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   9. PRICING SECTION IN INDIAN RUPEES (₹)
───────────────────────────────────────────────────────────────────────────── */
/* ─────────────────────────────────────────────────────────────────────────────
   9. PRICING SECTION: PAY FOR TALK TIME ONLY
───────────────────────────────────────────────────────────────────────────── */
function PricingSection() {
  const tiers = [
    {
      name: "Standard",
      price: "₹5",
      unit: "/ min",
      description: "Natural voices for everyday sales and support.",
      featured: false,
      cta: "Get Started",
      href: "/dashboard/ai-employees/new",
    },
    {
      name: "Premium",
      price: "₹7",
      unit: "/ min",
      description: "Our most lifelike voices, for when the voice is your brand.",
      featured: true,
      cta: "Try Premium Voice",
      href: "/dashboard/ai-employees/new",
    },
    {
      name: "High volume",
      price: "Talk to us",
      unit: "",
      description: "Lower rates and setup help for large campaigns.",
      featured: false,
      cta: "Contact Sales",
      href: "/contact",
    },
  ];

  return (
    <section id="pricing" className="py-24 relative bg-[#070614] border-t border-white/[0.08] overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-[150px] pointer-events-none -z-10" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header matching image */}
        <div className="mb-12">
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white mb-3">
            Pay for talk time only
          </h2>
          <p className="text-base text-slate-400 font-normal">
            Sample pricing. No setup fee, and credits never expire.
          </p>
        </div>

        {/* 3 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-2xl p-8 flex flex-col justify-between transition-all duration-300 min-h-[260px] ${
                tier.featured
                  ? "bg-[#0c102b] border-2 border-indigo-500/80 shadow-[0_0_40px_rgba(99,102,241,0.25)] hover:border-indigo-400 hover:shadow-[0_0_50px_rgba(99,102,241,0.35)]"
                  : "bg-[#0b0e24] border border-white/[0.09] hover:border-white/[0.2]"
              }`}
            >
              <div>
                <h3 className="text-xl font-bold text-white mb-5 tracking-tight">
                  {tier.name}
                </h3>

                <div className="flex items-baseline gap-1.5 mb-6">
                  <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                    {tier.price}
                  </span>
                  {tier.unit && (
                    <span className="text-base font-normal text-slate-400">
                      {tier.unit}
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-300 leading-relaxed font-normal">
                  {tier.description}
                </p>
              </div>

              <div className="mt-8 pt-5 border-t border-white/[0.07]">
                <Link
                  href={tier.href}
                  className={`inline-flex items-center justify-center w-full h-11 rounded-xl text-xs font-bold transition-all ${
                    tier.featured
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/30"
                      : "bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/[0.12]"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   10. FAQ SECTION
───────────────────────────────────────────────────────────────────────────── */
function FaqSection() {
  const faqs = [
    {
      q: "Does SideMate sound like a real person in Telugu?",
      a: "Yes. SideMate uses conversational Indian AI trained on natural Telugu speech patterns, including polite colloquial greetings (Namaskaram, andi), pauses, and bilingual vocabulary.",
    },
    {
      q: "Can I connect my own Indian business phone number?",
      a: "Yes! You can connect Airtel, Jio, Exotel, Twilio, or Tata Telephony numbers so calls show your brand's verified caller ID.",
    },
    {
      q: "How does SideMate book site visits and send brochures?",
      a: "When a customer agrees to a visit during the call, SideMate records the date, syncs it to Google Calendar/CRM, and sends location coordinates and project brochures straight to their WhatsApp.",
    },
    {
      q: "What payment methods are supported in India?",
      a: "We support UPI (PhonePe, Google Pay, Paytm), all Indian debit/credit cards, Net Banking, and NEFT/RTGS bank transfers for Enterprise plans with full GST invoices.",
    },
  ];

  return (
    <section className="py-20 relative">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-3 bg-indigo-500/20 text-indigo-300 border-indigo-500/40">
            Frequently Asked Questions
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Everything you need to know about Telugu AI Calling
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="p-6 rounded-2xl border border-white/[0.1] bg-[#0e0c1e]/80">
              <h4 className="font-bold text-base text-white">{faq.q}</h4>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   11. BOTTOM CTA SECTION
───────────────────────────────────────────────────────────────────────────── */
function CTASection() {
  return (
    <section className="py-16 sm:py-24 border-t border-white/[0.08]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-5xl font-black tracking-[-0.03em] text-white leading-tight">
          Ready to hire your first Telugu AI employee?
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-xl mx-auto">
          Start in 10 minutes with 500 free calling minutes. Zero credit card or setup fee required.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dashboard/ai-employees/new"
            className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-gradient-to-r from-indigo-500 via-purple-600 to-cyan-500 text-white font-bold text-[14px] shadow-[0_0_35px_rgba(99,102,241,0.6)] hover:shadow-[0_0_45px_rgba(99,102,241,0.8)] gap-2 cursor-pointer transition-all active:scale-95"
          >
            Build Your Telugu AI Free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center h-12 px-7 rounded-full border border-white/20 bg-white/[0.04] text-white text-[14px] font-semibold cursor-pointer hover:bg-white/[0.1] transition-all"
          >
            Sign In to Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
