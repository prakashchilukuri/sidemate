"use client";

import { useState } from "react";
import {
  Send,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EmptyState, LoadingState, ErrorState } from "@/components/ui/state-view";
import { INITIAL_INTEGRATIONS, type IntegrationItem } from "@/lib/demo-data";

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>(INITIAL_INTEGRATIONS);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeTab, setActiveTab] = useState<"apps" | "webhooks">("apps");
  const [viewState, setViewState] = useState<"normal" | "loading" | "empty" | "error">("normal");

  // Webhook Test Modal
  const [testPayloadModalOpen, setTestPayloadModalOpen] = useState(false);
  const [testResponseStatus, setTestResponseStatus] = useState<number | null>(null);

  // New Webhook Modal
  const [addWebhookOpen, setAddWebhookOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("https://api.acme.com/v1/sidemate/events");
  const [webhookEvents, setWebhookEvents] = useState("call.completed, meeting.booked");

  const toggleIntegration = (id: string) => {
    setIntegrations((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, connected: !item.connected } : item
      )
    );
  };

  const filteredIntegrations = integrations.filter(
    (item) => activeCategory === "All" || item.category === activeCategory
  );

  const handleTestWebhook = () => {
    setTestPayloadModalOpen(true);
    setTestResponseStatus(null);
    setTimeout(() => {
      setTestResponseStatus(200);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Connected Apps & Tools
            </h1>
            <Badge variant="default" size="sm">
              {integrations.filter((i) => i.connected).length} Connected
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted">
            Connect WhatsApp, Google Calendar, Sheets, and your Indian phone numbers to automate customer calls.
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

          <Button
            variant="secondary"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={handleTestWebhook}
          >
            <Send className="h-3.5 w-3.5" />
            Send Test Webhook
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-border">
        <button
          onClick={() => setActiveTab("apps")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === "apps"
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          Connected Applications & CRMs
        </button>
        <button
          onClick={() => setActiveTab("webhooks")}
          className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === "webhooks"
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-foreground"
          }`}
        >
          Real-Time Webhooks & APIs
        </button>
      </div>

      {/* State View Rendering */}
      {viewState === "loading" && (
        <Card>
          <CardContent className="p-6">
            <LoadingState label="Checking OAuth integration tokens..." rows={5} />
          </CardContent>
        </Card>
      )}

      {viewState === "empty" && (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              title="No Integrations Found"
              description="No third-party integrations configured."
              action={{
                label: "Reset Integrations",
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
              title="OAuth Marketplace Sync Failed"
              description="Unable to contact integration provider registry."
              onRetry={() => setViewState("normal")}
            />
          </CardContent>
        </Card>
      )}

      {/* APPS TAB */}
      {viewState === "normal" && activeTab === "apps" && (
        <div className="space-y-4">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {["All", "CRM", "Calendar", "Communication", "Automation"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-[var(--sm-radius-md)] px-3 py-1 text-xs font-medium border transition-colors cursor-pointer ${
                  activeCategory === cat
                    ? "border-primary bg-primary-light text-primary font-semibold"
                    : "border-border bg-surface text-muted hover:bg-surface-sunken"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredIntegrations.map((item) => (
              <Card key={item.id} className="transition-all hover:shadow-sm">
                <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[var(--sm-radius-md)] bg-primary-light text-primary font-bold text-xs">
                          {item.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-foreground">{item.name}</h4>
                          <span className="text-[11px] text-muted">{item.category}</span>
                        </div>
                      </div>

                      <Badge
                        variant={item.connected ? "success" : "outline"}
                        size="sm"
                      >
                        {item.connected ? "Active" : "Available"}
                      </Badge>
                    </div>

                    <p className="mt-3 text-xs text-muted leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-[11px] text-muted-foreground">
                      {item.lastSynced ? `Sync: ${item.lastSynced}` : "Not configured"}
                    </span>

                    <Button
                      size="sm"
                      variant={item.connected ? "secondary" : "primary"}
                      className="h-8 text-xs"
                      onClick={() => toggleIntegration(item.id)}
                    >
                      {item.connected ? "Disconnect" : "Connect"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* WEBHOOKS TAB */}
      {viewState === "normal" && activeTab === "webhooks" && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold">Active Webhook Listeners</CardTitle>
                <CardDescription className="text-xs">
                  Subscribe your server to event topics like call completions, meeting bookings, and transcript readiness.
                </CardDescription>
              </div>
              <Button
                size="sm"
                variant="primary"
                className="gap-1.5 text-xs"
                onClick={() => setAddWebhookOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                Add Endpoint
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-[var(--sm-radius-lg)] border border-border p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-surface-sunken/40">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-foreground">
                      https://api.vancetech.io/webhooks/sidemate
                    </span>
                    <Badge variant="success" size="sm">
                      200 OK (Healthy)
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    Events subscribed: <code className="text-primary">call.completed</code>, <code className="text-primary">meeting.scheduled</code>, <code className="text-primary">lead.qualified</code>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleTestWebhook}
                  >
                    Test Ping
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Test Webhook Modal */}
      <Modal
        isOpen={testPayloadModalOpen}
        onClose={() => setTestPayloadModalOpen(false)}
        title="Simulated Webhook Event Dispatched"
        description="Payload structure transmitted on 'call.completed' trigger."
        maxWidth="lg"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span>Target: <strong>https://api.vancetech.io/webhooks/sidemate</strong></span>
            {testResponseStatus === 200 ? (
              <Badge variant="success" size="sm">Status: 200 OK (38ms)</Badge>
            ) : (
              <Badge variant="outline" size="sm">Transmitting...</Badge>
            )}
          </div>

          <pre className="rounded-[var(--sm-radius-md)] bg-[#0C0C14] p-4 text-[11px] font-mono text-green-400 overflow-x-auto">
{`{
  "event": "call.completed",
  "timestamp": "2026-10-12T02:40:00Z",
  "data": {
    "call_id": "call-1",
    "agent_name": "Sarah Jenkins",
    "lead": {
      "name": "Marcus Vance",
      "company": "Apex HyperScale",
      "phone": "+1 (415) 890-2134"
    },
    "duration_seconds": 252,
    "outcome": "Meeting Booked",
    "sentiment": "Positive",
    "meeting_scheduled": {
      "time": "2026-10-15T15:00:00-05:00",
      "calendar_url": "https://meet.google.com/sdm-demo-apex"
    }
  }
}`}
          </pre>

          <div className="flex justify-end pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setTestPayloadModalOpen(false)}
            >
              Close Inspector
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Webhook Modal */}
      <Modal
        isOpen={addWebhookOpen}
        onClose={() => setAddWebhookOpen(false)}
        title="Add Webhook Endpoint"
        description="Enter your HTTPS endpoint to receive event webhooks."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Destination URL *
            </label>
            <Input
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://your-domain.com/webhooks"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Event Subscriptions
            </label>
            <Input
              value={webhookEvents}
              onChange={(e) => setWebhookEvents(e.target.value)}
              placeholder="call.completed, meeting.booked"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setAddWebhookOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setAddWebhookOpen(false)}
            >
              Save Endpoint
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
