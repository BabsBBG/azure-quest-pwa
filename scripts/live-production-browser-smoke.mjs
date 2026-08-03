import { createClient } from "@supabase/supabase-js";
import { chromium } from "@playwright/test";
import { randomUUID } from "node:crypto";

const EXPECTED_PROJECT_REF = "ozfexprlomzlhkcyagfd";
const EXPECTED_HOST = `${EXPECTED_PROJECT_REF}.supabase.co`;
const DEFAULT_BASE_URL = "https://azure-quest-pwa.vercel.app";

const result = {
  startedAt: new Date().toISOString(),
  projectRef: EXPECTED_PROJECT_REF,
  baseUrl: process.env.PRODUCTION_BASE_URL ?? DEFAULT_BASE_URL,
  checks: [],
  cleanup: [],
  status: "running"
};

const tempUsers = [];

function fail(message) {
  result.status = "failed";
  result.error = message;
  result.finishedAt = new Date().toISOString();
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) fail(`Missing required environment variable: ${name}`);
  return value;
}

function record(name, status, detail = {}) {
  result.checks.push({ name, status, ...detail });
}

function makeClient(url, key) {
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false
    }
  });
}

async function createQaUser(service, role, runId, { onboarded = false } = {}) {
  const password = `Pg1!${randomUUID().replaceAll("-", "")}`;
  const email = `praxisgrid-browser-${runId}-${role.toLowerCase().replaceAll("_", "-")}-${randomUUID().slice(0, 8)}@example.com`;
  const { data, error } = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: `Live ${role}`,
      praxisgrid_onboarded: onboarded,
      praxisgrid_primary_cert: "SC-300",
      praxisgrid_goal: "learn",
      praxisgrid_experience: "new"
    }
  });
  if (error) throw new Error(`create ${role} user failed: ${error.message}`);
  const userId = data.user.id;
  tempUsers.push(userId);

  const assigned = await service.from("user_roles").upsert({
    user_id: userId,
    role,
    assigned_by: null,
    reason: `live_browser_smoke_${runId}`
  });
  if (assigned.error) throw new Error(`assign ${role} failed: ${assigned.error.message}`);

  return { id: userId, email, password, role };
}

async function signIn(page, baseUrl, user, from = "/") {
  const url = new URL("/auth", baseUrl);
  url.searchParams.set("mode", "signin");
  if (from !== "/") url.searchParams.set("from", from);
  await page.goto(url.toString(), { waitUntil: "domcontentloaded" });
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: /^Sign in$/i }).click();
}

async function verifyLearnerOnboardingAndDenial(browser, baseUrl, viewport, user) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  try {
    await signIn(page, baseUrl, user, "/cert/sc-300/knowledge");
    await page.getByRole("heading", { name: /Set up your PraxisGrid workspace/i }).waitFor({ timeout: 30000 });
    await page.getByRole("button", { name: /Enter workspace/i }).click();
    await page.getByText(/Demo practice bank:/i).first().waitFor({ timeout: 30000 });

    await page.goto(new URL("/admin", baseUrl).toString(), { waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { name: /Admin access denied/i }).waitFor({ timeout: 30000 });

    await page.goto(new URL("/flashcards", baseUrl).toString(), { waitUntil: "domcontentloaded" });
    await page.getByText(/Demo practice bank:/i).first().waitFor({ timeout: 30000 });

    record(`learner browser smoke ${viewport.width}x${viewport.height}`, "passed", {
      onboarding: true,
      adminDenied: true,
      trustCopy: true
    });
  } finally {
    await context.close();
  }
}

async function verifySupportAdmin(browser, baseUrl, supportUser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  try {
    await signIn(page, baseUrl, supportUser, "/admin");
    await page.getByRole("heading", { name: /Review Studio/i }).waitFor({ timeout: 30000 });
    await page.getByText("SUPPORT_ADMIN").first().waitFor({ timeout: 30000 });
    await page.getByRole("button", { name: /Inspect Reports/i }).waitFor({ timeout: 30000 });
    const approveCount = await page.getByRole("button", { name: /Approve/i }).count();
    if (approveCount !== 0) {
      throw new Error(`support admin saw ${approveCount} approve button(s)`);
    }
    record("support admin production browser boundary", "passed", {
      adminRoute: true,
      inspectReports: true,
      approveHidden: true
    });
  } finally {
    await context.close();
  }
}

async function cleanup(service) {
  for (const userId of tempUsers.reverse()) {
    const { error } = await service.auth.admin.deleteUser(userId);
    result.cleanup.push({ userId, deleted: !error });
  }
}

async function main() {
  if (process.env.PRAXISGRID_LIVE_QA !== "1") {
    fail("Refusing to run production browser QA without PRAXISGRID_LIVE_QA=1.");
  }
  if (requireEnv("PRAXISGRID_LIVE_PROJECT_REF") !== EXPECTED_PROJECT_REF) {
    fail("Refusing to run against an unknown Supabase project ref.");
  }

  const supabaseUrl = requireEnv("SUPABASE_URL");
  const url = new URL(supabaseUrl);
  if (url.hostname !== EXPECTED_HOST) {
    fail("Refusing to run against an unknown Supabase host.");
  }

  const baseUrl = result.baseUrl;
  if (!baseUrl.startsWith("https://azure-quest-pwa.vercel.app") && !baseUrl.includes("praxisgrid")) {
    fail("Refusing to run against an unknown production web origin.");
  }

  const service = makeClient(supabaseUrl, requireEnv("SUPABASE_SERVICE_ROLE_KEY"));
  const runId = randomUUID().slice(0, 8);
  let browser;
  try {
    const learner = await createQaUser(service, "USER", runId, { onboarded: false });
    const mobileLearner = await createQaUser(service, "USER", runId, { onboarded: false });
    const support = await createQaUser(service, "SUPPORT_ADMIN", runId, { onboarded: true });

    browser = await chromium.launch();
    await verifyLearnerOnboardingAndDenial(browser, baseUrl, { width: 1280, height: 900 }, learner);
    await verifyLearnerOnboardingAndDenial(browser, baseUrl, { width: 390, height: 844 }, mobileLearner);
    await verifySupportAdmin(browser, baseUrl, support);
    result.status = "passed";
  } catch (error) {
    result.status = "failed";
    result.error = error.message;
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    await cleanup(service);
    result.finishedAt = new Date().toISOString();
    const output = JSON.stringify(result, null, 2);
    if (result.status === "passed") console.log(output);
    else console.error(output);
  }
}

await main();
