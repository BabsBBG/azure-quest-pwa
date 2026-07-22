import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, CheckCircle2, ClipboardCheck, FileText, Link2 } from "lucide-react";
import { examWalkthroughItems } from "../data/examWalkthroughItems";
import type { AssessmentItem } from "../types";
import { scoreRichItem, type RichAnswer } from "../utils/richItemScoring";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { QuestionBankNotice } from "../components/QuestionBankNotice";

type AnswerState = Record<string, RichAnswer>;

function defaultAnswer(item: AssessmentItem): RichAnswer {
  if (item.type === "MULTIPLE_CHOICE") return { type: item.type, selected: [] };
  if (item.type === "ORDERING") return { type: item.type, order: item.choices.map((choice) => choice.id) };
  if (item.type === "MATCHING") return { type: item.type, matches: {} };
  return { type: item.type, selected: null };
}

export function ExamWalkthrough() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerState>(() => Object.fromEntries(examWalkthroughItems.map((item) => [item.id, defaultAnswer(item)])));
  const [showReview, setShowReview] = useState(false);
  const item = examWalkthroughItems[index];
  const answer = answers[item.id] ?? defaultAnswer(item);
  const result = scoreRichItem(item, answer);
  const answered = Object.values(answers).filter((entry) => {
    if (entry.type === "MULTIPLE_CHOICE") return entry.selected.length > 0;
    if (entry.type === "ORDERING") return entry.order.length > 0;
    if (entry.type === "MATCHING") return Object.keys(entry.matches).length > 0;
    return Boolean(entry.selected);
  }).length;

  function setAnswer(next: RichAnswer) {
    setAnswers((prev) => ({ ...prev, [item.id]: next }));
  }

  const reviewScore = useMemo(() => {
    const scores = examWalkthroughItems.map((walkItem) => scoreRichItem(walkItem, answers[walkItem.id] ?? defaultAnswer(walkItem)).score);
    return Math.round((scores.reduce((sum, value) => sum + value, 0) / examWalkthroughItems.length) * 100);
  }, [answers]);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <section className="aq-hero p-5 sm:p-7">
        <Badge className="mb-3 border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] text-white">M5.2 Exam Walkthrough</Badge>
        <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">Practice the interaction types before a real run.</h1>
        <p className="mt-3 max-w-2xl text-sm font-semibold text-[var(--aq-muted)]">These walkthrough items demonstrate PraxisGrid controls only. They never enter certification assessment pools.</p>
      </section>

      <QuestionBankNotice />

      <Card>
        <CardHeader>
          <div>
            <Badge className="mb-2 border-[var(--aq-blue-600)] bg-[var(--aq-blue-700)] text-white">{item.type.replace(/_/g, " ")}</Badge>
            <CardTitle>Item {index + 1} of {examWalkthroughItems.length}</CardTitle>
            <p className="mt-1 text-sm font-semibold text-[var(--aq-muted)]">{answered} answered / demo score {reviewScore}%</p>
          </div>
          <ClipboardCheck className="h-6 w-6 text-[var(--aq-blue-600)]" />
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold">{item.stem}</p>
          {"caseStudyId" in item ? <CaseStudyPanel item={item} /> : null}
          <div className="mt-5">
            <ItemInteraction item={item} answer={answer} onAnswer={setAnswer} />
          </div>
          <div className="mt-5 rounded-md border border-[var(--aq-border)] bg-[var(--aq-blue-50)] p-3 text-sm font-semibold text-[var(--aq-ink)]">
            Current walkthrough scoring: {Math.round(result.score * 100)}% {result.correct ? "correct" : "not yet exact"}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Walkthrough navigation</CardTitle><FileText className="h-6 w-6 text-[var(--aq-blue-600)]" /></CardHeader>
        <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
          {examWalkthroughItems.map((walkItem, itemIndex) => (
            <button
              key={walkItem.id}
              type="button"
              onClick={() => setIndex(itemIndex)}
              className={`min-h-12 rounded-md border px-2 py-2 text-xs font-bold ${itemIndex === index ? "border-[var(--aq-blue-700)] bg-[var(--aq-blue-700)] text-white" : "border-[var(--aq-border)] bg-white text-[var(--aq-ink)] dark:bg-[#081d38] dark:text-[#e7f3ff]"}`}
              aria-current={itemIndex === index ? "step" : undefined}
            >
              {itemIndex + 1}
              <span className="block text-[10px] uppercase">{walkItem.type.split("_")[0]}</span>
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <Button onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0} variant="soft">Previous</Button>
          <Button onClick={() => setIndex((value) => Math.min(examWalkthroughItems.length - 1, value + 1))} disabled={index === examWalkthroughItems.length - 1} variant="hero">Next item</Button>
          <Button onClick={() => setShowReview((value) => !value)} variant="soft">{showReview ? "Hide review" : "Review all"}</Button>
        </div>
      </Card>

      {showReview ? (
        <Card>
          <CardHeader><CardTitle>Answer review</CardTitle><CheckCircle2 className="h-6 w-6 text-[var(--aq-blue-600)]" /></CardHeader>
          <div className="space-y-3">
            {examWalkthroughItems.map((walkItem) => (
              <details key={walkItem.id} className="aq-row-card p-4">
                <summary className="cursor-pointer text-sm font-semibold">{walkItem.type.replace(/_/g, " ")} / {walkItem.domain}</summary>
                <p className="mt-3 font-semibold">{walkItem.explanation}</p>
              </details>
            ))}
          </div>
        </Card>
      ) : null}
    </motion.div>
  );
}

