import { NextRequest } from "next/server";
import { getTenantContext, apiError, apiSuccess, hasRequiredRole } from "@/lib/tenant";
import { CreateCampaignSchema } from "@/lib/validation";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const tenant = await getTenantContext(req);
    const campaigns = await db.campaigns.list(tenant.organizationId);

    return apiSuccess(campaigns, {
      count: campaigns.length,
      tenantId: tenant.organizationId,
    });
  } catch (err: unknown) {
    console.error("GET /api/campaigns error:", err);
    return apiError("Failed to fetch campaigns", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenant = await getTenantContext(req);

    if (!hasRequiredRole(tenant.role, "MEMBER")) {
      return apiError("Insufficient permissions to create campaign", 403);
    }

    const body = await req.json();
    const result = CreateCampaignSchema.safeParse(body);

    if (!result.success) {
      return apiError("Validation failed", 400, result.error.flatten().fieldErrors);
    }

    const created = await db.campaigns.create(tenant.organizationId, {
      name: result.data.name,
      status: "Running",
      agentName: result.data.assignedAgentId,
      leadsTargeted: result.data.leadsTargeted,
      schedule: `${result.data.dialWindowStart} - ${result.data.dialWindowEnd} ${result.data.dialTimezone}`,
    });

    return apiSuccess(created, { status: "created" });
  } catch (err: unknown) {
    console.error("POST /api/campaigns error:", err);
    return apiError("Failed to create campaign", 500);
  }
}
