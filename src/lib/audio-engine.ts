/**
 * SideMate Real-Time Web Audio Engine
 * Provides realistic procedural ambient sound generation (Office, Call Center, Cafe, Quiet Room, Retail)
 * and seamless audio mixing with voice synthesis and preview playback.
 */

export type AmbientSoundId = "office" | "callcenter" | "cafe" | "quiet" | "retail" | "none";

export interface AmbientSoundOption {
  id: AmbientSoundId;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  recommendedVolume: number; // 0 to 100
}

export const AMBIENT_SOUND_OPTIONS: AmbientSoundOption[] = [
  {
    id: "office",
    name: "Office Ambience",
    tagline: "Productive workspace room tone",
    description: "Subtle keyboard typing, quiet room presence, and gentle acoustic space.",
    icon: "🏢",
    recommendedVolume: 25,
  },
  {
    id: "callcenter",
    name: "Call Center",
    tagline: "Professional support floor",
    description: "Soft multi-agent murmur with distant muted telephone chimes.",
    icon: "🎧",
    recommendedVolume: 20,
  },
  {
    id: "cafe",
    name: "Restaurant / Cafe",
    tagline: "Relaxed commercial atmosphere",
    description: "Gentle ceramic clinking and pleasant low-frequency ambient murmurs.",
    icon: "☕",
    recommendedVolume: 22,
  },
  {
    id: "quiet",
    name: "Quiet Room",
    tagline: "Studio & private cabin",
    description: "Ultra-clean acoustic presence eliminating artificial dead silence.",
    icon: "🎙️",
    recommendedVolume: 15,
  },
  {
    id: "retail",
    name: "Retail Store",
    tagline: "Modern showroom presence",
    description: "Soft store atmosphere with occasional pleasant welcoming chimes.",
    icon: "🛍️",
    recommendedVolume: 24,
  },
];

export interface VoiceOption {
  id: string;
  name: string;
  nativeName: string;
  languageCode: string;
  languageLabel: string;
  accent: string;
  gender: "Female" | "Male";
  style: string;
  tagline: string;
  sampleText: string;
  pitch: number;
  rate: number;
}

