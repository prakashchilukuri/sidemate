import { z } from "zod";

// -------------------------------------------------------------
// Authentication Schemas
// -------------------------------------------------------------
export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const SignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  organizationName: z.string().min(2, "Company name must be at least 2 characters"),
});

// -------------------------------------------------------------
// AI Employee Builder Schemas (Multi-Step Workflow)
// -------------------------------------------------------------
export const KnowledgeSourceSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Source title is required"),
  type: z.enum(["text", "url", "document"]),
  content: z.string().min(5, "Source content must be at least 5 characters"),
});

export const FAQSchema = z.object({
  id: z.string(),
  question: z.string().min(3, "FAQ question must be at least 3 characters"),
  answer: z.string().min(3, "FAQ answer must be at least 3 characters"),
});

export const QualificationQuestionSchema = z.object({
  id: z.string(),
  question: z.string().min(5, "Question must be at least 5 characters"),
  criteria: z.string().min(2, "Qualification criteria required"),
  required: z.boolean().default(true),
});

export const ObjectionHandlerSchema = z.object({
  id: z.string(),
  objection: z.string().min(3, "Objection description required"),
  response: z.string().min(5, "Counter-response required"),
});

export const BusinessHoursSchema = z.object({
  timezone: z.string().min(2, "Operating timezone is required"),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Start time must be in HH:MM format"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "End time must be in HH:MM format"),
  days: z.array(z.string()).min(1, "Select at least one operating day"),
});

export const EscalationSchema = z.object({
  escalationPhone: z.string().min(7, "Valid escalation telephone number required"),
  escalationEmail: z.string().email("Valid escalation email address required"),
  triggers: z.array(z.string()).min(1, "Specify at least one escalation trigger"),
  handoffMessage: z.string().min(5, "Handoff message must be at least 5 characters"),
});

export const TelephonySchema = z.object({
  voiceId: z.string().min(1, "Voice selection is required"),
  speed: z.number().min(0.5).max(2.0).default(1.0),
  pitch: z.number().min(0.5).max(2.0).default(1.0),
  ambientNoise: z.enum(["none", "office", "callcenter", "cafe", "quiet", "retail"]).default("none"),
  callerId: z.string().min(5, "Caller ID or phone number required"),
  maxDurationMinutes: z.number().int().min(1).max(60).default(15),
  calendarUrl: z.string().url("Must be a valid calendar booking URL").optional().or(z.literal("")),
});

// Step-by-Step Validation Schemas
export const BuilderStep1Schema = z.object({
  name: z.string().min(2, "Employee name must be at least 2 characters"),
  role: z.string().min(2, "Role title must be at least 2 characters"),
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  businessDescription: z.string().min(10, "Business description must be at least 10 characters"),
});

export const BuilderStep2Schema = z.object({
  primaryTask: z.enum([
    "lead_qualification",
    "sales_calls",
    "customer_support",
    "appointment_booking",
    "follow_up",
  ], { message: "Please select a primary task" }),
  communicationStyle: z.enum([
    "consultative",
    "friendly",
    "professional",
    "authoritative",
    "empathetic",
  ], { message: "Please select a communication style" }),
  language: z.string().min(2, "Language selection is required"),
  tone: z.string().min(2, "Voice tone is required"),
});

export const BuilderStep3Schema = z.object({
  systemInstructions: z.string().min(15, "Instructions must be at least 15 characters"),
  knowledgeSources: z.array(KnowledgeSourceSchema).default([]),
  faqs: z.array(FAQSchema).default([]),
});

export const BuilderStep4Schema = z.object({
  greeting: z.string().min(5, "Greeting message must be at least 5 characters"),
  conversationGoals: z.array(z.string().min(2)).min(1, "Provide at least one conversation goal"),
  qualificationQuestions: z.array(QualificationQuestionSchema).default([]),
  objectionHandlers: z.array(ObjectionHandlerSchema).default([]),
});

export const BuilderStep5Schema = z.object({
  businessHours: BusinessHoursSchema,
  escalation: EscalationSchema,
});

export const BuilderStep6Schema = z.object({
  telephony: TelephonySchema,
});

