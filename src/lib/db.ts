import {
  AIEmployee,
  Lead,
  Campaign,
  CallRecord,
  ConversationDetail,
  Appointment,
  IntegrationItem,
  INITIAL_AI_EMPLOYEES,
  INITIAL_LEADS,
  INITIAL_CAMPAIGNS,
  INITIAL_CALLS,
  INITIAL_CONVERSATION_DETAILS,
  INITIAL_APPOINTMENTS,
  INITIAL_INTEGRATIONS,
} from "./demo-data";
import { loadStorageFromDisk, saveStorageToDisk } from "./storage";

// In-Memory Relational State scoped strictly by organizationId with Permanent File Persistence
export interface TenantDataStore {
  aiEmployees: AIEmployee[];
  leads: Lead[];
  campaigns: Campaign[];
  calls: CallRecord[];
  conversations: Record<string, ConversationDetail>;
  appointments: Appointment[];
  integrations: IntegrationItem[];
  subscription: {
    tier: string;
    status: string;
    minutesUsed: number;
    minutesQuota: number;
    extraMinutes: number;
    activeAgentsQuota: number;
    maxConcurrentTrunks: number;
  };
  apiKeys: {
    id: string;
    name: string;
    keyPrefix: string;
    keyHash: string;
    created: string;
    lastUsed: string;
  }[];
}

const DEFAULT_ORG_ID = "org-demo-sidemate-01";

// Global cache keyed by organizationId backed by permanent disk storage
const tenantStores: Map<string, TenantDataStore> = new Map();

// Load initial persistent storage from disk if available
const diskStores = loadStorageFromDisk<TenantDataStore>();
if (diskStores && typeof diskStores === "object") {
  for (const [orgId, storeData] of Object.entries(diskStores)) {
    tenantStores.set(orgId, storeData);
  }
}

function persistAllStores(): void {
  const serializable: Record<string, TenantDataStore> = {};
  for (const [orgId, store] of tenantStores.entries()) {
    serializable[orgId] = store;
  }
  saveStorageToDisk(serializable);
}

function getStoreForTenant(organizationId: string): TenantDataStore {
  if (!tenantStores.has(organizationId)) {
    // Initialize new tenant store with deep-cloned baseline dataset
    const newStore: TenantDataStore = {
      aiEmployees: JSON.parse(JSON.stringify(INITIAL_AI_EMPLOYEES)),
      leads: JSON.parse(JSON.stringify(INITIAL_LEADS)),
      campaigns: JSON.parse(JSON.stringify(INITIAL_CAMPAIGNS)),
      calls: JSON.parse(JSON.stringify(INITIAL_CALLS)),
      conversations: JSON.parse(JSON.stringify(INITIAL_CONVERSATION_DETAILS)),
      appointments: JSON.parse(JSON.stringify(INITIAL_APPOINTMENTS)),
      integrations: JSON.parse(JSON.stringify(INITIAL_INTEGRATIONS)),
      subscription: {
        tier: "Growth",
        status: "Active",
        minutesUsed: 1640,
        minutesQuota: 2500,
        extraMinutes: 0,
        activeAgentsQuota: 10,
        maxConcurrentTrunks: 5,
      },
      apiKeys: [
        {
          id: "key-1",
          name: "Production Backend Service",
          keyPrefix: "sm_live_9a8f...4e12",
          keyHash: "hash_9a8f4e12",
          created: "Sep 12, 2026",
          lastUsed: "4 min ago",
        },
      ],
    };
    tenantStores.set(organizationId, newStore);
    persistAllStores();
  }
  return tenantStores.get(organizationId)!;
}

// Ensure default tenant is created and persisted
getStoreForTenant(DEFAULT_ORG_ID);

/**
 * Tenant-Isolated Repository Layer
 */
