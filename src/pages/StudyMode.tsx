import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, Baby, Sparkles } from "lucide-react";
import { concepts } from "../data/concepts";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export function StudyMode() {
  const [index, setIndex] = useState(0);
  const [eli5, setEli5] = useState(false);
  const concept = concepts[index % concepts.length];

  function next() {
    setEli5(false);
    setIndex((i) => i + 1);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm"><Link to="/"><ArrowLeft className="h-4 w-4" /> Home</Link></Button>
        <Badge>{index + 1}/{concepts.length}</Badge>
      </div>

      <motion.div key={concept.id} initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <Card className="min-h-[520px] overflow-hidden bg-gradient-to-br from-white to-sky-50 dark:from-slate-900 dark:to-slate-800">
          <CardHeader>
            <div>
              <Badge className="mb-3 bg-violet-500 text-white">{concept.cert}</Badge>
              <CardTitle className="text-4xl">{concept.emoji} {concept.title}</CardTitle>
            </div>
            <Sparkles className="h-8 w-8 text-amber-400" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-black leading-tight">{concept.punchline}</p>
            <pre className="rounded-[1.5rem] bg-slate-950 p-5 text-center text-lg font-black text-sky-200">{concept.diagram}</pre>
            <div className="rounded-[1.5rem] bg-amber-100 p-5 text-amber-950 dark:bg-amber-400/20 dark:text-amber-100">
              <p className="text-xs font-black uppercase tracking-wide opacity-70">Quick highlight</p>
              <p className="text-xl font-black">{concept.highlight}</p>
            </div>

            {eli5 ? (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.5rem] bg-emerald-100 p-5 text-emerald-950 dark:bg-emerald-500/20 dark:text-emerald-100">
                <p className="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-wide"><Baby className="h-4 w-4" /> Explain like I’m 5</p>
                <p className="text-xl font-black">{concept.eli5}</p>
                <div className="mt-4 rounded-2xl bg-white/70 p-4 text-slate-800 dark:bg-black/20 dark:text-emerald-50">
                  <p className="text-xs font-black uppercase tracking-wide opacity-70">Real-life concept</p>
                  <p className="mt-1 text-lg font-black">{concept.realLife}</p>
                </div>
              </motion.div>
            ) : null}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button onClick={() => setEli5((v) => !v)} variant="soft" size="lg" className="h-16"><Baby /> Explain Like I’m 5</Button>
        <Button onClick={next} variant="hero" size="lg" className="h-16">Next bite</Button>
      </div>
    </motion.div>
  );
}
