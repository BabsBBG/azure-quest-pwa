import type { Cert } from "../types";

export interface CaseFile {
  id: string;
  cert: Cert;
  title: string;
  org: string;
  minutes: number;
  questions: number;
  summary: string;
  architecture: string;
  focusDomain?: string;
  tags: string[];
}

export const caseFiles: CaseFile[] = [
  {
    id: "helix-pulse-identity-merger",
    cert: "SC-300",
    title: "Helix x Pulse Identity Merger",
    org: "Helix x Pulse Networks",
    minutes: 20,
    questions: 8,
    summary: "Post-acquisition identity cleanup: stale accounts, missing MFA, standing admin rights, guest collaboration, and lifecycle workflows.",
    architecture: "Pulse AD -> Entra Connect -> Helix tenant\nPartners -> B2B guests -> Teams/SharePoint\nAdmins -> PIM -> privileged roles",
    focusDomain: "Plan and automate identity governance",
    tags: ["pim", "access-reviews", "lifecycle", "b2b", "conditional-access"]
  },
  {
    id: "nexus-sentinel-rollout",
    cert: "AZ-500",
    title: "Nexus Financial Sentinel Rollout",
    org: "Nexus Financial",
    minutes: 20,
    questions: 8,
    summary: "Deploy Sentinel, connect Entra logs, tune analytics, automate phishing response, and improve Defender for Cloud posture.",
    architecture: "Entra ID logs -> Sentinel workspace\nDefender alerts -> Sentinel incidents\nPlaybook -> disable user + revoke sessions",
    focusDomain: "Secure Azure using Defender for Cloud and Sentinel",
    tags: ["sentinel", "kql", "defender", "playbooks", "incident-response"]
  },
  {
    id: "clearvault-secure-baseline",
    cert: "AZ-500",
    title: "ClearVault Secure Baseline",
    org: "ClearVault Finance",
    minutes: 20,
    questions: 8,
    summary: "Design hub-spoke networking, private access, storage hardening, Key Vault access, and VM JIT controls.",
    architecture: "Hub VNet: Firewall + Bastion\nSpokes: App, Data, Management\nStorage/SQL -> Private Endpoints\nVMs -> JIT + Defender",
    focusDomain: "Secure networking",
    tags: ["hub-spoke", "private-endpoint", "storage", "key-vault", "jit"]
  },
  {
    id: "fortisaid-ai-security",
    cert: "SC-500",
    title: "FortisAid AI Security Review",
    org: "FortisAid Healthcare",
    minutes: 20,
    questions: 8,
    summary: "Secure AI workloads, sensitive healthcare data, AI agents, DSPM findings, and Security Copilot-assisted investigations.",
    architecture: "Sensitive docs -> Purview DSPM\nAI app -> APIM AI Gateway -> Foundry endpoint\nAgents -> Entra Agent ID + Conditional Access",
    focusDomain: "Manage and monitor security posture",
    tags: ["ai-security", "dspm", "security-copilot", "agentic-ai", "defender"]
  }
];