export const ALL_VOICES: VoiceOption[] = [
  // Telugu (Primary)
  {
    id: "ananya",
    name: "Ananya",
    nativeName: "అనన్య",
    languageCode: "te-IN",
    languageLabel: "Telugu (తెలుగు)",
    accent: "Telugu (Hyderabad)",
    gender: "Female",
    style: "Warm & Conversational",
    tagline: "Natural polite Telugu tone, ideal for real estate, villas & customer follow-ups",
    sampleText: "నమస్కారం! నేను అనన్యను. మీ కస్టమర్లతో సహజమైన, గౌరవప్రదమైన తెలుగులో మాట్లాడటానికి సిద్ధంగా ఉన్నాను.",
    pitch: 1.05,
    rate: 0.98,
  },
  {
    id: "suresh",
    name: "Suresh",
    nativeName: "సురేష్",
    languageCode: "te-IN",
    languageLabel: "Telugu (తెలుగు)",
    accent: "Telugu (Vijayawada)",
    gender: "Male",
    style: "Clear & Confident",
    tagline: "Authoritative business cadence for wholesale trade, retail & B2B order follow-ups",
    sampleText: "నమస్కారం సార్! నేను సురేష్. రియల్ ఎస్టేట్ మరియు బిజినెస్ లీడ్స్ ఫాలో-అప్ మాట్లాడతాను.",
    pitch: 0.95,
    rate: 1.0,
  },
  {
    id: "harika",
    name: "Harika",
    nativeName: "హారిక",
    languageCode: "te-IN",
    languageLabel: "Telugu (తెలుగు)",
    accent: "Telugu & English",
    gender: "Female",
    style: "Friendly & Expressive",
    tagline: "Upbeat and lively, ideal for clinic patient bookings, callbacks & inquiries",
    sampleText: "హలో అండి! నేను హారిక. డాక్టర్ అపాయింట్‌మెంట్లు మరియు కస్టమర్ సపోర్ట్ క్షణాల్లో మాట్లాడే వాయిస్ అసిస్టెంట్ ఇది.",
    pitch: 1.1,
    rate: 1.02,
  },
  {
    id: "venkat",
    name: "Venkat",
    nativeName: "వెంకట్",
    languageCode: "te-IN",
    languageLabel: "Telugu (తెలుగు)",
    accent: "Telugu (AP/TS)",
    gender: "Male",
    style: "Polite & Respectful",
    tagline: "Respectful and clear tone, perfect for EMI, fee reminders & friendly follow-ups",
    sampleText: "నమస్తే! నేను వెంకట్. పేమెంట్ రిమైండర్లు, ఆర్డర్ కన్ఫర్మేషన్స్ మరియు ఎంక్వైరీలకు వెంటనే రెస్పాన్స్ ఇస్తాను.",
    pitch: 0.92,
    rate: 0.96,
  },
  {
    id: "priya",
    name: "Priya",
    nativeName: "ప్రియ",
    languageCode: "te-IN",
    languageLabel: "Telugu & English",
    accent: "Indian Bilingual (Tenglish)",
    gender: "Female",
    style: "Crisp & Professional",
    tagline: "Fluent bilingual voice that smoothly mixes Telugu and English",
    sampleText: "నమస్కారం! I am Priya from SideMate. We help Indian businesses talk to customers fluently in both Telugu and English.",
    pitch: 1.02,
    rate: 1.0,
  },

  // Hindi
  {
    id: "aarav",
    name: "Aarav",
    nativeName: "आरव",
    languageCode: "hi-IN",
    languageLabel: "Hindi (हिंदी)",
    accent: "Hindi (Standard)",
    gender: "Male",
    style: "Professional & Polished",
    tagline: "Smooth, trustworthy Hindi cadence for sales qualification and client outreach",
    sampleText: "नमस्ते! मैं आरव हूँ। आपके ग्राहकों से विनम्र और स्पष्ट हिंदी में बात करने के लिए तैयार हूँ।",
    pitch: 0.96,
    rate: 1.0,
  },
  {
    id: "kavya",
    name: "Kavya",
    nativeName: "काव्या",
    languageCode: "hi-IN",
    languageLabel: "Hindi (हिंदी)",
    accent: "Hindi (Urban)",
    gender: "Female",
    style: "Warm & Reassuring",
    tagline: "Polite and friendly tone for customer appointments, service & support",
    sampleText: "नमस्ते जी! मैं काव्या बात कर रही हूँ। आपकी सेवाओं की पूरी जानकारी मैं ग्राहकों को आसानी से समझा सकती हूँ।",
    pitch: 1.08,
    rate: 0.98,
  },

  // Tamil
  {
    id: "murugan",
    name: "Murugan",
    nativeName: "முருகன்",
    languageCode: "ta-IN",
    languageLabel: "Tamil (தமிழ்)",
    accent: "Tamil (Chennai)",
    gender: "Male",
    style: "Crisp & Articulate",
    tagline: "Clear respectful Tamil for commercial bookings and business queries",
    sampleText: "வணக்கம்! நான் முருகன். உங்கள் வாடிக்கையாளர்களிடம் அன்பாகவும் தெளிவாகவும் பேச நான் தயாராக உள்ளேன்.",
    pitch: 0.98,
    rate: 0.98,
  },
  {
    id: "soundarya",
    name: "Soundarya",
    nativeName: "சௌந்தர்யா",
    languageCode: "ta-IN",
    languageLabel: "Tamil (தமிழ்)",
    accent: "Tamil (Standard)",
    gender: "Female",
    style: "Warm & Welcoming",
    tagline: "Pleasant patient tone for clinic appointments and retail follow-ups",
    sampleText: "வணக்கம் அண்டி! நான் சௌந்தர்யா. கஸ்டமர் அழைப்புகள் மற்றும் அப்பாயின்ட்மென்ட்களுக்கு நான் உதவுவேன்.",
    pitch: 1.05,
    rate: 1.0,
  },

  // Kannada
  {
    id: "chethan",
    name: "Chethan",
    nativeName: "ಚೇತನ್",
    languageCode: "kn-IN",
    languageLabel: "Kannada (ಕನ್ನಡ)",
    accent: "Kannada (Bangalore)",
    gender: "Male",
    style: "Polite & Resonant",
    tagline: "Direct courteous Kannada for real estate and B2B trade inquiries",
    sampleText: "ನಮಸ್ಕಾರ! ನಾನು ಚೇತನ್. ನಿಮ್ಮ ಗ್ರಾಹಕರೊಂದಿಗೆ ಗೌರವಯುತ ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಲು ಸಿದ್ಧನಾಗಿದ್ದೇನೆ.",
    pitch: 0.96,
    rate: 0.98,
  },
  {
    id: "sahana",
    name: "Sahana",
    nativeName: "ಸಹನಾ",
    languageCode: "kn-IN",
    languageLabel: "Kannada (ಕನ್ನಡ)",
    accent: "Kannada (Karnataka)",
    gender: "Female",
    style: "Warm & Courteous",
    tagline: "Sweet courteous cadence for appointments, services and order updates",
    sampleText: "ನಮಸ್ಕಾರ! ನಾನು ಸಹನಾ. ನಿಮ್ಮ ವ್ಯಾಪಾರದ ಎಲ್ಲಾ ವಿಚಾರಣೆಗಳನ್ನು ಅತ್ಯಂತ ಸುಲಭವಾಗಿ ನಿರ್ವಹಿಸುತ್ತೇನೆ.",
    pitch: 1.06,
    rate: 0.98,
  },

  // Malayalam
  {
    id: "rahul",
    name: "Rahul",
    nativeName: "രാഹുൽ",
    languageCode: "ml-IN",
    languageLabel: "Malayalam (മലയാളം)",
    accent: "Malayalam (Kerala)",
    gender: "Male",
    style: "Gentle & Engaging",
    tagline: "Natural polite Malayalam for customer reminders and advisory calls",
    sampleText: "നമസ്കാരം! ഞാൻ രാഹുൽ സംസാരിക്കുന്നു. നിങ്ങളുടെ ഉപഭോക്താക്കളുമായി സൗഹൃദത്തോടെ സംസാരിക്കാൻ ഞാൻ തയ്യാറാണ്.",
    pitch: 0.98,
    rate: 0.98,
  },
  {
    id: "anjali",
    name: "Anjali",
    nativeName: "അഞ്ജലി",
    languageCode: "ml-IN",
    languageLabel: "Malayalam (മലയാളം)",
    accent: "Malayalam (Cochin)",
    gender: "Female",
    style: "Clear & Polite",
    tagline: "Crisp and pleasant voice for hospital, booking and education queries",
    sampleText: "നമസ്കാരം! ഞാൻ അഞ്ജലി. നിങ്ങളുടെ സേവനങ്ങളെക്കുറിച്ചുള്ള വിവരങ്ങൾ വിശദീകരിക്കാൻ ഞാൻ സദാ സന്നദ്ധയാണ്.",
    pitch: 1.06,
    rate: 0.98,
  },

  // Marathi
  {
    id: "rohan",
    name: "Rohan",
    nativeName: "रोहन",
    languageCode: "mr-IN",
    languageLabel: "Marathi (मराठी)",
    accent: "Marathi (Pune/Mumbai)",
    gender: "Male",
    style: "Crisp & Direct",
    tagline: "Honest and clear Marathi for retail trade, real estate and dispatch",
    sampleText: "नमस्कार! मी रोहन. आपल्या ग्राहकांशी सौम्य आणि स्पष्ट मराठीत संवाद साधण्यासाठी मी तत्पर आहे.",
    pitch: 0.98,
    rate: 1.0,
  },
  {
    id: "sneha",
    name: "Sneha",
    nativeName: "स्नेहा",
    languageCode: "mr-IN",
    languageLabel: "Marathi (मराठी)",
    accent: "Marathi (Standard)",
    gender: "Female",
    style: "Polite & Helpful",
    tagline: "Reassuring tone for patient reminders and service confirmation",
    sampleText: "नमस्कार! मी स्नेहा बोलतेय. आपल्या ग्राहकांच्या प्रश्नांची उत्तरे देण्यासाठी मी उपस्थित आहे.",
    pitch: 1.06,
    rate: 0.98,
  },

  // English (Indian)
  {
    id: "vikram",
    name: "Vikram",
    nativeName: "Vikram",
    languageCode: "en-IN",
    languageLabel: "English (Indian)",
    accent: "Neutral Indian English",
    gender: "Male",
    style: "Corporate Consultant",
    tagline: "Articulate, executive tone suited for corporate sales & enterprise consulting",
    sampleText: "Hello! This is Vikram from SideMate. I help your business connect with clients efficiently and professionally.",
    pitch: 0.98,
    rate: 1.0,
  },
  {
    id: "meera",
    name: "Meera",
    nativeName: "Meera",
    languageCode: "en-IN",
    languageLabel: "English (Indian)",
    accent: "Pan-Indian English",
    gender: "Female",
    style: "Customer Specialist",
    tagline: "Warm, empathetic and crisp Indian English for hospitality & customer care",
    sampleText: "Hello! I am Meera. I ensure your customers receive immediate, polite assistance and seamless appointment scheduling.",
    pitch: 1.04,
    rate: 1.0,
  },
];

