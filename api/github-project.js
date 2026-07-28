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

async function claimImportQuota(db, { userId, repoKey, contentHash }) {
  const { data, error } = await db.rpc("claim_github_import_quota", {
    p_user_id: userId,
    p_repo_key: repoKey,
    p_content_hash: contentHash,
    p_daily_limit: dailyLimit
  });
  if (error) {
    const limitReached = String(error.message ?? "").includes("Daily public repo import limit reached");
    const dbError = new Error(limitReached ? `Daily public repo import limit reached (${dailyLimit}).` : "Unable to claim public repo import quota.");
    dbError.statusCode = limitReached ? 429 : 503;
    throw dbError;
  }
  return data?.[0] ?? { remaining: 0 };
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

function detectProjectIntelligence({ contentHash, readme, primaryLanguage, languages, repoMeta }) {
  const lower = readme.toLowerCase();
  const detectedFrameworks = [
    lower.includes("react") ? "React" : null,
    lower.includes("vite") ? "Vite" : null,
    lower.includes("next") ? "Next.js" : null,
    lower.includes("express") ? "Express" : null,
    lower.includes("fastapi") ? "FastAPI" : null,
    lower.includes("supabase") ? "Supabase" : null,
    lower.includes("postgres") || lower.includes("postgresql") ? "Postgres" : null,
    lower.includes("docker") ? "Docker" : null,
    lower.includes("github actions") ? "GitHub Actions" : null
  ].filter(Boolean);
  const languageLine = [primaryLanguage, ...languages.filter((item) => item !== primaryLanguage)].filter(Boolean).slice(0, 5);
  const files = ["README.md"];
  const hasTests = /\b(test|tests|vitest|jest|playwright|pytest)\b/.test(lower);
  const hasApi = /\b(api|endpoint|route|controller|server)\b/.test(lower);
  const hasAuth = /\b(auth|oauth|login|sign in|jwt|session)\b/.test(lower);
  const hasCi = /\b(ci|github actions|workflow|pipeline)\b/.test(lower);
  const hasDeploy = /\b(vercel|netlify|docker|deploy|hosting|cloud)\b/.test(lower);
  const hasObservability = /\b(log|logging|monitoring|metrics|telemetry|observability)\b/.test(lower);

  return {
    id: `analysis-${contentHash.slice(0, 24)}`,
    generatedAt: new Date().toISOString(),
    contentHash,
    overview: {
      projectType: hasApi ? "Application or service with API-facing behaviour" : "Repository with documentation-backed implementation evidence",
      detectedFrameworks,
      keyEntryPoints: files,
      persistence: lower.includes("database") || lower.includes("postgres") || lower.includes("sql") ? "Persistence is mentioned in repository evidence." : "No persistence layer is confirmed from retrieved evidence.",
      apis: hasApi ? "API behaviour is mentioned in retrieved evidence." : "No API boundary is confirmed from retrieved evidence.",
      integrations: detectedFrameworks.length ? `Detected stack signals: ${detectedFrameworks.join(", ")}.` : "No external integration is confirmed from retrieved evidence.",
      authentication: hasAuth ? "Authentication is mentioned in retrieved evidence." : "Authentication is not confirmed from retrieved evidence.",
      tests: hasTests ? "Testing signals are present in retrieved evidence." : "Testing is not confirmed from retrieved evidence.",
      deployment: hasDeploy ? "Deployment or hosting signals are present in retrieved evidence." : "Deployment is not confirmed from retrieved evidence.",
      ciCd: hasCi ? "CI/CD signals are present in retrieved evidence." : "CI/CD is not confirmed from retrieved evidence.",
      observability: hasObservability ? "Observability signals are present in retrieved evidence." : "Observability is not confirmed from retrieved evidence."
    },
    architectureMap: [
      { label: "Repository overview and stated purpose", files, confidence: "confirmed" },
      { label: `Implementation stack: ${languageLine.join(", ") || "not confidently detected"}`, files, confidence: languageLine.length ? "confirmed" : "inferred" },
      { label: hasApi ? "API boundary appears in repository evidence" : "Inspect source tree before claiming API ownership", files, confidence: hasApi ? "confirmed" : "recommendation" },
      { label: hasDeploy ? "Deployment path appears in repository evidence" : "Add deployment evidence before presenting operations maturity", files, confidence: hasDeploy ? "confirmed" : "recommendation" }
    ],
    strengths: [
      { label: "Public evidence can be reviewed without requesting private GitHub scopes", files, confidence: "confirmed" },
      { label: detectedFrameworks.length ? "Stack signals are explicit enough for an interview walkthrough" : "Repository needs clearer stack documentation", files, confidence: detectedFrameworks.length ? "confirmed" : "recommendation" },
      { label: hasTests ? "Testing evidence is visible" : "Add visible test evidence or avoid claiming test maturity", files, confidence: hasTests ? "confirmed" : "recommendation" }
    ],
    risksAndImprovements: [
      { label: "Generated project story must be reviewed before use as final evidence", files, confidence: "recommendation" },
      { label: hasAuth ? "Explain authentication boundaries precisely and cite the relevant files" : "Do not claim authentication design until source evidence is reviewed", files, confidence: hasAuth ? "recommendation" : "confirmed" },
      { label: hasObservability ? "Prepare an operations answer using the monitoring evidence" : "Add logging or monitoring evidence before claiming observability", files, confidence: hasObservability ? "recommendation" : "confirmed" }
    ],
    interviewQuestions: [
      "What problem does this repository solve, and where is that visible in the evidence?",
      "Which implementation choices are confirmed by files rather than inferred?",
      "What would you improve first if you had one day?",
      "How would you test the riskiest path?",
      "What security boundary should an interviewer ask you to defend?"
    ],
    status: "draft"
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
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const parsed = parseRepoUrl(String(body?.url ?? ""));

    const repoKey = `${parsed.owner.toLowerCase()}/${parsed.repo.toLowerCase()}`;
    const cached = await readCachedImport(db, repoKey);
    if (cached) {
      const quota = await claimImportQuota(db, { userId: user.id, repoKey, contentHash: cached.project.contentHash });
      res.status(200).json({
        ...cached,
        cached: true,
        controls: { ...cached.controls, dailyLimit, remainingToday: quota.remaining, cacheTtlHours }
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
    const analysis = detectProjectIntelligence({ contentHash, readme, primaryLanguage, languages, repoMeta });
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
        storyDraft: makeStoryDraft({ ...parsed, readme, primaryLanguage, languages }),
        analysis
      },
      controls: {
        permissionModel: "public-read-only",
        dailyLimit,
        remainingToday: 0,
        cacheKey: contentHash,
        cacheTtlHours,
        storyGeneration: "server-side deterministic draft",
        rateLimitStorage: "supabase-user-day-rpc",
        cacheStorage: "supabase-repo-content-hash"
      }
    };

    const quota = await claimImportQuota(db, { userId: user.id, repoKey, contentHash });
    result.controls.remainingToday = quota.remaining;
    await writeCachedImport(db, { repoKey, parsed, result });
    res.status(200).json(result);
  } catch (error) {
    const statusCode = error.statusCode && Number(error.statusCode) >= 400 ? Number(error.statusCode) : 400;
    res.status(statusCode).json({ error: error instanceof Error ? error.message : "Unable to import repository." });
  }
}
