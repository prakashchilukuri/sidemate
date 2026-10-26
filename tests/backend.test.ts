/**
 * SideMate Backend Test Suite
 * Validates:
 * 1. Authentication (password hashing, JWT session signing, verification)
 * 2. Multi-Tenant Isolation (cross-tenant isolation queries)
 * 3. Role-Based Authorization (OWNER, ADMIN, MEMBER, VIEWER)
 * 4. Server-Side Validation (Zod schemas)
 */

import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from "../src/lib/auth";
import { hasRequiredRole, withTenantFilter, Role } from "../src/lib/tenant";
import { db } from "../src/lib/db";
import { CreateAIEmployeeSchema, CreateLeadSchema, LoginSchema } from "../src/lib/validation";

// Simple test assertion runner
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAILED: ${message}`);
    failedTests++;
  }
}

async function runTestSuite() {
  console.log("\n=======================================================");
  console.log("   SideMate SaaS Backend Automated Verification Suite");
  console.log("=======================================================\n");

  // -----------------------------------------------------------
  // TEST GROUP 1: Authentication & Session Security
  // -----------------------------------------------------------
  console.log("1. Authentication & Session Handling:");

  // Test bcrypt hashing
  const rawPassword = "StrongPassword2026!";
  const hash = await hashPassword(rawPassword);
  assert(hash.startsWith("$2"), "Password hashed using secure bcrypt salt");
  assert(await verifyPassword(rawPassword, hash), "Password verification succeeds for correct secret");
  assert(!(await verifyPassword("WrongPassword", hash)), "Password verification fails for incorrect secret");

  // Test JWT session token
  const testSession = {
    userId: "usr_test_123",
    email: "sarah@apex.com",
    name: "Sarah Chen",
    organizationId: "org_apex_456",
    role: "ADMIN" as const,
  };

  const token = await createSessionToken(testSession);
  assert(typeof token === "string" && token.split(".").length === 3, "Signed compact 3-part JWT generated");

  const verified = await verifySessionToken(token);
  assert(verified !== null && verified.userId === "usr_test_123", "Session token verified and decoded correctly");
  assert(verified?.organizationId === "org_apex_456", "Session token carries tenant organizationId claim");

  const invalidVerified = await verifySessionToken("tampered.token.invalid");
  assert(invalidVerified === null, "Tampered/invalid tokens rejected safely without exceptions");

  // -----------------------------------------------------------
  // TEST GROUP 2: Tenant Isolation
  // -----------------------------------------------------------
  console.log("\n2. Multi-Tenant Organization Isolation:");

  const tenantA = "org_alpha_inc";
  const tenantB = "org_beta_corp";

  // Create lead in Tenant A
  const leadA = await db.leads.create(tenantA, {
    name: "Alpha Lead 01",
    company: "Alpha Corp",
    email: "lead@alpha.com",
    phone: "+1 (555) 111-2222",
    status: "New",
    dealSize: "$50,000",
    assignedAgent: "Sarah Jenkins",
  });

  // Create lead in Tenant B
  const leadB = await db.leads.create(tenantB, {
    name: "Beta Lead 02",
    company: "Beta Systems",
    email: "lead@beta.com",
    phone: "+1 (555) 333-4444",
    status: "Qualified",
    dealSize: "$25,000",
    assignedAgent: "Leo Zhang",
  });

  // Query Tenant A leads
  const tenantALeads = await db.leads.list(tenantA);
  assert(
    tenantALeads.items.some((l) => l.id === leadA.id),
    "Tenant A can access its own created leads"
  );
  assert(
    !tenantALeads.items.some((l) => l.id === leadB.id),
    "Tenant A strictly CANNOT see Tenant B's leads (Tenant Isolation Enforced)"
  );

  // Query Tenant B leads
  const tenantBLeads = await db.leads.list(tenantB);
  assert(
    tenantBLeads.items.some((l) => l.id === leadB.id),
    "Tenant B can access its own created leads"
  );
  assert(
    !tenantBLeads.items.some((l) => l.id === leadA.id),
    "Tenant B strictly CANNOT see Tenant A's leads (Tenant Isolation Enforced)"
  );

  // Cross-tenant direct query rejection
  const crossTenantCheck = await db.leads.get(tenantB, leadA.id);
  assert(crossTenantCheck === null, "Direct ID lookup of Tenant A lead from Tenant B context returns null");

  // withTenantFilter helper test
  const scopedFilter = withTenantFilter(tenantA, { status: "QUALIFIED" });
  assert(
    scopedFilter.organizationId === tenantA && scopedFilter.status === "QUALIFIED",
    "withTenantFilter enforces mandatory organizationId constraint"
  );

  // -----------------------------------------------------------
  // TEST GROUP 3: Role-Based Authorization
  // -----------------------------------------------------------
  console.log("\n3. Role-Based Authorization Hierarchy:");

  assert(hasRequiredRole("OWNER", "OWNER"), "OWNER satisfies OWNER role requirement");
  assert(hasRequiredRole("OWNER", "ADMIN"), "OWNER satisfies ADMIN role requirement");
  assert(hasRequiredRole("OWNER", "MEMBER"), "OWNER satisfies MEMBER role requirement");
  assert(hasRequiredRole("ADMIN", "MEMBER"), "ADMIN satisfies MEMBER role requirement");
  assert(!hasRequiredRole("MEMBER", "ADMIN"), "MEMBER is denied from ADMIN-level operations");
  assert(!hasRequiredRole("VIEWER", "MEMBER"), "VIEWER is denied from mutating resources (MEMBER requirement)");
  assert(hasRequiredRole("VIEWER", "VIEWER"), "VIEWER satisfies read-only VIEWER requirement");

  // -----------------------------------------------------------
  // TEST GROUP 4: Server-Side Validation (Zod)
  // -----------------------------------------------------------
  console.log("\n4. Server-Side Request Validation:");

  // Login validation
  const validLogin = LoginSchema.safeParse({ email: "test@domain.com", password: "password123" });
  assert(validLogin.success, "Valid login payload passes Zod validation");

  const invalidEmailLogin = LoginSchema.safeParse({ email: "invalid-email", password: "password123" });
  assert(!invalidEmailLogin.success, "Invalid email format rejected by Zod");

  // AI Employee validation
  const validAgent = CreateAIEmployeeSchema.safeParse({
    name: "Alex SDR",
    role: "Sales Representative",
    systemPrompt: "Call outbound qualified leads and book meetings",
  });
  assert(validAgent.success, "Valid AI employee schema passes validation");

  const invalidAgent = CreateAIEmployeeSchema.safeParse({
    name: "A", // Too short
    role: "R",
    systemPrompt: "Short", // Too short
  });
  assert(!invalidAgent.success, "Malformed AI employee payload rejected with field errors");

  // -----------------------------------------------------------
  // Test Results Summary
  // -----------------------------------------------------------
  console.log("\n-------------------------------------------------------");
  console.log(`Results: ${passedTests} Passed, ${failedTests} Failed`);
  console.log("-------------------------------------------------------\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test runner encountered fatal error:", err);
  process.exit(1);
});
