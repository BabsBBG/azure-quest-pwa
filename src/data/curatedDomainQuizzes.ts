import type { Cert } from "../types";
import { domains } from "./examBlueprints";
import { approvedSourceGroundedQuestions } from "./sourceGrounding";

export type CuratedQuizTrack = "FOUNDATIONS" | "CONFIGURATION" | "SCENARIOS" | "TROUBLESHOOTING" | "DOMAIN_CHALLENGE";
export type CuratedQuizPublicationStatus = "draft" | "reviewed" | "published" | "blocked";

export interface CuratedDomainQuiz {
  id: string;
  cert: Cert;
  domainNumber: number;
  domain: string;
  track: CuratedQuizTrack;
  title: string;
  targetQuestions: number;
  minutes: number;
  unlockRule: string;
  itemIds: string[];
  missingApprovedItems: number;
  publicationStatus: CuratedQuizPublicationStatus;
  effectiveAt?: string;
  focusTags: string[];
}

const tracks: Array<{ track: CuratedQuizTrack; title: string; targetQuestions: number; minutes: number; unlockRule: string }> = [
  { track: "FOUNDATIONS", title: "Foundations", targetQuestions: 8, minutes: 10, unlockRule: "Unlocked by default." },
  { track: "CONFIGURATION", title: "Configuration", targetQuestions: 10, minutes: 12, unlockRule: "Unlock after Foundations is reviewed or completed locally." },
  { track: "SCENARIOS", title: "Scenarios", targetQuestions: 10, minutes: 14, unlockRule: "Unlock after Configuration reaches 70% or reviewer publishes direct access." },
  { track: "TROUBLESHOOTING", title: "Troubleshooting", targetQuestions: 10, minutes: 14, unlockRule: "Unlock after Scenarios reaches 70% or reviewer publishes direct access." },
  { track: "DOMAIN_CHALLENGE", title: "Domain Challenge", targetQuestions: 15, minutes: 22, unlockRule: "Unlock after all prior tracks are complete." }
];

function tagFor(domain: string, track: CuratedQuizTrack) {
  return `${domain}:${track}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const curatedDomainQuizzes: CuratedDomainQuiz[] = (["SC-300", "AZ-500", "SC-500"] as Cert[]).flatMap((cert) =>
  domains[cert].flatMap((domain, domainIndex) =>
    tracks.map((track) => {
      const approvedItems = approvedSourceGroundedQuestions()
        .filter((question) => question.cert === cert && question.domain === domain)
        .map((question) => question.id);
      const itemIds = approvedItems.slice(0, track.targetQuestions);
      const missingApprovedItems = Math.max(0, track.targetQuestions - itemIds.length);
      return {
        id: `${cert.toLowerCase().replace("-", "")}-d${domainIndex + 1}-${track.track.toLowerCase().replace(/_/g, "-")}`,
        cert,
        domainNumber: domainIndex + 1,
        domain,
        track: track.track,
        title: `${domain} - ${track.title}`,
        targetQuestions: track.targetQuestions,
        minutes: track.minutes,
        unlockRule: track.unlockRule,
        itemIds,
        missingApprovedItems,
        publicationStatus: missingApprovedItems === 0 ? "published" : "blocked",
        effectiveAt: missingApprovedItems === 0 ? "2026-07-26T00:00:00.000Z" : undefined,
        focusTags: [tagFor(domain, track.track), track.track.toLowerCase().replace(/_/g, "-")]
      } satisfies CuratedDomainQuiz;
    })
  )
);

export function curatedQuizzesForCert(cert: Cert) {
  return curatedDomainQuizzes.filter((quiz) => quiz.cert === cert);
}

export function validateCuratedDomainQuizzes(quizzes = curatedDomainQuizzes) {
  const errors: string[] = [];
  const ids = new Set<string>();
  const approvedIds = new Set(approvedSourceGroundedQuestions().map((question) => question.id));

  for (const cert of ["SC-300", "AZ-500", "SC-500"] as Cert[]) {
    for (const domain of domains[cert]) {
      for (const track of tracks) {
        if (!quizzes.some((quiz) => quiz.cert === cert && quiz.domain === domain && quiz.track === track.track)) {
          errors.push(`missing-quiz:${cert}:${domain}:${track.track}`);
        }
      }
    }
  }

  for (const quiz of quizzes) {
    if (ids.has(quiz.id)) errors.push(`duplicate-quiz-id:${quiz.id}`);
    ids.add(quiz.id);
    if (quiz.targetQuestions <= 0 || quiz.minutes <= 0) errors.push(`invalid-timing:${quiz.id}`);
    if (!quiz.unlockRule.trim()) errors.push(`missing-unlock-rule:${quiz.id}`);
    for (const itemId of quiz.itemIds) {
      if (!approvedIds.has(itemId)) errors.push(`unapproved-item-placement:${quiz.id}:${itemId}`);
    }
    if (quiz.publicationStatus === "published" && quiz.missingApprovedItems > 0) errors.push(`published-with-missing-items:${quiz.id}`);
    if (quiz.publicationStatus === "published" && !quiz.effectiveAt) errors.push(`published-without-effective-date:${quiz.id}`);
  }

  return { ok: errors.length === 0, errors };
}

export function curatedQuizCoverageSummary(cert?: Cert) {
  const quizzes = cert ? curatedQuizzesForCert(cert) : curatedDomainQuizzes;
  return {
    total: quizzes.length,
    published: quizzes.filter((quiz) => quiz.publicationStatus === "published").length,
    blocked: quizzes.filter((quiz) => quiz.publicationStatus === "blocked").length,
    missingApprovedItems: quizzes.reduce((sum, quiz) => sum + quiz.missingApprovedItems, 0)
  };
}
