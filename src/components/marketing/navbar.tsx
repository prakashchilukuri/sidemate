"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, Radio, PhoneCall } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* ── Transparent Luxury Topbar ── */}
      <div
        className={cn(
          "w-full transition-all duration-300",
          scrolled
            ? "bg-[#06050c]/85 backdrop-blur-2xl border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
            : "bg-transparent border-b border-transparent"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* ── Left: Brand (Identical to Footer Watermark) ── */}
          <div className="flex items-center">
            <Link href="/" className="inline-flex items-center select-none group py-1">
              <span className="font-black tracking-[-0.03em] text-[24px] sm:text-[28px] leading-none uppercase opacity-90 transition-opacity group-hover:opacity-100">
                <span className="bg-gradient-to-b from-white/25 via-white/10 to-transparent bg-clip-text text-transparent">Side</span><span className="bg-gradient-to-b from-indigo-400/35 via-indigo-500/15 to-transparent bg-clip-text text-transparent">Mate</span>
              </span>
            </Link>
          </div>

          {/* ── Center: Sleek Navigation Dock ── */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] border border-white/[0.08] rounded-full px-3 py-1 backdrop-blur-md">
            <Link
              href="#instant-leads"
              className="px-3.5 py-1.5 text-[13px] font-medium text-slate-300 hover:text-white hover:bg-white/[0.08] rounded-full transition-colors"
            >
              Product
            </Link>
            <Link
              href="#voices"
              className="px-3.5 py-1.5 text-[13px] font-medium text-slate-300 hover:text-white hover:bg-white/[0.08] rounded-full transition-colors"
            >
              Voices
            </Link>
            <Link
              href="#enhance"
              className="px-3.5 py-1.5 text-[13px] font-medium text-slate-300 hover:text-white hover:bg-white/[0.08] rounded-full transition-colors"
            >
              Telugu AI
            </Link>
            <Link
              href="#roi-calculator"
              className="px-3.5 py-1.5 text-[13px] font-medium text-slate-300 hover:text-white hover:bg-white/[0.08] rounded-full transition-colors"
            >
              ROI Calculator
            </Link>
            <Link
              href="#pricing"
              className="px-3.5 py-1.5 text-[13px] font-medium text-slate-300 hover:text-white hover:bg-white/[0.08] rounded-full transition-colors"
            >
              Pricing in ₹
            </Link>
          </nav>

          {/* ── Right: Direct CTAs ── */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/login"
              className="text-[13px] font-semibold text-slate-300 hover:text-white transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard/ai-employees/new"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-600 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white text-[13px] font-bold shadow-[0_0_25px_rgba(99,102,241,0.5)] hover:shadow-[0_0_35px_rgba(99,102,241,0.7)] transition-all active:scale-95 cursor-pointer"
            >
              Start Free
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* ── Mobile Hamburger ── */}
          <button
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.05] border border-white/[0.1] text-slate-300 hover:bg-white/[0.1]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Radiant Underline on Scroll */}
        <div
          className={cn(
            "h-[1px] w-full transition-opacity duration-300 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent",
            scrolled ? "opacity-100" : "opacity-0"
          )}
        />
      </div>

      {/* ── Mobile Menu Dropdown ── */}
      {mobileOpen && (
        <div className="md:hidden border-b border-white/[0.1] bg-[#090814]/95 backdrop-blur-2xl p-5 shadow-2xl space-y-3">
          <Link
            href="#instant-leads"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 text-[14px] font-medium text-slate-200 hover:bg-white/[0.06] rounded-xl"
          >
            Product
          </Link>
          <Link
            href="#voices"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 text-[14px] font-medium text-slate-200 hover:bg-white/[0.06] rounded-xl"
          >
            Voices &amp; Dialects
          </Link>
          <Link
            href="#enhance"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 text-[14px] font-medium text-slate-200 hover:bg-white/[0.06] rounded-xl"
          >
            Telugu AI Script Enhancer
          </Link>
          <Link
            href="#roi-calculator"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 text-[14px] font-medium text-slate-200 hover:bg-white/[0.06] rounded-xl"
          >
            ROI Calculator
          </Link>
          <Link
            href="#pricing"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2 text-[14px] font-medium text-slate-200 hover:bg-white/[0.06] rounded-xl"
          >
            Pricing in Indian Rupees (₹)
          </Link>
          <div className="pt-3 border-t border-white/[0.1] flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-2 text-[14px] font-semibold text-slate-300"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard/ai-employees/new"
              onClick={() => setMobileOpen(false)}
              className="w-full text-center py-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-bold text-[14px] shadow-lg shadow-indigo-500/40"
            >
              Start Free (500 Mins) →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
