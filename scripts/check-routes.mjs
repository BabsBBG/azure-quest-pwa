import { existsSync, readFileSync } from "node:fs";

const app = readFileSync("src/App.tsx", "utf8");
const layout = readFileSync("src/components/Layout.tsx", "utf8");

const requiredRoutes = [
  "/",
  "/quiz",
  "/exams",
  "/auth",
  "/auth/callback",
  "/privacy",
  "/terms",
  "/status",
  "/learn",
  "/practise",
  "/prove",
  "/domain-quizzes",
  "/certification-runs",
  "/career-lab",
  "/progress",
  "/admin",
  "/account",
  "/onboarding",
  "/cert/:cert/knowledge",
  "/cert/:cert/readiness",
  "/cert/:cert/job",
  "/arena",
  "/exam-walkthrough",
  "/history",
  "/settings"
];

const routeFiles = [
  "src/pages/PathHome.tsx",
  "src/pages/AuthPage.tsx",
  "src/pages/PublicInfoPage.tsx",
  "src/pages/KnowledgeCheck.tsx",
  "src/pages/Readiness.tsx",
  "src/pages/JobReadiness.tsx",
  "src/pages/PracticeArena.tsx",
  "src/pages/ExamWalkthrough.tsx",
  "src/pages/PastExams.tsx",
  "src/pages/Settings.tsx",
  "src/pages/AdminReviewStudio.tsx",
  "src/pages/Account.tsx",
  "src/pages/Onboarding.tsx"
];

const missingRoutes = requiredRoutes.filter((route) => !app.includes(`path="${route}"`));
const missingFiles = routeFiles.filter((file) => !existsSync(file));
const requiredNavLabels = ["Learn", "Practise", "Prove"];
const missingNavLabels = requiredNavLabels.filter((label) => !layout.includes(`label: "${label}"`));
const staleNavLabels = ["Docs", "Videos", "Job Prep", "Domain Quizzes", "Career Lab", "Progress"].filter((label) => layout.includes(`label: "${label}"`));
const adminRouteProtected = app.includes('path="/admin" element={<ProtectedAdminRoute />}');
const adminRouteDirect = app.includes('path="/admin" element={<AdminReviewStudio />}');

if (missingRoutes.length) {
  console.error(`Missing routes in App.tsx: ${missingRoutes.join(", ")}`);
  process.exit(1);
}

if (missingFiles.length) {
  console.error(`Missing route files: ${missingFiles.join(", ")}`);
  process.exit(1);
}

if (missingNavLabels.length) {
  console.error(`Missing active nav labels in Layout.tsx: ${missingNavLabels.join(", ")}`);
  process.exit(1);
}

if (staleNavLabels.length) {
  console.error(`Stale nav labels still active in Layout.tsx: ${staleNavLabels.join(", ")}`);
  process.exit(1);
}

if (!adminRouteProtected || adminRouteDirect) {
  console.error("Admin route must render through ProtectedAdminRoute and must not mount AdminReviewStudio directly.");
  process.exit(1);
}

console.log(`Route/import check passed: ${requiredRoutes.join(", ")}`);
