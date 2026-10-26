import {
  AIEmployeeFullConfig,
  QualificationQuestionItem,
  ObjectionHandlerItem,
  FAQItem,
  PrimaryTaskType,
  CommunicationStyleType,
} from "./types/ai-employee-builder";

export interface SimplePromptInput {
  businessDescription: string;
  employeeRole: string;
  targetCustomers: string;
  language: string; // "te-IN" | "hi-IN" | "ta-IN" | "kn-IN" | "ml-IN" | "mr-IN" | "en-IN"
  goal: string;
  industryTemplateId?: string;
}

export interface IndustryTemplate {
  id: string;
  title: string;
  category: string;
  icon: string;
  businessDescription: string;
  employeeRole: string;
  targetCustomers: string;
  language: string;
  goal: string;
}

export const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  {
    id: "real-estate",
    title: "Real Estate & Open Plots",
    category: "Real Estate & Construction",
    icon: "🏡",
    businessDescription: "Sri Balaji Ventures provides HMDA and RERA approved open plots, villas, and commercial ventures with clear titles and 80% bank loans in Hyderabad & Vijayawada.",
    employeeRole: "Senior Real Estate & Plot Sales Caller",
    targetCustomers: "People who inquired online about land investment, villa plots, or building their dream home",
    language: "te-IN",
    goal: "Verify customer budget in Rupees (₹) and book a free weekend site visit with complimentary cab pickup",
  },
  {
    id: "clinic-healthcare",
    title: "Clinic & Hospital Appointments",
    category: "Healthcare & Wellness",
    icon: "🏥",
    businessDescription: "Sri Sai Dental & Multispeciality Clinic offers dental checkups, root canals, smile makeovers, and family healthcare with experienced doctors in Vijayawada.",
    employeeRole: "Patient Care & Appointment Receptionist",
    targetCustomers: "Patients seeking dental appointments, routine consultations, and treatment follow-ups",
    language: "te-IN",
    goal: "Confirm appointment date and time slot, give doctor consultation details, and send WhatsApp directions",
  },
  {
    id: "wholesale-retail",
    title: "Wholesale Trade & Retail Orders",
    category: "Retail, FMCG & Trade",
    icon: "📦",
    businessDescription: "Krishna Wholesale Textiles supplies premium cotton sarees, dhotis, and dress materials at wholesale factory rates to retail stores across Andhra and Telangana.",
    employeeRole: "Wholesale Trade & Order Dispatch Follow-up",
    targetCustomers: "Retail garment store owners and distributors ordering inventory",
    language: "te-IN",
    goal: "Confirm order quantities, check if stock delivery arrived, and collect feedback for fresh seasonal orders",
  },
  {
    id: "emi-payments",
    title: "Payment, Fee & EMI Reminders",
    category: "Finance & Accounts",
    icon: "💳",
    businessDescription: "Balaji Finance & Educational Society manages commercial vehicle loans, school fees, and retail monthly installment payments.",
    employeeRole: "Polite Payment & Account Reminder Caller",
    targetCustomers: "Account holders and parents whose monthly EMI or school installment is due this week",
    language: "te-IN",
    goal: "Give a gentle polite reminder in Telugu about the due amount in ₹ and offer an instant UPI payment link via WhatsApp",
  },
  {
    id: "education-coaching",
    title: "Coaching & College Admissions",
    category: "Education & Academy",
    icon: "🎓",
    businessDescription: "Prerana Academy provides premier IIT-JEE, NEET, and EAMCET long-term coaching with experienced faculty and top ranks across AP & Telangana.",
    employeeRole: "Student Admissions & Career Counselor",
    targetCustomers: "Parents and students inquiring about intermediate admissions and test prep batches",
    language: "te-IN",
    goal: "Explain batch start dates, scholarship test details, and schedule a personalized campus counseling visit",
  },
  {
    id: "restaurant-catering",
    title: "Restaurant & Event Catering",
    category: "Hospitality & Events",
    icon: "🍽️",
    businessDescription: "Swagath Grand Banquet & Authentic Telugu Caterers host weddings, birthday celebrations, and corporate dinners with traditional South Indian feasts.",
    employeeRole: "Event & Banquet Reservation Coordinator",
    targetCustomers: "Families and event organizers planning wedding receptions, parties, and functions",
    language: "te-IN",
    goal: "Check expected guest count, function dates, and invite them for a complimentary food tasting session",
  },
];

