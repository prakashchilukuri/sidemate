import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { SubbuChatbot } from "@/components/shared/subbu-chatbot";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SideMate — AI Employees for Your Business",
    template: "%s | SideMate",
  },
  description:
    "Create AI-powered employees that call leads, qualify prospects, schedule meetings, and manage customer conversations at scale.",
  keywords: [
    "AI employees",
    "voice AI",
    "sales automation",
    "lead qualification",
    "AI calling",
    "Telugu AI",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} dark h-full bg-[#06050c]`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased bg-[#06050c] text-white selection:bg-indigo-500/30 selection:text-indigo-200">
        <ThemeProvider>
          {children}
          <SubbuChatbot />
        </ThemeProvider>
      </body>
    </html>
  );
}
