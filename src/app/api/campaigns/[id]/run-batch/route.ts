import { NextRequest } from "next/server";
import { getTenantContext, apiError, apiSuccess, hasRequiredRole } from "@/lib/tenant";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const tenant = await getTenantContext(req);

    if (!hasRequiredRole(tenant.role, "MEMBER")) {
      return apiError("Insufficient permissions to run campaign batch", 403);
    }

    const { id } = await params;
    const campaign = await db.campaigns.get(tenant.organizationId, id);

    if (!campaign) {
      return apiError("Campaign not found", 404);
    }

    // Fetch uncontacted leads or leads in New/In Progress state
    const leadsRes = await db.leads.list(tenant.organizationId, { limit: 10 });
    const eligibleLeads = leadsRes.items.slice(0, 3); // run batch of up to 3 leads

    const batchCalls = [];

    for (const lead of eligibleLeads) {
      // Create call record
      const call = await db.calls.create(tenant.organizationId, {
        leadName: lead.name,
        company: lead.company,
        phone: lead.phone,
        agentName: campaign.agentName,
        duration: "1m 45s",
        durationSeconds: 105,
        sentiment: "Positive",
        outcome: "Meeting Booked",
        hasRecording: true,
        transcriptSnippet: `Simulated outbound dial initiated by campaign "${campaign.name}". Lead qualified against ICP.`,
      });

      // Update lead status
      await db.leads.update(tenant.organizationId, lead.id, {
        status: "Meeting Booked",
        lastContact: "Just now",
      });

      batchCalls.push(call);
    }

    // Update campaign metrics
    const newCallsCompleted = (campaign.callsCompleted || 0) + batchCalls.length;
    const updatedCampaign = await db.campaigns.update(tenant.organizationId, id, {
      callsCompleted: newCallsCompleted,
      connectedRate: "68.4%",
      qualifiedRate: "34.2%",
      status: "Running",
    });

    return apiSuccess({
      campaign: updatedCampaign,
      dialsInitiated: batchCalls.length,
      calls: batchCalls,
      notice: "Outbound campaign batch executed in sandbox mode. Telemetry and call history updated.",
    });
  } catch (err: unknown) {
    console.error("POST /api/campaigns/[id]/run-batch error:", err);
    return apiError("Internal server error", 500);
  }
}