export interface GeneratedAIEmployeePackage {
  name: string;
  role: string;
  avatar: string;
  personality: string;
  conversationFlow: {
    stepNumber: number;
    title: string;
    description: string;
  }[];
  completeCallScript: string;
  greeting: string;
  customerQuestions: QualificationQuestionItem[];
  objectionHandlers: ObjectionHandlerItem[];
  faqs: FAQItem[];
  followUps: string[];
  closingStatement: string;
  fullConfig: AIEmployeeFullConfig;
}

/**
 * Intelligent Multi-Language AI Script Generator
 * Generates turn-by-turn conversational scripts, objections, FAQs, and closing statements
 * tailored to Telugu, Hindi, Tamil, Kannada, Malayalam, Marathi, or English.
 */
export function generateAIEmployeeScript(input: SimplePromptInput): GeneratedAIEmployeePackage {
  const lang = input.language || "te-IN";
  const role = input.employeeRole || "Telugu Business Caller";
  const business = input.businessDescription || "Local Business Services";
  const customers = input.targetCustomers || "Customers and Inquirers";
  const goal = input.goal || "Follow up on customer inquiries and confirm appointments";

  // Language-specific defaults
  if (lang.startsWith("te")) {
    return generateTeluguPackage(input);
  } else if (lang.startsWith("hi")) {
    return generateHindiPackage(input);
  } else if (lang.startsWith("ta")) {
    return generateTamilPackage(input);
  } else if (lang.startsWith("kn")) {
    return generateKannadaPackage(input);
  } else if (lang.startsWith("ml")) {
    return generateMalayalamPackage(input);
  } else if (lang.startsWith("mr")) {
    return generateMarathiPackage(input);
  } else {
    return generateEnglishPackage(input);
  }
}

