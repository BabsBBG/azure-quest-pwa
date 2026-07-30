import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border text-sm font-bold transition disabled:pointer-events-none disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-700 disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--aq-blue-600)] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:disabled:border-slate-600 dark:disabled:bg-slate-800 dark:disabled:text-slate-200 dark:focus-visible:ring-offset-[#061227]",
  {
    variants: {
      variant: {
        default: "border-[var(--aq-blue-700)] bg-[var(--aq-blue-700)] text-white shadow-sm hover:bg-[var(--aq-blue-800)] dark:border-[var(--aq-blue-500)] dark:bg-[var(--aq-blue-700)]",
        hero: "border-[var(--aq-blue-700)] bg-[var(--aq-blue-700)] text-white shadow-[0_10px_24px_rgba(0,87,184,0.25)] hover:bg-[var(--aq-blue-800)] dark:border-[var(--aq-blue-500)] dark:bg-[var(--aq-blue-600)] dark:text-[#061227]",
        success: "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700",
        danger: "border-rose-500 bg-rose-500 text-white hover:bg-rose-600",
        ghost: "border-transparent bg-transparent text-[var(--aq-muted)] hover:border-[var(--aq-border)] hover:bg-[var(--aq-blue-50)] hover:text-[var(--aq-blue-800)] dark:hover:bg-[var(--aq-blue-50)] dark:hover:text-[var(--aq-ink)]",
        soft: "border-[var(--aq-border)] bg-[var(--aq-blue-50)] text-[var(--aq-blue-800)] shadow-sm hover:bg-[var(--aq-blue-100)] dark:bg-[var(--aq-blue-50)] dark:text-[var(--aq-ink)]"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3",
        lg: "h-12 px-5 text-sm",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: { variant: "default", size: "default" }
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = "Button";

export { Button, buttonVariants };