// Full AI Employee Composite Schema
export const FullAIEmployeeBuilderSchema = z.object({
  name: z.string().min(2, "Employee name must be at least 2 characters"),
  role: z.string().min(2, "Role title must be at least 2 characters"),
  avatar: z.string().optional(),
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  businessDescription: z.string().min(10, "Business description must be at least 10 characters"),
  primaryTask: z.enum([
    "lead_qualification",
    "sales_calls",
    "customer_support",
    "appointment_booking",
    "follow_up",
  ]),
  communicationStyle: z.enum([
    "consultative",
    "friendly",
    "professional",
    "authoritative",
    "empathetic",
  ]),
  language: z.string().min(2),
  tone: z.string().min(2),
  systemInstructions: z.string().min(10, "Instructions must be at least 10 characters"),
  knowledgeSources: z.array(KnowledgeSourceSchema).default([]),
  faqs: z.array(FAQSchema).default([]),
  greeting: z.string().min(3, "Greeting message must be at least 3 characters"),
  conversationGoals: z.array(z.string()).min(1, "At least one goal is required"),
  qualificationQuestions: z.array(QualificationQuestionSchema).default([]),
  objectionHandlers: z.array(ObjectionHandlerSchema).default([]),
  businessHours: BusinessHoursSchema,
  escalation: EscalationSchema,
  telephony: TelephonySchema,
  status: z.string().default("Live"),
});

// Standard API Schemas
export const CreateAIEmployeeSchema = z.object({
  name: z.string().min(2, "Employee name is required"),
  role: z.string().min(2, "Role is required"),
  voiceId: z.string().default("nova"),
  language: z.string().default("en-US"),
  tone: z.string().default("Confident & Consultative"),
  systemPrompt: z.string().min(5, "System prompt instructions are required"),
  objectionPrompt: z.string().optional(),
  firstMessage: z.string().optional(),
  status: z.string().default("Live"),
  calendarUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  config: FullAIEmployeeBuilderSchema.optional(),
});

export const UpdateAIEmployeeSchema = CreateAIEmployeeSchema.partial().extend({
  config: FullAIEmployeeBuilderSchema.partial().optional(),
  status: z.string().optional(),
});

// -------------------------------------------------------------
// Lead Schemas
// -------------------------------------------------------------
export const CreateLeadSchema = z.object({
  name: z.string().min(2, "Lead name is required"),
  company: z.string().optional(),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(7, "Valid phone number required"),
  status: z
    .enum([
      "NEW",
      "IN_PROGRESS",
      "QUALIFIED",
      "MEETING_BOOKED",
      "DISQUALIFIED",
      "New",
      "In Progress",
      "Qualified",
      "Meeting Booked",
      "Disqualified",
    ])
    .default("NEW"),
  dealSize: z.string().optional(),
  assignedAgentId: z.string().optional(),
  assignedAgent: z.string().optional(),
});

export const UpdateLeadSchema = CreateLeadSchema.partial();

// -------------------------------------------------------------
// Campaign Schemas
// -------------------------------------------------------------
export const CreateCampaignSchema = z.object({
  name: z.string().min(3, "Campaign name is required"),
  assignedAgentId: z.string().min(1, "Assigned AI employee is required"),
  leadsTargeted: z.number().int().positive().default(250),
  dialWindowStart: z.string().default("09:00"),
  dialWindowEnd: z.string().default("17:30"),
  dialTimezone: z.string().default("EST"),
  maxDailyDials: z.number().int().positive().default(250),
  retryAttempts: z.number().int().min(1).max(5).default(3),
});

export const UpdateCampaignSchema = z.object({
  name: z.string().min(3).optional(),
  status: z.enum(["DRAFT", "RUNNING", "PAUSED", "COMPLETED", "ARCHIVED"]).optional(),
  assignedAgentId: z.string().optional(),
});

// -------------------------------------------------------------
// Call Trigger Schema
// -------------------------------------------------------------
export const TriggerCallSchema = z.object({
  leadId: z.string().optional(),
  leadName: z.string().optional(),
  company: z.string().optional(),
  agentId: z.string().min(1, "AI employee ID is required"),
  campaignId: z.string().optional(),
  phoneNumber: z.string().optional(),
});

// -------------------------------------------------------------
// Appointment Schema
// -------------------------------------------------------------
export const CreateAppointmentSchema = z.object({
  leadId: z.string().min(1, "Lead ID is required"),
  agentId: z.string().min(1, "AI employee ID is required"),
  title: z.string().min(3, "Meeting title required"),
  scheduledAt: z.string().datetime("Must be valid ISO date-time"),
  durationMinutes: z.number().int().default(30),
  meetingUrl: z.string().url().optional().or(z.literal("")),
});

// -------------------------------------------------------------
// Webhook & Integration Schemas
// -------------------------------------------------------------
export const CreateWebhookSchema = z.object({
  name: z.string().min(2, "Webhook name is required"),
  url: z.string().url("Valid HTTPS endpoint required"),
  events: z.array(z.string()).min(1, "At least one event topic required"),
});

// -------------------------------------------------------------
// Topup Schema
// -------------------------------------------------------------
export const TopupCreditsSchema = z.object({
  amountDollars: z.number().positive(),
  minutesGranted: z.number().int().positive(),
});

// -------------------------------------------------------------
// Settings Schema
// -------------------------------------------------------------
export const UpdateOrganizationSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  timezone: z.string().optional(),
  callerId: z.string().optional(),
});
