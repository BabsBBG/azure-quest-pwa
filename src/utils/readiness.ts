import type { Cert, ExamAttempt, Question, ReadinessReport } from "../types";

const CERTS: Cert[] = ["SC-300", "AZ-500", "SC-500"];

function avg(values: number[]) { return values.length ? Math.round(values.reduce((a,b)=>a+b,0)/values.length) : 0; }
function clamp(n: number, min=0, max=100) { return Math.max(min, Math.min(max, Math.round(n))); }

export function domainAverages(attempts: ExamAttempt[], cert?: Cert) {
  const map: Record<string, {correct:number; total:number}> = {};
  attempts.filter(a => !cert || a.cert === cert).forEach(a => {
    Object.entries(a.domains).forEach(([domain, s]) => {
      map[domain] ??= { correct: 0, total: 0 };
      map[domain].correct += s.correct;
      map[domain].total += s.total;
    });
  });
  return Object.fromEntries(Object.entries(map).map(([domain, s]) => [domain, { ...s, percentage: s.total ? Math.round((s.correct/s.total)*100) : 0 }]));
}

export function mistakeTaxonomy(attempts: ExamAttempt[]) {
  const tax: Record<string, number> = {};
  attempts.forEach(a => a.answers.filter(x => !x.correct).forEach(x => {
    const tags = x.tags.join(" ").toLowerCase();
    let label = "Concept gap";
    if (tags.includes("least") || tags.includes("rbac") || tags.includes("pim")) label = "Least privilege miss";
    else if (tags.includes("sentinel") || tags.includes("kql")) label = "Sentinel/KQL mix-up";
    else if (tags.includes("defender")) label = "Defender scope mix-up";
    else if (tags.includes("private") || tags.includes("endpoint") || tags.includes("network")) label = "Private access vs network control";
    else if (tags.includes("managed") || tags.includes("app") || tags.includes("workload")) label = "Workload identity choice";
    else if (tags.includes("conditional") || tags.includes("risk") || tags.includes("mfa")) label = "Access policy decision";
    tax[label] = (tax[label] ?? 0) + 1;
  }));
  return tax;
}

export function readinessForCert(cert: Cert, attempts: ExamAttempt[], bank: Question[] = []): ReadinessReport {
  const recent = attempts.filter(a => a.cert === cert).slice(0, 20);
  const exams = recent.filter(a => a.kind === "exam");
  const quizzes = recent.filter(a => a.kind === "quiz" || a.kind === "daily");
  const avgScore = avg(recent.map(a => a.percentage));
  const examAverage = avg(exams.map(a => a.percentage));
  const quizAverage = avg(quizzes.map(a => a.percentage));
  const variance = recent.length ? avg(recent.map(a => Math.abs(a.percentage - avgScore))) : 30;
  const consistency = clamp(100 - variance * 1.7);
  const timeManagement = avg(recent.map(a => a.timeLimitSeconds ? Math.min(100, Math.round((a.timeLimitSeconds / Math.max(a.timeTakenSeconds,1)) * 70)) : 75));
  const hardIds = new Set(bank.filter(q => q.cert === cert && q.difficulty === "hard").map(q => q.id));
  const hardAnswers = recent.flatMap(a => a.answers).filter(ans => hardIds.has(ans.questionId));
  const hardAccuracy = hardAnswers.length ? Math.round((hardAnswers.filter(a => a.correct).length / hardAnswers.length) * 100) : avgScore;
  const domains = domainAverages(recent, cert);
  const sorted = Object.entries(domains).sort((a,b) => a[1].percentage - b[1].percentage);
  const weakestDomain = sorted[0]?.[0];
  const strongestDomain = sorted[sorted.length - 1]?.[0];
  const raw = recent.length
    ? avgScore * 0.35 + (examAverage || avgScore) * 0.25 + consistency * 0.15 + timeManagement * 0.1 + (hardAccuracy || avgScore) * 0.15
    : 0;
  const readiness = clamp(raw);
  const status = readiness >= 85 ? "Exam ready" : readiness >= 72 ? "Almost ready" : readiness >= 55 ? "Building" : "Needs reps";
  const recommendation = !recent.length ? "Start with a 12-minute quiz sprint, then one weighted mock exam." : readiness >= 85 ? "Maintain with one case file and one KQL Gym per week." : weakestDomain ? `Attack ${weakestDomain} with a sprint, then retake missed questions.` : "Run a balanced mock exam to reveal weak domains.";
  return { cert, readiness, status, weakestDomain, strongestDomain, averageScore: avgScore, examAverage, quizAverage, consistency, timeManagement, hardAccuracy, attempts: recent.length, recommendation };
}

export function readinessAll(attempts: ExamAttempt[], bank: Question[] = []) { return CERTS.map(c => readinessForCert(c, attempts, bank)); }

export function readinessDeltaFromAttempt(attempt: ExamAttempt) {
  const base = attempt.kind === "exam" ? 4 : attempt.kind === "case" ? 3 : attempt.kind === "kql" ? 2 : 1;
  return Math.max(0, Math.round((attempt.percentage - 50) / 10) + base);
}
