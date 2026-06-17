import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BriefcaseBusiness, CheckCircle2, Clock, ExternalLink, FileText, Mic, Network, PauseCircle, Play, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";
import { certFromSlug, metaFor, pathFor } from "../data/certPaths";
import { interviewQuestions, interviewSessions, jobTracks, projectStories, type InterviewQuestion, type JobTrack } from "../data/jobReadiness";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";

function trackForCert(cert: string): JobTrack[] {
  if (cert === "SC-300") return ["IAM", "Cloud Security"];
  if (cert === "AZ-500") return ["Cloud Security", "SOC", "Cloud SOC", "IAM"];
  return ["Cloud Security", "Cloud SOC", "AI Security", "IAM"];
}

function phaseLabel(q?: InterviewQuestion) {
  if (!q) return "Interview";
  return q.phase.replace("-", " ");
}

export function JobReadiness() {
  const { cert: slug } = useParams();
  const cert = certFromSlug(slug);
  const meta = metaFor(cert);
  const tracks = trackForCert(cert);
  const [track, setTrack] = useState<JobTrack>(tracks[0]);
  const availableSessions = interviewSessions.filter((s) => s.certs.includes(cert) && tracks.includes(s.track));
  const [sessionId, setSessionId] = useState(availableSessions[0]?.id ?? "");
  const session = availableSessions.find((s) => s.id === sessionId) ?? availableSessions[0];
  const sessionQuestions = useMemo(() => (session?.questionIds ?? []).map((id) => interviewQuestions.find((q) => q.id === id)).filter(Boolean) as InterviewQuestion[], [session]);
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [coachOpen, setCoachOpen] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const activeQuestion = sessionQuestions[index] ?? sessionQuestions[0];
  const progress = sessionQuestions.length ? ((index + 1) / sessionQuestions.length) * 100 : 0;

  const [selectedProjects, setSelectedProjects] = useState<string[]>(["gatekeeper", "citadel"]);
  const [mapperTrack, setMapperTrack] = useState<JobTrack>(tracks[0]);
  const mappedProjects = projectStories.filter((p) => selectedProjects.includes(p.id));
  const mapperQuestions = interviewQuestions.filter((q) => q.certs.includes(cert) && (q.track === mapperTrack || q.bestProjects.some((id) => selectedProjects.includes(id)))).slice(0, 8);

  function startSession(id = sessionId) {
    setSessionId(id);
    setStarted(true);
    setIndex(0);
    setCoachOpen(false);
    setChecked({});
  }

  function nextQuestion() {
    setCoachOpen(false);
    if (index + 1 >= sessionQuestions.length) setStarted(false);
    else setIndex((v) => v + 1);
  }

  return (
    <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <section className="luxury-panel overflow-hidden rounded-[2rem] p-5 text-white shadow-card sm:p-6">
        <Badge className="mb-3 bg-white/15 text-white">{cert} Job Readiness</Badge>
        <h1 className="max-w-4xl text-3xl font-black leading-[1] sm:text-5xl">Interview simulator + project storytelling engine.</h1>
        <p className="mt-3 max-w-3xl text-base font-bold text-white/75">Practice a 30-minute IAM, Security Engineer, SOC, or Cloud SOC interview. Then map your projects to the strongest answer, pitch, STAR story, architecture talk-through, and follow-up traps.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <div className="rounded-[1.25rem] bg-white/10 p-4"><Mic className="mb-2 h-5 w-5" /><p className="font-black">30-min simulator</p></div>
          <div className="rounded-[1.25rem] bg-white/10 p-4"><Network className="mb-2 h-5 w-5" /><p className="font-black">Project mapper</p></div>
          <div className="rounded-[1.25rem] bg-white/10 p-4"><FileText className="mb-2 h-5 w-5" /><p className="font-black">STAR builder</p></div>
          <div className="rounded-[1.25rem] bg-white/10 p-4"><ShieldCheck className="mb-2 h-5 w-5" /><p className="font-black">Follow-up traps</p></div>
        </div>
      </section>

      <Card>
        <CardHeader><CardTitle>Choose interview lane</CardTitle><BriefcaseBusiness className="h-5 w-5" /></CardHeader>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {jobTracks.filter((item) => tracks.includes(item.id)).map((item) => (
            <button key={item.id} onClick={() => { setTrack(item.id); const next = availableSessions.find((s) => s.track === item.id); if (next) setSessionId(next.id); }} className={`rounded-[1.25rem] border p-4 text-left transition ${track === item.id ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950" : "border-slate-200 bg-white hover:-translate-y-1 dark:border-white/10 dark:bg-white/5"}`}>
              <h3 className="text-base font-black">{item.title}</h3>
              <p className={`mt-1 text-xs font-bold ${track === item.id ? "opacity-75" : "text-slate-500 dark:text-slate-400"}`}>{item.description}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card className="border-0 shadow-card">
        <CardHeader>
          <div>
            <Badge className="mb-2 bg-slate-950 text-white dark:bg-white dark:text-slate-950">Interview Simulator</Badge>
            <CardTitle className="text-2xl">30-minute mock interview</CardTitle>
            <p className="mt-1 font-bold text-slate-500 dark:text-slate-400">Designed for speaking practice. Reveal the coach answer only after you try your own answer aloud.</p>
          </div>
          <Clock className="h-6 w-6 text-sky-500" />
        </CardHeader>
        <div className="grid gap-3 md:grid-cols-[.85fr_1.15fr]">
          <div className="space-y-3">
            {availableSessions.map((s) => (
              <button key={s.id} onClick={() => setSessionId(s.id)} className={`w-full rounded-[1.25rem] border p-4 text-left ${session?.id === s.id ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950" : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"}`}>
                <div className="flex items-center justify-between gap-2"><Badge className={session?.id === s.id ? "bg-white/15 text-white dark:bg-slate-950/10 dark:text-slate-950" : ""}>{s.role}</Badge><span className="text-xs font-black">{s.minutes} min</span></div>
                <h3 className="mt-2 text-lg font-black">{s.title}</h3>
                <p className={`mt-1 text-xs font-bold ${session?.id === s.id ? "opacity-75" : "text-slate-500 dark:text-slate-400"}`}>{s.questionIds.length} high-value questions · warm-up to closing</p>
              </button>
            ))}
            <Button onClick={() => startSession()} size="lg" variant="hero" className="w-full"><Play className="h-4 w-4" /> Start 30-minute simulation</Button>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/40">
            {started && activeQuestion ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge>{phaseLabel(activeQuestion)}</Badge>
                  <Badge className="bg-amber-300 text-slate-950">~{Math.max(3, Math.round((session?.minutes ?? 30) / Math.max(1, sessionQuestions.length)))} min answer</Badge>
                </div>
                <Progress value={progress} />
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">Question {index + 1}/{sessionQuestions.length}</p>
                  <h2 className="mt-2 text-2xl font-black leading-tight">{activeQuestion.question}</h2>
                </div>
                <div className="rounded-2xl bg-white p-4 dark:bg-white/10"><p className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">What they are testing</p><p className="mt-1 font-bold">{activeQuestion.testing}</p></div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {activeQuestion.scoreRubric.map((item) => (
                    <button key={item} onClick={() => setChecked((prev) => ({ ...prev, [item]: !prev[item] }))} className={`flex items-center gap-2 rounded-xl p-3 text-left text-sm font-black ${checked[item] ? "bg-emerald-500 text-white" : "bg-white dark:bg-white/10"}`}><CheckCircle2 className="h-4 w-4" /> {item}</button>
                  ))}
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button onClick={() => setCoachOpen((v) => !v)} variant="soft" size="lg"><Sparkles className="h-4 w-4" /> {coachOpen ? "Hide coach answer" : "Show coach answer"}</Button>
                  <Button onClick={nextQuestion} variant="hero" size="lg">{index + 1 >= sessionQuestions.length ? "Finish interview" : "Next question"} <ArrowRight className="h-4 w-4" /></Button>
                </div>
                {coachOpen ? <CoachAnswer question={activeQuestion} /> : null}
              </div>
            ) : (
              <div className="grid min-h-[24rem] place-items-center text-center">
                <div>
                  <PauseCircle className="mx-auto mb-3 h-10 w-10 text-slate-400" />
                  <h3 className="text-2xl font-black">Ready when you are.</h3>
                  <p className="mx-auto mt-2 max-w-md font-bold text-slate-500 dark:text-slate-400">Pick a lane, start the simulation, answer aloud, then reveal the coach answer and score yourself against the rubric.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <Badge className="mb-2 bg-violet-500 text-white">Project-to-Interview Mapper</Badge>
            <CardTitle className="text-2xl">Choose projects. Get the pitch, STAR story, architecture talk, and interview answers.</CardTitle>
          </div>
          <Network className="h-6 w-6" />
        </CardHeader>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {projectStories.map((p) => {
            const on = selectedProjects.includes(p.id);
            return <button key={p.id} onClick={() => setSelectedProjects((prev) => on ? prev.filter((id) => id !== p.id) : [...prev, p.id])} className={`rounded-[1.25rem] border p-4 text-left transition ${on ? "border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950" : "border-slate-200 bg-white dark:border-white/10 dark:bg-white/5"}`}><Badge className={on ? "bg-white/15 text-white dark:bg-slate-950/10 dark:text-slate-950" : ""}>{p.shortName}</Badge><p className="mt-2 text-sm font-black">{p.headline}</p></button>;
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {tracks.map((t) => <Button key={t} onClick={() => setMapperTrack(t)} variant={mapperTrack === t ? "default" : "soft"} size="sm">{t}</Button>)}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-4">
            {mappedProjects.length ? mappedProjects.map((p) => <ProjectMapperCard key={p.id} projectId={p.id} />) : <p className="rounded-2xl bg-slate-100 p-4 font-bold text-slate-500 dark:bg-white/10">Select at least one project.</p>}
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-black">Questions this project set can answer</h3>
            {mapperQuestions.map((q) => (
              <div key={q.id} className="rounded-[1.25rem] bg-slate-100 p-4 dark:bg-white/10">
                <div className="mb-2 flex flex-wrap gap-2"><Badge>{q.track}</Badge><Badge className="bg-white text-slate-800 dark:bg-slate-950 dark:text-white">{q.level}</Badge></div>
                <p className="font-black">{q.question}</p>
                <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400">Say: {q.sayThis.slice(0, 190)}...</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-3">
        <Button asChild size="lg" variant="hero"><Link to={`/cert/${pathFor(cert)}/knowledge`}>Practice exam questions</Link></Button>
        <Button asChild size="lg" variant="soft"><Link to={`/cert/${pathFor(cert)}/readiness`}>Check exam readiness</Link></Button>
        <Button asChild size="lg" variant="soft"><Link to={`/history?cert=${cert}`}>Review attempts</Link></Button>
      </div>
    </motion.div>
  );
}

function CoachAnswer({ question }: { question: InterviewQuestion }) {
  const project = projectStories.find((p) => p.id === question.bestProjects[0]);
  return <div className="space-y-3 rounded-[1.25rem] bg-white p-4 shadow-sm dark:bg-white/10">
    <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-950 dark:bg-emerald-500/15 dark:text-emerald-50"><p className="text-xs font-black uppercase opacity-70">Say this</p><p className="mt-1 font-black leading-relaxed">{question.sayThis}</p></div>
    <div><p className="mb-2 text-xs font-black uppercase text-slate-500 dark:text-slate-400">Answer structure</p><div className="grid gap-2">{question.answerStructure.map((i) => <div key={i} className="flex items-center gap-2 rounded-xl bg-slate-100 p-3 text-sm font-black dark:bg-slate-950/50"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> {i}</div>)}</div></div>
    <div className="grid gap-3 sm:grid-cols-2"><div><p className="mb-2 text-xs font-black uppercase text-slate-500 dark:text-slate-400">Follow-up traps</p>{question.followUps.map((i) => <p key={i} className="mb-2 rounded-xl bg-amber-50 p-3 text-sm font-bold text-amber-950 dark:bg-amber-500/15 dark:text-amber-50">{i}</p>)}</div><div><p className="mb-2 text-xs font-black uppercase text-slate-500 dark:text-slate-400">Avoid saying</p>{question.avoid.map((i) => <p key={i} className="mb-2 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-950 dark:bg-rose-500/15 dark:text-rose-50">{i}</p>)}</div></div>
    {project ? <div className="rounded-2xl bg-slate-950 p-4 text-white dark:bg-white dark:text-slate-950"><p className="text-xs font-black uppercase opacity-70">Best project to mention</p><h3 className="mt-1 text-lg font-black">{project.title}</h3><p className="mt-2 text-sm font-bold opacity-80">{project.thirtySecond}</p></div> : null}
  </div>;
}

function ProjectMapperCard({ projectId }: { projectId: string }) {
  const project = projectStories.find((p) => p.id === projectId);
  const [tab, setTab] = useState<"pitch" | "star" | "architecture" | "resume">("pitch");
  if (!project) return null;
  return <div className="rounded-[1.35rem] border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
    <div className="flex flex-wrap items-center justify-between gap-2"><div><Badge>{project.shortName}</Badge><h3 className="mt-2 text-xl font-black">{project.title}</h3></div><Button asChild variant="soft" size="sm"><a href={project.sourceUrl} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> Source</a></Button></div>
    <div className="mt-3 flex flex-wrap gap-2">{(["pitch", "star", "architecture", "resume"] as const).map((t) => <Button key={t} onClick={() => setTab(t)} variant={tab === t ? "default" : "soft"} size="sm">{t}</Button>)}</div>
    <div className="mt-4 space-y-3">
      {tab === "pitch" ? <><div className="rounded-2xl bg-slate-100 p-4 dark:bg-white/10"><p className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">30-second pitch</p><p className="mt-1 font-black">{project.thirtySecond}</p></div><div className="rounded-2xl bg-slate-100 p-4 dark:bg-white/10"><p className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">2-minute version</p><p className="mt-1 text-sm font-bold">{project.twoMinute}</p></div></> : null}
      {tab === "star" ? <div className="rounded-2xl bg-slate-100 p-4 dark:bg-white/10"><p className="text-sm font-bold"><b>Situation:</b> {project.star.situation}</p><p className="mt-2 text-sm font-bold"><b>Task:</b> {project.star.task}</p><p className="mt-2 text-sm font-bold"><b>Action:</b> {project.star.action}</p><p className="mt-2 text-sm font-bold"><b>Result:</b> {project.star.result}</p></div> : null}
      {tab === "architecture" ? <div className="grid gap-2">{project.architectureTalk.map((i, n) => <div key={i} className="flex gap-3 rounded-xl bg-slate-100 p-3 text-sm font-black dark:bg-white/10"><span className="grid h-6 w-6 place-items-center rounded-full bg-slate-950 text-xs text-white dark:bg-white dark:text-slate-950">{n + 1}</span>{i}</div>)}<div className="rounded-2xl bg-slate-950 p-4 text-white dark:bg-white dark:text-slate-950"><p className="text-xs font-black uppercase opacity-70">Deep dive points</p>{project.technicalDeepDive.map((i) => <p key={i} className="mt-2 text-sm font-bold">• {i}</p>)}</div></div> : null}
      {tab === "resume" ? <div className="grid gap-2">{project.resumeBullets.map((b) => <p key={b} className="rounded-xl bg-slate-950 p-3 text-sm font-bold text-white dark:bg-white dark:text-slate-950">{b}</p>)}<p className="rounded-xl bg-slate-100 p-3 text-sm font-bold dark:bg-white/10">Metrics to mention: {project.metrics.join(" · ")}</p></div> : null}
    </div>
  </div>;
}