// ---------------------------------------------------------------------------
// 1. TELUGU SCRIPT GENERATOR
// ---------------------------------------------------------------------------
function generateTeluguPackage(input: SimplePromptInput): GeneratedAIEmployeePackage {
  const name = "Ananya Rao (అనన్య)";
  const avatar = "AR";
  const role = input.employeeRole || "Telugu Business Caller";
  const goal = input.goal || "Follow up on customer inquiries and confirm appointments";
  const personality = "Warm, courteous, and polite Telugu speaking voice with natural pronunciation, respectful greetings ('నమస్కారం అండి'), and reassuring clarity.";

  const greeting = `నమస్కారం అండి! నేను ${input.businessDescription.split(".")[0].substring(0, 30)} నుంచి అనన్యను మాట్లాడుతున్నాను. మీరు మా సేవల గురించి వివరాలు తెలుసుకోవడానికి ఎంక్వైరీ చేశారు కదా, ఇప్పుడు మాట్లాడటానికి 2 నిమిషాలు సమయం ఉంటుందా అండి?`;

  const closingStatement = `చాలా ధన్యవాదాలు అండి! మీ విలువైన సమయాన్ని కేటాయించినందుకు సంతోషం. పూర్తి వివరాలు ఇప్పుడే మీ వాట్సాప్‌కు పంపిస్తున్నాను. ఏవైనా సందేహాలు ఉంటే మాకు ఎప్పుడైనా కాల్ చేయవచ్చు. నమస్కారం అండి, హావ్ ఎ గ్రేట్ డే!`;

  const conversationFlow = [
    {
      stepNumber: 1,
      title: "Warm Telugu Greeting & Identity Verification",
      description: "Greets the customer respectfully with 'నమస్కారం అండి', introduces company name, and politely confirms if it is a convenient time to speak.",
    },
    {
      stepNumber: 2,
      title: "Requirement & Budget Qualification",
      description: `Inquires gently about customer's primary requirement (${input.targetCustomers}) and budget in Rupees (₹).`,
    },
    {
      stepNumber: 3,
      title: "Highlighting Value & Key Benefits",
      description: `Explains primary benefits (${input.businessDescription}), approvals, transparent pricing in ₹, and special advantages.`,
    },
    {
      stepNumber: 4,
      title: "Objection Resolution & Pushback Handling",
      description: "Answers hesitations regarding pricing, timing, or requests to 'send on WhatsApp' without being pushy.",
    },
    {
      stepNumber: 5,
      title: "Direct Action & Appointment Confirmation",
      description: `Secures commitment for primary goal: ${input.goal}.`,
    },
    {
      stepNumber: 6,
      title: "Respectful Sign-off & Instant WhatsApp Summary",
      description: "Delivers closing statement and initiates automated WhatsApp confirmation brochure and calendar invite.",
    },
  ];

  const completeCallScript = `=== SIDE-MATE TELUGU CALL SCRIPT ===
Employee: ${name}
Role: ${input.employeeRole}
Goal: ${input.goal}

[AGENT]: నమస్కారం అండి! నేను ${input.businessDescription.split(".")[0].substring(0, 25)} నుంచి అనన్యను మాట్లాడుతున్నాను. మీరు మా సేవల గురించి ఎంక్వైరీ చేశారు కదా, మాట్లాడటానికి 2 నిమిషాలు సమయం ఉంటుందా అండి?
[CUSTOMER]: అవునండి, మాట్లాడండి. ఏంటి వివరాలు?
[AGENT]: సార్, మా దగ్గర అత్యుత్తమ సేవలు మరియు స్పష్టమైన వివరాలు అందుబాటులో ఉన్నాయి. మీరు ఏ రకమైన ఆప్షన్ చూస్తున్నారో చెబితే మీ బడ్జెట్‌కు తగిన సరైన సమాచారం ఇస్తాను సార్.
[CUSTOMER]: ధర ఎంతవరకు ఉంటుంది? వివరాలు వాట్సాప్‌లో పంపగలరా?
[AGENT]: తప్పకుండా సార్! ఇప్పుడే మీ నంబర్‌కు పూర్తి బ్రోచర్ మరియు ప్రైస్ లిస్ట్ వాట్సాప్‌లో పంపిస్తున్నాను. అలాగే మీకు అనుకూలమైన సమయంలో నేరుగా మాట్లాడటానికి లేదా విజిట్ చేయడానికి సమయం ఫిక్స్ చేయమంటారా?
[CUSTOMER]: సరే, వివరాలు చూసి చెబుతాను.
[AGENT]: చాలా సంతోషం సార్! శనివారం లేదా ఆదివారం మీకు కన్వీనియంట్ టైమ్ చెబితే మేము అపాయింట్‌మెంట్ కన్ఫర్మ్ చేస్తాము.
[CUSTOMER]: సరే, శనివారం ఉదయం 11 గంటలకు ఓకే.
[AGENT]: ధన్యవాదాలు సార్! శనివారం ఉదయం 11 గంటలకు మీ అపాయింట్‌మెంట్ బుక్ చేశాము. పూర్తి వివరాలు వాట్సాప్‌లో ఉన్నాయి. నమస్కారం అండి, హావ్ ఎ వండర్‌ఫుల్ డే!`;

  const customerQuestions: QualificationQuestionItem[] = [
    {
      id: "q-1",
      question: "సార్, మీరు చూస్తున్న నిర్దిష్ట అవసరం లేదా సైజు గురించి వివరంగా తెలుసుకోవచ్చా?",
      criteria: "Specific requirement clarified",
      required: true,
    },
    {
      id: "q-2",
      question: "మీరు సుమారు ఎంత బడ్జెట్ అనుకుంటున్నారు సార్? (రూపాయల్లో ₹)?",
      criteria: "Budget in Rupees range identified",
      required: true,
    },
    {
      id: "q-3",
      question: "ఈ వారం మీకు నేరుగా కలవడానికి లేదా మాట్లాడటానికి ఏ రోజు అనుకూలంగా ఉంటుంది సార్?",
      criteria: "Preferred day & time identified",
      required: false,
    },
  ];

  const objectionHandlers: ObjectionHandlerItem[] = [
    {
      id: "obj-1",
      objection: "రేటు లేదా ఖర్చు ఎక్కువ (Price is high)",
      response: "సార్, మార్కెట్‌తో పోలిస్తే మా దగ్గర 100% పారదర్శకత, ఉత్తమ నాణ్యత మరియు బ్యాంక్ లోన్ లేదా సులభ EMI సదుపాయాలు ఉన్నాయి. ప్రతి రూపాయికి పూర్తి విలువ లభిస్తుంది సార్.",
    },
    {
      id: "obj-2",
      objection: "వాట్సాప్‌లో వివరాలు పంపండి (Send details on WhatsApp)",
      response: "ఖచ్చితంగా సార్! ఇప్పుడే మీ నంబర్‌కు పూర్తి బ్రోచర్ మరియు వివరాలు వాట్సాప్‌లో పంపిస్తున్నాను. రేపు సాయంత్రం ఒకసారి కాల్ చేసి మీ అభిప్రాయం తెలుసుకోవచ్చా సార్?",
    },
    {
      id: "obj-3",
      objection: "తర్వాత ఆలోచించి చెబుతాను (Will decide later)",
      response: "తప్పకుండా సార్, ఆలోచించుకోండి. అయితే ఈ వారంలో ప్రత్యేక ఆఫర్ అందుబాటులో ఉంది, అందుకే మీకు ఉపయోగపడుతుందని తెలియజేస్తున్నాను సార్.",
    },
  ];

  const faqs: FAQItem[] = [
    {
      id: "faq-1",
      question: "మీ ఆఫీస్ లేదా లొకేషన్ ఎక్కడ ఉంది?",
      answer: "మా ముఖ్య కార్యాలయం హైదరాబాద్ మరియు విజయవాడలో ఉంది సార్. గూగుల్ మ్యాప్స్ లొకేషన్ లింక్ మీ వాట్సాప్‌కు వెంటనే షేర్ చేస్తాము.",
    },
    {
      id: "faq-2",
      question: "పేమెంట్ విధానం ఎలా ఉంటుంది? UPI లేదా కార్డ్స్ ఉన్నాయా?",
      answer: "అవునండి! UPI (Google Pay, PhonePe), నెట్‌బ్యాంకింగ్, మరియు అన్ని రకాల డెబిట్/క్రెడిట్ కార్డులు అంగీకరిస్తాము. GST బిల్లు కూడా లభిస్తుంది.",
    },
  ];

  const followUps = [
    "Send automated WhatsApp brochure with pricing details in Rupees (₹)",
    "Sync meeting or visit slot to Google Calendar",
    "Send reminder SMS 2 hours prior to scheduled appointment",
    "Notify business manager on high-intent customer responses",
  ];

  const fullConfig: AIEmployeeFullConfig = {
    name,
    role,
    avatar,
    businessName: input.businessDescription.split(".")[0].substring(0, 40),
    businessDescription: input.businessDescription,
    primaryTask: "sales_calls",
    communicationStyle: "friendly",
    language: "te-IN",
    tone: personality,
    systemInstructions: `You are ${name}, a polite AI calling specialist for ${input.businessDescription}. Always greet with "నమస్కారం అండి". Goal: ${goal}. Keep the tone respectful and conversational in natural Telugu. Deal sizes in Rupees (₹).`,
    knowledgeSources: [
      {
        id: "src-1",
        title: "Business Offerings & Highlights",
        type: "text",
        content: input.businessDescription,
      },
    ],
    faqs,
    greeting,
    conversationGoals: [
      "Greet politely in natural Telugu",
      "Qualify requirements and budget in ₹",
      `Achieve target goal: ${goal}`,
    ],
    qualificationQuestions: customerQuestions,
    objectionHandlers,
    businessHours: {
      timezone: "Asia/Kolkata",
      startTime: "09:30",
      endTime: "18:30",
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    },
    escalation: {
      escalationPhone: "+91 98480 12345",
      escalationEmail: "support@sidemate.in",
      triggers: ["human", "manager", "manager garu", "person", "కాల్ ట్రాన్స్‌ఫర్"],
      handoffMessage: "ఖచ్చితంగా అండి, మా సీనియర్ మేనేజర్ గారికి కాల్ ఇప్పుడే కనెక్ట్ చేస్తున్నాను. ఒక్క క్షణం లైన్‌లో ఉండండి సార్.",
    },
    telephony: {
      voiceId: "ananya",
      speed: 1.0,
      pitch: 1.0,
      ambientNoise: "office",
      callerId: "+91 98480 12345",
      maxDurationMinutes: 15,
    },
    status: "Live",
  };

  return {
    name,
    role,
    avatar,
    personality,
    conversationFlow,
    completeCallScript,
    greeting,
    customerQuestions,
    objectionHandlers,
    faqs,
    followUps,
    closingStatement,
    fullConfig,
  };
}

