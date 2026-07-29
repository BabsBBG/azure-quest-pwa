import { useMemo, useState } from "react";
import { motion, PanInfo } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Brain, Check, Flame, Sparkles, X, Zap } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { QuestionBankNotice } from "../components/QuestionBankNotice";

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
        <Badge>{dueCards.length} due</Badge>
      </div>

      <Card className="aq-hero">
        <CardHeader>
          <div>
            <CardTitle className="text-2xl sm:text-3xl">Flashcards</CardTitle>
            <p className="font-semibold text-[var(--aq-muted)]">Swipe left for review. Swipe right for confident recall.</p>
          </div>
          <div className="text-right"><Brain className="ml-auto h-9 w-9 text-[var(--aq-blue-600)]" /><p className="mt-2 rounded-md border border-[var(--aq-border)] bg-[var(--aq-blue-50)] px-3 py-1 text-sm font-semibold text-[var(--aq-blue-800)] dark:text-[var(--aq-ink)]">Combo x{combo}</p></div>
        </CardHeader>
      </Card>

      <QuestionBankNotice compact />

      {!card ? (
        <Card>
          <CardTitle>All caught up</CardTitle>
          <p className="mt-2 font-bold text-slate-500 dark:text-slate-400">Your future self is impressed.</p>
        </Card>
      ) : (
        <div className="mx-auto max-w-xl pt-5">
          <div className="mb-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-md border border-rose-200 bg-rose-50 p-3 font-semibold text-rose-900 dark:border-rose-300/50 dark:bg-rose-300/10 dark:text-rose-100">Hard</div>
            <div className="aq-subtle-panel p-3 font-semibold"><Flame className="mx-auto h-5 w-5" /> x{combo}</div>
            <div className="rounded-md border border-[var(--aq-border)] bg-[var(--aq-blue-50)] p-3 font-semibold text-[var(--aq-blue-800)] dark:text-[var(--aq-ink)]">Easy</div>
          </div>
          <motion.div
            key={card.id + String(flipped)}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={onDragEnd}
            whileDrag={{ rotate: 4, scale: 1.02 }}
            className="aq-row-card relative min-h-[340px] cursor-grab overflow-hidden p-5 ring-2 ring-transparent active:cursor-grabbing sm:min-h-[460px] sm:p-6"
            onClick={() => setFlipped((f) => !f)}
          >
            <div className="relative mb-4 flex items-center justify-between">
              <Badge>{card.cert}</Badge>
              <Badge>tap to flip</Badge>
            </div>

            {!flipped ? (
              <div className="relative space-y-5">
                <p className="text-sm font-semibold uppercase tracking-wide text-[var(--aq-muted)]">{card.scenarioOrg}</p>
                <h2 className="text-3xl font-semibold leading-tight">{card.stem}</h2>
                {card.diagram ? <pre className="rounded-md border border-[var(--aq-border)] bg-[#061227] p-4 text-sm font-semibold text-[#d7ebff]">{card.diagram}</pre> : null}
                <div className="aq-subtle-panel p-4 text-center font-semibold"><Sparkles className="mx-auto mb-1 h-5 w-5" /> Tap to reveal answer</div>
              </div>
            ) : (
              <div className="relative space-y-4">
                <p className="text-sm font-semibold uppercase tracking-wide text-[var(--aq-muted)]">Correct answer</p>
                <h2 className="text-3xl font-semibold">{card.answer}. {card.options.find((o) => o.id === card.answer)?.text}</h2>
                <p className="aq-subtle-panel p-4 text-lg font-semibold">{card.explanation}</p>
                <div className="flex flex-wrap gap-2">{card.tags.map((tag) => <Badge key={tag}>#{tag}</Badge>)}</div>
              </div>
            )}
          </motion.div>

          <div className="mt-5 grid grid-cols-4 gap-2">
            <Button onClick={() => void rate("hard")} variant="danger" size="lg" className="h-14 flex-col text-xs sm:h-16"><X /> Again</Button>
            <Button onClick={() => void rate("hard")} variant="soft" size="lg" className="h-14 flex-col text-xs sm:h-16"><Zap /> Shaky</Button>
            <Button onClick={() => void rate("easy")} variant="success" size="lg" className="h-14 flex-col text-xs sm:h-16"><Check /> Got it</Button>
            <Button onClick={() => void rate("easy")} variant="hero" size="lg" className="h-14 flex-col text-xs sm:h-16"><Flame /> Mastered</Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
