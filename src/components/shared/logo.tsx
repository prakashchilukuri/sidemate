import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: { icon: "h-7 w-7", text: "text-lg" },
    md: { icon: "h-8 w-8", text: "text-xl" },
    lg: { icon: "h-10 w-10", text: "text-2xl" },
  };

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* Symbol — two overlapping rounded rectangles representing human + AI collaboration */}
      <div className={cn("relative", sizes[size].icon)}>
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
          aria-hidden="true"
        >
          {/* Back shape — represents the human */}
          <rect
            x="2"
            y="4"
            width="18"
            height="24"
            rx="5"
            fill="var(--sm-primary)"
            opacity="0.35"
          />
          {/* Front shape — represents the AI */}
          <rect
            x="12"
            y="4"
            width="18"
            height="24"
            rx="5"
            fill="var(--sm-primary)"
          />
          {/* Connection dot — the synergy */}
          <circle cx="16" cy="16" r="3" fill="white" />
        </svg>
      </div>
      {showText && (
        <span
          className={cn(
            "font-semibold tracking-tight text-foreground",
            sizes[size].text
          )}
        >
          Side<span className="text-primary">Mate</span>
        </span>
      )}
    </div>
  );
}
