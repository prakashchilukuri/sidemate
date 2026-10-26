"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Download,
  Plus,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EmptyState, LoadingState, ErrorState } from "@/components/ui/state-view";

export default function BillingPage() {
  const [viewState, setViewState] = useState<"normal" | "loading" | "empty" | "error">("normal");

  // Modals
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [selectedTopUp, setSelectedTopUp] = useState(2500);
  const [topUpSuccess, setTopUpSuccess] = useState(false);

  // Invoices demo in Indian Rupees
  const invoices = [
    { id: "INV-2026-009", date: "01 Oct 2026", amount: "₹9,999.00", status: "Paid", plan: "Growth Plan - Monthly (GST Included)" },
    { id: "INV-2026-008", date: "01 Sep 2026", amount: "₹9,999.00", status: "Paid", plan: "Growth Plan - Monthly (GST Included)" },
    { id: "INV-2026-007", date: "01 Aug 2026", amount: "₹9,999.00", status: "Paid", plan: "Growth Plan - Monthly (GST Included)" },
  ];

  const handleTopUpSubmit = () => {
    setTopUpSuccess(true);
    setTimeout(() => {
      setTopUpSuccess(false);
      setTopUpModalOpen(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Recharge & Balance (₹)
            </h1>
            <Badge variant="default" size="sm">
              Growth Plan Active
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted">
            Check your calling minutes balance, recharge extra minutes in Indian Rupees (₹), and download GST bills.
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
            onClick={() => setTopUpModalOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            Recharge Minutes (₹)
          </Button>

          <Button
            variant="primary"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => setUpgradeModalOpen(true)}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Change Plan
          </Button>
        </div>
      </div>

      {/* State View Rendering */}
      {viewState === "loading" && (
        <Card>
          <CardContent className="p-6">
            <LoadingState label="Loading your balance and payment details..." rows={5} />
          </CardContent>
        </Card>
      )}

      {viewState === "empty" && (
        <Card>
          <CardContent className="p-8">
            <EmptyState
              title="No Active Monthly Plan"
              description="Your account is currently in trial mode. Choose a plan to start making unlimited calls."
              action={{
                label: "Select Plan",
                onClick: () => {
                  setViewState("normal");
                  setUpgradeModalOpen(true);
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
              title="Payment Gateway Temporarily Offline"
              description="Could not load your latest UPI or card receipts. Please try again."
              onRetry={() => setViewState("normal")}
            />
          </CardContent>
        </Card>
      )}

      {/* Normal Billing Content */}
      {viewState === "normal" && (
        <>
          {/* Top Row: Plan Summary & Usage Meters */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Current Plan Card */}
            <Card className="border-primary/30 bg-primary-light/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">Your Current Plan</span>
                  <Badge variant="default" size="sm">Annual Saver</Badge>
                </div>
                <CardTitle className="text-2xl font-bold mt-1">Growth Plan</CardTitle>
                <CardDescription className="text-xs">
                  Best for real estate, clinics, retail shops & growing businesses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-foreground">₹9,999</span>
                  <span className="text-xs text-muted">/ month (GST incl.)</span>
                </div>

                <div className="space-y-2 text-xs text-muted">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>2,500 Telugu calling minutes included per month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Up to 10 active Telugu AI staff callers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>Instant WhatsApp brochure & location sharing</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-primary/20 flex items-center justify-between text-xs text-muted">
                  <span>Renews on 01 Nov 2026</span>
                  <button
                    onClick={() => setUpgradeModalOpen(true)}
                    className="text-primary font-semibold hover:underline cursor-pointer"
                  >
                    Change Plan
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Usage Meters */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Monthly Calling Minutes & Staff Seats</CardTitle>
                <CardDescription className="text-xs">
                  Your minutes reset automatically on the 1st of every month. Unused recharge minutes never expire.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Meter 1: Calling Minutes */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-foreground">Telugu Calling Minutes Used</span>
                    <span className="text-muted">
                      <strong className="text-foreground">1,640</strong> / 2,500 mins used (65%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-sunken overflow-hidden">
                    <div className="h-full rounded-full bg-primary" style={{ width: "65%" }} />
                  </div>
                </div>

                {/* Meter 2: Active AI Employees */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-foreground">Active AI Voice Agents</span>
                    <span className="text-muted">
                      <strong className="text-foreground">4</strong> / 10 agents on duty
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-sunken overflow-hidden">
                    <div className="h-full rounded-full bg-success" style={{ width: "40%" }} />
                  </div>
                </div>

                {/* Meter 3: Concurrent Dialing Lines */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-foreground">Calls Ringing at the Same Time</span>
                    <span className="text-muted">
                      <strong className="text-foreground">2</strong> / 5 simultaneous lines
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-sunken overflow-hidden">
                    <div className="h-full rounded-full bg-info" style={{ width: "40%" }} />
                  </div>
                </div>

                <div className="rounded-[var(--sm-radius-md)] bg-surface-sunken p-3 flex items-center justify-between text-xs">
                  <span className="text-muted">Running low on calling minutes this month?</span>
                  <Button
                    variant="primary"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setTopUpModalOpen(true)}
                  >
                    Recharge Minutes Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Method & Invoices */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Payment Method */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Payment Details</CardTitle>
                <CardDescription className="text-xs">UPI & Card details used for monthly renewals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-[var(--sm-radius-md)] border border-border p-3 bg-surface-sunken/40">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-12 items-center justify-center rounded bg-primary text-white font-bold text-xs">
                      UPI
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">srikanth@okhdfcbank</p>
                      <p className="text-[11px] text-muted">Auto-pay Active via UPI / RuPay</p>
                    </div>
                  </div>
                  <Badge variant="success" size="sm">Active</Badge>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => alert("UPI / Card update options opened via Razorpay.")}
                >
                  Change Payment Method / UPI ID
                </Button>
              </CardContent>
            </Card>

            {/* Invoices History */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">GST Invoices & Payment History</CardTitle>
                <CardDescription className="text-xs">Download official tax invoices with your business GST number</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-t border-border bg-surface-sunken/40 text-xs uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-5 py-3 font-semibold">Invoice No</th>
                        <th className="px-5 py-3 font-semibold">Date</th>
                        <th className="px-5 py-3 font-semibold">Plan Description</th>
                        <th className="px-5 py-3 font-semibold">Amount (₹)</th>
                        <th className="px-5 py-3 font-semibold">Payment Status</th>
                        <th className="px-5 py-3 font-semibold text-right">Download Bill</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="transition-colors hover:bg-surface-sunken/40">
                          <td className="px-5 py-3 font-mono text-xs font-medium text-foreground">
                            {inv.id}
                          </td>
                          <td className="px-5 py-3 text-xs text-muted">{inv.date}</td>
                          <td className="px-5 py-3 text-xs text-foreground">{inv.plan}</td>
                          <td className="px-5 py-3 text-xs font-semibold text-foreground">{inv.amount}</td>
                          <td className="px-5 py-3">
                            <Badge variant="success" size="sm">
                              {inv.status}
                            </Badge>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button
                              onClick={() => alert(`Downloading GST Bill PDF for ${inv.id}`)}
                              className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Download className="h-3 w-3" />
                              GST PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Top-up Credits Modal */}
      <Modal
        isOpen={topUpModalOpen}
        onClose={() => setTopUpModalOpen(false)}
        title="Recharge Telugu Calling Minutes"
        description="Add instant prepaid calling balance. Minutes never expire."
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { amount: 1000, mins: "1,000 Mins", perMin: "₹1.00/min" },
              { amount: 2500, mins: "2,750 Mins", perMin: "₹0.90/min", bonus: "10% Extra" },
              { amount: 5000, mins: "6,000 Mins", perMin: "₹0.83/min", bonus: "20% Extra" },
            ].map((pkg) => (
              <div
                key={pkg.amount}
                onClick={() => setSelectedTopUp(pkg.amount)}
                className={`rounded-[var(--sm-radius-md)] border p-3 text-center transition-all cursor-pointer ${
                  selectedTopUp === pkg.amount
                    ? "border-primary bg-primary-light/50 ring-1 ring-primary"
                    : "border-border bg-surface hover:bg-surface-sunken"
                }`}
              >
                <p className="text-lg font-bold text-foreground">₹{pkg.amount.toLocaleString("en-IN")}</p>
                <p className="text-xs font-semibold text-primary">{pkg.mins}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{pkg.perMin}</p>
                {pkg.bonus && (
                  <Badge variant="success" size="sm" className="mt-1 text-[9px] py-0">
                    {pkg.bonus}
                  </Badge>
                )}
              </div>
            ))}
          </div>

          <div className="rounded-[var(--sm-radius-md)] bg-surface-sunken p-3 text-xs text-muted flex items-center justify-between">
            <span>Pay via: <strong>UPI / NetBanking / RuPay</strong></span>
            <span>Total: <strong className="text-foreground">₹{selectedTopUp.toLocaleString("en-IN")}</strong></span>
          </div>

          {topUpSuccess ? (
            <div className="rounded-[var(--sm-radius-md)] bg-success/10 border border-success/30 p-3 text-center text-xs font-semibold text-success">
              ₹{selectedTopUp.toLocaleString("en-IN")} Added Successfully to Calling Balance!
            </div>
          ) : (
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setTopUpModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleTopUpSubmit}
              >
                Pay ₹{selectedTopUp.toLocaleString("en-IN")} via UPI
              </Button>
            </div>
          )}
        </div>
      </Modal>

      {/* Upgrade Plan Modal */}
      <Modal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        title="Change Your Monthly Calling Plan"
        description="Choose the plan that fits how many calls you make every month."
        maxWidth="lg"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { name: "Starter Plan", price: "₹3,999", mins: "800 mins/mo", agents: "2 AI Voice Agents", current: false },
            { name: "Growth Plan", price: "₹9,999", mins: "2,500 mins/mo", agents: "10 AI Voice Agents", current: true },
            { name: "Scale Plan", price: "₹24,999", mins: "7,500 mins/mo", agents: "Unlimited Agents", current: false },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-[var(--sm-radius-lg)] border p-4 space-y-3 ${
                plan.current
                  ? "border-primary bg-primary-light/30 ring-1 ring-primary"
                  : "border-border bg-surface"
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground text-sm">{plan.name}</h4>
                {plan.current && <Badge variant="default" size="sm">Current Plan</Badge>}
              </div>
              <p className="text-2xl font-bold text-foreground">
                {plan.price}<span className="text-xs text-muted font-normal">/month</span>
              </p>
              <ul className="text-xs text-muted space-y-1">
                <li>• {plan.mins}</li>
                <li>• {plan.agents}</li>
                <li>• WhatsApp Location & Brochure Sync</li>
                <li>• Full Telugu Call Transcripts</li>
              </ul>
              <Button
                size="sm"
                variant={plan.current ? "secondary" : "primary"}
                className="w-full text-xs"
                disabled={plan.current}
                onClick={() => {
                  alert(`Plan changed to ${plan.name}!`);
                  setUpgradeModalOpen(false);
                }}
              >
                {plan.current ? "Current Plan" : `Select ${plan.name}`}
              </Button>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
