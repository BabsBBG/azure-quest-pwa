import { useMemo, useState } from "react";
import { motion, PanInfo } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Brain, Check, Flame, Sparkles, X, Zap } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export function Flashcards() {
  const questions = useAppStore((state) => state.questions);
  const flashcards = useAppStore((state) => state.flashcards);
  const recordFlashcard = useAppStore((state) => state.recordFlashcard);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [combo, setCombo] = useState(0);
  const dueCards = useMemo(() => {
    const now = Date.now();
    return questions.filter((q) => !flashcards[q.id] || new Date(flashcards[q.id].dueAt).getTime() <= now);
  }, [questions, flashcards]);

  const card = dueCards[index % Math.max(1, dueCards.length)];

  async function rate(rating: "easy" | "hard") {
    if (!card) return;
    await recordFlashcard(card.id, rating);
    setCombo((c) => rating === "easy" ? c + 1 : 0);
    setFlipped(false);
    setIndex((i) => i + 1);
  }

  async function onDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (info.offset.x > 120) await rate("easy");
    if (info.offset.x < -120) await rate("hard");
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm"><Link to="/"><ArrowLeft className="h-4 w-4" /> Home</Link></Button>
        <Badge className="bg-emerald-400 text-slate-950">{dueCards.length} due</Badge>
      </div>

      <Card className="bg-gradient-to-br from-violet-500 to-sky-500 text-white">
        <CardHeader>
          <div>
            <CardTitle className="text-3xl">Swipe Cards</CardTitle>
            <p className="font-bold opacity-85">Swipe left for review. Swipe right for confident recall.</p>
          </div>
          <div className="text-right"><Brain className="ml-auto h-9 w-9" /><p className="mt-2 rounded-full bg-white/20 px-3 py-1 text-sm font-black">Combo x{combo}</p></div>
        </CardHeader>
      </Card>

      {!card ? (
        <Card>
          <CardTitle>All caught up</CardTitle>
          <p className="mt-2 font-bold text-slate-500 dark:text-slate-400">Your future self is impressed.</p>
        </Card>
      ) : (
        <div className="mx-auto max-w-xl pt-5">
          <div className="mb-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-rose-100 p-3 font-black text-rose-900 dark:bg-rose-500/20 dark:text-rose-100">Hard</div>
            <div className="rounded-2xl bg-amber-100 p-3 font-black text-amber-900 dark:bg-amber-500/20 dark:text-amber-100"><Flame className="mx-auto h-5 w-5" /> x{combo}</div>
            <div className="rounded-2xl bg-emerald-100 p-3 font-black text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-100">Easy</div>
          </div>
          <motion.div
            key={card.id + String(flipped)}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={onDragEnd}
            whileDrag={{ rotate: 4, scale: 1.02 }}
            className="relative min-h-[460px] cursor-grab overflow-hidden rounded-[2rem] bg-white p-6 shadow-card ring-4 ring-transparent active:cursor-grabbing dark:bg-slate-900"
            onClick={() => setFlipped((f) => !f)}
          >
            <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-sky-300/30 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-violet-300/30 blur-2xl" />
            <div className="relative mb-4 flex items-center justify-between">
              <Badge>{card.cert}</Badge>
              <Badge className="bg-amber-300 text-slate-950">tap to flip</Badge>
            </div>

            {!flipped ? (
              <div className="relative space-y-5">
                <p className="text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{card.scenarioOrg}</p>
                <h2 className="text-3xl font-black leading-tight">{card.stem}</h2>
                {card.diagram ? <pre className="rounded-2xl bg-slate-950 p-4 text-sm font-bold text-sky-200">{card.diagram}</pre> : null}
                <div className="rounded-2xl bg-slate-100 p-4 text-center font-black text-slate-500 dark:bg-white/10 dark:text-slate-300"><Sparkles className="mx-auto mb-1 h-5 w-5" /> Tap to reveal answer</div>
              </div>
            ) : (
              <div className="relative space-y-4">
                <p className="text-sm font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Correct answer</p>
                <h2 className="text-3xl font-black">{card.answer}. {card.options.find((o) => o.id === card.answer)?.text}</h2>
                <p className="rounded-2xl bg-emerald-100 p-4 text-lg font-black text-emerald-900 dark:bg-emerald-500/20 dark:text-emerald-100">{card.explanation}</p>
                <div className="flex flex-wrap gap-2">{card.tags.map((tag) => <Badge key={tag} className="bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-white">#{tag}</Badge>)}</div>
              </div>
            )}
          </motion.div>

          <div className="mt-5 grid grid-cols-4 gap-2">
            <Button onClick={() => void rate("hard")} variant="danger" size="lg" className="h-16 flex-col text-xs"><X /> Again</Button>
            <Button onClick={() => void rate("hard")} variant="soft" size="lg" className="h-16 flex-col text-xs"><Zap /> Shaky</Button>
            <Button onClick={() => void rate("easy")} variant="success" size="lg" className="h-16 flex-col text-xs"><Check /> Got it</Button>
            <Button onClick={() => void rate("easy")} variant="hero" size="lg" className="h-16 flex-col text-xs"><Flame /> Mastered</Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
