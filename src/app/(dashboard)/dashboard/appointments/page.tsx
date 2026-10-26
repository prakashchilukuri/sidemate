"use client";

import { useState } from "react";
import {
  Plus,
  Video,
  CheckCircle2,
  Bot,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EmptyState, LoadingState, ErrorState } from "@/components/ui/state-view";
import { INITIAL_APPOINTMENTS, type Appointment } from "@/lib/demo-data";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [viewState, setViewState] = useState<"normal" | "loading" | "empty" | "error">("normal");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // New Booking Modal
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [newBooking, setNewBooking] = useState({
    leadName: "",
    company: "",
    agentName: "Ananya Rao (అనన్య)",
    date: "2026-10-24",
    time: "11:00 AM - 12:00 PM IST",
    type: "Site Visit / Customer Meeting",
  });

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBooking.leadName) return;

    const booking: Appointment = {
      id: `apt-${Date.now()}`,
      leadName: newBooking.leadName,
      company: newBooking.company || "Company",
      agentName: newBooking.agentName,
      date: newBooking.date,
      time: newBooking.time,
      duration: "30 mins",
      type: newBooking.type,
      status: "Confirmed",
      meetingLink: "https://maps.google.com/?q=Customer+Visit",
    };

    setAppointments([booking, ...appointments]);
    setBookingModalOpen(false);
  };

  const cancelAppointment = (id: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Cancelled" as const } : a))
    );
  };

  const copyMeetingLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Booked Meetings & Visits
            </h1>
            <Badge variant="default" size="sm">
              Calendar Sync Active
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted">
            All customer site visits, doctor appointments, and meetings booked in Telugu by your AI staff.
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
            variant="primary"
            size="sm"
            className="gap-1.5 shadow-sm"
            onClick={() => setBookingModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Book Manual Meeting
          </Button>
        </div>
      </div>

      {/* State View Rendering */}
      {viewState === "loading" && (
        <Card>
          <CardContent className="p-6">
            <LoadingState label="Syncing calendar appointments..." rows={5} />
          </CardContent>
        </Card>
      )}

      {viewState === "empty" && (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              title="No Upcoming Appointments"
              description="Your AI employees have not scheduled any appointments yet. Enable calendar booking in your AI employee wizard."
              action={{
                label: "Create Manual Booking",
                onClick: () => {
                  setViewState("normal");
                  setBookingModalOpen(true);
                },
              }}
            />
          </CardContent>
        </Card>
      )}

      {viewState === "error" && (
        <Card>
          <CardContent className="p-8">
            <ErrorState
              title="Google Calendar Integration Timeout"
              description="OAuth token expired. Re-authenticate your calendar integration."
              onRetry={() => setViewState("normal")}
            />
          </CardContent>
        </Card>
      )}

      {/* Normal Appointments View */}
      {viewState === "normal" && (
        <>
          {/* Stat Meters */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-5">
                <span className="text-xs font-semibold text-muted uppercase">Booked This Week</span>
                <p className="mt-2 text-2xl font-bold text-foreground">14 Meetings</p>
                <span className="text-xs text-success font-medium">+3 vs last week</span>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <span className="text-xs font-semibold text-muted uppercase">Show-Up Rate</span>
                <p className="mt-2 text-2xl font-bold text-foreground">91.4%</p>
                <span className="text-xs text-muted">Via automated SMS reminders</span>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <span className="text-xs font-semibold text-muted uppercase">Top Booking Agent</span>
                <p className="mt-2 text-xl font-bold text-primary truncate">Sarah Jenkins</p>
                <span className="text-xs text-muted">9 bookings this cycle</span>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <span className="text-xs font-semibold text-muted uppercase">Calendar Sync</span>
                <p className="mt-2 text-xl font-bold text-success flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Connected
                </p>
                <span className="text-xs text-muted">Google Calendar round-robin</span>
              </CardContent>
            </Card>
          </div>

          {/* Appointments Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Scheduled Meetings</CardTitle>
              <CardDescription className="text-xs">
                Upcoming demos, discovery syncs, and client calls booked by autonomous voice agents.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-t border-border bg-surface-sunken/40 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Lead Contact</th>
                      <th className="px-5 py-3 font-semibold">Meeting Subject</th>
                      <th className="px-5 py-3 font-semibold">Booked By</th>
                      <th className="px-5 py-3 font-semibold">Date & Time</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {appointments.map((apt) => (
                      <tr key={apt.id} className="transition-colors hover:bg-surface-sunken/40">
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-foreground">{apt.leadName}</p>
                          <p className="text-xs text-muted">{apt.company}</p>
                        </td>
                        <td className="px-5 py-3.5 text-xs font-medium text-foreground">
                          {apt.type}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-muted">
                          <span className="flex items-center gap-1">
                            <Bot className="h-3.5 w-3.5 text-primary" />
                            {apt.agentName}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs">
                          <p className="font-medium text-foreground">{apt.date}</p>
                          <p className="text-muted text-[11px] font-mono">{apt.time}</p>
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge
                            variant={apt.status === "Confirmed" ? "success" : "outline"}
                            size="sm"
                          >
                            {apt.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-7 px-2.5 text-xs gap-1"
                              onClick={() => copyMeetingLink(apt.meetingLink, apt.id)}
                            >
                              <Video className="h-3 w-3 text-primary" />
                              {copiedLink === apt.id ? "Copied" : "Join URL"}
                            </Button>

                            {apt.status === "Confirmed" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs text-danger hover:bg-danger/10"
                                onClick={() => cancelAppointment(apt.id)}
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Manual Booking Modal */}
      <Modal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        title="Schedule Manual Meeting"
        description="Book a demo slot directly on your team calendar."
        maxWidth="md"
      >
        <form onSubmit={handleCreateBooking} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Lead Name *</label>
              <Input
                required
                value={newBooking.leadName}
                onChange={(e) => setNewBooking({ ...newBooking, leadName: e.target.value })}
                placeholder="e.g. Liam Foster"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Company</label>
              <Input
                value={newBooking.company}
                onChange={(e) => setNewBooking({ ...newBooking, company: e.target.value })}
                placeholder="e.g. TechCorp"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Meeting Date</label>
              <Input
                type="date"
                value={newBooking.date}
                onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Time Slot</label>
              <Input
                value={newBooking.time}
                onChange={(e) => setNewBooking({ ...newBooking, time: e.target.value })}
                placeholder="2:00 PM - 2:30 PM EST"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Meeting Objective</label>
            <Input
              value={newBooking.type}
              onChange={(e) => setNewBooking({ ...newBooking, type: e.target.value })}
              placeholder="e.g. Enterprise Architecture Review"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setBookingModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Confirm & Dispatch Invite
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