export const db = {
  // -----------------------------------------------------------
  // AI Employees
  // -----------------------------------------------------------
  aiEmployees: {
    async list(
      organizationId: string,
      query?: { search?: string; status?: string }
    ): Promise<AIEmployee[]> {
      const store = getStoreForTenant(organizationId);
      let items = [...store.aiEmployees];

      if (query?.status && query.status !== "All") {
        items = items.filter((emp) => emp.status === query.status);
      }

      if (query?.search) {
        const s = query.search.toLowerCase();
        items = items.filter(
          (emp) =>
            emp.name.toLowerCase().includes(s) ||
            emp.role.toLowerCase().includes(s) ||
            emp.voice.toLowerCase().includes(s)
        );
      }

      return items;
    },

    async get(organizationId: string, id: string): Promise<AIEmployee | null> {
      const store = getStoreForTenant(organizationId);
      return store.aiEmployees.find((e) => e.id === id) || null;
    },

    async create(
      organizationId: string,
      data: Omit<AIEmployee, "id" | "totalCalls" | "successRate" | "avgDuration">
    ): Promise<AIEmployee> {
      const store = getStoreForTenant(organizationId);
      const newEmp: AIEmployee = {
        ...data,
        id: `emp-${Date.now()}`,
        avatar: data.avatar || data.name.substring(0, 2).toUpperCase(),
        totalCalls: 0,
        successRate: "0.0%",
        avgDuration: "0m 00s",
      };
      store.aiEmployees.unshift(newEmp);
      persistAllStores();
      return newEmp;
    },

    async update(
      organizationId: string,
      id: string,
      data: Partial<AIEmployee>
    ): Promise<AIEmployee | null> {
      const store = getStoreForTenant(organizationId);
      const idx = store.aiEmployees.findIndex((e) => e.id === id);
      if (idx === -1) return null;
      store.aiEmployees[idx] = { ...store.aiEmployees[idx], ...data };
      persistAllStores();
      return store.aiEmployees[idx];
    },

    async delete(organizationId: string, id: string): Promise<boolean> {
      const store = getStoreForTenant(organizationId);
      const initialLen = store.aiEmployees.length;
      store.aiEmployees = store.aiEmployees.filter((e) => e.id !== id);
      const changed = store.aiEmployees.length < initialLen;
      if (changed) {
        persistAllStores();
      }
      return changed;
    },
  },

  // -----------------------------------------------------------
  // Leads & Contacts
  // -----------------------------------------------------------
  leads: {
    async list(
      organizationId: string,
      params?: { search?: string; status?: string; page?: number; limit?: number }
    ): Promise<{ items: Lead[]; total: number; page: number; totalPages: number }> {
      const store = getStoreForTenant(organizationId);
      let items = [...store.leads];

      if (params?.status && params.status !== "All") {
        items = items.filter((l) => l.status === params.status);
      }

      if (params?.search) {
        const s = params.search.toLowerCase();
        items = items.filter(
          (l) =>
            l.name.toLowerCase().includes(s) ||
            l.company.toLowerCase().includes(s) ||
            l.email.toLowerCase().includes(s) ||
            l.phone.includes(s)
        );
      }

      const total = items.length;
      const page = params?.page || 1;
      const limit = params?.limit || 50;
      const totalPages = Math.ceil(total / limit) || 1;
      const paginated = items.slice((page - 1) * limit, page * limit);

      return {
        items: paginated,
        total,
        page,
        totalPages,
      };
    },

    async get(organizationId: string, id: string): Promise<Lead | null> {
      const store = getStoreForTenant(organizationId);
      return store.leads.find((l) => l.id === id) || null;
    },

    async create(
      organizationId: string,
      data: Omit<Lead, "id" | "lastContact">
    ): Promise<Lead> {
      const store = getStoreForTenant(organizationId);
      const newLead: Lead = {
        ...data,
        id: `lead-${Date.now()}`,
        lastContact: "Just added",
      };
      store.leads.unshift(newLead);
      return newLead;
    },

    async update(
      organizationId: string,
      id: string,
      data: Partial<Lead>
    ): Promise<Lead | null> {
      const store = getStoreForTenant(organizationId);
      const idx = store.leads.findIndex((l) => l.id === id);
      if (idx === -1) return null;
      store.leads[idx] = { ...store.leads[idx], ...data };
      return store.leads[idx];
    },

    async delete(organizationId: string, id: string): Promise<boolean> {
      const store = getStoreForTenant(organizationId);
      const initialLen = store.leads.length;
      store.leads = store.leads.filter((l) => l.id !== id);
      return store.leads.length < initialLen;
    },
  },

  // -----------------------------------------------------------
  // Campaigns
  // -----------------------------------------------------------
  campaigns: {
    async list(organizationId: string): Promise<Campaign[]> {
      const store = getStoreForTenant(organizationId);
      return store.campaigns;
    },

    async get(organizationId: string, id: string): Promise<Campaign | null> {
      const store = getStoreForTenant(organizationId);
      return store.campaigns.find((c) => c.id === id) || null;
    },

    async create(
      organizationId: string,
      data: Omit<Campaign, "id" | "callsCompleted" | "connectedRate" | "qualifiedRate">
    ): Promise<Campaign> {
      const store = getStoreForTenant(organizationId);
      const camp: Campaign = {
        ...data,
        id: `camp-${Date.now()}`,
        callsCompleted: 0,
        connectedRate: "0%",
        qualifiedRate: "0%",
      };
      store.campaigns.unshift(camp);
      return camp;
    },

    async update(
      organizationId: string,
      id: string,
      data: Partial<Campaign>
    ): Promise<Campaign | null> {
      const store = getStoreForTenant(organizationId);
      const idx = store.campaigns.findIndex((c) => c.id === id);
      if (idx === -1) return null;
      store.campaigns[idx] = { ...store.campaigns[idx], ...data };
      return store.campaigns[idx];
    },

    async delete(organizationId: string, id: string): Promise<boolean> {
      const store = getStoreForTenant(organizationId);
      const initialLen = store.campaigns.length;
      store.campaigns = store.campaigns.filter((c) => c.id !== id);
      return store.campaigns.length < initialLen;
    },
  },

  // -----------------------------------------------------------
  // Calls & Transcripts
  // -----------------------------------------------------------
  calls: {
    async list(
      organizationId: string,
      params?: { outcome?: string; sentiment?: string; search?: string }
    ): Promise<CallRecord[]> {
      const store = getStoreForTenant(organizationId);
      let items = [...store.calls];

      if (params?.outcome && params.outcome !== "All") {
        items = items.filter((c) => c.outcome === params.outcome);
      }

      if (params?.sentiment && params.sentiment !== "All") {
        items = items.filter((c) => c.sentiment === params.sentiment);
      }

      if (params?.search) {
        const s = params.search.toLowerCase();
        items = items.filter(
          (c) =>
            c.leadName.toLowerCase().includes(s) ||
            c.company.toLowerCase().includes(s) ||
            c.agentName.toLowerCase().includes(s)
        );
      }

      return items;
    },

    async get(organizationId: string, id: string): Promise<CallRecord | null> {
      const store = getStoreForTenant(organizationId);
      return store.calls.find((c) => c.id === id) || null;
    },

    async create(
      organizationId: string,
      data: Omit<CallRecord, "id" | "timestamp">
    ): Promise<CallRecord> {
      const store = getStoreForTenant(organizationId);
      const newCall: CallRecord = {
        ...data,
        id: `call-${Date.now()}`,
        timestamp: "Just now",
      };
      store.calls.unshift(newCall);
      return newCall;
    },
  },

  conversations: {
    async get(organizationId: string, callId: string): Promise<ConversationDetail | null> {
      const store = getStoreForTenant(organizationId);
      return store.conversations[callId] || store.conversations["call-1"] || null;
    },
  },

  // -----------------------------------------------------------
  // Appointments
  // -----------------------------------------------------------
  appointments: {
    async list(organizationId: string): Promise<Appointment[]> {
      const store = getStoreForTenant(organizationId);
      return store.appointments;
    },

    async create(
      organizationId: string,
      data: Omit<Appointment, "id" | "status" | "meetingLink">
    ): Promise<Appointment> {
      const store = getStoreForTenant(organizationId);
      const apt: Appointment = {
        ...data,
        id: `apt-${Date.now()}`,
        status: "Confirmed",
        meetingLink: "https://meet.google.com/sdm-auto-" + Math.random().toString(36).substring(2, 6),
      };
      store.appointments.unshift(apt);
      return apt;
    },

    async update(
      organizationId: string,
      id: string,
      data: Partial<Appointment>
    ): Promise<Appointment | null> {
      const store = getStoreForTenant(organizationId);
      const idx = store.appointments.findIndex((a) => a.id === id);
      if (idx === -1) return null;
      store.appointments[idx] = { ...store.appointments[idx], ...data };
      return store.appointments[idx];
    },
  },

  // -----------------------------------------------------------
  // Integrations
  // -----------------------------------------------------------
  integrations: {
    async list(organizationId: string): Promise<IntegrationItem[]> {
      const store = getStoreForTenant(organizationId);
      return store.integrations;
    },

    async toggle(organizationId: string, id: string): Promise<IntegrationItem | null> {
      const store = getStoreForTenant(organizationId);
      const item = store.integrations.find((i) => i.id === id);
      if (!item) return null;
      item.connected = !item.connected;
      item.lastSynced = item.connected ? "Just now" : undefined;
      return item;
    },
  },

  // -----------------------------------------------------------
  // Subscription & Billing
  // -----------------------------------------------------------
  billing: {
    async get(organizationId: string) {
      const store = getStoreForTenant(organizationId);
      return store.subscription;
    },

    async topup(organizationId: string, minutes: number) {
      const store = getStoreForTenant(organizationId);
      store.subscription.extraMinutes += minutes;
      return store.subscription;
    },
  },

  // -----------------------------------------------------------
  // API Keys
  // -----------------------------------------------------------
  apiKeys: {
    async list(organizationId: string) {
      const store = getStoreForTenant(organizationId);
      return store.apiKeys;
    },

    async create(organizationId: string, name: string) {
      const store = getStoreForTenant(organizationId);
      const randomPart = Math.random().toString(36).substring(2, 8);
      const newKey = {
        id: `key-${Date.now()}`,
        name,
        keyPrefix: `sm_live_${randomPart}...${Math.random().toString(36).substring(2, 6)}`,
        keyHash: `hash_${randomPart}`,
        created: "Just now",
        lastUsed: "Never",
      };
      store.apiKeys.unshift(newKey);
      return newKey;
    },

    async revoke(organizationId: string, id: string) {
      const store = getStoreForTenant(organizationId);
      store.apiKeys = store.apiKeys.filter((k) => k.id !== id);
      return true;
    },
  },
};
