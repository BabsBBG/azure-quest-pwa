import * as React from "react";
import { cn } from "../../lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full bg-emerald-900 px-3 py-1 text-xs font-semibold text-white dark:bg-emerald-300 dark:text-emerald-950", className)} {...props} />;
}
