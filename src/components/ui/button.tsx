import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold tracking-tight transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500",
  {
    variants: {
      variant: {
        default: "bg-emerald-900 text-white shadow-sm hover:bg-emerald-800 dark:bg-emerald-500 dark:text-emerald-950 dark:hover:bg-emerald-400",
        hero: "bg-emerald-800 text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-400 dark:text-emerald-950 dark:hover:bg-emerald-300",
        success: "bg-emerald-600 text-white hover:bg-emerald-700",
        danger: "bg-rose-500 text-white hover:bg-rose-600",
        ghost: "bg-transparent hover:bg-emerald-50 dark:hover:bg-emerald-400/10",
        soft: "border border-emerald-900/15 bg-white text-emerald-950 shadow-sm hover:bg-emerald-50 dark:border-emerald-300/15 dark:bg-emerald-950/40 dark:text-emerald-50 dark:hover:bg-emerald-900/60"
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
