import { Progress } from "../ui/progress";
import { nextLevelXp, xpForLevel } from "../../utils/quizEngine";

export function XPBar({ xp, level }: { xp: number; level: number }) {
  const floor = xpForLevel(level);
  const next = nextLevelXp(level);
  const percent = Math.max(0, Math.min(100, ((xp - floor) / (next - floor)) * 100));
  return (
    <div className="rounded-[1.5rem] bg-white/80 p-4 shadow-sm dark:bg-white/10">
      <div className="mb-2 flex items-center justify-between text-sm font-black">
        <span>Level {level}</span>
        <span>{xp} XP</span>
      </div>
      <Progress value={percent} />
      <p className="mt-2 text-xs font-bold text-slate-500 dark:text-slate-400">{Math.max(0, next - xp)} XP to next level</p>
    </div>
  );
}
