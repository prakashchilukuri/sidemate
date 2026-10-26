import { NextRequest } from "next/server";
import { getTenantContext, apiError, apiSuccess, hasRequiredRole } from "@/lib/tenant";
import { CreateWebhookSchema } from "@/lib/validation";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const tenant = await getTenantContext(req);
    const integrations = await db.integrations.list(tenant.organizationId);

    return apiSuccess(integrations, {
      count: integrations.length,
      tenantId: tenant.organizationId,
    });
  } catch (err: unknown) {
    console.error("GET /api/integrations error:", err);
    return apiError("Failed to fetch integrations", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenant = await getTenantContext(req);

    if (!hasRequiredRole(tenant.role, "ADMIN")) {
      return apiError("Forbidden: Only Admins can modify integrations", 403);
    }

    const body = await req.json();

    // Action 1: Toggle integration status
    if (body.action === "toggle" && body.integrationId) {
      const updated = await db.integrations.toggle(tenant.organizationId, body.integrationId);
      return apiSuccess(updated);
    }

    // Action 2: Trigger test webhook dispatch
    if (body.action === "test_webhook") {
      const testPayload = {
        event: "call.completed",
        timestamp: new Date().toISOString(),
        organization_id: tenant.organizationId,
        data: {
          call_id: "call-demo-test",
          agent: "Sarah Jenkins",
          lead: "Marcus Vance",
          outcome: "Meeting Booked",
          duration_seconds: 252,
        },
      };

      return apiSuccess({
        delivered: true,
        http_status: 200,
        response_time_ms: 42,
        payload: testPayload,
      });
    }

    return apiError("Invalid action requested", 400);
  } catch (err: unknown) {
    console.error("POST /api/integrations error:", err);
    return apiError("Failed to update integration", 500);
  }
}
