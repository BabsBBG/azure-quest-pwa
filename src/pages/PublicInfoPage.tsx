import { Link } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { PRODUCT_NAME, PROVIDER_NEUTRAL_DISCLAIMER } from "../lib/brand";

interface PublicInfoPageProps {
  kind: "privacy" | "terms" | "status";
}

const copy = {
  privacy: {
    label: "Privacy",
    title: "Privacy notice",
    body: "PraxisGrid stores account and learning data only to provide the product experience. Repository analysis data is private to the authenticated user and must not be shared across accounts."
  },
  terms: {
    label: "Terms",
    title: "Terms of use",
    body: "PraxisGrid is a free learning platform for 2026. Do not use it to misrepresent certification-provider affiliation, official exam content, or work experience."
  },
  status: {
    label: "Status",
    title: "System status",
    body: "The public beta is under M5 production hardening and Phase 6 launch preparation. Live Supabase, RLS, accessibility, and production smoke gates remain tracked in the M5/M6 defect ledger."
  }
} as const;

export function PublicInfoPage({ kind }: PublicInfoPageProps) {
  const content = copy[kind];

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10 text-slate-950" style={{ backgroundColor: "#f8fafc", color: "#0f172a", colorScheme: "light" }}>
      <section
        className="w-full max-w-2xl rounded-md border border-[var(--aq-border)] bg-white p-5 text-slate-950 shadow-[var(--aq-shadow)] sm:p-6"
        style={{ backgroundColor: "#ffffff", color: "#0f172a", colorScheme: "light" }}
      >
        <header className="mb-5">
          <div>
            <Badge className="mb-2">{content.label}</Badge>
            <h1 className="text-2xl font-bold leading-tight text-slate-950" style={{ color: "#0f172a" }}>{content.title}</h1>
            <p className="mt-2 text-sm font-semibold text-slate-700" style={{ color: "#334155" }}>{PRODUCT_NAME}</p>
          </div>
        </header>
        <div className="space-y-4">
          <p className="text-sm font-medium leading-7 text-slate-700" style={{ color: "#334155" }}>{content.body}</p>
          <p className="rounded-md border border-[#b9d8f8] bg-[#eef6ff] p-3 text-xs font-semibold text-slate-800 dark:border-[#b9d8f8] dark:bg-[#eef6ff] dark:text-slate-800">{PROVIDER_NEUTRAL_DISCLAIMER}</p>
          <Link className="text-sm font-bold text-[#0057b8] underline underline-offset-4" to="/auth?mode=signup">Return to sign up</Link>
        </div>
      </section>
    </main>
  );
}
