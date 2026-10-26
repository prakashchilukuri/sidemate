"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Play,
  Pause,
  Clock,
  Bot,
  Trash2,
  PhoneCall,
  Sparkles,
  RotateCcw,
  Users,
  CheckCircle2,
  Calendar,
  AlertCircle,
  BarChart2,
  Flame,
  ArrowUpRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EmptyState, LoadingState, ErrorState } from "@/components/ui/state-view";
import { INITIAL_CAMPAIGNS, type Campaign, type AIEmployee } from "@/lib/demo-data";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [employees, setEmployees] = useState<AIEmployee[]>([]);
  const [runningBatchId, setRunningBatchId] = useState<string | null>(null);
  const [batchNotice, setBatchNotice] = useState<string | null>(null);

  // Create Campaign Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    agentName: "Ananya Rao (అనన్య)",
    leadsTargeted: 250,
    dialWindowStart: "10:00",
    dialWindowEnd: "18:30",
    dialTimezone: "IST",
    maxDailyDials: 250,
    retryAttempts: 3,
  });

  // Fetch campaigns and employees on mount
  useEffect(() => {
    fetch("/api/campaigns")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data)) {
          setCampaigns(resData.data);
        }
      })
      .catch((err) => console.error("Error fetching campaigns:", err));

    fetch("/api/ai-employees")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data)) {
          setEmployees(resData.data);
          if (resData.data.length > 0) {
            setNewCampaign((prev) => ({ ...prev, agentName: resData.data[0].name }));
          }
        }
      })
      .catch((err) => console.error("Error fetching employees for campaign:", err));
  }, []);

  // Toggle Campaign Run / Pause
  const toggleCampaignStatus = async (id: string, currentStatus: Campaign["status"]) => {
    const nextStatus = currentStatus === "Running" ? "Paused" : "Running";
    setCampaigns((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: nextStatus } : c))
    );

    try {
      await fetch(`/api/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus.toUpperCase() }),
      });
    } catch (err) {
      console.error("Error updating campaign status:", err);
    }
  };

  // Run Batch Outbound Dials
  const handleRunBatch = async (campaignId: string) => {
    setRunningBatchId(campaignId);
    setBatchNotice(null);

    try {
      const res = await fetch(`/api/campaigns/${campaignId}/run-batch`, {
        method: "POST",
      });
      const data = await res.json();

      if (data.success && data.data) {
        setCampaigns((prev) =>
          prev.map((c) => (c.id === campaignId ? data.data.campaign : c))
        );
        setBatchNotice(
          `🚀 Started calling ${data.data.dialsInitiated} customer contacts! Call history and reports updated.`
        );
      }
    } catch (err) {
      console.error("Batch runner error:", err);
    } finally {
      setRunningBatchId(null);
    }
  };

  // Create Campaign
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaign.name) return;

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCampaign.name,
          assignedAgentId: newCampaign.agentName,
          leadsTargeted: Number(newCampaign.leadsTargeted) || 250,
          dialWindowStart: newCampaign.dialWindowStart,
          dialWindowEnd: newCampaign.dialWindowEnd,
          dialTimezone: newCampaign.dialTimezone,
          maxDailyDials: Number(newCampaign.maxDailyDials) || 250,
          retryAttempts: Number(newCampaign.retryAttempts) || 3,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setCampaigns((prev) => [data.data, ...prev]);
      } else {
        const fallback: Campaign = {
          id: `camp-${Date.now()}`,
          name: newCampaign.name,
          status: "Running",
          agentName: newCampaign.agentName,
          leadsTargeted: Number(newCampaign.leadsTargeted) || 250,
          callsCompleted: 0,
          connectedRate: "0%",
          qualifiedRate: "0%",
          schedule: `${newCampaign.dialWindowStart} - ${newCampaign.dialWindowEnd} ${newCampaign.dialTimezone}`,
        };
        setCampaigns((prev) => [fallback, ...prev]);
      }
    } catch {
      const fallback: Campaign = {
        id: `camp-${Date.now()}`,
        name: newCampaign.name,
        status: "Running",
        agentName: newCampaign.agentName,
        leadsTargeted: Number(newCampaign.leadsTargeted) || 250,
        callsCompleted: 0,
        connectedRate: "0%",
        qualifiedRate: "0%",
        schedule: `${newCampaign.dialWindowStart} - ${newCampaign.dialWindowEnd} ${newCampaign.dialTimezone}`,
      };
      setCampaigns((prev) => [fallback, ...prev]);
    }

    setNewCampaign({
      name: "",
      agentName: employees[0]?.name || "Jordan Blake",
      leadsTargeted: 250,
      dialWindowStart: "09:30",
      dialWindowEnd: "17:00",
      dialTimezone: "EST",
      maxDailyDials: 250,
      retryAttempts: 3,
    });
    setCreateModalOpen(false);
  };

  // Delete Campaign
  const deleteCampaign = async (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    try {
      await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
    } catch (err) {
      console.error("Delete campaign error:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Calling Campaigns
            </h1>
            <Badge variant="default" size="sm">
              {campaigns.length} Active Lists
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted">
            Start automatic calling lists for your customers. Your AI voice agents dial numbers, speak politely in Telugu & regional languages, and record results.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
          >
            <Plus className="h-4 w-4" />
            Create Calling Campaign
          </Button>
        </div>
      </div>

      {/* Notice after running batch */}
      {batchNotice && (
        <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 flex items-center justify-between text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600 shrink-0" />
            <span>{batchNotice}</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setBatchNotice(null)}
            className="h-6 text-[10px]"
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((camp) => {
          const progressPercent = Math.min(
            100,
            Math.round(((camp.callsCompleted || 0) / (camp.leadsTargeted || 1)) * 100)
          );
          const isRunning = camp.status === "Running";
          const isBatchBusy = runningBatchId === camp.id;

          return (
            <Card
              key={camp.id}
              className="flex flex-col justify-between shadow-xs hover:shadow-sm transition-shadow border-border"
            >
              <CardContent className="p-5 space-y-4">
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-sm leading-tight text-foreground">
                      {camp.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                      <Bot className="h-3.5 w-3.5 text-indigo-600" />
                      <span>{camp.agentName}</span>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className={`text-[10px] font-medium ${
                      isRunning
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {camp.status}
                  </Badge>
                </div>

                {/* Dialing Schedule */}
                <div className="p-2.5 rounded-lg bg-muted/30 border text-xs flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                  <span className="truncate">{camp.schedule}</span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress: {progressPercent}%</span>
                    <span>
                      {camp.callsCompleted} / {camp.leadsTargeted} Dials
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Conversion Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t text-center">
                  <div className="p-2 rounded-lg bg-muted/20">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                      Connection Rate
                    </span>
                    <span className="font-bold text-sm text-foreground">{camp.connectedRate}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/20">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                      Qualified Rate
                    </span>
                    <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                      {camp.qualifiedRate}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleCampaignStatus(camp.id, camp.status)}
                      className="h-8 text-xs gap-1"
                    >
                      {isRunning ? (
                        <>
                          <Pause className="h-3.5 w-3.5" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-3.5 w-3.5" />
                          Resume
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => handleRunBatch(camp.id)}
                      disabled={isBatchBusy || !isRunning}
                      className="h-8 text-xs gap-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                      title="Initiate next batch of outbound dials"
                    >
                      {isBatchBusy ? (
                        <>
                          <RotateCcw className="h-3.5 w-3.5 animate-spin" />
                          Dialing...
                        </>
                      ) : (
                        <>
                          <PhoneCall className="h-3.5 w-3.5" />
                          Run Batch
                        </>
                      )}
                    </Button>
                  </div>

                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteCampaign(camp.id)}
                    className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                    title="Delete Campaign"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* MODAL: CREATE CAMPAIGN */}
      {/* ===================================================================== */}
      <Modal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        title="Create Outbound Dialing Campaign"
        description="Configure target prospect volumes, dial schedules, cadence limits, and assign an AI voice employee."
      >
        <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-medium">Campaign Name *</label>
            <Input
              required
              value={newCampaign.name}
              onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
              placeholder="e.g. Q4 Inbound Trial Follow-Up"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-medium">Assigned AI Employee</label>
              <select
                value={newCampaign.agentName}
                onChange={(e) => setNewCampaign({ ...newCampaign, agentName: e.target.value })}
                className="w-full rounded-md border bg-background px-3 py-2 text-xs"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.name}>
                    {emp.name} ({emp.role})
                  </option>
                ))}
                {employees.length === 0 && (
                  <>
                    <option value="Ananya Rao">Ananya Rao (Real Estate & Appointments)</option>
                    <option value="Suresh Kumar">Suresh Kumar (Wholesale & Trade)</option>
                    <option value="Harika Varma">Harika Varma (Clinic Reception)</option>
                    <option value="Venkat Prabhu">Venkat Prabhu (EMI & Payments)</option>
                  </>
                )}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-medium">Target Leads Count</label>
              <Input
                type="number"
                min={10}
                max={5000}
                value={newCampaign.leadsTargeted}
                onChange={(e) =>
                  setNewCampaign({
                    ...newCampaign,
                    leadsTargeted: parseInt(e.target.value) || 200,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-medium">Window Start</label>
              <Input
                type="time"
                value={newCampaign.dialWindowStart}
                onChange={(e) => setNewCampaign({ ...newCampaign, dialWindowStart: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium">Window End</label>
              <Input
                type="time"
                value={newCampaign.dialWindowEnd}
                onChange={(e) => setNewCampaign({ ...newCampaign, dialWindowEnd: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium">Timezone</label>
              <select
                value={newCampaign.dialTimezone}
                onChange={(e) => setNewCampaign({ ...newCampaign, dialTimezone: e.target.value })}
                className="w-full rounded-md border bg-background px-3 py-2 text-xs"
              >
                <option value="EST">Eastern (EST)</option>
                <option value="CST">Central (CST)</option>
                <option value="MST">Mountain (MST)</option>
                <option value="PST">Pacific (PST)</option>
                <option value="GMT">London (GMT)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-medium">Max Daily Dials</label>
              <Input
                type="number"
                min={10}
                max={1000}
                value={newCampaign.maxDailyDials}
                onChange={(e) =>
                  setNewCampaign({
                    ...newCampaign,
                    maxDailyDials: parseInt(e.target.value) || 250,
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <label className="font-medium">Voicemail Retry Limit</label>
              <select
                value={newCampaign.retryAttempts}
                onChange={(e) =>
                  setNewCampaign({
                    ...newCampaign,
                    retryAttempts: parseInt(e.target.value) || 3,
                  })
                }
                className="w-full rounded-md border bg-background px-3 py-2 text-xs"
              >
                <option value={1}>1 Retry</option>
                <option value={2}>2 Retries</option>
                <option value={3}>3 Retries (Recommended)</option>
                <option value={5}>5 Retries</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Launch Campaign
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
