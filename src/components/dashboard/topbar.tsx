"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Search,
  Menu,
  Check,
  Trash2,
  ExternalLink,
  User,
  CreditCard,
  Settings,
  LogOut,
  Bot,
  Users,
  Megaphone,
  Wallet,
} from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

interface TopbarProps {
  onMobileMenuToggle: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "call" | "lead" | "system";
}

const initialNotifications: NotificationItem[] = [
  {
    id: "n1",
    title: "Site Visit Booked",
    message: "Ananya AI (Telugu) booked a site visit with Rajesh Goud for Shankarpally open plots.",
    time: "5 min ago",
    read: false,
    type: "call",
  },
  {
    id: "n2",
    title: "Calling Target Reached",
    message: "Vijayawada Clinic Campaign completed 150 calls today with 46% bookings.",
    time: "1 hour ago",
    read: false,
    type: "system",
  },
  {
    id: "n3",
    title: "Phone Numbers Imported",
    message: "125 customer numbers imported from Excel sheet under 'Hyderabad Real Estate Inquiries'.",
    time: "3 hours ago",
    read: true,
    type: "lead",
  },
  {
    id: "n4",
    title: "Calling Balance Alert",
    message: "You have used 65% of your included calling minutes. Recharge anytime in ₹.",
    time: "Yesterday",
    read: true,
    type: "system",
  },
];