// ---------------------------------------------------------------------------
// 2. HINDI SCRIPT GENERATOR
// ---------------------------------------------------------------------------
function generateHindiPackage(input: SimplePromptInput): GeneratedAIEmployeePackage {
  const name = "Aarav Sharma (आरव)";
  const avatar = "AS";
  const role = input.employeeRole || "Hindi Business Caller";
  const goal = input.goal || "Follow up on customer inquiries and confirm appointments";
  const personality = "Polite, articulate, and respectful Hindi calling voice. Speaks with natural flow, clear clarity, and pleasant customer manners.";

  const greeting = `नमस्ते जी! मैं ${input.businessDescription.split(".")[0].substring(0, 30)} से आरव बात कर रहा हूँ। आपने हमारी सेवाओं के बारे में इन्क्वायरी की थी, क्या अभी दो मिनट बात हो सकती है?`;

  const closingStatement = `बहुत-बहुत धन्यवाद आपका! आपकी सुविधा के लिए सारी जानकारी अभी आपके व्हाट्सएप पर भेज दी गई है। कोई भी सवाल हो तो आप हमें कभी भी संपर्क कर सकते हैं। आपका दिन शुभ हो!`;

  const conversationFlow = [
    {
      stepNumber: 1,
      title: "Namaste & Professional Identity",
      description: "Warm Hindi greeting with company introduction and timing confirmation.",
    },
    {
      stepNumber: 2,
      title: "Customer Requirement & Budget in ₹",
      description: "Understands specific needs and price expectations.",
    },
    {
      stepNumber: 3,
      title: "Value Proposition & Offer Details",
      description: "Highlights key features, quality assurance, and pricing in Rupees.",
    },
    {
      stepNumber: 4,
      title: "Handling Objections with Respect",
      description: "Answers concerns regarding price, timing, or WhatsApp catalog requests.",
    },
    {
      stepNumber: 5,
      title: "Booking & Next Step Commitment",
      description: `Confirms target goal: ${input.goal}.`,
    },
    {
      stepNumber: 6,
      title: "Polite Sign-Off & Instant Follow-Up",
      description: "Sends automated WhatsApp confirmation and calendar reminder.",
    },
  ];

  const completeCallScript = `=== SIDE-MATE HINDI CALL SCRIPT ===
Agent: ${name}
Role: ${input.employeeRole}

[AGENT]: नमस्ते जी! मैं ${input.businessDescription.split(".")[0].substring(0, 25)} से आरव बात कर रहा हूँ। क्या अभी दो मिनट बात हो सकती है?
[CUSTOMER]: हाँ जी, बताइए।
[AGENT]: जी, आपने हमारी सेवाओं के लिए इन्क्वायरी की थी। मैं आपकी ज़रूरत के हिसाब से सबसे बेहतरीन ऑप्शन बता सकता हूँ। आपकी मुख्य आवश्यकता क्या है?
[CUSTOMER]: क्या आप व्हाट्सएप पर डिटेल्स भेज सकते हैं?
[AGENT]: बिल्कुल जी! मैं तुरंत आपके नंबर पर पूरी जानकारी और रेट लिस्ट व्हाट्सएप कर रहा हूँ। क्या कल या वीकेंड पर 10 मिनट की मीटिंग या विज़िट प्लान कर सकते हैं?
[CUSTOMER]: हाँ, शनिवार को बात करते हैं।
[AGENT]: बहुत-बहुत धन्यवाद जी! शनिवार के लिए हमने नोट कर लिया है। आपका दिन शुभ हो!`;

  const customerQuestions: QualificationQuestionItem[] = [
    {
      id: "q-1",
      question: "सर, आप किस तरह की सेवा या उत्पाद में विशेष रुचि रखते हैं?",
      criteria: "Requirement identified",
      required: true,
    },
    {
      id: "q-2",
      question: "आपका अनुमानित बजट कितना है (रुपयों में ₹)?",
      criteria: "Budget in ₹ identified",
      required: true,
    },
    {
      id: "q-3",
      question: "क्या इस वीकेंड पर विज़िट या कॉल का समय निर्धारित कर सकते हैं?",
      criteria: "Appointment scheduled",
      required: false,
    },
  ];

  const objectionHandlers: ObjectionHandlerItem[] = [
    {
      id: "obj-1",
      objection: "कीमत ज़्यादा है (Price is high)",
      response: "सर, हमारे यहाँ आपको 100% क्वालिटी गारंटी और आसान किस्तों की सुविधा मिलती है। एक-एक पैसे की पूरी वैल्यू आपको मिलेगी।",
    },
    {
      id: "obj-2",
      objection: "व्हाट्सएप पर भेजें (Send on WhatsApp)",
      response: "जी बिल्कुल, अभी आपके नंबर पर पीडीएफ और डिटेल्स भेजी जा रही हैं। कल शाम को इस पर चर्चा कर सकते हैं सर?",
    },
  ];

  const faqs: FAQItem[] = [
    {
      id: "faq-1",
      question: "पेमेंट के क्या विकल्प उपलब्ध हैं?",
      answer: "जी, UPI (PhonePe, GPay, Paytm), नेट बैंकिंग और क्रेडिट/डेबिट कार्ड्स उपलब्ध हैं। पक्का जीएसटी बिल भी मिलता है।",
    },
  ];

  const followUps = [
    "WhatsApp brochure and pricing sheet",
    "Calendar invite with reminders",
    "SMS confirmation",
  ];

  const fullConfig: AIEmployeeFullConfig = {
    name,
    role: input.employeeRole,
    avatar,
    businessName: input.businessDescription.split(".")[0].substring(0, 40),
    businessDescription: input.businessDescription,
    primaryTask: "sales_calls",
    communicationStyle: "professional",
    language: "hi-IN",
    tone: personality,
    systemInstructions: `You are ${name}, speaking fluent Hindi for ${input.businessDescription}. Greet with "नमस्ते". Goal: ${input.goal}.`,
    knowledgeSources: [],
    faqs,
    greeting,
    conversationGoals: ["Greet politely in Hindi", `Achieve goal: ${input.goal}`],
    qualificationQuestions: customerQuestions,
    objectionHandlers,
    businessHours: {
      timezone: "Asia/Kolkata",
      startTime: "09:30",
      endTime: "18:30",
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    },
    escalation: {
      escalationPhone: "+91 98480 12345",
      escalationEmail: "support@sidemate.in",
      triggers: ["human", "manager", "senior", "person"],
      handoffMessage: "जी बिल्कुल, मैं आपकी बात हमारे सीनियर मैनेजर से करवा रहा हूँ। कृपया एक मिनट लाइन पर रहिए।",
    },
    telephony: {
      voiceId: "aarav",
      speed: 1.0,
      pitch: 1.0,
      ambientNoise: "office",
      callerId: "+91 98480 12345",
      maxDurationMinutes: 15,
    },
    status: "Live",
  };

  return {
    name,
    role: input.employeeRole,
    avatar,
    personality,
    conversationFlow,
    completeCallScript,
    greeting,
    customerQuestions,
    objectionHandlers,
    faqs,
    followUps,
    closingStatement,
    fullConfig,
  };
}

