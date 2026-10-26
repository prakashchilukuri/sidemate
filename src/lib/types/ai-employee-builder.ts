export type PrimaryTaskType =
  | "lead_qualification"
  | "sales_calls"
  | "customer_support"
  | "appointment_booking"
  | "follow_up";

export type CommunicationStyleType =
  | "consultative"
  | "friendly"
  | "professional"
  | "authoritative"
  | "empathetic";

export type AmbientNoiseType = "none" | "office" | "callcenter" | "quiet";

export type AgentStatusType = "Live" | "Active" | "Draft" | "Building" | "Ready" | "Paused" | "Training";

export interface KnowledgeSourceItem {
  id: string;
  title: string;
  type: "text" | "url" | "document";
  content: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface QualificationQuestionItem {
  id: string;
  question: string;
  criteria: string;
  required: boolean;
}

export interface ObjectionHandlerItem {
  id: string;
  objection: string;
  response: string;
}

export interface BusinessHoursConfig {
  timezone: string;
  startTime: string; // e.g., "09:00"
  endTime: string;   // e.g., "17:30"
  days: string[];    // e.g., ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
}

export interface EscalationConfig {
  escalationPhone: string;
  escalationEmail: string;
  triggers: string[];
  handoffMessage: string;
}

export interface TelephonyConfig {
  voiceId: string;
  speed: number;       // 0.8 to 1.2
  pitch: number;       // 0.8 to 1.2
  ambientNoise: AmbientNoiseType;
  callerId: string;
  maxDurationMinutes: number;
  calendarUrl?: string;
}

export interface AIEmployeeFullConfig {
  id?: string;
  // 1. Employee Identity
  name: string;
  role: string;
  avatar?: string;

  // 2. Business Profile
  businessName: string;
  businessDescription: string;

  // 3. Primary Task
  primaryTask: PrimaryTaskType;

  // 4. Communication Style & Language
  communicationStyle: CommunicationStyleType;
  language: string;
  tone: string;

  // 5. Instructions, Knowledge & FAQs
  systemInstructions: string;
  knowledgeSources: KnowledgeSourceItem[];
  faqs: FAQItem[];

  // 6. Greeting, Goals & Qualifications
  greeting: string;
  conversationGoals: string[];
  qualificationQuestions: QualificationQuestionItem[];
  objectionHandlers: ObjectionHandlerItem[];

  // 7. Business Hours & Escalation
  businessHours: BusinessHoursConfig;
  escalation: EscalationConfig;

  // 8. Voice & Telephony
  telephony: TelephonyConfig;

  // Status & Metadata
  status: AgentStatusType;
  totalCalls?: number;
  successRate?: string;
  avgDuration?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SimulatedMessage {
  id: string;
  sender: "agent" | "user" | "system";
  text: string;
  timestamp: string;
  qualificationMet?: string;
}
