import { NextRequest } from "next/server";
import { getTenantContext, apiError, apiSuccess } from "@/lib/tenant";
import { generateSimulationResponse } from "@/lib/simulation-engine";
import { AIEmployeeFullConfig, SimulatedMessage } from "@/lib/types/ai-employee-builder";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const tenant = await getTenantContext(req);
    const body = await req.json();

    const { employeeId, message, history = [], config: incomingConfig } = body;

    if (!message || typeof message !== "string") {
      return apiError("A user message is required to run simulation", 400);
    }

    let config: AIEmployeeFullConfig | undefined = incomingConfig;

    if (!config && employeeId) {
      const emp = await db.aiEmployees.get(tenant.organizationId, employeeId);
      if (emp?.config) {
        config = emp.config;
      } else if (emp) {
        // Synthesize minimal config
        config = {
          name: emp.name,
          role: emp.role,
          businessName: "Acme Growth Corp",
          businessDescription: "AI Employee SaaS platform",
          primaryTask: "lead_qualification",
          communicationStyle: "consultative",
          language: emp.language || "en-US",
          tone: "Confident & Consultative",
          systemInstructions: emp.objective,
          knowledgeSources: [],
          faqs: [],
          greeting: `Hello, this is ${emp.name} calling from Acme Growth Corp.`,
          conversationGoals: ["Introduce company", "Qualify requirements", "Book demo"],
          qualificationQuestions: [
            { id: "q1", question: "What is your current team size?", criteria: "10+ members", required: true },
            { id: "q2", question: "What timeline are you looking at?", criteria: "Within 60 days", required: true },
          ],
          objectionHandlers: [
            { id: "o1", objection: "already have a solution", response: "That's great! What platform are you using, and how is latency treating you?" },
          ],
          businessHours: {
            timezone: "America/New_York",
            startTime: "09:00",
            endTime: "17:30",
            days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          },
          escalation: {
            escalationPhone: "+1 (555) 019-2834",
            escalationEmail: "support@acmegrowth.com",
            triggers: ["human", "person", "representative"],
            handoffMessage: "Connecting you to our team specialist immediately.",
          },
          telephony: {
            voiceId: emp.voice || "nova",
            speed: 1.0,
            pitch: 1.0,
            ambientNoise: "office",
            callerId: "+1 (555) 392-1084",
            maxDurationMinutes: 15,
            calendarUrl: "https://calendly.com/acme-growth/discovery-30min",
          },
          status: "Active",
        };
      }
    }

    if (!config) {
      return apiError("Missing AI employee configuration for simulation", 400);
    }

    const simResult = generateSimulationResponse(config, message, history as SimulatedMessage[]);

    return apiSuccess({
      ...simResult,
      isSimulation: true,
      simulationNotice: "This is a sandboxed browser simulation. No telephone calls, carrier charges, or external network connections are made.",
    });
  } catch (err: unknown) {
    console.error("POST /api/ai-employees/simulate error:", err);
    return apiError("Failed to run simulated conversation", 500);
  }
}