// ---------------------------------------------------------------------------
// 3. TAMIL SCRIPT GENERATOR
// ---------------------------------------------------------------------------
function generateTamilPackage(input: SimplePromptInput): GeneratedAIEmployeePackage {
  const name = "Murugan (முருகன்)";
  const avatar = "MU";
  const personality = "Articulate, polite, and respectful Tamil speaking tone with clear business clarity.";
  const greeting = `வணக்கம்! நான் ${input.businessDescription.split(".")[0].substring(0, 25)} சார்பாக முருகன் பேசுகிறேன். நீங்கள் எங்கள் சேவைகள் பற்றி தகவல் கேட்டிருந்தீர்கள், இப்போது பேச 2 நிமிடம் நேரம் கிடைக்குமா?`;
  const closingStatement = `மிக்க நன்றி! அனைத்து விவரங்களும் உங்கள் வாட்ஸ்அப் எண்ணுக்கு அனுப்பப்பட்டுள்ளது. வணக்கம், நல்ல நாளாக அமையட்டும்!`;

  return buildGenericPackage(name, avatar, "ta-IN", personality, greeting, closingStatement, input, "murugan");
}

// ---------------------------------------------------------------------------
// 4. KANNADA SCRIPT GENERATOR
// ---------------------------------------------------------------------------
function generateKannadaPackage(input: SimplePromptInput): GeneratedAIEmployeePackage {
  const name = "Chethan (ಚೇತನ್)";
  const avatar = "CH";
  const personality = "Polite, sweet, and resonant Kannada speaking voice with warm regional courtesy.";
  const greeting = `ನಮಸ್ಕಾರ! ನಾನು ${input.businessDescription.split(".")[0].substring(0, 25)} ಇಂದ ಚೇತನ್ ಮಾತನಾಡುತ್ತಿದ್ದೇನೆ. ನಮ್ಮ ಸೇವೆಗಳ ಕುರಿತು ವಿಚಾರಿಸಲು ಈಗ 2 ನಿಮಿಷ ಸಮಯವಿದೆಯೇ?`;
  const closingStatement = `ತುಂಬಾ ಧನ್ಯವಾದಗಳು! ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ನಿಮ್ಮ ವಾಟ್ಸಾಪ್‌ಗೆ ಕಳುಹಿಸಲಾಗಿದೆ. ನಮಸ್ಕಾರ, ಹ್ಯಾವ್ ಎ ಗ್ರೇಟ್ ಡೇ!`;

  return buildGenericPackage(name, avatar, "kn-IN", personality, greeting, closingStatement, input, "chethan");
}

