import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

const EXPECTED_PROJECT_REF = "ozfexprlomzlhkcyagfd";
const EXPECTED_HOST = `${EXPECTED_PROJECT_REF}.supabase.co`;
const VALID_SCENARIOS = new Set([
  "validate",
  "auth",
  "rls",
  "roles",
  "repository-isolation"
]);

const scenario = process.argv[2] || "validate";

const result = {
  scenario,
  projectRef: EXPECTED_PROJECT_REF,
  startedAt: new Date().toISOString(),
  checks: [],
  cleanup: [],
  status: "running"
};

const tempUsers = [];
const tempIds = {
  importedProjectIds: [],
  projectAnalysisIds: [],
  contentQualityReportIds: []
};

function record(name, status, detail = {}) {
  result.checks.push({ name, status, ...detail });
}

function fail(message) {
  result.status = "failed";
  result.error = message;
  result.finishedAt = new Date().toISOString();
  console.error(JSON.stringify(result, null, 2));
  process.exit(1);
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    fail(`Missing required environment variable: ${name}`);
  }
  return value;
}

function assertNoError(label, response) {
  if (response.error) {
    throw new Error(`${label}: ${response.error.message}`);
  }
  return response.data;
}

function assertBlocked(label, response) {
  if (!response.error && response.data && !Array.isArray(response.data)) {
    throw new Error(`${label}: operation unexpectedly returned a record`);
  }
  if (!response.error && Array.isArray(response.data) && response.data.length > 0) {
    throw new Error(`${label}: operation unexpectedly returned ${response.data.length} records`);
  }
}

function makeClient(supabaseUrl, key) {
  return createClient(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false
    }
  });
}

async function signInClient(supabaseUrl, anonKey, email, password) {
  const client = makeClient(supabaseUrl, anonKey);
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(`sign-in failed for temporary user: ${error.message}`);
  }
  return { client, session: data.session, user: data.user };
}

async function createQaUser(service, role, runId) {
  const password = `Pg1!${randomUUID().replaceAll("-", "")}`;
  const email = `praxisgrid-live-${runId}-${role.toLowerCase().replaceAll("_", "-")}-${randomUUID().slice(0, 8)}@example.com`;
  const created = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { liveQa: true, role }
  });
  if (created.error) {
    throw new Error(`create ${role} user failed: ${created.error.message}`);
  }

  const userId = created.data.user.id;
  tempUsers.push(userId);
  assertNoError(
    `assign ${role}`,
    await service.from("user_roles").upsert({
      user_id: userId,
      role,
      assigned_by: null,
      reason: `live_qa_${runId}`
    })
  );

  return { id: userId, email, password, role };
}

async function verifyProjectGuard(service) {
  const tables = assertNoError(
    "read project guard table",
    await service.from("user_roles").select("user_id").limit(1)
  );
  record("project guard", "passed", { inspectedTable: "user_roles", rowsSampled: tables.length });
}

async function verifyAuth(supabaseUrl, anonKey, service, runId) {
  const user = await createQaUser(service, "USER", runId);
  const signedIn = await signInClient(supabaseUrl, anonKey, user.email, user.password);
  if (!signedIn.session?.access_token || signedIn.user.id !== user.id) {
    throw new Error("temporary auth session did not match created user");
  }
  const { error: signOutError } = await signedIn.client.auth.signOut();
  if (signOutError) {
    throw new Error(`sign-out failed: ${signOutError.message}`);
  }
  record("email/password auth", "passed", { userCreated: true, signIn: true, signOut: true });
}

