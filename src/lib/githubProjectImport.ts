import type { ImportedProject } from "../types";
import { isSupabaseConfigured, supabase } from "./supabase";

const IMPORT_LIMIT = 8;
const STORAGE_KEY = "praxisgrid:github-import-rate";
const LEGACY_STORAGE_KEY = "azure-quest:github-import-rate";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function parseGitHubRepoUrl(value: string) {
  try {
    const url = new URL(value.trim());
    if (url.hostname !== "github.com" && url.hostname !== "www.github.com") return null;
    const [owner, rawRepo] = url.pathname.split("/").filter(Boolean);
    if (!owner || !rawRepo) return null;
    return { owner, repo: rawRepo.replace(/\.git$/, ""), url: `https://github.com/${owner}/${rawRepo.replace(/\.git$/, "")}` };
  } catch {
    return null;
  }
}

export function canImportPublicRepo() {
  const day = today();
  const raw = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_STORAGE_KEY);
  const bucket = raw ? safeParseBucket(raw, day) : { day, count: 0 };
  if (bucket.day !== day) return { allowed: true, remaining: IMPORT_LIMIT, day };
  return { allowed: bucket.count < IMPORT_LIMIT, remaining: Math.max(0, IMPORT_LIMIT - bucket.count), day };
}

export function recordPublicRepoImport() {
  const day = today();
  const raw = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_STORAGE_KEY);
  const bucket = raw ? safeParseBucket(raw, day) : { day, count: 0 };
  const count = bucket.day === day ? bucket.count + 1 : 1;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ day, count }));
  return { day, count, remaining: Math.max(0, IMPORT_LIMIT - count) };
}

function safeParseBucket(raw: string, day: string) {
  try {
    const parsed = JSON.parse(raw) as { day?: string; count?: number };
    return { day: parsed.day ?? day, count: Number(parsed.count ?? 0) };
  } catch {
    return { day, count: 0 };
  }
}

export async function importPublicGitHubProject(url: string): Promise<ImportedProject> {
  const parsed = parseGitHubRepoUrl(url);
  if (!parsed) throw new Error("Enter a public GitHub repository URL.");
  if (!isSupabaseConfigured || !supabase) throw new Error("Sign in is required before importing a public GitHub repository.");

  const rate = canImportPublicRepo();
  if (!rate.allowed) throw new Error(`Daily public repo import limit reached (${IMPORT_LIMIT}).`);

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) throw new Error("Sign in is required before importing a public GitHub repository.");

  const response = await fetch("/api/github-project", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ url: parsed.url })
  });
  const data = await response.json() as { project?: ImportedProject; error?: string };
  if (!response.ok || !data.project) throw new Error(data.error ?? "Unable to import this repository.");
  recordPublicRepoImport();
  return data.project;
}
