import Link from "next/link";

const footerLinks = {
  Product: [
    { label: "AI Employees", href: "#features" },
    { label: "Voice Calls", href: "#voices" },
    { label: "Campaigns", href: "#instant-leads" },
    { label: "Pricing in ₹", href: "#pricing" },
    { label: "Integrations", href: "#" },
  ],
  Industries: [
    { label: "Real Estate", href: "#" },
    { label: "Healthcare", href: "#" },
    { label: "FMCG & Retail", href: "#" },
    { label: "Education", href: "#" },
    { label: "Automotive", href: "#" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "Telugu AI Engine", href: "#enhance" },
    { label: "ROI Calculator", href: "#roi-calculator" },
    { label: "Changelog", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="relative border-t border-white/[0.08] bg-[#06050c] text-white overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        {/* ── Main grid ── */}
        <div className="grid grid-cols-2 gap-8 py-16 md:grid-cols-6">
          {/* Brand column (2 cols) */}
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center select-none group py-1">
              <span className="font-black tracking-[-0.03em] text-[22px] sm:text-[24px] leading-none uppercase opacity-90 transition-opacity group-hover:opacity-100">
                <span className="bg-gradient-to-b from-white/25 via-white/10 to-transparent bg-clip-text text-transparent">Side</span><span className="bg-gradient-to-b from-indigo-400/35 via-indigo-500/15 to-transparent bg-clip-text text-transparent">Mate</span>
              </span>
            </Link>
            <p className="mt-4 max-w-[280px] text-[13.5px] leading-relaxed text-slate-400">
              AI employees that make phone calls for Indian businesses — every lead, every list, in natural Telugu &amp; English.
            </p>
            <p className="mt-3 text-[13px] text-slate-500 font-mono">
              support@sidemate.ai
            </p>
            {/* Social Icons */}
            <div className="mt-5 flex items-center gap-3">
              <Link
                href="#"
                aria-label="X (Twitter)"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.1] text-slate-400 hover:text-white hover:border-white/30 hover:bg-white/[0.06] transition-all"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </Link>
              <Link
                href="#"
                aria-label="LinkedIn"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.1] text-slate-400 hover:text-white hover:border-white/30 hover:bg-white/[0.06] transition-all"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
              </Link>
              <Link
                href="#"
                aria-label="GitHub"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.1] text-slate-400 hover:text-white hover:border-white/30 hover:bg-white/[0.06] transition-all"
              >
                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>
              </Link>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-4">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13.5px] text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ── */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-white/[0.08] py-6 sm:flex-row">
          <p className="text-[12.5px] text-slate-400">
            © 2026 SideMate Technologies Pvt Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-[12.5px] text-slate-400">
            <span>Supported by</span>
            <span className="font-semibold text-slate-200">Sarvam AI</span>
            <span className="mx-1">·</span>
            <span className="font-semibold text-slate-200">Cartesia</span>
          </div>
        </div>

        {/* ── Massive Brand Watermark (matching brand identity) ── */}
        <div className="relative mt-8 select-none overflow-hidden pb-4 text-center pointer-events-none w-full max-w-[100vw]">
          <p className="font-black tracking-[-0.03em] text-[11vw] sm:text-[12.8vw] lg:text-[13.8vw] leading-none uppercase opacity-90">
            <span className="bg-gradient-to-b from-white/25 via-white/10 to-transparent bg-clip-text text-transparent">Side</span><span className="bg-gradient-to-b from-indigo-400/35 via-indigo-500/15 to-transparent bg-clip-text text-transparent">Mate</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
