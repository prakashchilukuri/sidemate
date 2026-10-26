"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  Users,
  Megaphone,
  Phone,
  MessageSquare,
  Calendar,
  Plug,
  CreditCard,
  Wallet,
  Settings,
  ChevronLeft,
  ChevronsUpDown,
  Sparkles,
  Plus,
  Building2,
  Globe2,
  Zap,
  PhoneIncoming,
  PhoneCall,
  Layers,
  BookOpen,
  BarChart2,
  Code2,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";
import { DASHBOARD_NAV_SECTIONS, DASHBOARD_NAV_BOTTOM, type NavItem } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Bot,
  Users,
  Megaphone,
  Phone,
  MessageSquare,
  Calendar,
  Plug,
  CreditCard,
  Wallet,
  Settings,
  Building2,
  Globe2,
  Zap,
  PhoneIncoming,
  PhoneCall,
  Layers,
  BookOpen,
  BarChart2,
  Code2,
  Plus,
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const renderBadge = (item: NavItem) => {
    if (!item.badge) return null;

    if (item.badgeVariant === "live") {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {item.badge}
        </span>
      );
    }

    if (item.badgeVariant === "purple") {
      return (
        <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/70 border border-purple-200 dark:border-purple-800 px-2 py-0.2 rounded-full shrink-0">
          {item.badge}
        </span>
      );
    }

    if (item.badgeVariant === "currency") {
      return (
        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded-md shrink-0">
          {item.badge}
        </span>
      );
    }

    return (
      <span className="text-[10px] font-medium text-muted-foreground bg-surface-sunken border border-border/60 px-1.5 py-0.5 rounded-md shrink-0">
        {item.badge}
      </span>
    );
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-full flex-col border-r border-border bg-surface transition-all duration-200 select-none",
        collapsed ? "w-[var(--sm-sidebar-collapsed)]" : "w-[var(--sm-sidebar-width)]"
      )}
    >
      {/* ── Header: Logo & Collapse Button ── */}
      <div className="flex h-16 items-center justify-between border-b border-border px-4 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
          <Logo size="sm" showText={!collapsed} />
        </Link>
        <button
          onClick={onToggle}
          className="hidden h-7 w-7 items-center justify-center rounded-[var(--sm-radius-sm)] border border-border/60 text-muted-foreground hover:bg-surface-sunken hover:text-foreground lg:flex cursor-pointer transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform duration-200",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* ── Workspace Switcher Card ── */}
      <div className="p-3 pb-2 shrink-0">
        {collapsed ? (
          <div
            className="flex h-10 w-10 mx-auto items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-xs shadow-xs"
            title="Sri Balaji Real Estate (Pro Workspace)"
          >
            SB
          </div>
        ) : (
          <div className="group relative flex items-center justify-between rounded-xl border border-border/80 bg-surface-sunken/40 hover:bg-surface-sunken p-2 transition-all cursor-pointer">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-xs shadow-xs">
                SB
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-xs font-semibold text-foreground leading-tight">
                    Sri Balaji Estates
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground leading-tight">
                  <span className="truncate">Multilingual AI</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 pl-1">
              <Badge variant="default" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] px-1.5 py-0 h-4 font-bold tracking-wide">
                PRO
              </Badge>
              <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* ── Grouped Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-4 scrollbar-thin">
        {DASHBOARD_NAV_SECTIONS.map((section, sIdx) => (
          <div key={section.title || sIdx} className="space-y-1">
            {!collapsed && (
              <div className="flex items-center justify-between px-2.5 pb-1 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  {section.title}
                </span>
                {section.title === "Overview" && (
                  <Link
                    href="/dashboard/ai-employees/new"
                    className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                    title="Create New AI Voice Agent"
                  >
                    <Plus className="h-3 w-3" />
                    New
                  </Link>
                )}
              </div>
            )}

            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = iconMap[item.icon];
                const isActive =
                  item.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname.startsWith(item.href);

                return (
                  <li key={`${item.label}-${item.href}`}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-3 py-2 text-[13px] font-medium transition-all duration-150 relative",
                        isActive
                          ? "bg-indigo-50/90 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 font-semibold border-l-2 border-indigo-600 dark:border-indigo-400 pl-2.5 pr-2.5 rounded-r-lg shadow-2xs"
                          : "text-muted-foreground hover:text-foreground hover:bg-surface-sunken/80 pl-3 pr-2.5 rounded-lg",
                        collapsed && "justify-center px-0 border-l-0 rounded-lg"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      {Icon && (
                        <Icon
                          className={cn(
                            "h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-105",
                            isActive
                              ? "text-indigo-600 dark:text-indigo-400"
                              : "text-muted-foreground group-hover:text-foreground"
                          )}
                        />
                      )}
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {renderBadge(item)}
                        </>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* ── Bottom Nav (Recharge & Settings) ── */}
      <div className="border-t border-border p-3 shrink-0 space-y-1">
        <ul className="space-y-0.5">
          {DASHBOARD_NAV_BOTTOM.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 py-2 text-[13px] font-medium transition-all duration-150",
                    isActive
                      ? "bg-indigo-50/90 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 font-semibold border-l-2 border-indigo-600 dark:border-indigo-400 pl-2.5 pr-2.5 rounded-r-lg shadow-2xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface-sunken/80 pl-3 pr-2.5 rounded-lg",
                    collapsed && "justify-center px-0 border-l-0 rounded-lg"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  {Icon && (
                    <Icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0 transition-transform group-hover:scale-105",
                        isActive
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                  )}
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate">{item.label}</span>
                      {renderBadge(item)}
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── Team Status Footer ── */}
      {!collapsed && (
        <div className="p-3 pt-0 shrink-0">
          <div className="rounded-xl border border-border/80 bg-surface-sunken/40 p-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-foreground">Your team</span>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                2 working
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                2 live
              </span>
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                Telugu & English
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
