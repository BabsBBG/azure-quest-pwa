import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useHydrateApp } from "./hooks/useHydrateApp";
import { useAppStore } from "./store/useAppStore";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { PathHome } from "./pages/PathHome";
import { CertHome } from "./pages/CertHome";
import { KnowledgeCheck } from "./pages/KnowledgeCheck";
import { JobReadiness } from "./pages/JobReadiness";
import { PracticeArena } from "./pages/PracticeArena";
import { PastExams } from "./pages/PastExams";
import { Flashcards } from "./pages/Flashcards";
import { StudyMode } from "./pages/StudyMode";
import { Settings } from "./pages/Settings";
import { Scenarios } from "./pages/Scenarios";
import { ScenarioDetail } from "./pages/ScenarioDetail";
import { ScenarioPlayer } from "./pages/ScenarioPlayer";
import { Videos } from "./pages/Videos";
import { Docs } from "./pages/Docs";
import { CaseFiles } from "./pages/CaseFiles";
import { KqlGym } from "./pages/KqlGym";
import { LearnTracker } from "./pages/LearnTracker";
import { Readiness } from "./pages/Readiness";

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
          <div className="text-4xl font-black tracking-tight">AQ</div>
          <p className="mt-3 text-xl font-black">Loading Azure Quest...</p>
        </motion.div>
      </main>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <Layout>
        <Routes>
          <Route path="/" element={<PathHome />} />
          <Route path="/legacy-dashboard" element={<Dashboard />} />
          <Route path="/cert/:cert" element={<CertHome />} />
          <Route path="/cert/:cert/knowledge" element={<KnowledgeCheck />} />
          <Route path="/cert/:cert/readiness" element={<Readiness />} />
          <Route path="/cert/:cert/job" element={<JobReadiness />} />
          <Route path="/study" element={<StudyMode />} />
          <Route path="/arena" element={<PracticeArena />} />
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
    </AnimatePresence>
  );
}
