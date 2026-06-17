import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "../../lib/utils";

export const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>>(
  ({ className, value = 0, ...props }, ref) => (
    <ProgressPrimitive.Root ref={ref} className={cn("relative h-2.5 w-full overflow-hidden rounded-full bg-emerald-900/10 dark:bg-white/10", className)} {...props}>
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 rounded-full bg-gradient-to-r from-emerald-700 via-emerald-500 to-lime-400 transition-all"
        style={{ transform: `translateX(-${100 - (value ?? 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
);
Progress.displayName = "Progress";
