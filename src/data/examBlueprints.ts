import type { Cert } from "../types";

export interface ExamBlueprint {
  id: string;
  cert: Cert;
  number: number;
  title: string;
  subtitle: string;
  targetQuestions: number;
  minutes: number;
  vibe: string;
  focusDomain?: string;
  domainWeights?: Record<string, number>;
}

export const domains: Record<Cert, string[]> = {
  "SC-300": [
    "Implement and manage user identities",
    "Implement authentication and access management",
    "Plan and implement workload identities",
    "Plan and automate identity governance"
  ],
  "AZ-500": [
    "Secure identity and access",
    "Secure networking",
    "Secure compute, storage, and databases",
    "Secure Azure using Defender for Cloud and Sentinel"
  ],
  "SC-500": [
    "Manage identity, access, and governance",
    "Protect storage, databases, and networks",
    "Secure compute",
    "Manage and monitor security posture"
  ]
};


export const domainWeights: Record<Cert, Record<string, number>> = {
  "SC-300": {
    "Implement and manage user identities": 0.23,
    "Implement authentication and access management": 0.29,
    "Plan and implement workload identities": 0.23,
    "Plan and automate identity governance": 0.25
  },
  "AZ-500": {
    "Secure identity and access": 0.18,
    "Secure networking": 0.22,
    "Secure compute, storage, and databases": 0.25,
    "Secure Azure using Defender for Cloud and Sentinel": 0.35
  },
  "SC-500": {
    "Manage identity, access, and governance": 0.24,
    "Protect storage, databases, and networks": 0.28,
    "Secure compute": 0.23,
    "Manage and monitor security posture": 0.25
  }
};

const subtitles = ["Baseline Assessment", "Access Control Sprint", "Network & Data Drill", "Operations Review", "Governance Check", "Scenario Mixer", "Hard Mode", "Weakness Probe", "Speed Trial", "Final Readiness"];

export const examBlueprints: ExamBlueprint[] = (["SC-300", "AZ-500", "SC-500"] as Cert[]).flatMap((cert) =>
  Array.from({ length: 10 }, (_, i) => {
    const number = i + 1;
    const focusDomain = number <= 4 ? domains[cert][number - 1] : undefined;
    return {
      id: `${cert.toLowerCase().replace("-", "")}-exam-${number}`,
      cert,
      number,
      title: `${cert} Exam ${number}`,
      subtitle: subtitles[i],
      targetQuestions: 50,
      minutes: 100,
      vibe: focusDomain ?? "Balanced mixed-domain mock",
      focusDomain,
      domainWeights: focusDomain ? undefined : domainWeights[cert]
    };
  })
);
