import type { Cert } from "../types";

export interface QuizBlueprint {
  id: string;
  cert: Cert;
  domainNumber: number;
  quizNumber: number;
  title: string;
  subtitle: string;
  domain: string;
  targetQuestions: number;
  minutes: number;
  focusTags: string[];
}

const domainMap: Record<Cert, { domain: string; topics: string[] }[]> = {
  "SC-300": [
    { domain: "Implement and manage user identities", topics: ["tenant-domain-branding", "admin-units", "bulk-user-management", "dynamic-groups", "hybrid-sync"] },
    { domain: "Implement authentication and access management", topics: ["auth-methods", "temporary-access-pass", "conditional-access", "identity-protection", "global-secure-access"] },
    { domain: "Plan and implement workload identities", topics: ["app-registration", "api-permissions", "enterprise-sso", "managed-identity", "workload-risk"] },
    { domain: "Plan and automate identity governance", topics: ["pim", "access-reviews", "entitlement-management", "lifecycle-workflows", "custom-security-attributes"] }
  ],
  "AZ-500": [
    { domain: "Secure identity and access", topics: ["azure-rbac", "pim-azure", "managed-identities", "app-consent", "conditional-access-azure"] },
    { domain: "Secure networking", topics: ["nsg-asg", "private-endpoints", "azure-firewall", "waf", "network-watcher"] },
    { domain: "Secure compute, storage, and databases", topics: ["vm-security", "aks-security", "storage-hardening", "sas", "sql-security"] },
    { domain: "Secure Azure using Defender for Cloud and Sentinel", topics: ["defender-cloud", "defender-plans", "sentinel-connectors", "kql-analytics", "playbooks"] }
  ],
  "SC-500": [
    { domain: "Manage identity, access, and governance", topics: ["zero-trust", "key-vault-governance", "policy-compliance", "overprivileged-access", "hybrid-identity-security"] },
    { domain: "Protect storage, databases, and networks", topics: ["storage-security", "database-security", "network-security", "private-access", "secret-scanning"] },
    { domain: "Secure compute", topics: ["server-security", "arc", "container-security", "appservice-security", "machine-config"] },
    { domain: "Manage and monitor security posture", topics: ["sentinel", "security-copilot", "dspm", "defender-ai", "agentic-ai"] }
  ]
};

export const quizBlueprints: QuizBlueprint[] = (["SC-300", "AZ-500", "SC-500"] as Cert[]).flatMap((cert) =>
  domainMap[cert].flatMap((domainItem, dIndex) =>
    domainItem.topics.map((tag, tIndex) => ({
      id: `${cert.toLowerCase().replace("-", "")}-d${dIndex + 1}-q${tIndex + 1}`,
      cert,
      domainNumber: dIndex + 1,
      quizNumber: tIndex + 1,
      title: `${cert} Quiz ${dIndex + 1}.${tIndex + 1}`,
      subtitle: tag.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" "),
      domain: domainItem.domain,
      targetQuestions: 10,
      minutes: 12,
      focusTags: [tag]
    }))
  )
);
