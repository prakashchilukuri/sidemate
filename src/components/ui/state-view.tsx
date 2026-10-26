import { type ReactNode } from "react";
import { AlertCircle, FolderSearch, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[var(--sm-radius-xl)] border border-dashed border-border bg-surface-sunken/40 px-6 py-12 text-center",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary mb-4">
        {icon || <FolderSearch className="h-6 w-6" />}
      </div>
      <h4 className="text-base font-semibold text-foreground">{title}</h4>
      <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>
      {action && (
        <Button onClick={action.onClick} size="sm" className="mt-5">
          {action.label}
        </Button>
      )}
    </div>
  );
}

interface LoadingStateProps {
  rows?: number;
  label?: string;
  className?: string;
}

export function LoadingState({
  rows = 4,
  label = "Loading data...",
  className,
}: LoadingStateProps) {
  return (
    <div className={cn("space-y-3 p-4", className)}>
      <div className="flex items-center gap-2 text-sm text-muted mb-4">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span>{label}</span>
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-12 w-full animate-pulse rounded-[var(--sm-radius-md)] bg-surface-sunken"
        />
      ))}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "An error occurred while loading this data. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[var(--sm-radius-xl)] border border-danger/20 bg-danger/5 px-6 py-10 text-center",
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger/10 text-danger mb-3">
        <AlertCircle className="h-5 w-5" />
      </div>
      <h4 className="text-base font-semibold text-foreground">{title}</h4>
      <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="secondary"
          size="sm"
          className="mt-4 gap-1.5"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </Button>
      )}
    </div>
  );
}