// ---------------------------------------------------------------------------
// 5. MALAYALAM SCRIPT GENERATOR
// ---------------------------------------------------------------------------
function generateMalayalamPackage(input: SimplePromptInput): GeneratedAIEmployeePackage {
  const name = "Rahul (രാഹുൽ)";
  const avatar = "RA";
  const personality = "Gentle, respectful Malayalam tone with natural conversational cadence.";
  const greeting = `നമസ്കാരം! ഞാൻ ${input.businessDescription.split(".")[0].substring(0, 25)} ൽ നിന്നും രാഹുൽ സംസാരിക്കുന്നു. ഞങ്ങളുടെ സേവനങ്ങളെക്കുറിച്ച് സംസാരിക്കാൻ 2 മിനിറ്റ് സമയമുണ്ടോ?`;
  const closingStatement = `വളരെ നന്ദി! കൂടുതൽ വിവരങ്ങൾ നിങ്ങളുടെ വാട്ട്സാപ്പിൽ അയച്ചിട്ടുണ്ട്. നമസ്കാരം!`;

  return buildGenericPackage(name, avatar, "ml-IN", personality, greeting, closingStatement, input, "rahul");
}

// ---------------------------------------------------------------------------
// 6. MARATHI SCRIPT GENERATOR
// ---------------------------------------------------------------------------
function generateMarathiPackage(input: SimplePromptInput): GeneratedAIEmployeePackage {
  const name = "Rohan (रोहन)";
  const avatar = "RO";
  const personality = "Crisp, polite Marathi voice with clean pronunciation and welcoming cadence.";
  const greeting = `नमस्कार! मी ${input.businessDescription.split(".")[0].substring(0, 25)} कडून रोहन बोलत आहे. आमच्या सेवेबद्दल माहिती देण्यासाठी 2 मिनिटे वेळ मिळेल का?`;
  const closingStatement = `खूप खूप धन्यवाद! सर्व तपशील आपल्या व्हॉट्सअॅपवर पाठवले आहेत. नमस्कार, आपला दिवस चांगला जावो!`;

  return buildGenericPackage(name, avatar, "mr-IN", personality, greeting, closingStatement, input, "rohan");
}