function ownedRows(userId, runId) {
  const now = new Date().toISOString();
  const later = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const projectId = `live-${runId}-${userId}-project`;
  const analysisId = `live-${runId}-${userId}-analysis`;

  tempIds.importedProjectIds.push(projectId);
  tempIds.projectAnalysisIds.push(analysisId);

  return [
    {
      table: "profiles",
      key: "id",
      row: { id: userId, email: `live-${runId}@example.com`, full_name: "Live QA User" },
      update: { full_name: "Live QA User Updated" }
    },
    {
      table: "quiz_attempts",
      key: "id",
      row: {
        id: `live-${runId}-${userId}-quiz`,
        user_id: userId,
        cert: "SC-300",
        mode: "practice",
        kind: "domain",
        title: "Live QA quiz",
        completed_at: now,
        score: 1,
        total: 1,
        percentage: 100,
        payload: { liveQa: true, runId }
      },
      update: { score: 0, percentage: 0 }
    },
    {
      table: "assessment_sessions",
      key: "id",
      row: {
        id: `live-${runId}-${userId}-assessment`,
        user_id: userId,
        cert: "SC-300",
        mode: "exam",
        kind: "certification",
        title: "Live QA assessment",
        status: "ACTIVE",
        started_at: now,
        updated_at: now,
        expires_at: later,
        payload: { liveQa: true, runId }
      },
      update: { status: "PAUSED", updated_at: now }
    },
    {
      table: "interview_sessions",
      key: "id",
      row: {
        id: `live-${runId}-${userId}-interview`,
        user_id: userId,
        cert: "SC-300",
        track: "iam",
        session_title: "Live QA interview",
        completed_at: now,
        score: 1,
        total: 1,
        percentage: 100,
        payload: { liveQa: true, runId }
      },
      update: { score: 0, percentage: 0 }
    },
    {
      table: "active_interview_sessions",
      key: "id",
      row: {
        id: `live-${runId}-${userId}-active-interview`,
        user_id: userId,
        cert: "SC-300",
        track: "iam",
        session_title: "Live QA active interview",
        status: "ACTIVE",
        started_at: now,
        updated_at: now,
        payload: { liveQa: true, runId }
      },
      update: { status: "PAUSED", updated_at: now }
    },
    {
      table: "question_flags",
      key: "id",
      row: {
        id: `live-${runId}-${userId}-flag`,
        user_id: userId,
        cert: "SC-300",
        question_id: "live-qa-question",
        reason: "other",
        note: "Live QA isolation",
        payload: { liveQa: true, runId }
      },
      update: { resolved: true }
    },
    {
      table: "imported_projects",
      key: "id",
      row: {
        id: projectId,
        user_id: userId,
        owner: "praxisgrid-live",
        repo: `qa-${runId}`,
        source_url: "https://github.com/BabsBBG/praxisgrid",
        content_hash: `live-${runId}-${userId}`,
        status: "draft",
        imported_at: now,
        payload: { liveQa: true, runId }
      },
      update: { status: "reviewed" }
    },
    {
      table: "project_intelligence_analyses",
      key: "id",
      row: {
        id: analysisId,
        user_id: userId,
        imported_project_id: projectId,
        content_hash: `live-${runId}-${userId}`,
        status: "draft",
        payload: { liveQa: true, runId }
      },
      update: { status: "reviewed" }
    }
  ];
}

async function insertOwnedRows(client, rows) {
  for (const spec of rows) {
    assertNoError(
      `insert ${spec.table}`,
      await client.from(spec.table).insert(spec.row).select(spec.key).single()
    );
  }
}

async function verifyOneWayIsolation(attackerClient, ownerRows) {
  for (const spec of ownerRows) {
    const id = spec.row[spec.key];
    const read = await attackerClient.from(spec.table).select("*").eq(spec.key, id);
    assertBlocked(`cross-read ${spec.table}`, read);

    const update = await attackerClient.from(spec.table).update(spec.update).eq(spec.key, id).select(spec.key);
    assertBlocked(`cross-update ${spec.table}`, update);

    const remove = await attackerClient.from(spec.table).delete().eq(spec.key, id).select(spec.key);
    assertBlocked(`cross-delete ${spec.table}`, remove);
  }
}

async function verifyOwnAccess(client, ownerRows) {
  for (const spec of ownerRows) {
    const id = spec.row[spec.key];
    const ownRead = assertNoError(
      `own-read ${spec.table}`,
      await client.from(spec.table).select(spec.key).eq(spec.key, id)
    );
    if (ownRead.length !== 1) {
      throw new Error(`own-read ${spec.table}: expected 1 row, got ${ownRead.length}`);
    }
  }
}

async function verifyRlsAndRepositoryIsolation(supabaseUrl, anonKey, service, runId) {
  const userA = await createQaUser(service, "USER", runId);
  const userB = await createQaUser(service, "USER", runId);
  const a = await signInClient(supabaseUrl, anonKey, userA.email, userA.password);
  const b = await signInClient(supabaseUrl, anonKey, userB.email, userB.password);
  const rowsA = ownedRows(userA.id, runId);
  const rowsB = ownedRows(userB.id, runId);

  await insertOwnedRows(a.client, rowsA);
  await insertOwnedRows(b.client, rowsB);
  await verifyOneWayIsolation(b.client, rowsA);
  await verifyOneWayIsolation(a.client, rowsB);
  await verifyOwnAccess(a.client, rowsA);
  await verifyOwnAccess(b.client, rowsB);

  record("two-user RLS isolation", "passed", { tables: rowsA.map((row) => row.table) });
  record("repository isolation", "passed", {
    tables: ["imported_projects", "project_intelligence_analyses"]
  });
}

