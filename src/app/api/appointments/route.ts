import { NextRequest } from "next/server";
import { getTenantContext, apiError, apiSuccess, hasRequiredRole } from "@/lib/tenant";
import { CreateAppointmentSchema } from "@/lib/validation";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const tenant = await getTenantContext(req);
    const appointments = await db.appointments.list(tenant.organizationId);

    return apiSuccess(appointments, {
      count: appointments.length,
      tenantId: tenant.organizationId,
    });
  } catch (err: unknown) {
    console.error("GET /api/appointments error:", err);
    return apiError("Failed to fetch appointments", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenant = await getTenantContext(req);

    if (!hasRequiredRole(tenant.role, "MEMBER")) {
      return apiError("Insufficient permissions to create appointment", 403);
    }

    const body = await req.json();
    const result = CreateAppointmentSchema.safeParse(body);

    if (!result.success) {
      return apiError("Validation failed", 400, result.error.flatten().fieldErrors);
    }

    const lead = await db.leads.get(tenant.organizationId, result.data.leadId);
    const agent = await db.aiEmployees.get(tenant.organizationId, result.data.agentId);

    const created = await db.appointments.create(tenant.organizationId, {
      leadName: lead?.name || "Lead",
      company: lead?.company || "Company",
      agentName: agent?.name || "Sarah Jenkins",
      date: result.data.scheduledAt.split("T")[0],
      time: result.data.scheduledAt.includes("T")
        ? result.data.scheduledAt.split("T")[1].substring(0, 5)
        : "14:00 EST",
      duration: `${result.data.durationMinutes} mins`,
      type: result.data.title,
    });

    return apiSuccess(created, { status: "created" });
  } catch (err: unknown) {
    console.error("POST /api/appointments error:", err);
    return apiError("Failed to create appointment", 500);
  }
}