function ItemInteraction({ item, answer, onAnswer }: { item: AssessmentItem; answer: RichAnswer; onAnswer: (answer: RichAnswer) => void }) {
  if (item.type === "MULTIPLE_CHOICE" && answer.type === "MULTIPLE_CHOICE") {
    return (
      <div className="space-y-3" role="group" aria-label={`Choose exactly ${item.exactSelectionCount} answers`}>
        <p className="text-sm font-semibold text-[var(--aq-muted)]">Choose exactly {item.exactSelectionCount} answers.</p>
        {item.options.map((option) => {
          const selected = answer.selected.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                const next = selected ? answer.selected.filter((id) => id !== option.id) : [...answer.selected, option.id].slice(0, item.maxSelections);
                onAnswer({ type: item.type, selected: next });
              }}
              aria-pressed={selected}
              className={`flex w-full items-center gap-3 rounded-md border p-3 text-left text-sm font-semibold ${selected ? "border-[var(--aq-blue-700)] bg-[var(--aq-blue-700)] text-white" : "border-[var(--aq-border)] bg-white text-[var(--aq-ink)] dark:bg-[#081d38] dark:text-[#e7f3ff]"}`}
            >
              <span>{option.id}</span>
              <span>{option.text}</span>
            </button>
          );
        })}
      </div>
    );
  }

  if (item.type === "ORDERING" && answer.type === "ORDERING") {
    return (
      <div className="space-y-2">
        {answer.order.map((choiceId, choiceIndex) => {
          const choice = item.choices.find((entry) => entry.id === choiceId);
          if (!choice) return null;
          return (
            <div key={choice.id} className="flex items-center gap-2 rounded-md border border-[var(--aq-border)] bg-white p-3 dark:bg-[#081d38]">
              <span className="w-6 text-sm font-bold">{choiceIndex + 1}</span>
              <span className="flex-1 text-sm font-semibold">{choice.text}</span>
              <Button onClick={() => moveOrder(answer.order, choiceIndex, -1, (order) => onAnswer({ type: item.type, order }))} disabled={choiceIndex === 0} size="icon" variant="soft" aria-label={`Move ${choice.text} up`}><ArrowUp className="h-4 w-4" /></Button>
              <Button onClick={() => moveOrder(answer.order, choiceIndex, 1, (order) => onAnswer({ type: item.type, order }))} disabled={choiceIndex === answer.order.length - 1} size="icon" variant="soft" aria-label={`Move ${choice.text} down`}><ArrowDown className="h-4 w-4" /></Button>
            </div>
          );
        })}
      </div>
    );
  }

  if (item.type === "MATCHING" && answer.type === "MATCHING") {
    return (
      <div className="grid gap-3">
        {item.prompts.map((prompt) => (
          <label key={prompt.id} className="grid gap-2 rounded-md border border-[var(--aq-border)] bg-white p-3 text-sm font-semibold dark:bg-[#081d38]">
            <span>{prompt.text}</span>
            <select
              value={answer.matches[prompt.id] ?? ""}
              onChange={(event) => onAnswer({ type: item.type, matches: { ...answer.matches, [prompt.id]: event.target.value } })}
              className="rounded-md border border-[var(--aq-border)] bg-white px-3 py-2 text-[var(--aq-ink)] dark:bg-[#061227] dark:text-[#e7f3ff]"
            >
              <option value="">Select match</option>
              {item.matches.map((match) => <option key={match.id} value={match.id}>{match.text}</option>)}
            </select>
          </label>
        ))}
      </div>
    );
  }

  if ((item.type === "SINGLE_CHOICE" || item.type === "CASE_STUDY_QUESTION") && (answer.type === "SINGLE_CHOICE" || answer.type === "CASE_STUDY_QUESTION")) {
    return (
      <div className="space-y-3" role="radiogroup" aria-label="Choose one answer">
        {item.options.map((option) => {
          const selected = answer.selected === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onAnswer({ type: item.type, selected: option.id })}
              role="radio"
              aria-checked={selected}
              className={`flex w-full items-center gap-3 rounded-md border p-3 text-left text-sm font-semibold ${selected ? "border-[var(--aq-blue-700)] bg-[var(--aq-blue-700)] text-white" : "border-[var(--aq-border)] bg-white text-[var(--aq-ink)] dark:bg-[#081d38] dark:text-[#e7f3ff]"}`}
            >
              <span>{option.id}</span>
              <span>{option.text}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return null;
}

function CaseStudyPanel({ item }: { item: Extract<AssessmentItem, { type: "CASE_STUDY_QUESTION" }> }) {
  return (
    <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr]">
      <div className="aq-subtle-panel p-3">
        <p className="text-sm font-bold">{item.caseTitle}</p>
        <p className="mt-2 text-sm font-semibold text-[var(--aq-muted)]">{item.overview}</p>
        <div className="mt-3 space-y-2">
          {item.sections.map((section) => (
            <div key={section.id}>
              <p className="text-xs font-bold uppercase text-[var(--aq-blue-700)]">{section.title}</p>
              <p className="text-sm font-semibold">{section.body}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="aq-subtle-panel p-3">
        <p className="mb-2 flex items-center gap-2 text-sm font-bold"><Link2 className="h-4 w-4" /> Exhibits and constraints</p>
        {item.exhibits.map((exhibit) => (
          <details key={exhibit.id} className="mb-2 rounded-md border border-[var(--aq-border)] p-2">
            <summary className="cursor-pointer text-sm font-semibold">{exhibit.title}</summary>
            <p className="mt-2 text-sm font-semibold text-[var(--aq-muted)]">{exhibit.body}</p>
          </details>
        ))}
        <p className="mt-3 text-xs font-bold uppercase text-[var(--aq-blue-700)]">Requirements</p>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm font-semibold">
          {item.requirements.map((requirement) => <li key={requirement}>{requirement}</li>)}
        </ul>
      </div>
    </div>
  );
}

function moveOrder(order: string[], index: number, direction: -1 | 1, onMove: (order: string[]) => void) {
  const next = [...order];
  const target = index + direction;
  if (target < 0 || target >= next.length) return;
  [next[index], next[target]] = [next[target], next[index]];
  onMove(next);
}
