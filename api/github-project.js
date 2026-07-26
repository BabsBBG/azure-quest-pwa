import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const dailyLimit = Number(process.env.GITHUB_IMPORT_DAILY_LIMIT ?? 8);
const cacheTtlHours = Number(process.env.GITHUB_IMPORT_CACHE_TTL_HOURS ?? 24);
const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function parseRepoUrl(value) {
  const url = new URL(value);
  if (url.hostname !== "github.com" && url.hostname !== "www.github.com") {
    throw new Error("Only public github.com repository URLs are supported.");
  }
  const [owner, repoName] = url.pathname.split("/").filter(Boolean);
  if (!owner || !repoName) throw new Error("Enter a GitHub repository URL with an owner and repo name.");
  const repo = repoName.replace(/\.git$/, "");
  return { owner, repo, url: `https://github.com/${owner}/${repo}` };
}

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function serverSupabase() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    const error = new Error("GitHub import is unavailable until server-side Supabase controls are configured.");
    error.statusCode = 503;
    throw error;
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}

async function authenticateUser(req, db) {
  const token = String(req.headers.authorization ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    const error = new Error("Sign in is required before importing a public GitHub repository.");
    error.statusCode = 401;
    throw error;
  }

  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) {
    const authError = new Error("Your session could not be verified. Please sign in again.");
    authError.statusCode = 401;
    throw authError;
  }
  return data.user;
}

async function checkRateLimit(db, userId) {
  const importDay = new Date().toISOString().slice(0, 10);
  const { count, error } = await db
    .from("github_import_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("import_day", importDay);

  if (error) {
    const dbError = new Error("Unable to verify public repo import limit.");
    dbError.statusCode = 503;
    throw dbError;
  }

  if (count >= dailyLimit) {
    const error = new Error(`Daily public repo import limit reached (${dailyLimit}).`);
    error.statusCode = 429;
    throw error;
  }
  return { importDay, remaining: Math.max(0, dailyLimit - Number(count ?? 0) - 1) };
}

async function recordImportEvent(db, { userId, importDay, repoKey, contentHash }) {
  const { error } = await db.from("github_import_events").insert({
    user_id: userId,
    import_day: importDay,
    repo_key: repoKey,
    content_hash: contentHash
  });
  if (error) {
    const dbError = new Error("Unable to record public repo import usage.");
    dbError.statusCode = 503;
    throw dbError;
  }
}

function isFreshCacheEntry(entry) {
  if (!entry?.updated_at) return false;
  const ageMs = Date.now() - new Date(entry.updated_at).getTime();
  return ageMs >= 0 && ageMs <= cacheTtlHours * 60 * 60 * 1000;
}

async function readCachedImport(db, repoKey) {
  const { data, error } = await db
    .from("github_import_cache")
    .select("payload, updated_at")
    .eq("repo_key", repoKey)
    .maybeSingle();
  if (error) {
    const dbError = new Error("Unable to read public repo import cache.");
    dbError.statusCode = 503;
    throw dbError;
  }
  if (!isFreshCacheEntry(data)) return null;
  return data.payload;
}

async function writeCachedImport(db, { repoKey, parsed, result }) {
  const { error } = await db.from("github_import_cache").upsert({
    repo_key: repoKey,
    owner: parsed.owner,
    repo: parsed.repo,
    source_url: parsed.url,
    default_branch: result.project.defaultBranch,
    content_hash: result.project.contentHash,
    payload: result,
    fetched_at: result.project.importedAt,
    updated_at: new Date().toISOString()
  });
  if (error) {
    const dbError = new Error("Unable to cache public repo import result.");
    dbError.statusCode = 503;
    throw dbError;
  }
}

async function githubJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "praxisgrid-public-import"
    }
  });
  if (!response.ok) {
    const error = new Error(`GitHub returned ${response.status} for ${url}.`);
    error.statusCode = response.status;
    throw error;
  }
  return response.json();
}

