"use client";

import { useState } from "react";
import {
  Building2,
  Users,
  Key,
  Bell,
  Phone,
  Plus,
  Trash2,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EmptyState, LoadingState, ErrorState } from "@/components/ui/state-view";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Member";
  status: "Active" | "Pending";
}

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  created: string;
  lastUsed: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "team" | "telephony" | "api" | "notifications">("general");
  const [viewState, setViewState] = useState<"normal" | "loading" | "empty" | "error">("normal");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // General Settings Form
  const [companyName, setCompanyName] = useState("Sri Balaji Enterprises (Hyderabad)");
  const [workspaceSlug, setWorkspaceSlug] = useState("sri-balaji-telugu-ai");
  const [timezone, setTimezone] = useState("Asia/Kolkata (IST)");
  const [callerId, setCallerId] = useState("+91 98480 12345");

  // Team State
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: "tm-1", name: "Srikanth Rao", email: "srikanth@balajienterprises.in", role: "Owner", status: "Active" },
    { id: "tm-2", name: "Anitha Reddy", email: "anitha@balajienterprises.in", role: "Admin", status: "Active" },
    { id: "tm-3", name: "Venu Madhav", email: "venu@balajienterprises.in", role: "Member", status: "Pending" },
  ]);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"Admin" | "Member">("Member");

  // API Keys State
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([
    { id: "key-1", name: "Production Backend Service", keyPrefix: "sm_live_9a8f...4e12", created: "Sep 12, 2026", lastUsed: "4 min ago" },
    { id: "key-2", name: "Zapier Lead Ingestion", keyPrefix: "sm_live_2b1c...99d1", created: "Oct 02, 2026", lastUsed: "Yesterday" },
  ]);
  const [newKeyModalOpen, setNewKeyModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Notification Toggles
  const [emailOnBooking, setEmailOnBooking] = useState(true);
  const [emailOnLowCredits, setEmailOnLowCredits] = useState(true);
  const [dailyDigest, setDailyDigest] = useState(false);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setTeamMembers([
      ...teamMembers,
      {
        id: `tm-${Date.now()}`,
        name: inviteEmail.split("@")[0],
        email: inviteEmail,
        role: inviteRole,
        status: "Pending",
      },
    ]);
    setInviteEmail("");
    setInviteModalOpen(false);
  };

  const removeMember = (id: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;

    setApiKeys([
      ...apiKeys,
      {
        id: `key-${Date.now()}`,
        name: newKeyName,
        keyPrefix: `sm_live_${Math.random().toString(36).substring(2, 6)}...${Math.random().toString(36).substring(2, 6)}`,
        created: "Just now",
        lastUsed: "Never",
      },
    ]);
    setNewKeyName("");
    setNewKeyModalOpen(false);
  };

  const revokeApiKey = (id: string) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
  };

  const copyKey = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Organization & Workspace Settings
            </h1>
            <Badge variant="default" size="sm">
              Admin Access
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted">
            Configure company domain credentials, team access, SIP trunks, API tokens, and alert subscriptions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* State view switcher */}
          <div className="inline-flex rounded-[var(--sm-radius-md)] border border-border bg-surface p-0.5 text-xs">
            {(["normal", "loading", "empty", "error"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setViewState(s)}
                className={`rounded-[var(--sm-radius-sm)] px-2 py-0.5 font-medium capitalize cursor-pointer ${
                  viewState === s ? "bg-primary text-white" : "text-muted hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center border-b border-border gap-1">
        {[
          { id: "general", label: "General & Org", icon: Building2 },
          { id: "team", label: "Team Members", icon: Users },
          { id: "telephony", label: "Calling Defaults", icon: Phone },
          { id: "api", label: "API Keys", icon: Key },
          { id: "notifications", label: "Alerts & Digest", icon: Bell },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as typeof activeTab)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === id
                ? "border-primary text-primary"
                : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* State View Rendering */}
      {viewState === "loading" && (
        <Card>
          <CardContent className="p-6">
            <LoadingState label="Loading tenant configuration schema..." rows={5} />
          </CardContent>
        </Card>
      )}

      {viewState === "empty" && (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              title="Settings Reset"
              description="Default settings restored."
              action={{
                label: "Restore Defaults",
                onClick: () => setViewState("normal"),
              }}
            />
          </CardContent>
        </Card>
      )}

      {viewState === "error" && (
        <Card>
          <CardContent className="p-8">
            <ErrorState
              title="Tenant Store Unavailable"
              description="Could not write updates to Prisma database."
              onRetry={() => setViewState("normal")}
            />
          </CardContent>
        </Card>
      )}

      {/* TAB 1: General */}
      {viewState === "normal" && activeTab === "general" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Company Profile & Tenant Identity</CardTitle>
            <CardDescription className="text-xs">
              Primary organization identifier and global regional defaults.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveGeneral} className="space-y-4 max-w-xl">
              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Company Name</label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foreground block mb-1">Workspace Subdomain</label>
                <div className="flex items-center">
                  <Input
                    value={workspaceSlug}
                    onChange={(e) => setWorkspaceSlug(e.target.value)}
                    className="rounded-r-none"
                  />
                  <span className="inline-flex h-10 items-center rounded-r-[var(--sm-radius-md)] border border-l-0 border-border bg-surface-sunken px-3 text-xs text-muted">
                    .sidemate.ai
                  </span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full rounded-[var(--sm-radius-md)] border border-border bg-surface p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option>America/New_York (EST)</option>
                    <option>America/Chicago (CST)</option>
                    <option>America/Los_Angeles (PST)</option>
                    <option>Europe/London (GMT)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-foreground block mb-1">Default Caller ID</label>
                  <Input
                    value={callerId}
                    onChange={(e) => setCallerId(e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between">
                {savedSuccess ? (
                  <span className="text-xs font-semibold text-success flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Preferences Saved!
                  </span>
                ) : (
                  <span />
                )}
                <Button type="submit" variant="primary" size="sm">
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: Team Members */}
      {viewState === "normal" && activeTab === "team" && (
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Workspace Team Members</CardTitle>
              <CardDescription className="text-xs">
                Invite colleagues to collaborate on AI employee scripts, view transcripts, and take calls.
              </CardDescription>
            </div>
            <Button
              variant="primary"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setInviteModalOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Invite Teammate
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-t border-border bg-surface-sunken/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-semibold">User</th>
                    <th className="px-5 py-3 font-semibold">Role</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {teamMembers.map((member) => (
                    <tr key={member.id} className="transition-colors hover:bg-surface-sunken/40">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-foreground text-xs">{member.name}</p>
                        <p className="text-[11px] text-muted">{member.email}</p>
                      </td>
                      <td className="px-5 py-3.5 text-xs font-medium text-foreground">
                        {member.role}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          variant={member.status === "Active" ? "success" : "warning"}
                          size="sm"
                        >
                          {member.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {member.role !== "Owner" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted hover:text-danger"
                            onClick={() => removeMember(member.id)}
                            title="Remove Member"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 3: Calling Defaults */}
      {viewState === "normal" && activeTab === "telephony" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Autonomous Dialing Safeguards</CardTitle>
            <CardDescription className="text-xs">
              Compliance rules, TCPA quiet hours, and AMD (Answering Machine Detection).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-w-xl text-xs">
            <div>
              <label className="font-medium text-foreground block mb-1">
                Compliant Calling Window
              </label>
              <Input defaultValue="09:00 AM - 05:30 PM (Lead Local Time)" />
            </div>

            <div>
              <label className="font-medium text-foreground block mb-1">
                Max Consecutive Retries Before Disqualification
              </label>
              <select className="w-full rounded-[var(--sm-radius-md)] border border-border bg-surface p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                <option>3 Call Attempts (Standard)</option>
                <option>5 Call Attempts (Aggressive)</option>
                <option>2 Call Attempts (Gentle)</option>
              </select>
            </div>

            <div className="rounded-[var(--sm-radius-md)] border border-border p-3 space-y-2 bg-surface-sunken/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Answering Machine Detection (AMD)</p>
                  <p className="text-muted text-[11px]">Automatically hang up or drop voicemail on beep</p>
                </div>
                <Badge variant="success" size="sm">Enabled</Badge>
              </div>
            </div>

            <Button variant="primary" size="sm" onClick={() => alert("Calling defaults saved!")}>
              Save Telephony Safeguards
            </Button>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: API Keys */}
      {viewState === "normal" && activeTab === "api" && (
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Workspace REST API Keys</CardTitle>
              <CardDescription className="text-xs">
                Authenticate server-to-server requests to initiate calls and query transcripts.
              </CardDescription>
            </div>
            <Button
              variant="primary"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => setNewKeyModalOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              Generate API Key
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-t border-border bg-surface-sunken/40 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Key Identifier</th>
                    <th className="px-5 py-3 font-semibold">Key Prefix</th>
                    <th className="px-5 py-3 font-semibold">Created</th>
                    <th className="px-5 py-3 font-semibold">Last Used</th>
                    <th className="px-5 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {apiKeys.map((key) => (
                    <tr key={key.id} className="transition-colors hover:bg-surface-sunken/40">
                      <td className="px-5 py-3.5 font-semibold text-xs text-foreground">
                        {key.name}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-muted">
                        {key.keyPrefix}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-muted">{key.created}</td>
                      <td className="px-5 py-3.5 text-xs text-muted">{key.lastUsed}</td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs gap-1"
                            onClick={() => copyKey(key.id, key.keyPrefix)}
                          >
                            <Copy className="h-3 w-3" />
                            {copiedKeyId === key.id ? "Copied" : "Copy"}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted hover:text-danger"
                            onClick={() => revokeApiKey(key.id)}
                            title="Revoke Token"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 5: Notifications */}
      {viewState === "normal" && activeTab === "notifications" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Alerts & Notification Preferences</CardTitle>
            <CardDescription className="text-xs">
              Choose when and how SideMate notifies your team.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 max-w-xl text-xs">
            <div className="flex items-center justify-between rounded-[var(--sm-radius-md)] border border-border p-3.5">
              <div>
                <p className="font-semibold text-foreground">Immediate Alert on Booked Meeting</p>
                <p className="text-muted text-[11px]">Send instant email with calendar invite and summary</p>
              </div>
              <input
                type="checkbox"
                checked={emailOnBooking}
                onChange={() => setEmailOnBooking(!emailOnBooking)}
                className="h-4 w-4 rounded border-border text-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between rounded-[var(--sm-radius-md)] border border-border p-3.5">
              <div>
                <p className="font-semibold text-foreground">Low Calling Minutes Balance Alert</p>
                <p className="text-muted text-[11px]">Notify admins when less than 20% of monthly minutes remain</p>
              </div>
              <input
                type="checkbox"
                checked={emailOnLowCredits}
                onChange={() => setEmailOnLowCredits(!emailOnLowCredits)}
                className="h-4 w-4 rounded border-border text-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between rounded-[var(--sm-radius-md)] border border-border p-3.5">
              <div>
                <p className="font-semibold text-foreground">Daily Executive Performance Digest</p>
                <p className="text-muted text-[11px]">Morning email with total dials, qualification %, and ROI</p>
              </div>
              <input
                type="checkbox"
                checked={dailyDigest}
                onChange={() => setDailyDigest(!dailyDigest)}
                className="h-4 w-4 rounded border-border text-primary cursor-pointer"
              />
            </div>

            <Button variant="primary" size="sm" onClick={() => alert("Notification settings saved!")}>
              Save Alert Preferences
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Invite Member Modal */}
      <Modal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite Team Member"
        description="Grant access to your SideMate dashboard workspace."
        maxWidth="md"
      >
        <form onSubmit={handleInviteMember} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Email Address *</label>
            <Input
              required
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@yourcompany.com"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Role Permissions</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as "Admin" | "Member")}
              className="w-full rounded-[var(--sm-radius-md)] border border-border bg-surface p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="Member">Member (View calls, edit own agents)</option>
              <option value="Admin">Admin (Full access, billing, and API tokens)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setInviteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Generate API Key Modal */}
      <Modal
        isOpen={newKeyModalOpen}
        onClose={() => setNewKeyModalOpen(false)}
        title="Create API Key"
        description="Issue a secret token to authorize REST API calls."
        maxWidth="md"
      >
        <form onSubmit={handleCreateApiKey} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Key Description *</label>
            <Input
              required
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              placeholder="e.g. Inbound CRM Webhook Trigger"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setNewKeyModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Generate Key
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
