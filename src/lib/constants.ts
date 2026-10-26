export const APP_NAME = "SideMate";
export const APP_DESCRIPTION =
  "Telugu AI Voice Calling for Indian businesses. Automatic phone calls in natural Telugu & English, customer follow-ups, and appointment bookings in Indian Rupees (₹).";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Telugu Voice Demo", href: "#voice-demo" },
  { label: "Pricing in ₹", href: "#pricing" },
] as const;

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
  badgeVariant?: "live" | "count" | "currency" | "purple";
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const DASHBOARD_NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
      { label: "My Employees", href: "/dashboard/ai-employees", icon: "Users", badge: "3", badgeVariant: "purple" },
      { label: "New employee", href: "/dashboard/ai-employees/new", icon: "Plus" },
      { label: "Talk to an employee", href: "/dashboard/calls", icon: "PhoneCall" },
    ],
  },
  {
    title: "Calling",
    items: [
      { label: "Instant Leads", href: "/dashboard/leads", icon: "Zap" },
      { label: "Bulk Campaigns", href: "/dashboard/campaigns", icon: "Megaphone" },
      { label: "Inbound Calls", href: "/dashboard/calls", icon: "PhoneIncoming" },
    ],
  },
  {
    title: "Results & Setup",
    items: [
      { label: "Leads & Results", href: "/dashboard/leads", icon: "Layers" },
      { label: "All Conversations", href: "/dashboard/conversations", icon: "MessageSquare" },
      { label: "Train Employees", href: "/dashboard/integrations", icon: "BookOpen" },
      { label: "Phone Numbers", href: "/dashboard/integrations", icon: "Phone" },
      { label: "Performance", href: "/dashboard", icon: "BarChart2" },
      { label: "Billing", href: "/dashboard/billing", icon: "CreditCard" },
      { label: "Settings", href: "/dashboard/settings", icon: "Settings" },
      { label: "Developers", href: "/dashboard/integrations", icon: "Code2" },
    ],
  },
];

export const DASHBOARD_NAV = DASHBOARD_NAV_SECTIONS.flatMap((s) => s.items);

export const DASHBOARD_NAV_BOTTOM: NavItem[] = [
  { label: "Recharge & Wallet (₹)", href: "/dashboard/billing", icon: "Wallet", badge: "₹18,450", badgeVariant: "currency" },
  { label: "Settings", href: "/dashboard/settings", icon: "Settings" },
];

