import { NextRequest } from "next/server";
import { getTenantContext, apiError, apiSuccess, hasRequiredRole } from "@/lib/tenant";
import { UpdateOrganizationSchema } from "@/lib/validation";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const tenant = await getTenantContext(req);
    const apiKeys = await db.apiKeys.list(tenant.organizationId);

    return apiSuccess({
      organization: {
        id: tenant.organizationId,
        name: "Acme Growth Corp",
        slug: "acme-growth",
        domain: "vancetech.io",
        timezone: "America/New_York (EST)",
        callerId: "+1 (800) 412-9900",
      },
      apiKeys,
      currentUserRole: tenant.role,
    });
  } catch (err: unknown) {
    console.error("GET /api/settings error:", err);
    return apiError("Failed to fetch settings", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenant = await getTenantContext(req);

    if (!hasRequiredRole(tenant.role, "ADMIN")) {
      return apiError("Forbidden: Only Admins can manage API keys and settings", 403);
    }

    const body = await req.json();

    if (body.action === "create_key" && body.name) {
      const createdKey = await db.apiKeys.create(tenant.organizationId, body.name);
      return apiSuccess(createdKey);
    }

    if (body.action === "revoke_key" && body.keyId) {
      await db.apiKeys.revoke(tenant.organizationId, body.keyId);
      return apiSuccess({ revoked: true, keyId: body.keyId });
    }

    return apiError("Invalid action requested", 400);
  } catch (err: unknown) {
    console.error("POST /api/settings error:", err);
    return apiError("Failed to update settings", 500);
  }
}