async function verifyRoles(supabaseUrl, anonKey, service, runId) {
  const main = await createQaUser(service, "MAIN_ADMIN", runId);
  const reviewer = await createQaUser(service, "CONTENT_REVIEWER", runId);
  const support = await createQaUser(service, "SUPPORT_ADMIN", runId);
  const user = await createQaUser(service, "USER", runId);

  const mainSession = await signInClient(supabaseUrl, anonKey, main.email, main.password);
  const reviewerSession = await signInClient(supabaseUrl, anonKey, reviewer.email, reviewer.password);
  const supportSession = await signInClient(supabaseUrl, anonKey, support.email, support.password);
  const userSession = await signInClient(supabaseUrl, anonKey, user.email, user.password);

  assertNoError(
    "main admin can read role audit",
    await mainSession.client.from("role_change_events").select("id").limit(1)
  );

  assertBlocked(
    "normal user cannot read role audit",
    await userSession.client.from("role_change_events").select("id").limit(1)
  );

  assertBlocked(
    "normal user cannot self-escalate",
    await userSession.client
      .from("user_roles")
      .upsert({ user_id: user.id, role: "MAIN_ADMIN", reason: `live_qa_escalation_${runId}` })
      .select("role")
  );

  assertBlocked(
    "normal user cannot forge role audit",
    await userSession.client.from("role_change_events").insert({
      target_user_id: user.id,
      previous_role: "USER",
      new_role: "MAIN_ADMIN",
      changed_by: user.id,
      reason: `live_qa_forge_${runId}`
    }).select("id")
  );

  assertBlocked(
    "reviewer cannot publish approved questions",
    await reviewerSession.client.from("approved_questions").insert({
      id: `live-${runId}-reviewer-question`,
      cert: "SC-300",
      domain: "identity",
      source_chunk_id: `live-${runId}-missing-source`,
      source_url: "https://learn.microsoft.com/en-us/entra/identity/",
      duplicate_key: `live-${runId}-reviewer`,
      review_status: "approved",
      approved_at: new Date().toISOString(),
      payload: { liveQa: true, runId }
    }).select("id")
  );

  assertBlocked(
    "support admin cannot publish approved questions",
    await supportSession.client.from("approved_questions").insert({
      id: `live-${runId}-support-question`,
      cert: "SC-300",
      domain: "identity",
      source_chunk_id: `live-${runId}-missing-source`,
      source_url: "https://learn.microsoft.com/en-us/entra/identity/",
      duplicate_key: `live-${runId}-support`,
      review_status: "approved",
      approved_at: new Date().toISOString(),
      payload: { liveQa: true, runId }
    }).select("id")
  );

  assertNoError(
    "support admin can read support queue",
    await supportSession.client.from("content_quality_reports").select("id").limit(1)
  );

  record("role boundaries", "passed", {
    roles: ["MAIN_ADMIN", "CONTENT_REVIEWER", "SUPPORT_ADMIN", "USER"]
  });
  record("audit integrity", "passed", {
    forgedRoleChangeEventBlocked: true,
    selfEscalationBlocked: true
  });
}

async function cleanup(service) {
  for (const id of tempIds.projectAnalysisIds) {
    await service.from("project_intelligence_analyses").delete().eq("id", id);
  }
  for (const id of tempIds.importedProjectIds) {
    await service.from("imported_projects").delete().eq("id", id);
  }
  for (const id of tempIds.contentQualityReportIds) {
    await service.from("content_quality_reports").delete().eq("id", id);
  }
  for (const userId of tempUsers.reverse()) {
    const { error } = await service.auth.admin.deleteUser(userId);
    result.cleanup.push({ userId, deleted: !error });
  }
}

async function main() {
  if (!VALID_SCENARIOS.has(scenario)) {
    fail(`Unknown live Supabase scenario: ${scenario}`);
  }
  if (process.env.PRAXISGRID_LIVE_QA !== "1") {
    fail("Refusing to run live production QA without PRAXISGRID_LIVE_QA=1.");
  }

  const projectRef = requireEnv("PRAXISGRID_LIVE_PROJECT_REF");
  if (projectRef !== EXPECTED_PROJECT_REF) {
    fail("Refusing to run against an unknown Supabase project ref.");
  }

  const supabaseUrl = requireEnv("SUPABASE_URL");
  const anonKey = requireEnv("SUPABASE_ANON_KEY");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const url = new URL(supabaseUrl);
  if (url.hostname !== EXPECTED_HOST) {
    fail("Refusing to run against an unknown Supabase host.");
  }

  const service = makeClient(supabaseUrl, serviceRoleKey);
  const runId = randomUUID().slice(0, 8);

  try {
    await verifyProjectGuard(service);
    if (scenario === "validate" || scenario === "auth") {
      await verifyAuth(supabaseUrl, anonKey, service, runId);
    }
    if (scenario === "validate" || scenario === "rls" || scenario === "repository-isolation") {
      await verifyRlsAndRepositoryIsolation(supabaseUrl, anonKey, service, runId);
    }
    if (scenario === "validate" || scenario === "roles") {
      await verifyRoles(supabaseUrl, anonKey, service, runId);
    }
    result.status = "passed";
  } catch (error) {
    result.status = "failed";
    result.error = error.message;
    process.exitCode = 1;
  } finally {
    await cleanup(service);
    result.finishedAt = new Date().toISOString();
    const output = JSON.stringify(result, null, 2);
    if (result.status === "passed") {
      console.log(output);
    } else {
      console.error(output);
    }
  }
}

await main();
