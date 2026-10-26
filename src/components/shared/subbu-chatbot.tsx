"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  MessageSquare,
  X,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  ExternalLink,
  Plus,
  PhoneCall,
  CreditCard,
  Mic,
  RotateCcw,
  Check,
  ChevronRight,
  Headphones,
} from "lucide-react";
import { audioEngine, ALL_VOICES } from "@/lib/audio-engine";

interface ChatMessage {
  id: string;
  sender: "subbu" | "user";
  text: string;
  timestamp: string;
  actions?: {
    label: string;
    href?: string;
    onClickType?: "audio-demo" | "navigate";
  }[];
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m-1",
    sender: "subbu",
    text: "నమస్కారం అండి! I am Subbu (సుబ్బు), your SideMate AI Assistant.\n\nI can help you build multilingual AI voice callers, explain pricing in Indian Rupees (₹), or demonstrate how our calls sound in natural Telugu. How can I help your business today?",
    timestamp: "Just now",
    actions: [
      { label: "🚀 Create AI Voice Agent", href: "/dashboard/ai-employees/new" },
      { label: "💰 View Pricing in ₹", href: "/dashboard/billing" },
      { label: "🔊 Hear Telugu Voice Demo", onClickType: "audio-demo" },
    ],
  },
];

const QUICK_PROMPTS = [
  { label: "📞 How does AI calling work?", query: "How does AI calling work in Telugu?" },
  { label: "💰 Pricing & Plans in ₹", query: "What are the pricing plans and call rates in Indian Rupees?" },
  { label: "⚡ How to build an employee?", query: "How do I create a new AI employee in 1 minute?" },
  { label: "🏡 Real estate plot calls", query: "Can you tell me about the real estate open plots calling agent?" },
  { label: "📱 WhatsApp & UPI follow-ups", query: "How does Subbu send WhatsApp brochures and UPI payment links?" },
  { label: "🗣️ Which languages are supported?", query: "Which Indian languages does SideMate support?" },
];

