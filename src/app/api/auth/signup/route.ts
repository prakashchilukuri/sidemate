import { NextRequest } from "next/server";
import { SignupSchema } from "@/lib/validation";
import { createSessionToken, hashPassword, AUTH_COOKIE_NAME } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/tenant";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = SignupSchema.safeParse(body);

    if (!result.success) {
      return apiError("Validation failed", 400, result.error.flatten().fieldErrors);
    }

    const { name, email, password, organizationName } = result.data;

    // Hash password
    const passwordHash = await hashPassword(password);

    const organizationId = `org-${Math.random().toString(36).substring(2, 9)}`;
    const userId = `user-${Math.random().toString(36).substring(2, 9)}`;

    const sessionPayload = {
      userId,
      email,
      name,
      organizationId,
      role: "OWNER" as const,
    };

    const token = await createSessionToken(sessionPayload);

    const response = apiSuccess({
      user: {
        id: userId,
        email,
        name,
        role: "OWNER",
      },
      organization: {
        id: organizationId,
        name: organizationName,
      },
    });

    response.headers.set(
      "Set-Cookie",
      `${AUTH_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
    );

    return response;
  } catch (err: unknown) {
    console.error("Signup route error:", err);
    return apiError("An internal registration error occurred", 500);
  }
}
