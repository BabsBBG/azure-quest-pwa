import { motion } from "framer-motion";
import { Card } from "../ui/card";

export function StatCard({ emoji, label, value, hint }: { emoji: string; label: string; value: string | number; hint?: string }) {
  return (
    <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
      <Card className="overflow-hidden p-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-sky-200 to-violet-200 text-sm font-black dark:from-sky-500/30 dark:to-violet-500/30">
            {emoji}
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
            <p className="text-sm font-black font-black">{value}</p>
          </div>
        </div>
        {hint ? <p className="mt-3 text-sm font-bold text-slate-500 dark:text-slate-400">{hint}</p> : null}
      </Card>
    </motion.div>
  );
}
