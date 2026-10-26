"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Volume2,
  PhoneCall,
  Save,
  CheckCircle2,
  Play,
  Square,
  Copy,
  ChevronRight,
  Sliders,
  Send,
  RotateCcw,
  ShieldCheck,
  Building2,
  Users,
  Target,
  Languages,
  Wand2,
  FileText,
  HelpCircle,
  AlertTriangle,
  Radio,
  Check,
  Settings2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  audioEngine,
  ALL_VOICES,
  AMBIENT_SOUND_OPTIONS,
  type VoiceOption,
  type AmbientSoundId,
} from "@/lib/audio-engine";
import {
  INDUSTRY_TEMPLATES,
  generateAIEmployeeScript,
  type IndustryTemplate,
  type GeneratedAIEmployeePackage,
} from "@/lib/ai-script-generator";
import {
  AIEmployeeFullConfig,
  SimulatedMessage,
  QualificationQuestionItem,
  ObjectionHandlerItem,
  FAQItem,
} from "@/lib/types/ai-employee-builder";
import { generateSimulationResponse } from "@/lib/simulation-engine";

const LANGUAGE_CHOICES = [
  { code: "te-IN", label: "Telugu (తెలుగు)", region: "Andhra Pradesh & Telangana", icon: "🇮🇳" },
  { code: "hi-IN", label: "Hindi (हिंदी)", region: "Pan-India & North", icon: "🇮🇳" },
  { code: "ta-IN", label: "Tamil (தமிழ்)", region: "Tamil Nadu", icon: "🇮🇳" },
  { code: "kn-IN", label: "Kannada (ಕನ್ನಡ)", region: "Karnataka", icon: "🇮🇳" },
  { code: "ml-IN", label: "Malayalam (മലയാളം)", region: "Kerala", icon: "🇮🇳" },
  { code: "mr-IN", label: "Marathi (मराठी)", region: "Maharashtra", icon: "🇮🇳" },
  { code: "en-IN", label: "English (Indian)", region: "All India Corporate", icon: "🇮🇳" },
];

function CreateEmployeeWorkflowContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams?.get("id");

  // Workflow steps:
  // 1: Enter Prompt & Industry Template
  // 2: Building State Animation (auto-advances to 3)
  // 3: Generated Call Script & Conversation Flow
  // 4: Select Voice
  // 5: Select Background Sound and Volume
  // 6: Preview, Test Simulation & Activate / Draft
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1 Prompt Inputs
  const [businessDescription, setBusinessDescription] = useState(
    "Sri Balaji Ventures provides HMDA and RERA approved open plots, luxury villas, and commercial ventures with clear titles and 80% bank loans in Hyderabad & Vijayawada."
  );
  const [employeeRole, setEmployeeRole] = useState("Telugu Real Estate & Plot Sales Specialist");
  const [targetCustomers, setTargetCustomers] = useState(
    "People who inquired online about land investment, villa plots, or home construction"
  );
  const [selectedLanguage, setSelectedLanguage] = useState("te-IN");
  const [goal, setGoal] = useState(
    "Verify customer budget in Rupees (₹) and book a free weekend site visit with complimentary cab pickup"
  );
  const [activeTemplateId, setActiveTemplateId] = useState<string>("real-estate");

  // Step 2 & 3: Generated Package
  const [generatedPackage, setGeneratedPackage] = useState<GeneratedAIEmployeePackage | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildingProgress, setBuildingProgress] = useState(0);
  const [buildingStageText, setBuildingStageText] = useState("");

  // Editable generated fields
  const [editableName, setEditableName] = useState("");
  const [editableRole, setEditableRole] = useState("");
  const [editableGreeting, setEditableGreeting] = useState("");
  const [editableScript, setEditableScript] = useState("");
  const [editableClosing, setEditableClosing] = useState("");
  const [editableQuestions, setEditableQuestions] = useState<QualificationQuestionItem[]>([]);
  const [editableObjections, setEditableObjections] = useState<ObjectionHandlerItem[]>([]);
  const [editableFaqs, setEditableFaqs] = useState<FAQItem[]>([]);

  // Step 4: Voice Selection
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("ananya");
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  // Step 5: Background Sound Selection
  const [ambientEnabled, setAmbientEnabled] = useState<boolean>(true);
  const [selectedAmbientId, setSelectedAmbientId] = useState<AmbientSoundId>("office");
  const [ambientVolume, setAmbientVolume] = useState<number>(25);
  const [previewingAmbientId, setPreviewingAmbientId] = useState<AmbientSoundId | null>(null);

  // Step 6: Interactive Test Simulator
  const [combinedAudioPlaying, setCombinedAudioPlaying] = useState(false);
  const [simMessages, setSimMessages] = useState<SimulatedMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isSimLoading, setIsSimLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Save states
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState<string | null>(null);

  // Load existing employee if editing
  useEffect(() => {
    if (editId) {
      fetch(`/api/ai-employees/${editId}`)
        .then((res) => res.json())
        .then((resData) => {
          if (resData.success && resData.data) {
            const emp = resData.data;
            if (emp.config) {
              setBusinessDescription(emp.config.businessDescription || "");
              setEmployeeRole(emp.role || "");
              setSelectedLanguage(emp.config.language || "te-IN");
              setGoal(emp.config.conversationGoals?.[0] || "");
              setSelectedVoiceId(emp.config.telephony?.voiceId || "ananya");
              setSelectedAmbientId(emp.config.telephony?.ambientNoise || "office");
              setEditableName(emp.name);
              setEditableRole(emp.role);
              setEditableGreeting(emp.config.greeting || "");
              setEditableClosing(
                emp.config.systemInstructions?.split("Closing:")?.[1] ||
                  "ధన్యవాదాలు అండి! నమస్కారం!"
              );
              setEditableQuestions(emp.config.qualificationQuestions || []);
              setEditableObjections(emp.config.objectionHandlers || []);
              setEditableFaqs(emp.config.faqs || []);
            }
          }
        })
        .catch((err) => console.error("Error loading agent for edit:", err));
    }
  }, [editId]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      audioEngine.stopAll();
    };
  }, []);

  // Handle template selection
  const applyTemplate = (tpl: IndustryTemplate) => {
    setActiveTemplateId(tpl.id);
    setBusinessDescription(tpl.businessDescription);
    setEmployeeRole(tpl.employeeRole);
    setTargetCustomers(tpl.targetCustomers);
    setSelectedLanguage(tpl.language);
    setGoal(tpl.goal);
  };

  // Build My Employee Action
  const handleBuildMyEmployee = () => {
    setIsBuilding(true);
    setBuildingProgress(10);
    setBuildingStageText("Analyzing your business and target customers...");

    // Smooth generation progress simulation
    setTimeout(() => {
      setBuildingProgress(40);
      setBuildingStageText(
        selectedLanguage === "te-IN"
          ? "Drafting polite natural Telugu greetings and questions..."
          : "Drafting conversational greetings, script, and questions..."
      );
    }, 450);

    setTimeout(() => {
      setBuildingProgress(75);
      setBuildingStageText("Synthesizing objection responses, FAQs, and closing statement in Rupees (₹)...");
    }, 900);

    setTimeout(() => {
      const generated = generateAIEmployeeScript({
        businessDescription,
        employeeRole,
        targetCustomers,
        language: selectedLanguage,
        goal,
        industryTemplateId: activeTemplateId,
      });

      setGeneratedPackage(generated);
      setEditableName(generated.name);
      setEditableRole(generated.role);
      setEditableGreeting(generated.greeting);
      setEditableScript(generated.completeCallScript);
      setEditableClosing(generated.closingStatement);
      setEditableQuestions(generated.customerQuestions);
      setEditableObjections(generated.objectionHandlers);
      setEditableFaqs(generated.faqs);

      // Auto-select matching voice
      if (selectedLanguage.startsWith("te")) {
        setSelectedVoiceId("ananya");
      } else if (selectedLanguage.startsWith("hi")) {
        setSelectedVoiceId("aarav");
      } else if (selectedLanguage.startsWith("ta")) {
        setSelectedVoiceId("murugan");
      } else if (selectedLanguage.startsWith("kn")) {
        setSelectedVoiceId("chethan");
      } else if (selectedLanguage.startsWith("ml")) {
        setSelectedVoiceId("rahul");
      } else if (selectedLanguage.startsWith("mr")) {
        setSelectedVoiceId("rohan");
      } else {
        setSelectedVoiceId("vikram");
      }

      setBuildingProgress(100);
      setBuildingStageText("AI Employee successfully generated!");
      setIsBuilding(false);
      setCurrentStep(3); // Advance to Generated Script Review
    }, 1400);
  };

  // Step 4 Voice Sample Playback
  const handlePlayVoiceSample = (voice: VoiceOption) => {
    if (playingVoiceId === voice.id) {
      audioEngine.stopVoice();
      setPlayingVoiceId(null);
      return;
    }

    setPlayingVoiceId(voice.id);
    audioEngine.playVoice(
      voice.id,
      voice.sampleText,
      "none",
      0,
      () => setPlayingVoiceId(voice.id),
      () => setPlayingVoiceId(null)
    );
  };

  // Step 5 Ambient Preview Playback
  const handleToggleAmbientPreview = (ambId: AmbientSoundId) => {
    if (previewingAmbientId === ambId) {
      audioEngine.stopAmbient();
      setPreviewingAmbientId(null);
      return;
    }

    setPreviewingAmbientId(ambId);
    audioEngine.startAmbient(ambId, ambientVolume);
  };

  // Step 6 Combined Audio Preview (Voice + Ambient mixed)
  const handleToggleCombinedPreview = () => {
    if (combinedAudioPlaying) {
      audioEngine.stopAll();
      setCombinedAudioPlaying(false);
      return;
    }

    setCombinedAudioPlaying(true);
    const ambientToPlay = ambientEnabled ? selectedAmbientId : "none";

    audioEngine.playVoice(
      selectedVoiceId,
      editableGreeting || "నమస్కారం అండి! నేను SideMate నుంచి మాట్లాడుతున్నాను.",
      ambientToPlay,
      ambientVolume,
      () => setCombinedAudioPlaying(true),
      () => setCombinedAudioPlaying(false)
    );
  };

  // Step 6 Interactive Test Simulator
  const handleSendSimMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isSimLoading) return;

    const userMsg: SimulatedMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    const nextMessages = [...simMessages, userMsg];
    setSimMessages(nextMessages);
    setUserInput("");
    setIsSimLoading(true);

    const mockConfig: AIEmployeeFullConfig = {
      name: editableName,
      role: editableRole,
      businessName: businessDescription.split(".")[0],
      businessDescription,
      primaryTask: "sales_calls",
      communicationStyle: "friendly",
      language: selectedLanguage,
      tone: "Warm & Conversational",
      systemInstructions: editableScript,
      knowledgeSources: [],
      faqs: editableFaqs,
      greeting: editableGreeting,
      conversationGoals: [goal],
      qualificationQuestions: editableQuestions,
      objectionHandlers: editableObjections,
      businessHours: {
        timezone: "Asia/Kolkata",
        startTime: "09:30",
        endTime: "18:30",
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      },
      escalation: {
        escalationPhone: "+91 98480 12345",
        escalationEmail: "support@sidemate.in",
        triggers: ["human", "manager", "person"],
        handoffMessage: "ఖచ్చితంగా అండి, మా సీనియర్ మేనేజర్ గారికి కాల్ కనెక్ట్ చేస్తున్నాను.",
      },
      telephony: {
        voiceId: selectedVoiceId,
        speed: 1.0,
        pitch: 1.0,
        ambientNoise: ambientEnabled ? selectedAmbientId : "none",
        callerId: "+91 98480 12345",
        maxDurationMinutes: 15,
      },
      status: "Live",
    };

    setTimeout(() => {
      const result = generateSimulationResponse(mockConfig, userMsg.text, nextMessages);

      const agentMsg: SimulatedMessage = {
        id: `agent-${Date.now()}`,
        sender: "agent",
        text: result.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setSimMessages([...nextMessages, agentMsg]);
      setIsSimLoading(false);

      // Play agent reply in speech synthesis with mixed ambient
      const ambientToPlay = ambientEnabled ? selectedAmbientId : "none";
      audioEngine.playVoice(selectedVoiceId, result.reply, ambientToPlay, ambientVolume);
    }, 600);
  };

  // Save as Draft or Activate
  const handleSaveEmployee = async (activateStatus: "Live" | "Draft") => {
    setIsSaving(true);
    audioEngine.stopAll();

    const payload = {
      name: editableName || "AI Voice Caller",
      role: editableRole || employeeRole,
      voiceId: selectedVoiceId,
      language: selectedLanguage,
      status: activateStatus,
      systemPrompt: editableScript || businessDescription,
      config: {
        name: editableName,
        role: editableRole,
        businessName: businessDescription.split(".")[0].substring(0, 40),
        businessDescription,
        primaryTask: "sales_calls",
        communicationStyle: "friendly",
        language: selectedLanguage,
        tone: "Natural & Respectful",
        systemInstructions: editableScript,
        knowledgeSources: [
          {
            id: "src-1",
            title: "Business Offerings",
            type: "text",
            content: businessDescription,
          },
        ],
        faqs: editableFaqs,
        greeting: editableGreeting,
        conversationGoals: [goal],
        qualificationQuestions: editableQuestions,
        objectionHandlers: editableObjections,
        businessHours: {
          timezone: "Asia/Kolkata",
          startTime: "09:30",
          endTime: "18:30",
          days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        },
        escalation: {
          escalationPhone: "+91 98480 12345",
          escalationEmail: "support@sidemate.in",
          triggers: ["human", "manager", "person", "కాల్ ట్రాన్స్‌ఫర్"],
          handoffMessage: "ఖచ్చితంగా అండి, మా సీనియర్ మేనేజర్ గారికి కాల్ ఇప్పుడే కనెక్ట్ చేస్తున్నాను.",
        },
        telephony: {
          voiceId: selectedVoiceId,
          speed: 1.0,
          pitch: 1.0,
          ambientNoise: ambientEnabled ? selectedAmbientId : "none",
          callerId: "+91 98480 12345",
          maxDurationMinutes: 15,
        },
        status: activateStatus,
      },
    };

    try {
      const endpoint = editId ? `/api/ai-employees/${editId}` : "/api/ai-employees";
      const method = editId ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSaveSuccessNotice(
          activateStatus === "Live"
            ? `🎉 Employee "${editableName}" is now LIVE and saved permanently!`
            : `💾 Employee "${editableName}" saved as Draft permanently!`
        );
        setTimeout(() => {
          router.push("/dashboard/ai-employees");
        }, 1200);
      } else {
        alert("Failed to save employee. Please try again.");
      }
    } catch (err) {
      console.error("Save employee error:", err);
      alert("Error saving employee to backend storage.");
    } finally {
      setIsSaving(false);
    }
  };

  const currentVoiceObj = ALL_VOICES.find((v) => v.id === selectedVoiceId) || ALL_VOICES[0];
  const currentAmbientObj = AMBIENT_SOUND_OPTIONS.find((a) => a.id === selectedAmbientId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <Link
          href="/dashboard/ai-employees"
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => audioEngine.stopAll()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to AI Employees Dashboard
        </Link>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
            {editId ? "Editing Employee" : "New AI Employee Setup"}
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">
            Step {currentStep} of 6
          </span>
        </div>
      </div>

      {/* Workflow Step Progress Bar */}
      <div className="grid grid-cols-6 gap-2">
        {[
          { num: 1, title: "1. Business Prompt" },
          { num: 2, title: "2. AI Generation" },
          { num: 3, title: "3. Call Script" },
          { num: 4, title: "4. Voice Selection" },
          { num: 5, title: "5. Background Sound" },
          { num: 6, title: "6. Preview & Activate" },
        ].map((s) => {
          const isDone = currentStep > s.num;
          const isCurrent = currentStep === s.num;

          return (
            <button
              key={s.num}
              onClick={() => {
                if (currentStep >= s.num || generatedPackage) {
                  audioEngine.stopAll();
                  setCurrentStep(s.num);
                }
              }}
              disabled={currentStep < s.num && !generatedPackage}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                isCurrent
                  ? "border-indigo-600 bg-indigo-600/10 text-indigo-400 ring-1 ring-indigo-600"
                  : isDone
                  ? "border-border bg-card text-foreground hover:bg-muted/30"
                  : "border-border/50 bg-card/40 text-muted-foreground/50 opacity-60 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="truncate">{s.title}</span>
                {isDone && <Check className="h-3 w-3 text-emerald-500 shrink-0" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Success Notice Banner */}
      {saveSuccessNotice && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{saveSuccessNotice}</span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
         STEP 1: ENTER PROMPT & INDUSTRY TEMPLATES
      ────────────────────────────────────────────────────────────────────────── */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-500" />
              Describe your AI Caller in one simple prompt
            </h2>
            <p className="text-xs text-muted-foreground">
              Provide your business description, customer type, primary goal, and preferred language. You can also pick an industry template below for instant setup.
            </p>
          </div>

          {/* Industry Quick Templates */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Quick Industry Templates (Click to Pre-fill)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {INDUSTRY_TEMPLATES.map((tpl) => {
                const isSelected = activeTemplateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => applyTemplate(tpl)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-500/10 text-foreground ring-1 ring-indigo-600 shadow-xs"
                        : "border-border bg-card hover:bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    <div className="text-xl mb-1.5">{tpl.icon}</div>
                    <div className="font-bold text-xs text-foreground line-clamp-1">{tpl.title}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{tpl.category.split("&")[0]}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Fields */}
          <Card className="border-border bg-card shadow-sm">
            <CardContent className="p-6 space-y-5">
              {/* Business Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-indigo-500" />
                  What is your business and what do you sell or offer?
                </label>
                <textarea
                  value={businessDescription}
                  onChange={(e) => setBusinessDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  placeholder="e.g. Sri Balaji Ventures provides HMDA and RERA approved open plots in Hyderabad with 80% bank loans..."
                />
              </div>

              {/* Employee Role & Target Customers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Wand2 className="h-3.5 w-3.5 text-indigo-500" />
                    Employee Role / Calling Title
                  </label>
                  <Input
                    value={employeeRole}
                    onChange={(e) => setEmployeeRole(e.target.value)}
                    placeholder="e.g. Senior Real Estate & Plot Sales Caller"
                    className="text-xs h-10 bg-background border-border"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground flex items-center gap-2">
                    <Users className="h-3.5 w-3.5 text-indigo-500" />
                    Who are you calling? (Target Customers)
                  </label>
                  <Input
                    value={targetCustomers}
                    onChange={(e) => setTargetCustomers(e.target.value)}
                    placeholder="e.g. Home buyers, plot investors, clinic patients, trade dealers"
                    className="text-xs h-10 bg-background border-border"
                  />
                </div>
              </div>

              {/* Language Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Languages className="h-3.5 w-3.5 text-indigo-500" />
                  Primary Language for Phone Calls
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                  {LANGUAGE_CHOICES.map((lang) => {
                    const isSelected = selectedLanguage === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setSelectedLanguage(lang.code)}
                        className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-500/10 text-indigo-400 font-bold ring-1 ring-indigo-600"
                            : "border-border bg-background hover:bg-muted/40 text-muted-foreground"
                        }`}
                      >
                        <div className="text-sm">{lang.icon}</div>
                        <div className="text-xs font-semibold mt-1 text-foreground">{lang.label.split(" ")[0]}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{lang.region}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Goal */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center gap-2">
                  <Target className="h-3.5 w-3.5 text-indigo-500" />
                  What is the primary call goal?
                </label>
                <Input
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Book weekend site visits, confirm doctor appointment, or collect pending EMI in ₹"
                  className="text-xs h-10 bg-background border-border"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Button: Build My Employee */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              ⚡ Automatically generates complete conversational script, greetings, questions & objection handlers.
            </span>
            <Button
              size="lg"
              onClick={handleBuildMyEmployee}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 shadow-lg shadow-indigo-600/20"
            >
              <Sparkles className="h-4 w-4" />
              Build My Employee
            </Button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
         STEP 2: BUILDING STATE ANIMATION
      ────────────────────────────────────────────────────────────────────────── */}
      {isBuilding && (
        <Card className="border-indigo-500/30 bg-card p-12 text-center shadow-xl animate-in fade-in">
          <div className="max-w-md mx-auto space-y-6">
            <div className="relative w-16 h-16 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-indigo-600/20" />
              <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
              <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-indigo-500 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-foreground">
                Building Your AI Employee...
              </h3>
              <p className="text-xs text-indigo-400 font-medium">
                {buildingStageText}
              </p>
            </div>

            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-indigo-600 h-full transition-all duration-300"
                style={{ width: `${buildingProgress}%` }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
         STEP 3: GENERATED CALL SCRIPT & CONVERSATION FLOW
      ────────────────────────────────────────────────────────────────────────── */}
      {currentStep === 3 && generatedPackage && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-500" />
                Review & Edit Generated Call Script
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                SideMate has synthesized a full conversational workflow for {editableName}. Review or edit any wording.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep(1)}
                className="text-xs"
              >
                Edit Prompt
              </Button>
              <Button
                size="sm"
                onClick={() => setCurrentStep(4)}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
              >
                Proceed to Voice Selection
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Employee Identity Card */}
          <Card className="border-border bg-card">
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Generated Name</label>
                  <Input
                    value={editableName}
                    onChange={(e) => setEditableName(e.target.value)}
                    className="text-xs h-9 bg-background border-border"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground">Role Title</label>
                  <Input
                    value={editableRole}
                    onChange={(e) => setEditableRole(e.target.value)}
                    className="text-xs h-9 bg-background border-border"
                  />
                </div>
              </div>

              {/* Greeting */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>Opening Greeting (First Words)</span>
                  <Badge variant="outline" className="text-[10px] text-indigo-400">
                    {selectedLanguage.split("-")[0].toUpperCase()}
                  </Badge>
                </label>
                <textarea
                  value={editableGreeting}
                  onChange={(e) => setEditableGreeting(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              {/* Complete Call Script */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Complete Conversational Call Script
                </label>
                <textarea
                  value={editableScript}
                  onChange={(e) => setEditableScript(e.target.value)}
                  rows={6}
                  className="w-full rounded-xl border border-border bg-background p-3 font-mono text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              {/* Closing Statement */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  Closing Statement (Sign-off)
                </label>
                <textarea
                  value={editableClosing}
                  onChange={(e) => setEditableClosing(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>
            </CardContent>
          </Card>

          {/* Qualification Questions & Objection Handling */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Qualification Questions */}
            <Card className="border-border bg-card">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-indigo-500" />
                    Customer Questions ({editableQuestions.length})
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {editableQuestions.map((q, idx) => (
                    <div key={q.id} className="p-3 rounded-lg border border-border bg-background space-y-1 text-xs">
                      <div className="flex items-center justify-between text-muted-foreground text-[10px]">
                        <span>Question {idx + 1}</span>
                        {q.required && <Badge variant="outline" className="text-[9px]">Required</Badge>}
                      </div>
                      <p className="font-medium text-foreground">{q.question}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Objection Handlers */}
            <Card className="border-border bg-card">
              <CardContent className="p-5 space-y-3">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  Objection Handling ({editableObjections.length})
                </h3>

                <div className="space-y-2.5">
                  {editableObjections.map((obj) => (
                    <div key={obj.id} className="p-3 rounded-lg border border-border bg-background space-y-1 text-xs">
                      <span className="font-semibold text-rose-400 block">{obj.objection}</span>
                      <p className="text-muted-foreground leading-relaxed">&ldquo;{obj.response}&rdquo;</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              size="lg"
              onClick={() => setCurrentStep(4)}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 shadow-md"
            >
              Next: Select Voice
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
         STEP 4: VOICE SELECTION
      ────────────────────────────────────────────────────────────────────────── */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Volume2 className="h-5 w-5 text-indigo-500" />
                Select Voice for {editableName || "Your Employee"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Listen to natural Indian voice models. Click &ldquo;Play Sample&rdquo; to test each voice immediately.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep(3)}
                className="text-xs"
              >
                Back to Script
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  audioEngine.stopAll();
                  setCurrentStep(5);
                }}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
              >
                Next: Background Sound
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Voice Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALL_VOICES.map((v) => {
              const isSelected = selectedVoiceId === v.id;
              const isPlaying = playingVoiceId === v.id;

              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVoiceId(v.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-500/10 ring-2 ring-indigo-600 shadow-md"
                      : "border-border bg-card hover:bg-muted/40"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-foreground">
                            {v.name} ({v.nativeName})
                          </h3>
                          <Badge variant="outline" className="text-[10px]">
                            {v.gender}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-indigo-400 font-medium mt-0.5">{v.accent}</p>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-border bg-background"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {v.tagline}
                    </p>

                    <div className="p-2.5 rounded-xl bg-background border border-border text-[11px] italic text-muted-foreground line-clamp-2">
                      &ldquo;{v.sampleText}&rdquo;
                    </div>
                  </div>

                  {/* Play Sample Button */}
                  <div className="pt-4 mt-3 border-t border-border flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                      {v.style}
                    </span>

                    <Button
                      size="sm"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayVoiceSample(v);
                      }}
                      className={`gap-1.5 h-8 text-xs font-semibold ${
                        isPlaying
                          ? "bg-rose-600 hover:bg-rose-700 text-white"
                          : isSelected
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white"
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
                          Play Sample
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              size="lg"
              onClick={() => {
                audioEngine.stopAll();
                setCurrentStep(5);
              }}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 shadow-md"
            >
              Next: Background Sound
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
         STEP 5: BACKGROUND SOUND SELECTION & MIXER
      ────────────────────────────────────────────────────────────────────────── */}
      {currentStep === 5 && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Sliders className="h-5 w-5 text-indigo-500" />
                Background Sound & Audio Mixer
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Add subtle ambient sound to make phone calls sound 100% natural. The AI voice will always remain clear and louder.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  audioEngine.stopAll();
                  setCurrentStep(4);
                }}
                className="text-xs"
              >
                Back to Voice
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  audioEngine.stopAll();
                  setCurrentStep(6);
                }}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
              >
                Next: Preview & Activate
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Ambient Sound Master Toggle & Volume Slider */}
          <Card className="border-border bg-card">
            <CardContent className="p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div>
                  <span className="font-bold text-sm text-foreground block">
                    Ambient Background Sound
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Mix realistic room tone behind {editableName}&apos;s voice calls
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const next = !ambientEnabled;
                    setAmbientEnabled(next);
                    if (!next) {
                      audioEngine.stopAmbient();
                      setPreviewingAmbientId(null);
                    }
                  }}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer p-0.5 ${
                    ambientEnabled ? "bg-indigo-600" : "bg-muted"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      ambientEnabled ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {ambientEnabled && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">
                      Background Sound Volume (Ducked under voice)
                    </span>
                    <span className="font-mono text-indigo-400 font-bold">{ambientVolume}%</span>
                  </div>
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
                    className="w-full accent-indigo-600 cursor-pointer h-2 bg-muted rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Subtle (10%)</span>
                    <span>Recommended (25%)</span>
                    <span>Loud (60%+)</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 5 Selectable Ambient Sound Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AMBIENT_SOUND_OPTIONS.map((amb) => {
              const isSelected = selectedAmbientId === amb.id && ambientEnabled;
              const isPreviewing = previewingAmbientId === amb.id;

              return (
                <div
                  key={amb.id}
                  onClick={() => {
                    if (!ambientEnabled) setAmbientEnabled(true);
                    setSelectedAmbientId(amb.id);
                  }}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-500/10 ring-2 ring-indigo-600 shadow-md"
                      : "border-border bg-card hover:bg-muted/40"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{amb.icon}</span>
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-600 text-white"
                            : "border-border bg-background"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                    </div>

                    <h3 className="font-bold text-sm text-foreground">{amb.name}</h3>
                    <p className="text-[11px] text-indigo-400 font-medium">{amb.tagline}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {amb.description}
                    </p>
                  </div>

                  {/* Audio Preview Control */}
                  <div className="pt-4 mt-3 border-t border-border flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      Rec. Vol: {amb.recommendedVolume}%
                    </span>

                    <Button
                      size="sm"
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleAmbientPreview(amb.id);
                      }}
                      className={`gap-1.5 h-8 text-xs font-semibold ${
                        isPreviewing
                          ? "bg-rose-600 hover:bg-rose-700 text-white"
                          : "bg-muted text-foreground hover:bg-muted/80"
                      }`}
                    >
                      {isPreviewing ? (
                        <>
                          <Square className="h-3 w-3 fill-current" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Play className="h-3 w-3 fill-current" />
                          Preview Sound
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              size="lg"
              onClick={() => {
                audioEngine.stopAll();
                setCurrentStep(6);
              }}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 shadow-md"
            >
              Next: Preview & Activate
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────
         STEP 6: PREVIEW, INTERACTIVE TEST SIMULATOR & ACTIVATE / DRAFT
      ────────────────────────────────────────────────────────────────────────── */}
      {currentStep === 6 && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                Preview, Test & Activate {editableName}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Audition the voice with mixed background sound, test conversations in the sandbox, and save as Draft or Activate.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  audioEngine.stopAll();
                  setCurrentStep(5);
                }}
                className="text-xs"
              >
                Back to Sounds
              </Button>
            </div>
          </div>

          {/* Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl border border-border bg-card">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Employee</span>
              <span className="font-bold text-sm text-foreground">{editableName}</span>
              <span className="text-xs text-indigo-400 block truncate">{editableRole}</span>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-card">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Voice Model</span>
              <span className="font-bold text-sm text-foreground">{currentVoiceObj.name}</span>
              <span className="text-xs text-muted-foreground block">{currentVoiceObj.accent}</span>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-card">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Background Sound</span>
              <span className="font-bold text-sm text-foreground">
                {ambientEnabled ? currentAmbientObj?.name : "None (Muted)"}
              </span>
              <span className="text-xs text-muted-foreground block">
                {ambientEnabled ? `Volume: ${ambientVolume}%` : "No ambience"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl border border-border bg-card">
              <span className="text-[10px] text-muted-foreground uppercase font-bold block">Language</span>
              <span className="font-bold text-sm text-foreground">
                {LANGUAGE_CHOICES.find((l) => l.code === selectedLanguage)?.label || selectedLanguage}
              </span>
              <span className="text-xs text-emerald-500 font-semibold block">Natural Speech Engine</span>
            </div>
          </div>

          {/* Live Audio Audition Bar (Voice + Ambient Mixed) */}
          <Card className="border-indigo-500/30 bg-gradient-to-r from-indigo-950/30 to-purple-950/20 shadow-md">
            <CardContent className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="font-bold text-sm text-foreground">
                    Audition Voice + Background Sound Mixed
                  </span>
                  <Badge variant="outline" className="text-[10px] text-indigo-400 border-indigo-400/30">
                    Live Audio Engine
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Plays {currentVoiceObj.name}&apos;s voice with {ambientEnabled ? currentAmbientObj?.name : "no ambience"} mixed underneath.
                </p>
              </div>

              <Button
                size="lg"
                onClick={handleToggleCombinedPreview}
                className={`gap-2 text-xs font-bold px-6 shrink-0 ${
                  combinedAudioPlaying
                    ? "bg-rose-600 hover:bg-rose-700 text-white"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20"
                }`}
              >
                {combinedAudioPlaying ? (
                  <>
                    <Square className="h-4 w-4 fill-current" />
                    Stop Audio
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" />
                    Play Voice & Ambience Together
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Interactive Chat / Test Sandbox */}
          <Card className="border-border bg-card">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <PhoneCall className="h-4 w-4 text-emerald-500" />
                  <span className="font-bold text-sm text-foreground">Interactive Call Simulator</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSimMessages([])}
                  className="text-xs h-7 gap-1 text-muted-foreground"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset Chat
                </Button>
              </div>

              {/* Messages Container */}
              <div className="h-64 overflow-y-auto space-y-3 p-3 rounded-xl bg-background border border-border">
                {simMessages.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-xs space-y-1">
                    <p className="font-semibold text-foreground">Test Conversation Sandbox</p>
                    <p>Type a message below or say hello to simulate speaking with {editableName}.</p>
                    <p className="italic text-[11px] text-indigo-400">
                      Greeting: &ldquo;{editableGreeting}&rdquo;
                    </p>
                  </div>
                ) : (
                  simMessages.map((msg) => {
                    const isAgent = msg.sender === "agent";
                    return (
                      <div
                        key={msg.id}
                        className={`flex gap-2.5 ${isAgent ? "justify-start" : "justify-end"}`}
                      >
                        {isAgent && (
                          <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {editableName.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-xl px-3.5 py-2 text-xs leading-relaxed ${
                            isAgent
                              ? "bg-card border border-border text-foreground"
                              : "bg-indigo-600 text-white"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-0.5 text-[10px] opacity-70">
                            <span>{isAgent ? editableName : "You"}</span>
                            <span>{msg.timestamp}</span>
                          </div>
                          <p>{msg.text}</p>
                        </div>
                      </div>
                    );
                  })
                )}
                {isSimLoading && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
                    <span className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                    <span>{editableName} is formulating response...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendSimMessage} className="flex gap-2">
                <Input
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type a message (e.g. రేటు ఎంత?, బడ్జెట్ ₹30 లక్షలు, వివరాలు పంపండి)..."
                  className="text-xs h-10 bg-background border-border"
                />
                <Button
                  type="submit"
                  disabled={!userInput.trim() || isSimLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 h-10 shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Safety & Telephony Notice */}
          <div className="p-3.5 rounded-xl border border-border bg-muted/20 text-xs text-muted-foreground flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>
                <strong>Safety Guarantee:</strong> SideMate never initiates real telephone calls automatically. All tests are safely simulated.
              </span>
            </span>
            <Badge variant="outline" className="text-[10px]">
              Carrier Calling: Twilio/Exotel Ready
            </Badge>
          </div>

          {/* Final Action Buttons: Save as Draft or Activate */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border">
            <Button
              variant="outline"
              size="lg"
              disabled={isSaving}
              onClick={() => handleSaveEmployee("Draft")}
              className="w-full sm:w-auto gap-2 text-xs"
            >
              <Save className="h-4 w-4" />
              Save as Draft
            </Button>

            <Button
              size="lg"
              disabled={isSaving}
              onClick={() => handleSaveEmployee("Live")}
              className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 shadow-lg shadow-emerald-600/20"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isSaving ? "Activating..." : "Activate Employee (Go Live)"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AIEmployeeBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-muted-foreground">
          Loading AI Employee Builder...
        </div>
      }
    >
      <CreateEmployeeWorkflowContent />
    </Suspense>
  );
}