class AudioEngine {
  private ctx: AudioContext | null = null;
  private currentAmbientId: AmbientSoundId | null = null;
  private ambientGainNode: GainNode | null = null;
  private ambientSourceNodes: (AudioNode | number)[] = [];
  private ambientIntervalId: any = null;
  private isSpeaking: boolean = false;
  private activeVoiceAudioSource: AudioNode | null = null;

  private getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === "closed") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Generates white/pink noise buffer
   */
  private createNoiseBuffer(ctx: AudioContext, seconds = 2): AudioBuffer {
    const bufferSize = ctx.sampleRate * seconds;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      data[i] = (b0 + b1 + b2 + white * 0.5362) * 0.1;
    }
    return buffer;
  }

  /**
   * Start procedural ambient sound loop
   */
  public startAmbient(type: AmbientSoundId, volumePercent: number): void {
    if (type === "none") {
      this.stopAmbient();
      return;
    }

    if (typeof window === "undefined") return;

    this.stopAmbient();
    const ctx = this.getContext();
    this.currentAmbientId = type;

    // Master ambient gain
    const masterGain = ctx.createGain();
    const normalizedVol = Math.max(0.01, Math.min(1.0, volumePercent / 100)) * 0.35;
    masterGain.gain.setValueAtTime(normalizedVol, ctx.currentTime);
    masterGain.connect(ctx.destination);
    this.ambientGainNode = masterGain;

    const noiseBuffer = this.createNoiseBuffer(ctx, 3);

    if (type === "office") {
      // Room presence filter
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 850;
      filter.Q.value = 0.8;

      noiseSource.connect(filter);
      filter.connect(masterGain);
      noiseSource.start();
      this.ambientSourceNodes.push(noiseSource);

      // Random gentle key clicks
      this.ambientIntervalId = setInterval(() => {
        if (!this.currentAmbientId || this.ctx?.state === "closed") return;
        try {
          const osc = ctx.createOscillator();
          const clickGain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(1400 + Math.random() * 1800, ctx.currentTime);
          clickGain.gain.setValueAtTime(0.015 * Math.random(), ctx.currentTime);
          clickGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
          osc.connect(clickGain);
          clickGain.connect(masterGain);
          osc.start();
          osc.stop(ctx.currentTime + 0.05);
        } catch {}
      }, 350 + Math.random() * 500);

    } else if (type === "callcenter") {
      // Filtered multi-talker murmur
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 650;
      filter.Q.value = 1.2;

      noiseSource.connect(filter);
      filter.connect(masterGain);
      noiseSource.start();
      this.ambientSourceNodes.push(noiseSource);

      // Distant telephone ring cadence
      this.ambientIntervalId = setInterval(() => {
        if (!this.currentAmbientId || this.ctx?.state === "closed") return;
        try {
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const ringGain = ctx.createGain();
          osc1.frequency.value = 440;
          osc2.frequency.value = 480;
          ringGain.gain.setValueAtTime(0.006, ctx.currentTime);
          ringGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
          osc1.connect(ringGain);
          osc2.connect(ringGain);
          ringGain.connect(masterGain);
          osc1.start();
          osc2.start();
          osc1.stop(ctx.currentTime + 0.35);
          osc2.stop(ctx.currentTime + 0.35);
        } catch {}
      }, 2600);

    } else if (type === "cafe") {
      // Low-frequency cozy room warmth
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 450;

      noiseSource.connect(filter);
      filter.connect(masterGain);
      noiseSource.start();
      this.ambientSourceNodes.push(noiseSource);

      // Occasional gentle cup clinking
      this.ambientIntervalId = setInterval(() => {
        if (!this.currentAmbientId || this.ctx?.state === "closed") return;
        try {
          const osc = ctx.createOscillator();
          const pingGain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(2200 + Math.random() * 800, ctx.currentTime);
          pingGain.gain.setValueAtTime(0.012, ctx.currentTime);
          pingGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
          osc.connect(pingGain);
          pingGain.connect(masterGain);
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
        } catch {}
      }, 1800 + Math.random() * 1200);

    } else if (type === "quiet") {
      // Ultra-clean warm acoustic presence
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 280;

      noiseSource.connect(filter);
      filter.connect(masterGain);
      noiseSource.start();
      this.ambientSourceNodes.push(noiseSource);

    } else if (type === "retail") {
      // Store acoustic presence + light welcoming chime
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 950;
      filter.Q.value = 0.6;

      noiseSource.connect(filter);
      filter.connect(masterGain);
      noiseSource.start();
      this.ambientSourceNodes.push(noiseSource);

      // Pleasant soft chime
      this.ambientIntervalId = setInterval(() => {
        if (!this.currentAmbientId || this.ctx?.state === "closed") return;
        try {
          [523.25, 659.25].forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const chimeGain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.value = freq;
            const delay = idx * 0.1;
            chimeGain.gain.setValueAtTime(0.015, ctx.currentTime + delay);
            chimeGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + 0.4);
            osc.connect(chimeGain);
            chimeGain.connect(masterGain);
            osc.start(ctx.currentTime + delay);
            osc.stop(ctx.currentTime + delay + 0.45);
          });
        } catch {}
      }, 3400);
    }
  }

  /**
   * Smoothly update ambient volume in real-time
   */
  public setAmbientVolume(volumePercent: number): void {
    if (!this.ambientGainNode || !this.ctx) return;
    try {
      const normalizedVol = Math.max(0.001, Math.min(1.0, volumePercent / 100)) * 0.35;
      this.ambientGainNode.gain.setTargetAtTime(normalizedVol, this.ctx.currentTime, 0.05);
    } catch {}
  }

  /**
   * Stop ambient audio playback
   */
  public stopAmbient(): void {
    if (this.ambientIntervalId) {
      clearInterval(this.ambientIntervalId);
      this.ambientIntervalId = null;
    }
    this.ambientSourceNodes.forEach((node) => {
      try {
        if (typeof (node as any).stop === "function") {
          (node as any).stop();
        }
      } catch {}
    });
    this.ambientSourceNodes = [];

    if (this.ambientGainNode && this.ctx) {
      try {
        this.ambientGainNode.disconnect();
      } catch {}
      this.ambientGainNode = null;
    }
    this.currentAmbientId = null;
  }

  /**
   * Is an ambient sound currently active
   */
  public isAmbientActive(type?: AmbientSoundId): boolean {
    if (!this.currentAmbientId) return false;
    if (type) return this.currentAmbientId === type;
    return true;
  }

  /**
   * Play Voice Sample with optional Ambient Sound mixing
   */
  public playVoice(
    voiceId: string,
    text: string,
    ambientType: AmbientSoundId = "none",
    ambientVolume = 25,
    onStart?: () => void,
    onEnd?: () => void
  ): void {
    if (typeof window === "undefined") return;

    this.stopVoice();

    // Start background sound if selected
    if (ambientType && ambientType !== "none") {
      this.startAmbient(ambientType, ambientVolume);
      // Duck ambient slightly while voice is active so voice is loud and crisp
      if (this.ambientGainNode && this.ctx) {
        const ducked = Math.max(0.005, (ambientVolume / 100) * 0.22);
        this.ambientGainNode.gain.setValueAtTime(ducked, this.ctx.currentTime);
      }
    }

    const voice = ALL_VOICES.find((v) => v.id === voiceId) || ALL_VOICES[0];
    this.isSpeaking = true;
    onStart?.();

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voice.languageCode;
      utterance.pitch = voice.pitch;
      utterance.rate = voice.rate;

      // Pick best matching system voice if available
      const systemVoices = window.speechSynthesis.getVoices();
      const match = systemVoices.find(
        (sv) =>
          sv.lang === voice.languageCode ||
          sv.lang.startsWith(voice.languageCode.split("-")[0]) ||
          sv.name.toLowerCase().includes(voice.name.toLowerCase())
      );
      if (match) {
        utterance.voice = match;
      }

      utterance.onend = () => {
        this.isSpeaking = false;
        if (ambientType && ambientType !== "none") {
          this.setAmbientVolume(ambientVolume);
        }
        onEnd?.();
      };

      utterance.onerror = () => {
        this.isSpeaking = false;
        onEnd?.();
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback procedural voice chime preview
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(320 * voice.pitch, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.5);
      setTimeout(() => {
        this.isSpeaking = false;
        onEnd?.();
      }, 1500);
    }
  }

  /**
   * Stop voice playback
   */
  public stopVoice(): void {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
  }

  /**
   * Stop everything (ambient + voice)
   */
  public stopAll(): void {
    this.stopVoice();
    this.stopAmbient();
  }

  /**
   * Check if speech is currently active
   */
  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

// Global Singleton Audio Engine
export const audioEngine = new AudioEngine();
