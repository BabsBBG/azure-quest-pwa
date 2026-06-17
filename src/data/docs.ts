export interface DocLink {
  label: string;
  url: string;
  description: string;
}

export interface ExamDocs {
  title: string;
  description: string;
  passingScore: number;
  links: DocLink[];
  domains: { name: string; weight: string }[];
}

export const docs: Record<"sc-300" | "sc-500" | "az-500", ExamDocs> = {
  "sc-300": {
    title: "SC-300: Microsoft Identity and Access Administrator Associate",
    description: "Design, implement, and operate identity and access management with Microsoft Entra ID.",
    passingScore: 700,
    links: [
      { label: "Study Guide", url: "https://learn.microsoft.com/credentials/certifications/resources/study-guides/sc-300", description: "Official exam study guide and topic summary." },
      { label: "Practice Assessment", url: "https://learn.microsoft.com/credentials/certifications/exams/sc-300/practice/assessment", description: "Official Microsoft practice assessment." },
      { label: "Certification Page", url: "https://learn.microsoft.com/credentials/certifications/identity-and-access-administrator/", description: "Certification overview, prerequisites, and resources." },
      { label: "Exam Page", url: "https://learn.microsoft.com/credentials/certifications/exams/sc-300/", description: "Exam details and measured skills." },
      { label: "Microsoft Learn Identity Training", url: "https://learn.microsoft.com/training/browse/?products=azure-active-directory&terms=identity", description: "Official Learn modules for identity and access management." }
    ],
    domains: [
      { name: "Implement identities in Microsoft Entra ID", weight: "20-25%" },
      { name: "Implement authentication and access management", weight: "25-30%" },
      { name: "Implement access management for applications", weight: "20-25%" },
      { name: "Plan and implement identity governance", weight: "20-25%" }
    ]
  },
  "az-500": {
    title: "AZ-500: Microsoft Azure Security Technologies",
    description: "Implement Azure security controls across identity, networking, compute, storage, databases, Defender for Cloud, and Sentinel.",
    passingScore: 700,
    links: [
      { label: "Study Guide", url: "https://learn.microsoft.com/credentials/certifications/resources/study-guides/az-500", description: "Official exam study guide and topic summary." },
      { label: "Certification Page", url: "https://learn.microsoft.com/credentials/certifications/azure-security-engineer/", description: "Certification overview and exam resources." },
      { label: "Exam Page", url: "https://learn.microsoft.com/credentials/certifications/exams/az-500/", description: "Exam details and measured skills." },
      { label: "Exam Readiness Videos", url: "https://learn.microsoft.com/shows/exam-readiness-zone/?terms=AZ-500", description: "Microsoft Learn exam prep video series." }
    ],
    domains: [
      { name: "Secure identity and access", weight: "20-25%" },
      { name: "Secure networking", weight: "20-25%" },
      { name: "Secure compute, storage, and databases", weight: "20-25%" },
      { name: "Secure Azure using Defender for Cloud and Sentinel", weight: "30-35%" }
    ]
  },
  "sc-500": {
    title: "SC-500: Cloud and AI Security Engineer Associate",
    description: "Design, implement, and manage security controls for cloud, hybrid, multicloud, and AI workloads.",
    passingScore: 700,
    links: [
      { label: "Study Guide", url: "https://learn.microsoft.com/credentials/certifications/resources/study-guides/sc-500", description: "Official exam study guide and topic summary." },
      { label: "Certification Page", url: "https://learn.microsoft.com/credentials/certifications/cloud-and-ai-security-engineer-associate/", description: "Certification overview and beta exam details." },
      { label: "Exam Page", url: "https://learn.microsoft.com/credentials/certifications/exams/sc-500/", description: "Exam details and measured skills." },
      { label: "Official Course SC-500T00-A", url: "https://learn.microsoft.com/training/courses/sc-500t00", description: "Microsoft official course page." },
      { label: "Microsoft Security Copilot", url: "https://learn.microsoft.com/security-copilot/", description: "Official Security Copilot documentation." }
    ],
    domains: [
      { name: "Manage identity, access, and governance", weight: "20-25%" },
      { name: "Protect storage, databases, and networks", weight: "25-30%" },
      { name: "Secure compute", weight: "20-25%" },
      { name: "Manage and monitor security posture", weight: "20-25%" }
    ]
  }
};