// ---------------------------------------------------------------------------
// 7. ENGLISH (INDIAN) SCRIPT GENERATOR
// ---------------------------------------------------------------------------
function generateEnglishPackage(input: SimplePromptInput): GeneratedAIEmployeePackage {
  const name = "Vikram";
  const avatar = "VI";
  const personality = "Warm, articulate pan-Indian English voice with consultative executive tone.";
  const greeting = `Hello! This is Vikram calling from ${input.businessDescription.split(".")[0].substring(0, 30)}. You recently inquired about our services. Do you have two quick minutes to speak?`;
  const closingStatement = `Thank you so much for your time today! I have sent the full brochure and pricing details directly to your WhatsApp. Have a wonderful day ahead!`;

  return buildGenericPackage(name, avatar, "en-IN", personality, greeting, closingStatement, input, "vikram");
}

function buildGenericPackage(
  name: string,
  avatar: string,
  lang: string,
  personality: string,
  greeting: string,
  closingStatement: string,
  input: SimplePromptInput,
  voiceId: string
): GeneratedAIEmployeePackage {
  const role = input.employeeRole || "AI Calling Specialist";
  const goal = input.goal || "Follow up on customer inquiries and confirm appointments";
  const conversationFlow = [
    { stepNumber: 1, title: "Greeting & Introductions", description: "Polite opening and checking availability." },
    { stepNumber: 2, title: "Customer Requirement", description: `Understanding need for ${input.targetCustomers}.` },
    { stepNumber: 3, title: "Value Proposition", description: `Presenting ${input.businessDescription}.` },
    { stepNumber: 4, title: "Objection Resolution", description: "Answering budget and timing pushbacks." },
    { stepNumber: 5, title: "Target Action", description: `Achieving goal: ${input.goal}.` },
    { stepNumber: 6, title: "Polite Farewell", description: "Closing statement and WhatsApp follow-up." },
  ];

  const completeCallScript = `=== CALL SCRIPT (${name}) ===
[AGENT]: ${greeting}
[CUSTOMER]: Yes, please share details.
[AGENT]: We provide high-quality services tailored to your budget. Are you looking for immediate assistance or comparing options?
[CUSTOMER]: Please send full details on WhatsApp first.
[AGENT]: Absolutely! I am sending the complete brochure and pricing directly to your number right now. Can we schedule a quick 10-minute follow-up or visit?
[CUSTOMER]: Yes, weekend works.
[AGENT]: ${closingStatement}`;

  const customerQuestions: QualificationQuestionItem[] = [
    { id: "q-1", question: "What is your primary requirement or priority?", criteria: "Requirement specified", required: true },
    { id: "q-2", question: "What is your planned budget in Rupees (₹)?", criteria: "Budget clarified", required: true },
    { id: "q-3", question: "Which day would you prefer for our follow-up or visit?", criteria: "Timeline confirmed", required: false },
  ];

  const objectionHandlers: ObjectionHandlerItem[] = [
    { id: "obj-1", objection: "Pricing seems higher than market", response: "We offer 100% verified quality, clear guarantees, and flexible payment plans in Rupees (₹)." },
    { id: "obj-2", objection: "Send everything on WhatsApp first", response: "Certainly! Sending the brochure and pricing to your WhatsApp now. Can I follow up tomorrow evening?" },
  ];

  const faqs: FAQItem[] = [
    { id: "faq-1", question: "What are your payment modes?", answer: "We accept UPI (GPay, PhonePe), NetBanking, Credit/Debit cards, and provide official GST invoices." },
  ];

  const followUps = [
    "Send automated WhatsApp brochure",
    "Sync meeting to Google Calendar",
    "SMS confirmation with directions",
  ];

  const fullConfig: AIEmployeeFullConfig = {
    name,
    role: input.employeeRole,
    avatar,
    businessName: input.businessDescription.split(".")[0].substring(0, 40),
    businessDescription: input.businessDescription,
    primaryTask: "sales_calls",
    communicationStyle: "professional",
    language: lang,
    tone: personality,
    systemInstructions: `You are ${name}, a professional calling agent for ${input.businessDescription}. Goal: ${input.goal}.`,
    knowledgeSources: [],
    faqs,
    greeting,
    conversationGoals: ["Greet politely", `Achieve goal: ${input.goal}`],
    qualificationQuestions: customerQuestions,
    objectionHandlers,
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
      handoffMessage: "Certainly, transferring you to our senior manager right now.",
    },
    telephony: {
      voiceId,
      speed: 1.0,
      pitch: 1.0,
      ambientNoise: "office",
      callerId: "+91 98480 12345",
      maxDurationMinutes: 15,
    },
    status: "Live",
  };

  return {
    name,
    role: input.employeeRole,
    avatar,
    personality,
    conversationFlow,
    completeCallScript,
    greeting,
    customerQuestions,
    objectionHandlers,
    faqs,
    followUps,
    closingStatement,
    fullConfig,
  };
}