export function SubbuChatbot() {
  const router = useRouter();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<"te" | "en" | "all">("all");

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to latest message
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
      setShowNotification(false);
    }
  }, [isOpen]);

  // Speak aloud helper
  const speakText = (text: string) => {
    if (!speechEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      // Clean markdown tags for natural speech
      const clean = text.replace(/[*_#`[\]()]/g, "").substring(0, 200);
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      // Try to find an Indian English or Telugu voice
      const voices = window.speechSynthesis.getVoices();
      const inVoice = voices.find((v) => v.lang.includes("te") || v.lang.includes("IN") || v.name.includes("India"));
      if (inVoice) utterance.voice = inVoice;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  };

  // Subbu's Smart Knowledge Responder
  const generateSubbuResponse = (userQuery: string): { text: string; actions?: ChatMessage["actions"] } => {
    const q = userQuery.toLowerCase().trim();

    // 1. Pricing / Cost / Rupees
    if (q.includes("price") || q.includes("pricing") || q.includes("cost") || q.includes("rate") || q.includes("రూపాయ") || q.includes("rupee") || q.includes("₹") || q.includes("plan")) {
      return {
        text: "మా వద్ద భారతీయ వ్యాపారాలకు సరిపోయే 3 సులభమైన ప్లాన్‌లు అందుబాటులో ఉన్నాయి:\n\n• **Starter Plan (₹3,999/mo)**: 800 కాలింగ్ మినిట్స్ & 2 AI Voice Agents.\n• **Growth Plan (₹9,999/mo)**: 2,500 కాలింగ్ మినిట్స్ & 10 AI Voice Agents (Most Popular).\n• **Scale Plan (₹24,999/mo)**: 7,500 కాలింగ్ మినిట్స్ & Unlimited Callers.\n\nఅన్ని ఛార్జీలు పూర్తి పారదర్శకంగా భారతీయ రూపాయలలో (₹) మాత్రమే ఉంటాయి. ఎటువంటి దాగి ఉన్న ఛార్జీలు ఉండవు!",
        actions: [
          { label: "💳 View Full Pricing Plans", href: "/dashboard/billing" },
          { label: "🚀 Start Free Trial", href: "/dashboard/ai-employees/new" },
        ],
      };
    }

    // 2. How it works / Calling technology / Latency
    if (q.includes("how does") || q.includes("how it works") || q.includes("work") || q.includes("ఎలా పనిచేస్తుంది") || q.includes("latency") || q.includes("telephony")) {
      return {
        text: "సైడ్‌మేట్ AI కాలర్ ఎలా పనిచేస్తుందో చూడండి:\n\n1. **Ultra-Low Latency (<350ms)**: కస్టమర్ మాట్లాడిన వెంటనే మానవుడిలా సహజంగా వింటుంది మరియు స్పందిస్తుంది.\n2. **Natural Telugu & Regional Speech**: గౌరవప్రదమైన 'నమస్కారం అండి', కస్టమర్ అభ్యంతరాల పరిష్కారం మరియు బడ్జెట్ క్వాలిఫికేషన్ చేస్తుంది.\n3. **Background Ambience**: కాల్ సెంటర్ లేదా ఆఫీస్ రూమ్ టోన్ మిక్స్ చేసి నిజమైన కాల్ అనుభూతిని ఇస్తుంది.\n4. **Instant WhatsApp Sync**: కాల్ ముగిసిన వెంటనే బ్రోచర్, గూగుల్ మ్యాప్స్ లొకేషన్, లేదా UPI లింక్ కస్టమర్ వాట్సాప్‌కు చేరుతుంది.",
        actions: [
          { label: "📞 Test Outbound Dialer Sandbox", href: "/dashboard/calls" },
          { label: "🔊 Listen to Voice Audio", onClickType: "audio-demo" },
        ],
      };
    }

    // 3. Create employee / New agent
    if (q.includes("create") || q.includes("build") || q.includes("new employee") || q.includes("ఏజెంట్") || q.includes("ఎలా క్రియేట్ చేయాలి") || q.includes("setup")) {
      return {
        text: "మీరు సైడ్‌మేట్‌లో కేవలం **ఒక్క బేసిక్ ప్రాంప్ట్** ఇవ్వడం ద్వారా పూర్తి AI కాలర్‌ను తయారు చేయవచ్చు!\n\n1. మీ బిజినెస్ వివరాలు (ఉదా: రియల్ ఎస్టేట్ ఓపెన్ ప్లాట్లు).\n2. కాలర్ రోల్ & లక్ష్యం (ఉదా: సైట్ విజిట్ బుకింగ్).\n3. భాష ఎంచుకోండి (తెలుగు, హిందీ, తమిళం, కన్నడ, ఇంగ్లీష్).\n\n**'Build My Employee'** క్లిక్ చేస్తే పూర్తి స్క్రిప్ట్, స్వాగతం, కస్టమర్ ప్రశ్నలు మరియు వాట్సాప్ ఫాలో-అప్‌లు ఆటోమేటిక్‌గా తయారవుతాయి!",
        actions: [
          { label: "✨ Launch AI Employee Builder", href: "/dashboard/ai-employees/new" },
        ],
      };
    }

    // 4. Real estate / Plots
    if (q.includes("real estate") || q.includes("plot") || q.includes("open plot") || q.includes("ప్లాట్లు") || q.includes("villa") || q.includes("site visit")) {
      return {
        text: "రియల్ ఎస్టేట్ వెంచర్లకు సైడ్‌మేట్ అద్భుతంగా పనిచేస్తుంది సార్!\n\nమా AI కాలర్ Ananya (అనన్య):\n• ఫేస్‌బుక్/గూగుల్ యాడ్స్ లీడ్స్‌కు క్షణాల్లో కాల్ చేస్తుంది.\n• HMDA / RERA అప్రూవల్స్ & ₹ బడ్జెట్ క్వాలిఫై చేస్తుంది.\n• వీకెండ్ ఫ్రీ క్యాబ్ పికప్‌తో సైట్ విజిట్ బుక్ చేస్తుంది.\n• లొకేషన్ మ్యాప్ & బ్రోచర్ వాట్సాప్‌కు వెంటనే పంపుతుంది.",
        actions: [
          { label: "🏡 Use Real Estate Template", href: "/dashboard/ai-employees/new" },
        ],
      };
    }

    // 5. WhatsApp & UPI links
    if (q.includes("whatsapp") || q.includes("upi") || q.includes("brochure") || q.includes("వాట్సాప్") || q.includes("పేమెంట్") || q.includes("emi")) {
      return {
        text: "అవునండి! సైడ్‌మేట్ AI కాలర్ కస్టమర్‌తో మాట్లాడిన వెంటనే ఈ ఆటోమేటిక్ యాక్షన్లు చేస్తుంది:\n\n• **WhatsApp Brochure**: పీడీఎఫ్ మరియు ప్రైస్ లిస్ట్ ఆటోమేటిక్ డెలివరీ.\n• **UPI Payment Links**: డ్యూ అమౌంట్ కోసం PhonePe/Google Pay డైరెక్ట్ లింక్స్.\n• **Google Calendar Sync**: సైట్ విజిట్ లేదా డాక్టర్ అపాయింట్‌మెంట్ స్లాట్ క్యాలెండర్‌లో లాక్ అవుతుంది.",
        actions: [
          { label: "📱 Check Contacts & WhatsApp Status", href: "/dashboard/leads" },
        ],
      };
    }

    // 6. Languages supported
    if (q.includes("language") || q.includes("languages") || q.includes("భాష") || q.includes("hindi") || q.includes("tamil") || q.includes("telugu")) {
      return {
        text: "సైడ్‌మేట్ ప్రస్తుతానికి **7 భారతీయ భాషలకు** పూర్తి మద్దతు ఇస్తుంది:\n\n1. **Telugu (తెలుగు)** — Ananya & Suresh\n2. **Hindi (हिंदी)** — Aarav\n3. **Tamil (தமிழ்)** — Murugan\n4. **Kannada (ಕನ್ನಡ)** — Chethan\n5. **Malayalam (മലയാളം)** — Rahul\n6. **Marathi (मराठी)** — Rohan\n7. **English (Indian)** — Vikram\n\nభవిష్యత్తులో మరిన్ని భాషలు యాడ్ చేయబడుతున్నాయి!",
        actions: [
          { label: "🎙️ Test Voice Auditions", href: "/dashboard/ai-employees" },
        ],
      };
    }

    // 7. General greeting / Telugu conversational fallback
    if (q.includes("hello") || q.includes("hi") || q.includes("నమస్కారం") || q.includes("subbu") || q.includes("సుబ్బు") || q.includes("who are you")) {
      return {
        text: "నమస్కారం అండి! నేను సుబ్బు (Subbu), మీ సైడ్‌మేట్ అసిస్టెంట్‌ని.\n\nమీ బిజినెస్‌లో టెలికాలింగ్ ఖర్చులు తగ్గించి, రోజూ వందల కొద్దీ కస్టమర్ కాల్స్ ఆటోమేటిక్‌గా చేయడానికి నేను సహాయపడతాను. మీరు ఏ రకమైన బిజినెస్ నడుపుతున్నారో చెప్పండి, మీ కోసం సరైన AI ప్లాన్ సిఫార్సు చేస్తాను!",
        actions: [
          { label: "📊 Go to Dashboard", href: "/dashboard" },
          { label: "🚀 Create Voice Agent", href: "/dashboard/ai-employees/new" },
        ],
      };
    }

    // Default intelligent response
    return {
      text: `ధన్యవాదాలు అండి! మీ ప్రశ్న: "${userQuery}".\n\nసైడ్‌మేట్ భారతీయ వ్యాపారాల కోసం సహజమైన తెలుగు మరియు ప్రాంతీయ భాషలలో ఆటోమేటిక్ ఫోన్ కాల్స్ చేయడానికి రూపొందించబడింది. మీరు మా డాష్‌బోర్డ్ నుండి వెంటనే ఒక AI Voice Agent ని టెస్ట్ చేయవచ్చు లేదా కాల్ క్యాంపెయిన్ రన్ చేయవచ్చు.`,
      actions: [
        { label: "🚀 Create AI Voice Agent", href: "/dashboard/ai-employees/new" },
        { label: "📞 Test Sandbox Dialer", href: "/dashboard/calls" },
        { label: "💰 View Plans in ₹", href: "/dashboard/billing" },
      ],
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: text.trim(),
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Simulate smart AI typing delay
    setTimeout(() => {
      const resp = generateSubbuResponse(text);
      const subbuMsg: ChatMessage = {
        id: `sb-${Date.now()}`,
        sender: "subbu",
        text: resp.text,
        timestamp: "Just now",
        actions: resp.actions,
      };

      setMessages((prev) => [...prev, subbuMsg]);
      setIsTyping(false);
      speakText(resp.text);
    }, 600);
  };

  const handleActionClick = (action: NonNullable<ChatMessage["actions"]>[number]) => {
    if (action.onClickType === "audio-demo") {
      audioEngine.previewVoice("ananya", 0.98, 1.05, "office", 20);
      const audioFeedbackMsg: ChatMessage = {
        id: `sb-audio-${Date.now()}`,
        sender: "subbu",
        text: "🔊 Playing Telugu Ananya voice with realistic office background ambience! Listen through your speakers.",
        timestamp: "Just now",
      };
      setMessages((prev) => [...prev, audioFeedbackMsg]);
      return;
    }

    if (action.href) {
      setIsOpen(false);
      router.push(action.href);
    }
  };

  // Hide Subbu AI on the landing page
  if (pathname === "/" || pathname === "") {
    return null;
  }

  return (
    <>
      {/* ── Floating Notification Bubble (When chat is closed) ── */}
      {!isOpen && showNotification && (
        <div className="fixed bottom-20 right-5 z-50 max-w-xs animate-bounce-subtle">
          <div className="relative rounded-2xl border border-indigo-500/30 bg-surface/95 backdrop-blur-md p-3.5 shadow-xl">
            <button
              onClick={() => setShowNotification(false)}
              className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-surface border border-border text-muted-foreground hover:text-foreground flex items-center justify-center text-xs shadow-xs"
              title="Close note"
            >
              <X className="h-3 w-3" />
            </button>
            <div className="flex items-start gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-xs">
                SB
              </div>
              <div className="text-xs">
                <p className="font-bold text-foreground">నమస్కారం! I&apos;m Subbu</p>
                <p className="text-muted-foreground mt-0.5 leading-relaxed">
                  Have questions about Telugu AI voice callers or ₹ plans? Ask me anytime!
                </p>
                <button
                  onClick={() => setIsOpen(true)}
                  className="mt-2 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  Chat with Subbu AI <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Floating Subbu AI Launcher Button ── */}
      <div className="fixed bottom-5 right-5 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 p-2 pr-4 text-white shadow-lg hover:shadow-indigo-500/30 hover:scale-102 transition-all cursor-pointer"
          aria-label={isOpen ? "Close Subbu AI Chatbot" : "Open Subbu AI Chatbot"}
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/20 font-bold text-xs shadow-xs">
            SB
            {/* Live pulsing online indicator */}
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-indigo-700" />
            </span>
          </div>
          <div className="text-left">
            <span className="block text-xs font-bold leading-tight flex items-center gap-1">
              Subbu AI
              <Sparkles className="h-3 w-3 text-amber-300" />
            </span>
            <span className="block text-[10px] text-white/80 leading-tight">
              {isOpen ? "Close Chat" : "Online • Telugu & English"}
            </span>
          </div>
        </button>
      </div>

      {/* ── Subbu AI Chat Window ── */}
      {isOpen && (
        <div className="fixed bottom-20 right-5 z-50 w-[92vw] sm:w-[400px] h-[580px] max-h-[85vh] flex flex-col rounded-2xl border border-border/80 bg-surface/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-indigo-600/10 via-purple-600/5 to-transparent px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs shadow-xs">
                SB
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 border border-surface" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-foreground">Subbu AI (సుబ్బు)</h3>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded-full">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  SideMate Business AI • Telugu & English
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Voice Speech Toggle */}
              <button
                onClick={() => setSpeechEnabled(!speechEnabled)}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  speechEnabled
                    ? "bg-indigo-600 text-white"
                    : "text-muted-foreground hover:bg-surface-sunken"
                }`}
                title={speechEnabled ? "Mute Subbu Speech" : "Enable Subbu Voice Speech"}
              >
                {speechEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-surface-sunken hover:text-foreground transition-colors cursor-pointer"
                title="Minimize Chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompt Carousel / Pills */}
          <div className="border-b border-border/60 bg-surface-sunken/40 px-3 py-2 overflow-x-auto scrollbar-none flex gap-1.5 shrink-0">
            {QUICK_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(p.query)}
                className="whitespace-nowrap rounded-full border border-border/70 bg-surface px-2.5 py-1 text-[11px] text-muted-foreground hover:border-indigo-500/50 hover:text-foreground transition-colors cursor-pointer shrink-0"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "subbu" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-[10px] shadow-2xs mt-0.5">
                    SB
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white rounded-tr-none shadow-xs"
                      : "bg-surface-sunken/80 border border-border/80 text-foreground rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Message Action Chips */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-border/60 flex flex-wrap gap-1.5">
                      {msg.actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => handleActionClick(act)}
                          className="inline-flex items-center gap-1 rounded-lg border border-indigo-500/30 bg-indigo-50/60 dark:bg-indigo-950/40 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
                        >
                          {act.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {msg.sender === "subbu" && (
                    <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground/70">
                      <span>{msg.timestamp}</span>
                      <button
                        onClick={() => speakText(msg.text)}
                        className="hover:text-foreground transition-colors"
                        title="Listen to this message"
                      >
                        <Volume2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Subbu Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-600 font-bold text-[10px]">
                  SB
                </div>
                <div className="flex items-center gap-1 rounded-2xl bg-surface-sunken border border-border/70 px-3 py-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce" />
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[10px] text-muted-foreground ml-1.5">Subbu is typing...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Footer */}
          <div className="border-t border-border bg-surface p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ask Subbu in Telugu or English..."
                className="flex-1 rounded-xl border border-border bg-surface-sunken/60 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition-colors cursor-pointer shrink-0"
                title="Send message"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground/60 px-1">
              <span>Speaks Telugu, English & Tanglish</span>
              <span>₹ Rates & Fast Setup</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
