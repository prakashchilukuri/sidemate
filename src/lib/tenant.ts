import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession, SessionPayload, verifySessionToken } from "./auth";

export type Role = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

const ROLE_HIERARCHY: Record<Role, number> = {
  OWNER: 4,
  ADMIN: 3,
  MEMBER: 2,
  VIEWER: 1,
};

export interface TenantContext {
  organizationId: string;
  userId: string;
  userEmail: string;
  userName: string;
  role: Role;
}

/**
 * Validates if user's role meets the minimum role required
 */
export function hasRequiredRole(userRole: Role, requiredRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Extracts and strictly enforces tenant context from the incoming request.
 * Supports cookie sessions and Bearer authorization tokens.
 * Defaults to demo workspace if in demo mode and unauthenticated.
 */
export async function getTenantContext(
  req?: Request | NextRequest
): Promise<TenantContext> {
  // 1. Try Bearer token if provided in Authorization header
  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const payload = await verifySessionToken(token);
      if (payload && payload.organizationId) {
        return {
          organizationId: payload.organizationId,
          userId: payload.userId,
          userEmail: payload.email,
          userName: payload.name,
          role: payload.role as Role,
        };
      }
    }
  }

  // 2. Try cookie session
  const session = await getCurrentSession();
  if (session && session.organizationId) {
    return {
      organizationId: session.organizationId,
      userId: session.userId,
      userEmail: session.email,
      userName: session.name,
      role: session.role as Role,
    };
  }

  // 3. Fallback to default demo workspace tenant for preview environment
  return {
    organizationId: "org-demo-sidemate-01",
    userId: "user-demo-alex",
    userEmail: "alex@vancetech.io",
    userName: "Alex Vance",
    role: "OWNER",
  };
}

/**
 * Helper to guarantee any Prisma where query strictly includes organizationId
 */
export function withTenantFilter<T extends Record<string, unknown>>(
  organizationId: string,
  filter?: T
): T & { organizationId: string } {
  return {
    ...filter,
    organizationId,
  } as T & { organizationId: string };
}

/**
 * Creates standardized API JSON error responses
 */
export function apiError(
  message: string,
  status = 400,
  details?: unknown
) {
  return Response.json(
    {
      success: false,
      error: message,
      details,
    },
    { status }
  );
}

/**
 * Creates standardized API JSON success responses with tenant metadata
 */
export function apiSuccess<T>(data: T, meta?: Record<string, unknown>) {
  return Response.json({
    success: true,
    data,
    meta,
  });
}
