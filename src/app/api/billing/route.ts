import { NextRequest } from "next/server";
import { getTenantContext, apiError, apiSuccess, hasRequiredRole } from "@/lib/tenant";
import { TopupCreditsSchema } from "@/lib/validation";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const tenant = await getTenantContext(req);
    const subscription = await db.billing.get(tenant.organizationId);

    const isStripeConfigured = Boolean(
      process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== "mock"
    );

    return apiSuccess({
      ...subscription,
      gatewayMode: isStripeConfigured ? "stripe_live" : "sandbox_demo_mode",
      tenantId: tenant.organizationId,
    });
  } catch (err: unknown) {
    console.error("GET /api/billing error:", err);
    return apiError("Failed to fetch billing details", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const tenant = await getTenantContext(req);

    if (!hasRequiredRole(tenant.role, "ADMIN")) {
      return apiError("Forbidden: Only Admins can purchase calling credits", 403);
    }

    const body = await req.json();
    const result = TopupCreditsSchema.safeParse(body);

    if (!result.success) {
      return apiError("Validation failed", 400, result.error.flatten().fieldErrors);
    }

    const isStripeConfigured = Boolean(
      process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== "mock"
    );

    // Apply top-up minutes to tenant store
    const updated = await db.billing.topup(
      tenant.organizationId,
      result.data.minutesGranted
    );

    return apiSuccess(updated, {
      chargedDollars: result.data.amountDollars,
      minutesAdded: result.data.minutesGranted,
      processor: isStripeConfigured ? "Stripe" : "Sandbox Test Mode",
    });
  } catch (err: unknown) {
    console.error("POST /api/billing error:", err);
    return apiError("Failed to process credit topup", 500);
  }
}
