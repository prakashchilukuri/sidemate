import { NextRequest } from "next/server";
import { getTenantContext, apiError, apiSuccess, hasRequiredRole } from "@/lib/tenant";
import { UpdateLeadSchema } from "@/lib/validation";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenant = await getTenantContext(req);
    const { id } = await params;

    const lead = await db.leads.get(tenant.organizationId, id);
    if (!lead) {
      return apiError("Lead not found in this organization", 404);
    }

    return apiSuccess(lead);
  } catch (err: unknown) {
    console.error("GET /api/leads/[id] error:", err);
    return apiError("Internal server error", 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenant = await getTenantContext(req);

    if (!hasRequiredRole(tenant.role, "MEMBER")) {
      return apiError("Insufficient permissions to update lead", 403);
    }

    const { id } = await params;
    const body = await req.json();
    const result = UpdateLeadSchema.safeParse(body);

    if (!result.success) {
      return apiError("Validation failed", 400, result.error.flatten().fieldErrors);
    }

    let normalizedStatus: "New" | "In Progress" | "Qualified" | "Meeting Booked" | "Disqualified" | undefined;
    if (result.data.status) {
      const s = result.data.status.toUpperCase();
      if (s === "NEW") normalizedStatus = "New";
      else if (s === "IN_PROGRESS") normalizedStatus = "In Progress";
      else if (s === "QUALIFIED") normalizedStatus = "Qualified";
      else if (s === "MEETING_BOOKED") normalizedStatus = "Meeting Booked";
      else if (s === "DISQUALIFIED") normalizedStatus = "Disqualified";
      else normalizedStatus = result.data.status as any;
    }

    const updated = await db.leads.update(tenant.organizationId, id, {
      ...(result.data.name && { name: result.data.name }),
      ...(result.data.company && { company: result.data.company }),
      ...(result.data.email && { email: result.data.email }),
      ...(result.data.phone && { phone: result.data.phone }),
      ...(result.data.dealSize && { dealSize: result.data.dealSize }),
      ...(result.data.assignedAgent && { assignedAgent: result.data.assignedAgent }),
      ...(result.data.assignedAgentId && { assignedAgent: result.data.assignedAgentId }),
      ...(normalizedStatus && { status: normalizedStatus }),
    });

    if (!updated) {
      return apiError("Lead not found", 404);
    }

    return apiSuccess(updated);
  } catch (err: unknown) {
    console.error("PATCH /api/leads/[id] error:", err);
    return apiError("Internal server error", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenant = await getTenantContext(req);

    if (!hasRequiredRole(tenant.role, "MEMBER")) {
      return apiError("Insufficient permissions to delete lead", 403);
    }

    const { id } = await params;
    const deleted = await db.leads.delete(tenant.organizationId, id);

    if (!deleted) {
      return apiError("Lead not found", 404);
    }

    return apiSuccess({ deleted: true, id });
  } catch (err: unknown) {
    console.error("DELETE /api/leads/[id] error:", err);
    return apiError("Internal server error", 500);
  }
}
