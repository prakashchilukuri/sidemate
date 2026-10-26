import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-text hover:bg-primary-hover shadow-sm",
        default:
          "bg-primary text-primary-text hover:bg-primary-hover shadow-sm",
        secondary:
          "bg-surface text-foreground border border-border hover:bg-surface-sunken shadow-xs",
        outline:
          "bg-surface text-foreground border border-border hover:bg-surface-sunken shadow-xs",
        ghost:
          "text-foreground hover:bg-surface-sunken",
        danger:
          "bg-danger text-white hover:bg-danger/90 shadow-sm",
        destructive:
          "bg-danger text-white hover:bg-danger/90 shadow-sm",
        link:
          "text-primary underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-8 px-3 text-sm rounded-[var(--sm-radius-sm)]",
        md: "h-10 px-4 text-sm rounded-[var(--sm-radius-md)]",
        lg: "h-12 px-6 text-base rounded-[var(--sm-radius-md)]",
        icon: "h-10 w-10 rounded-[var(--sm-radius-md)]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
