import { NextRequest } from "next/server";
import { getTenantContext, apiError, apiSuccess, hasRequiredRole } from "@/lib/tenant";
import { CreateAIEmployeeSchema } from "@/lib/validation";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const tenant = await getTenantContext(req);
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;

    const employees = await db.aiEmployees.list(tenant.organizationId, {
      search,
      status,
    });

    return apiSuccess(employees, {
      count: employees.length,
      tenantId: tenant.organizationId,
    });
  } catch (err: unknown) {
    console.error("GET /api/ai-employees error:", err);
    return apiError("Failed to fetch AI employees", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenant = await getTenantContext(req);

    // Enforce role: only MEMBER or above can create agents
    if (!hasRequiredRole(tenant.role, "MEMBER")) {
      return apiError("Insufficient permissions to create AI employees", 403);
    }

    const body = await req.json();
    const result = CreateAIEmployeeSchema.safeParse(body);

    if (!result.success) {
      return apiError("Validation failed", 400, result.error.flatten().fieldErrors);
    }

    const { config, name, role, voiceId, language, status, systemPrompt } = result.data;

    let finalStatus: "Live" | "Active" | "Draft" | "Building" | "Ready" | "Paused" = "Live";
    if (config?.status) {
      finalStatus = config.status as any;
    } else if (status === "DRAFT") {
      finalStatus = "Draft";
    } else if (status === "PAUSED") {
      finalStatus = "Paused";
    } else if (status === "READY") {
      finalStatus = "Ready";
    } else if (status === "BUILDING") {
      finalStatus = "Building";
    }

    const created = await db.aiEmployees.create(tenant.organizationId, {
      name: name,
      role: role,
      avatar: (config?.avatar || name.substring(0, 2)).toUpperCase(),
      voice: config?.telephony?.voiceId || voiceId || "nova",
      language: config?.language || language || "en-US",
      status: finalStatus,
      objective: systemPrompt || config?.systemInstructions || "Outbound prospecting & qualification",
      config: config,
    });

    return apiSuccess(created, { status: "created" });
  } catch (err: unknown) {
    console.error("POST /api/ai-employees error:", err);
    return apiError("Failed to create AI employee", 500);
  }
}
