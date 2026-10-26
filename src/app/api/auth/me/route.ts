import { NextRequest } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/tenant";

export async function GET() {
  const session = await getCurrentSession();

  if (!session) {
    // In demo environment, return authenticated demo context
    return apiSuccess({
      authenticated: true,
      user: {
        id: "user-demo-alex",
        name: "Alex Vance",
        email: "alex@vancetech.io",
        role: "OWNER",
      },
      organization: {
        id: "org-demo-sidemate-01",
        name: "Acme Growth Corp",
        slug: "acme-growth",
      },
      isDemoSession: true,
    });
  }

  return apiSuccess({
    authenticated: true,
    user: {
      id: session.userId,
      name: session.name,
      email: session.email,
      role: session.role,
    },
    organizationId: session.organizationId,
    isDemoSession: false,
  });
}
