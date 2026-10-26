import { NextRequest } from "next/server";
import { getTenantContext, apiError, apiSuccess } from "@/lib/tenant";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ callId: string }> }
) {
  try {
    const tenant = await getTenantContext(req);
    const { callId } = await params;

    const conversation = await db.conversations.get(tenant.organizationId, callId);

    if (!conversation) {
      return apiError("Transcript conversation not found for this call", 404);
    }

    return apiSuccess(conversation, {
      tenantId: tenant.organizationId,
    });
  } catch (err: unknown) {
    console.error("GET /api/conversations/[callId] error:", err);
    return apiError("Internal server error", 500);
  }
}
