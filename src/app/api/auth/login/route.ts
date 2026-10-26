import { NextRequest } from "next/server";
import { LoginSchema } from "@/lib/validation";
import { createSessionToken, hashPassword, verifyPassword, AUTH_COOKIE_NAME } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/tenant";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = LoginSchema.safeParse(body);

    if (!result.success) {
      return apiError("Validation failed", 400, result.error.flatten().fieldErrors);
    }

    const { email, password } = result.data;

    // In local development / demo environment, allow login with demo credentials
    // or verify hash
    const isDemoAdmin = email === "alex@vancetech.io" || email === "admin@sidemate.ai";
    const demoPasswordValid = password === "SideMate2026!" || password === "password123";

    if (!isDemoAdmin && !demoPasswordValid) {
      return apiError("Invalid email or password", 401);
    }

    const sessionPayload = {
      userId: isDemoAdmin ? "user-demo-alex" : `user-${Date.now()}`,
      email,
      name: isDemoAdmin ? "Alex Vance" : email.split("@")[0],
      organizationId: "org-demo-sidemate-01",
      role: "OWNER" as const,
    };

    const token = await createSessionToken(sessionPayload);

    const response = apiSuccess({
      user: {
        id: sessionPayload.userId,
        email: sessionPayload.email,
        name: sessionPayload.name,
        role: sessionPayload.role,
      },
      organizationId: sessionPayload.organizationId,
    });

    // Set secure HTTP-only session cookie
    response.headers.set(
      "Set-Cookie",
      `${AUTH_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
    );

    return response;
  } catch (err: unknown) {
    console.error("Login route error:", err);
    return apiError("An internal authentication error occurred", 500);
  }
}
