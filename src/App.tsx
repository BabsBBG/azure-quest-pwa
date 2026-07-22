import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useHydrateApp } from "./hooks/useHydrateApp";
import { useAppStore } from "./store/useAppStore";
import { Layout } from "./components/Layout";
import { AuthProvider } from "./hooks/useAuth";
import { Dashboard } from "./pages/Dashboard";
import { PathHome } from "./pages/PathHome";
import { CertHome } from "./pages/CertHome";
import { KnowledgeCheck } from "./pages/KnowledgeCheck";
import { JobReadiness } from "./pages/JobReadiness";
import { PracticeArena } from "./pages/PracticeArena";
import { ExamWalkthrough } from "./pages/ExamWalkthrough";
import { PastExams } from "./pages/PastExams";
import { Flashcards } from "./pages/Flashcards";
import { StudyMode } from "./pages/StudyMode";
import { Settings } from "./pages/Settings";
import { Scenarios } from "./pages/Scenarios";
import { ScenarioDetail } from "./pages/ScenarioDetail";
import { ScenarioPlayer } from "./pages/ScenarioPlayer";
import { CaseFiles } from "./pages/CaseFiles";
import { KqlGym } from "./pages/KqlGym";
import { Readiness } from "./pages/Readiness";
import { Account } from "./pages/Account";
import { PRODUCT_INITIALS, PRODUCT_NAME } from "./lib/brand";

export default function App() {
  const hydrated = useHydrateApp();
  const settings = useAppStore((state) => state.settings);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.darkMode);
  }, [settings.darkMode]);

  if (!hydrated) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 text-white">
        <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ repeat: Infinity, duration: 1.2 }} className="text-center">
          <div className="text-4xl font-black tracking-tight">{PRODUCT_INITIALS}</div>
          <p className="mt-3 text-xl font-black">Loading {PRODUCT_NAME}...</p>
        </motion.div>
      </main>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <AuthProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<PathHome />} />
            <Route path="/legacy-dashboard" element={<Dashboard />} />
            <Route path="/quiz" element={<Navigate to="/cert/sc-300/knowledge" replace />} />
            <Route path="/exams" element={<Navigate to="/cert/sc-300/readiness" replace />} />
            <Route path="/learn" element={<Navigate to="/cert/sc-300" replace />} />
            <Route path="/domain-quizzes" element={<Navigate to="/cert/sc-300/knowledge" replace />} />
            <Route path="/certification-runs" element={<Navigate to="/cert/sc-300/readiness" replace />} />
            <Route path="/career-lab" element={<Navigate to="/cert/sc-300/job" replace />} />
            <Route path="/progress" element={<Navigate to="/cert/sc-300/readiness" replace />} />
            <Route path="/account" element={<Account />} />
            <Route path="/cert/:cert" element={<CertHome />} />
            <Route path="/cert/:cert/knowledge" element={<KnowledgeCheck />} />
            <Route path="/cert/:cert/readiness" element={<Readiness />} />
            <Route path="/cert/:cert/job" element={<JobReadiness />} />
            <Route path="/study" element={<StudyMode />} />
            <Route path="/arena" element={<PracticeArena />} />
            <Route path="/exam-walkthrough" element={<ExamWalkthrough />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/history" element={<PastExams />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/scenarios" element={<Scenarios />} />
            <Route path="/scenarios/:exam/:scenarioId" element={<ScenarioDetail />} />
            <Route path="/scenario-player/:exam/:scenarioId" element={<ScenarioPlayer />} />
            <Route path="/cases" element={<CaseFiles />} />
            <Route path="/kql" element={<KqlGym />} />
            <Route path="/readiness" element={<Readiness />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </AnimatePresence>
  );
}