function makeStoryDraft({ owner, repo, readme, primaryLanguage, languages }) {
  const name = repo.replace(/[-_]/g, " ");
  const languageLine = [primaryLanguage, ...languages.filter((item) => item !== primaryLanguage)].filter(Boolean).slice(0, 4).join(", ") || "the project stack";
  const firstHeading = readme.split(/\r?\n/).find((line) => line.trim().startsWith("#"))?.replace(/^#+\s*/, "").trim() || name;

  return {
    pitch30: `${firstHeading} is a public GitHub project I can use to explain practical security delivery: the goal, the implementation choices, and the evidence I would show during an interview. I would frame it around the problem it solves, the controls it demonstrates, and what I would improve next.`,
    walkthrough2m: `I would start with the user or security problem, then walk through the repository structure, the ${languageLine} implementation, and the controls demonstrated in the README. I would call out tradeoffs, testing evidence, operational risks, and the next hardening step instead of overselling the project.`,
    star: {
      situation: `${owner}/${repo} gives me a concrete project to discuss instead of speaking hypothetically.`,
      task: "Turn the repository into a clear interview story with problem, design, implementation, validation, and lessons learned.",
      action: "Review the README, identify the technical stack and security-relevant decisions, map the work to role expectations, and prepare follow-up answers around limitations.",
      result: "A draft story that can be reviewed, edited, and approved before it is used in mock interviews."
    },
    architecture: [
      "Explain the entry point and user/security problem first.",
      `Describe the implementation stack: ${languageLine}.`,
      "Show where configuration, data flow, validation, and operational controls live.",
      "Name one limitation and one realistic hardening step."
    ],
    resumeBullets: [
      `Built and documented ${firstHeading}, using ${languageLine} to demonstrate practical security delivery.`,
      "Prepared architecture walkthrough, STAR story, risks, and follow-up answers from public repository evidence.",
      "Converted project documentation into interview-ready security impact, tradeoffs, and improvement plan."
    ],
    risks: [
      "README evidence may be incomplete; review code before approving the story.",
      "Do not claim production impact unless metrics are present in the repository.",
      "Keep secrets, private customer details, and unsupported claims out of the final story."
    ]
  };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  try {
    const db = serverSupabase();
    const user = await authenticateUser(req, db);
    const rate = await checkRateLimit(db, user.id);
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const parsed = parseRepoUrl(String(body?.url ?? ""));

    const repoKey = `${parsed.owner.toLowerCase()}/${parsed.repo.toLowerCase()}`;
    const cached = await readCachedImport(db, repoKey);
    if (cached) {
      await recordImportEvent(db, { userId: user.id, importDay: rate.importDay, repoKey, contentHash: cached.project.contentHash });
      res.status(200).json({
        ...cached,
        cached: true,
        controls: { ...cached.controls, dailyLimit, remainingToday: rate.remaining, cacheTtlHours }
      });
      return;
    }

    const repoMeta = await githubJson(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`);
    if (repoMeta.private) {
      res.status(403).json({ error: "Private repositories are not supported in this milestone." });
      return;
    }

    const readmeMeta = await githubJson(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}/readme`);
    const readme = Buffer.from(readmeMeta.content ?? "", "base64").toString("utf8").slice(0, 80_000);
    const languageStats = await githubJson(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}/languages`).catch(() => ({}));
    const languages = Object.keys(languageStats).slice(0, 8);
    const primaryLanguage = repoMeta.language ?? languages[0] ?? null;
    const contentHash = hash(JSON.stringify({ readme, languageStats, defaultBranch: repoMeta.default_branch }));
    const importedAt = new Date().toISOString();
    const result = {
      project: {
        id: contentHash.slice(0, 24),
        owner: parsed.owner,
        repo: parsed.repo,
        url: parsed.url,
        defaultBranch: repoMeta.default_branch ?? "main",
        primaryLanguage,
        languages,
        stars: repoMeta.stargazers_count ?? 0,
        readme,
        readmeExcerpt: readme.replace(/\s+/g, " ").slice(0, 420),
        contentHash,
        importedAt,
        status: "draft",
        storyDraft: makeStoryDraft({ ...parsed, readme, primaryLanguage, languages })
      },
      controls: {
        permissionModel: "public-read-only",
        dailyLimit,
        remainingToday: rate.remaining,
        cacheKey: contentHash,
        cacheTtlHours,
        storyGeneration: "server-side deterministic draft",
        rateLimitStorage: "supabase-user-day",
        cacheStorage: "supabase-repo-content-hash"
      }
    };

    await writeCachedImport(db, { repoKey, parsed, result });
    await recordImportEvent(db, { userId: user.id, importDay: rate.importDay, repoKey, contentHash });
    res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode && Number(error.statusCode) >= 400 ? Number(error.statusCode) : 400;
    res.status(statusCode).json({ error: error instanceof Error ? error.message : "Unable to import repository." });
  }
}
