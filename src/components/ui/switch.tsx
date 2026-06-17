import { cn } from "../../lib/utils";

export function Switch({ checked, onCheckedChange, label }: { checked: boolean; onCheckedChange: (next: boolean) => void; label?: string }) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      aria-label={label}
      onClick={() => onCheckedChange(!checked)}
      className={cn("relative h-8 w-14 rounded-full transition", checked ? "bg-emerald-500" : "bg-slate-300 dark:bg-white/20")}
    >
      <span className={cn("absolute top-1 h-6 w-6 rounded-full bg-white shadow transition", checked ? "left-7" : "left-1")} />
    </button>
  );
}
