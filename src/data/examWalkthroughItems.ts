import type { AssessmentItem } from "../types";

export const examWalkthroughItems: AssessmentItem[] = [
  {
    id: "walk-single-choice",
    type: "SINGLE_CHOICE",
    cert: "SC-300",
    domain: "Identity governance",
    difficulty: "easy",
    stem: "Which control is the best first step when a tenant needs conditional access for risky sign-ins?",
    options: [
      { id: "A", text: "A Conditional Access policy scoped to sign-in risk" },
      { id: "B", text: "A storage firewall rule" },
      { id: "C", text: "A billing alert" },
      { id: "D", text: "A DNS TXT record" }
    ],
    answer: "A",
    explanation: "Conditional Access can evaluate sign-in risk and apply access controls at authentication time.",
    whyWrong: {
      B: "Storage firewall rules do not evaluate identity sign-in risk.",
      C: "Billing alerts do not enforce access controls.",
      D: "DNS records do not manage risky sign-ins."
    },
    tags: ["conditional-access"],
    walkthroughOnly: true
  },
  {
    id: "walk-multiple-choice",
    type: "MULTIPLE_CHOICE",
    cert: "SC-300",
    domain: "Identity governance",
    difficulty: "medium",
    stem: "Select the two signals most relevant to deciding whether an access review needs follow-up.",
    options: [
      { id: "A", text: "Reviewer decisions" },
      { id: "B", text: "Inactive guest accounts" },
      { id: "C", text: "The tenant billing country" },
      { id: "D", text: "The color of the company logo" }
    ],
    answers: ["A", "B"],
    minSelections: 2,
    maxSelections: 2,
    exactSelectionCount: 2,
    allowPartialCredit: false,
    explanation: "Reviewer decisions and inactive guest accounts are directly relevant to access review follow-up.",
    whyWrong: {
      C: "Billing country does not determine whether access should be removed.",
      D: "Branding is not an access governance signal."
    },
    tags: ["access-review"],
    walkthroughOnly: true
  },
  {
    id: "walk-ordering",
    type: "ORDERING",
    cert: "SC-300",
    domain: "Identity governance",
    difficulty: "medium",
    stem: "Order the review workflow from setup to completion.",
    choices: [
      { id: "scope", text: "Define the users, groups, or apps in scope" },
      { id: "reviewers", text: "Assign reviewers and recurrence" },
      { id: "decisions", text: "Collect approve/deny decisions" },
      { id: "apply", text: "Apply or audit the resulting changes" }
    ],
    correctOrder: ["scope", "reviewers", "decisions", "apply"],
    allowPartialCredit: true,
    explanation: "A defensible review starts with scope, then reviewers, then decisions, then enforcement or audit.",
    tags: ["governance"],
    walkthroughOnly: true
  },
  {
    id: "walk-matching",
    type: "MATCHING",
    cert: "SC-300",
    domain: "Identity governance",
    difficulty: "medium",
    stem: "Match each governance need to the closest control.",
    prompts: [
      { id: "need-review", text: "Periodic user access validation" },
      { id: "need-approval", text: "Controlled access request workflow" },
      { id: "need-risk", text: "Risk-aware sign-in enforcement" }
    ],
    matches: [
      { id: "access-review", text: "Access reviews" },
      { id: "entitlement", text: "Entitlement management" },
      { id: "conditional-access", text: "Conditional Access" }
    ],
    correctMatches: {
      "need-review": "access-review",
      "need-approval": "entitlement",
      "need-risk": "conditional-access"
    },
    allowPartialCredit: true,
    explanation: "Each control maps to a distinct governance or access-enforcement purpose.",
    tags: ["governance"],
    walkthroughOnly: true
  },
  {
    id: "walk-case-study-1",
    type: "CASE_STUDY_QUESTION",
    cert: "SC-300",
    domain: "Identity governance",
    difficulty: "hard",
    stem: "What should the administrator evaluate first for the contractor group?",
    caseStudyId: "walk-case-contoso-contractors",
    caseTitle: "Contoso contractor access review",
    overview: "Contoso uses guest accounts for contractors and wants to reduce standing access without disrupting active projects.",
    sections: [
      { id: "identity", title: "Identity state", body: "Contractors are assigned to a project group that grants application access." },
      { id: "operations", title: "Operations", body: "Some contractors have not signed in for more than 90 days." }
    ],
    exhibits: [
      { id: "exhibit-review", title: "Review evidence", body: "The last review had no reviewer assigned and did not apply denied decisions automatically." }
    ],
    requirements: ["Keep active contractors productive.", "Remove unnecessary standing access.", "Retain review evidence."],
    constraints: ["Do not delete guest accounts without review.", "Do not reveal answers from related case questions."],
    relatedQuestionIds: ["walk-case-study-1"],
    options: [
      { id: "A", text: "Create an access review for the project group with assigned reviewers" },
      { id: "B", text: "Delete every guest account immediately" },
      { id: "C", text: "Disable audit logging" },
      { id: "D", text: "Move the application to another region" }
    ],
    answer: "A",
    explanation: "An access review lets reviewers validate contractor access and preserve evidence before removal.",
    whyWrong: {
      B: "Immediate deletion can disrupt active work and skips review evidence.",
      C: "Disabling audit logging undermines governance.",
      D: "Region changes do not solve standing guest access."
    },
    tags: ["case-study", "access-review"],
    walkthroughOnly: true
  }
];
