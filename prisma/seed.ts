import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  INITIAL_AI_EMPLOYEES,
  INITIAL_LEADS,
  INITIAL_CAMPAIGNS,
  INITIAL_CALLS,
  INITIAL_CONVERSATION_DETAILS,
  INITIAL_APPOINTMENTS,
  INITIAL_INTEGRATIONS,
} from "../src/lib/demo-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding SideMate multi-tenant PostgreSQL database...");

  // 1. Create Demo Organization
  const org = await prisma.organization.upsert({
    where: { slug: "acme-growth" },
    update: {},
    create: {
      id: "org-demo-sidemate-01",
      name: "Acme Growth Corp",
      slug: "acme-growth",
      domain: "vancetech.io",
      callerId: "+1 (800) 412-9900",
      timezone: "America/New_York",
    },
  });
  console.log(`✓ Organization ready: ${org.name} (${org.id})`);

  // 2. Create Primary Admin User
  const passwordHash = await bcrypt.hash("SideMate2026!Secure", 10);
  const user = await prisma.user.upsert({
    where: { email: "alex@vancetech.io" },
    update: {},
    create: {
      id: "user-demo-alex",
      email: "alex@vancetech.io",
      name: "Alex Vance",
      passwordHash,
    },
  });

  // 3. Link Membership
  await prisma.membership.upsert({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: org.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      organizationId: org.id,
      role: "OWNER",
    },
  });
  console.log(`✓ Owner membership linked: ${user.email} -> ${org.name}`);

  // 4. Seed AI Employees
  for (const emp of INITIAL_AI_EMPLOYEES) {
    await prisma.aIEmployee.upsert({
      where: { id: emp.id },
      update: {},
      create: {
        id: emp.id,
        organizationId: org.id,
        name: emp.name,
        role: emp.role,
        avatar: emp.avatar,
        voiceId: emp.voice.split(" ")[0].toLowerCase(),
        language: emp.language,
        systemPrompt: emp.objective,
        status: emp.status.toUpperCase() as "ACTIVE" | "PAUSED" | "TRAINING",
      },
    });
  }
  console.log(`✓ Seeded ${INITIAL_AI_EMPLOYEES.length} AI Employees`);

  // 5. Seed Leads
  for (const lead of INITIAL_LEADS) {
    await prisma.lead.upsert({
      where: { id: lead.id },
      update: {},
      create: {
        id: lead.id,
        organizationId: org.id,
        name: lead.name,
        company: lead.company,
        email: lead.email,
        phone: lead.phone,
        status: lead.status.replace(/\s+/g, "_").toUpperCase() as any,
        dealSize: lead.dealSize,
      },
    });
  }
  console.log(`✓ Seeded ${INITIAL_LEADS.length} Leads`);

  // 6. Seed Subscription
  await prisma.subscription.upsert({
    where: { organizationId: org.id },
    update: {},
    create: {
      organizationId: org.id,
      tier: "GROWTH",
      status: "ACTIVE",
      monthlyMinutesQuota: 2500,
      extraMinutesPurchased: 0,
      maxAgents: 10,
      maxConcurrentTrunks: 5,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
  console.log("✓ Growth subscription record provisioned");

  console.log("\n🎉 Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
