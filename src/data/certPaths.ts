import type { Cert } from "../types";

export interface CertPathMeta {
  cert: Cert;
  title: string;
  role: string;
  accent: string;
  summary: string;
  targetRoles: string[];
  readinessTarget: number;
  examFormat: string;
  quizFormat: string;
}

export const certPaths: CertPathMeta[] = [
  {
    cert: "SC-300",
    title: "Identity & Access Administrator",
    role: "IAM / Entra ID",
    accent: "from-emerald-900 via-emerald-700 to-lime-500",
    summary: "Master Entra ID, Conditional Access, workload identities, PIM, access reviews, and identity governance.",
    targetRoles: ["IAM Analyst", "Identity Engineer", "Entra Administrator", "Cloud Security Analyst"],
    readinessTarget: 80,
    examFormat: "50 questions · 100 minutes · weighted by domain",
    quizFormat: "10 questions · 12 minutes · focused sprints"
  },
  {
    cert: "AZ-500",
    title: "Azure Security Engineer",
    role: "Azure Security",
    accent: "from-emerald-800 via-teal-700 to-emerald-500",
    summary: "Secure identity, networks, compute, storage, databases, Defender for Cloud, and Microsoft Sentinel.",
    targetRoles: ["Azure Security Engineer", "Cloud Security Engineer", "Cloud SOC Analyst", "Security Operations Engineer"],
    readinessTarget: 82,
    examFormat: "50 questions · 100 minutes · Defender/Sentinel heavy",
    quizFormat: "10 questions · 12 minutes · domain-based drills"
  },
  {
    cert: "SC-500",
    title: "Cloud & AI Security Engineer",
    role: "Cloud + AI Security",
    accent: "from-emerald-950 via-emerald-800 to-green-600",
    summary: "Prepare for cloud, hybrid, multicloud, Microsoft security posture, Copilot, AI workload, and agent security.",
    targetRoles: ["Cloud Security Engineer", "AI Security Engineer", "Cloud SOC Engineer", "Security Engineer"],
    readinessTarget: 82,
    examFormat: "50 questions · 100 minutes · cloud + AI security mix",
    quizFormat: "10 questions · 12 minutes · modern security sprints"
  }
];

export function certSlug(cert: Cert) {
  return cert.toLowerCase();
}

export function certFromSlug(slug?: string): Cert {
  const normalized = (slug ?? "").toUpperCase();
  if (normalized === "AZ-500" || normalized === "SC-500" || normalized === "SC-300") return normalized;
  return "SC-300";
}

export function pathFor(cert: Cert) {
  return cert.toLowerCase();
}

export function metaFor(cert: Cert) {
  return certPaths.find((path) => path.cert === cert) ?? certPaths[0];
}
