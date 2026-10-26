import { NextRequest } from "next/server";
import { getTenantContext, apiError, apiSuccess, hasRequiredRole } from "@/lib/tenant";
import { CreateLeadSchema } from "@/lib/validation";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const tenant = await getTenantContext(req);
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const result = await db.leads.list(tenant.organizationId, {
      search,
      status,
      page,
      limit,
    });

    return apiSuccess(result.items, {
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      tenantId: tenant.organizationId,
    });
  } catch (err: unknown) {
    console.error("GET /api/leads error:", err);
    return apiError("Failed to fetch leads", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenant = await getTenantContext(req);

    if (!hasRequiredRole(tenant.role, "MEMBER")) {
      return apiError("Insufficient role permissions to add leads", 403);
    }

    const body = await req.json();

    // Batch Import Handling
    if (Array.isArray(body) || (body.batch && Array.isArray(body.batch))) {
      const itemsToImport = Array.isArray(body) ? body : body.batch;
      const existingLeads = await db.leads.list(tenant.organizationId, { limit: 1000 });
      const existingEmails = new Set(existingLeads.items.map((l) => l.email.toLowerCase()));
      const existingPhones = new Set(existingLeads.items.map((l) => l.phone.replace(/\D/g, "")));

      const imported = [];
      let duplicates = 0;

      for (const item of itemsToImport) {
        const val = CreateLeadSchema.safeParse(item);
        if (!val.success) continue;

        const emailClean = val.data.email.toLowerCase();
        const phoneClean = val.data.phone.replace(/\D/g, "");

        if (existingEmails.has(emailClean) || (phoneClean && existingPhones.has(phoneClean))) {
          duplicates++;
          continue;
        }

        existingEmails.add(emailClean);
        if (phoneClean) existingPhones.add(phoneClean);

        const created = await db.leads.create(tenant.organizationId, {
          name: val.data.name,
          company: val.data.company || "Independent",
          email: val.data.email,
          phone: val.data.phone,
          status: (val.data.status === "MEETING_BOOKED"
            ? "Meeting Booked"
            : val.data.status === "IN_PROGRESS"
            ? "In Progress"
            : val.data.status.charAt(0) + val.data.status.slice(1).toLowerCase()) as any,
          dealSize: val.data.dealSize || "$15,000/yr",
          assignedAgent: val.data.assignedAgent || val.data.assignedAgentId || "Sarah Jenkins",
        });
        imported.push(created);
      }

      return apiSuccess({
        importedCount: imported.length,
        duplicatesCount: duplicates,
        leads: imported,
      });
    }

    // Single Lead Creation
    const result = CreateLeadSchema.safeParse(body);

    if (!result.success) {
      return apiError("Validation failed", 400, result.error.flatten().fieldErrors);
    }

    const created = await db.leads.create(tenant.organizationId, {
      name: result.data.name,
      company: result.data.company || "Independent",
      email: result.data.email,
      phone: result.data.phone,
      status: (result.data.status === "MEETING_BOOKED"
        ? "Meeting Booked"
        : result.data.status === "IN_PROGRESS"
        ? "In Progress"
        : result.data.status.charAt(0) + result.data.status.slice(1).toLowerCase()) as any,
      dealSize: result.data.dealSize || "$15,000/yr",
      assignedAgent: result.data.assignedAgent || result.data.assignedAgentId || "Sarah Jenkins",
    });

    return apiSuccess(created, { status: "created" });
  } catch (err: unknown) {
    console.error("POST /api/leads error:", err);
    return apiError("Failed to create lead", 500);
  }
}
