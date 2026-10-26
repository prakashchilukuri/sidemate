import { NextRequest } from "next/server";
import { getTenantContext, apiError, apiSuccess, hasRequiredRole } from "@/lib/tenant";
import { UpdateCampaignSchema } from "@/lib/validation";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenant = await getTenantContext(req);

    if (!hasRequiredRole(tenant.role, "MEMBER")) {
      return apiError("Insufficient permissions to update campaign", 403);
    }

    const { id } = await params;
    const body = await req.json();
    const result = UpdateCampaignSchema.safeParse(body);

    if (!result.success) {
      return apiError("Validation failed", 400, result.error.flatten().fieldErrors);
    }

    const updated = await db.campaigns.update(tenant.organizationId, id, {
      ...(result.data.name && { name: result.data.name }),
      ...(result.data.status && {
        status: (result.data.status.charAt(0) + result.data.status.slice(1).toLowerCase()) as any,
      }),
    });

    if (!updated) {
      return apiError("Campaign not found", 404);
    }

    return apiSuccess(updated);
  } catch (err: unknown) {
    console.error("PATCH /api/campaigns/[id] error:", err);
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
      return apiError("Forbidden: Only Admins can delete campaigns", 403);
    }

    const { id } = await params;
    const deleted = await db.campaigns.delete(tenant.organizationId, id);

    if (!deleted) {
      return apiError("Campaign not found", 404);
    }

    return apiSuccess({ deleted: true, id });
  } catch (err: unknown) {
    console.error("DELETE /api/campaigns/[id] error:", err);
    return apiError("Internal server error", 500);
  }
}
