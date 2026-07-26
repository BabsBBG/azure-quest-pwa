import { Link } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
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
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10 text-[var(--aq-ink)] dark:bg-[#061227]">
      <Card className="w-full max-w-2xl border-[var(--aq-border)] bg-white dark:bg-[#0b1b33]">
        <CardHeader>
          <div>
            <Badge className="mb-2">{content.label}</Badge>
            <CardTitle>{content.title}</CardTitle>
            <p className="mt-2 text-sm font-semibold text-[var(--aq-muted)]">{PRODUCT_NAME}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm font-medium leading-7 text-slate-600 dark:text-slate-300">{content.body}</p>
          <p className="rounded-md border border-[var(--aq-border)] bg-[var(--aq-blue-50)] p-3 text-xs font-semibold text-[var(--aq-muted)]">{PROVIDER_NEUTRAL_DISCLAIMER}</p>
          <Link className="text-sm font-bold text-[var(--aq-blue-700)]" to="/auth?mode=signup">Return to sign up</Link>
        </CardContent>
      </Card>
    </main>
  );
}
