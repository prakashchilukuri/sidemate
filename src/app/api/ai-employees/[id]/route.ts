import { NextRequest } from "next/server";
import { getTenantContext, apiError, apiSuccess, hasRequiredRole } from "@/lib/tenant";
import { UpdateAIEmployeeSchema } from "@/lib/validation";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenant = await getTenantContext(req);
    const { id } = await params;

    const employee = await db.aiEmployees.get(tenant.organizationId, id);
    if (!employee) {
      return apiError("AI employee not found in this organization", 404);
    }

    return apiSuccess(employee);
  } catch (err: unknown) {
    console.error("GET /api/ai-employees/[id] error:", err);
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
      return apiError("Forbidden: Insufficient role permissions", 403);
    }

    const { id } = await params;
    const body = await req.json();
    const result = UpdateAIEmployeeSchema.safeParse(body);

    if (!result.success) {
      return apiError("Validation failed", 400, result.error.flatten().fieldErrors);
    }

    let normalizedStatus: "Live" | "Active" | "Draft" | "Building" | "Ready" | "Paused" | undefined;
    if (result.data.status) {
      const s = result.data.status.toUpperCase();
      if (s === "LIVE" || s === "ACTIVE") normalizedStatus = "Live";
      else if (s === "READY") normalizedStatus = "Ready";
      else if (s === "BUILDING") normalizedStatus = "Building";
      else if (s === "PAUSED") normalizedStatus = "Paused";
      else if (s === "DRAFT") normalizedStatus = "Draft";
    }

    const updated = await db.aiEmployees.update(tenant.organizationId, id, {
      ...(result.data.name && { name: result.data.name }),
      ...(result.data.role && { role: result.data.role }),
      ...(result.data.systemPrompt && { objective: result.data.systemPrompt }),
      ...(result.data.voiceId && { voice: result.data.voiceId }),
      ...(result.data.language && { language: result.data.language }),
      ...(normalizedStatus && { status: normalizedStatus }),
      ...(result.data.config && { config: result.data.config as any }),
    });

    if (!updated) {
      return apiError("AI employee not found", 404);
    }

    return apiSuccess(updated);
  } catch (err: unknown) {
    console.error("PATCH /api/ai-employees/[id] error:", err);
    return apiError("Internal server error", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenant = await getTenantContext(req);

    if (!hasRequiredRole(tenant.role, "ADMIN")) {
      return apiError("Forbidden: Only Admins can delete AI employees", 403);
    }

    const { id } = await params;
    const deleted = await db.aiEmployees.delete(tenant.organizationId, id);

    if (!deleted) {
      return apiError("AI employee not found", 404);
    }

    return apiSuccess({ deleted: true, id });
  } catch (err: unknown) {
    console.error("DELETE /api/ai-employees/[id] error:", err);
    return apiError("Internal server error", 500);
  }
}