export function Topbar({ onMobileMenuToggle }: TopbarProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Quick navigation items for search
  const quickItems = [
    { label: "Ananya Rao — Real Estate Caller (Telugu)", type: "AI Caller", href: "/dashboard/ai-employees", icon: Bot },
    { label: "Rajesh Goud (Hyderabad)", type: "Customer Contact", href: "/dashboard/leads", icon: Users },
    { label: "Hyderabad Open Plots Calling Drive", type: "Campaign", href: "/dashboard/campaigns", icon: Megaphone },
    { label: "Call Recordings & Telugu Notes", type: "Recordings", href: "/dashboard/conversations", icon: ExternalLink },
    { label: "WhatsApp & UPI Integrations", type: "Connected Apps", href: "/dashboard/integrations", icon: ExternalLink },
    { label: "Recharge & Invoices (₹)", type: "Billing", href: "/dashboard/billing", icon: CreditCard },
  ];

  const filteredQuickItems = quickItems.filter(
    (item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-surface/80 backdrop-blur-lg px-4 sm:px-6">
      {/* Mobile menu button */}
      <button
        className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--sm-radius-md)] text-muted hover:bg-surface-sunken lg:hidden cursor-pointer"
        onClick={onMobileMenuToggle}
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Interactive Search Bar Trigger */}
      <div className="hidden flex-1 sm:block max-w-md">
        <button
          onClick={() => setSearchModalOpen(true)}
          className="flex h-10 w-full items-center justify-between rounded-[var(--sm-radius-md)] border border-border bg-surface-sunken/60 px-3 text-sm text-muted-foreground hover:border-primary/40 hover:bg-surface-sunken transition-colors cursor-pointer text-left"
        >
          <span className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span>Search employees, leads, calls...</span>
          </span>
          <kbd className="hidden rounded bg-surface px-1.5 py-0.5 text-[10px] font-semibold text-muted border border-border md:inline-block">
            ⌘K
          </kbd>
        </button>
      </div>

      <div className="flex-1 sm:hidden">
        <button
          onClick={() => setSearchModalOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-[var(--sm-radius-md)] text-muted hover:bg-surface-sunken"
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Live Call Telemetry Pill */}
        <div className="hidden xl:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium">2 Callers Active • Sub-350ms Audio</span>
        </div>

        {/* Wallet Credit Balance Pill */}
        <Link
          href="/dashboard/billing"
          className="hidden md:flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300 hover:bg-indigo-500/20 transition-colors"
          title="Click to recharge wallet"
        >
          <Wallet className="h-3.5 w-3.5 text-indigo-400" />
          <span className="font-bold text-foreground">₹4,850.00</span>
          <span className="text-[10px] text-indigo-400 font-semibold bg-indigo-500/20 px-1.5 py-0.2 rounded-full">
            + Recharge
          </span>
        </Link>

        <ThemeToggle />

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="Notifications"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </Button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-[var(--sm-radius-xl)] border border-border bg-surface shadow-xl z-50 overflow-hidden animate-in fade-in-50 duration-150">
              <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-surface-sunken/30">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-foreground">Notifications</h4>
                  {unreadCount > 0 && (
                    <Badge variant="default" size="sm">
                      {unreadCount} new
                    </Badge>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="h-3 w-3" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-border">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start justify-between gap-3 p-3.5 transition-colors ${
                        n.read ? "bg-surface" : "bg-primary-light/20"
                      } hover:bg-surface-sunken/60`}
                    >
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground">
                            {n.title}
                          </span>
                          {!n.read && (
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="mt-0.5 text-xs text-muted leading-relaxed">
                          {n.message}
                        </p>
                        <span className="mt-1 block text-[10px] text-muted-foreground">
                          {n.time}
                        </span>
                      </div>
                      <button
                        onClick={() => clearNotification(n.id)}
                        className="text-muted-foreground hover:text-danger p-1 cursor-pointer"
                        title="Dismiss"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-border p-2 bg-surface-sunken/20 text-center">
                <Link
                  href="/dashboard/calls"
                  onClick={() => setNotificationsOpen(false)}
                  className="text-xs text-muted hover:text-foreground font-medium"
                >
                  View all activity history &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Menu Dropdown */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 rounded-full p-0.5 hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer"
            aria-label="User profile menu"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-text shadow-xs">
              AV
            </div>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-[var(--sm-radius-xl)] border border-border bg-surface p-2 shadow-xl z-50 animate-in fade-in-50 duration-150">
              <div className="border-b border-border px-3 py-2.5 mb-1">
                <p className="text-sm font-semibold text-foreground">Srikanth Rao</p>
                <p className="text-xs text-muted truncate">srikanth@balajienterprises.in</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-muted">Business:</span>
                  <Badge variant="outline" size="sm" className="text-[10px]">
                    Sri Balaji Enterprises (Hyderabad)
                  </Badge>
                </div>
              </div>

              <div className="space-y-0.5">
                <Link
                  href="/dashboard/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-[var(--sm-radius-md)] px-3 py-2 text-xs font-medium text-muted hover:bg-surface-sunken hover:text-foreground transition-colors"
                >
                  <User className="h-4 w-4" />
                  Profile & Team
                </Link>
                <Link
                  href="/dashboard/billing"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-[var(--sm-radius-md)] px-3 py-2 text-xs font-medium text-muted hover:bg-surface-sunken hover:text-foreground transition-colors"
                >
                  <CreditCard className="h-4 w-4" />
                  Billing & Credits
                </Link>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-[var(--sm-radius-md)] px-3 py-2 text-xs font-medium text-muted hover:bg-surface-sunken hover:text-foreground transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Workspace Settings
                </Link>
              </div>

              <div className="border-t border-border mt-1 pt-1">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    router.push("/");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-[var(--sm-radius-md)] px-3 py-2 text-xs font-medium text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Exit to Landing Page
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Quick Search Modal */}
      <Modal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        title="Quick Search"
        description="Jump to any AI employee, lead, or dashboard section."
        maxWidth="lg"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, role, campaign, or lead..."
              className="pl-9 h-11"
            />
          </div>

          <div className="space-y-1 max-h-64 overflow-y-auto">
            {filteredQuickItems.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted">
                No matching results found for &ldquo;{searchQuery}&rdquo;
              </p>
            ) : (
              filteredQuickItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    setSearchModalOpen(false);
                    router.push(item.href);
                  }}
                  className="flex w-full items-center justify-between rounded-[var(--sm-radius-md)] p-2.5 text-left hover:bg-surface-sunken transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-[var(--sm-radius-sm)] bg-primary-light text-primary">
                      <item.icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted">{item.type}</p>
                    </div>
                  </div>
                  <span className="text-xs text-primary font-medium">&rarr;</span>
                </button>
              ))
            )}
          </div>
        </div>
      </Modal>
    </header>
  );
}
