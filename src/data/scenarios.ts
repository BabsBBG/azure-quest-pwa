export type ScenarioDifficulty = "Easy" | "Medium" | "Hard";

export interface ScenarioTopic {
  id: string;
  title: string;
  description: string;
  difficulty: ScenarioDifficulty;
  estimatedTime: string;
  tags: string[];
  questions: number[];
}

export interface ScenarioDomain {
  id: string;
  name: string;
  weight: string;
  scenarios: ScenarioTopic[];
}

export interface ProjectScenario {
  id: string;
  title: string;
  description: string;
  repo: string;
  tech: string[];
  domains: string[];
  questions: number[];
}

export const scenarios: Record<"sc-300" | "sc-500", { domains: ScenarioDomain[] }> = {
  "sc-300": {
    domains: [
      {
        id: "implement-identities",
        name: "Implement identities in Microsoft Entra ID",
        weight: "20-25%",
        scenarios: [
          { id: "tenant-domain-setup", title: "Custom Domains and Tenant Properties", description: "A company purchased a custom domain and must verify ownership, configure tenant properties, and allow users to sign in with the new domain.", difficulty: "Easy", estimatedTime: "5 minutes", tags: ["domains", "tenant", "verification"], questions: [1, 2, 3] },
          { id: "bulk-user-creation", title: "Bulk User Creation with PowerShell", description: "An organisation needs to onboard 200 employees with consistent attributes and group membership while avoiding manual portal work.", difficulty: "Medium", estimatedTime: "10 minutes", tags: ["powershell", "users", "bulk-creation"], questions: [4, 5, 6, 7] },
          { id: "dynamic-group-configuration", title: "Dynamic Groups for Departmental Access", description: "Users in the Sales department must be automatically assigned to the correct access group based on directory attributes.", difficulty: "Medium", estimatedTime: "8 minutes", tags: ["dynamic-groups", "attributes", "membership"], questions: [8, 9, 10] },
          { id: "entra-id-connect-configuration", title: "Hybrid Identity with Entra Connect", description: "An organisation with on-premises Active Directory wants synchronized identities, the right sign-in method, and a predictable sync schedule.", difficulty: "Hard", estimatedTime: "15 minutes", tags: ["hybrid", "entra-id-connect", "synchronization"], questions: [11, 12, 13, 14, 15] },
          { id: "b2b-guest-access", title: "B2B Guest Access for Partners", description: "External partners need access to project collaboration resources without broad access to internal applications.", difficulty: "Medium", estimatedTime: "12 minutes", tags: ["b2b", "guest", "external-identities"], questions: [16, 17, 18, 19] }
        ]
      },
      {
        id: "implement-authentication",
        name: "Implement authentication and access management",
        weight: "25-30%",
        scenarios: [
          { id: "mfa-configuration", title: "MFA Registration for All Users", description: "A policy requires all users to register for MFA within 14 days using approved authentication methods.", difficulty: "Easy", estimatedTime: "6 minutes", tags: ["mfa", "authentication", "registration"], questions: [20, 21, 22] },
          { id: "conditional-access-policies", title: "Conditional Access for Remote Work", description: "A remote workforce must use MFA, avoid legacy authentication, and respond to risk-based access decisions.", difficulty: "Hard", estimatedTime: "20 minutes", tags: ["conditional-access", "mfa", "legacy-auth", "risk"], questions: [23, 24, 25, 26, 27, 28, 29] },
          { id: "identity-protection-risk", title: "Risky User Investigation", description: "A user has been flagged as risky. Investigate sign-in risk, confirm legitimacy, and choose the right remediation action.", difficulty: "Medium", estimatedTime: "12 minutes", tags: ["identity-protection", "risk", "investigation"], questions: [30, 31, 32, 33] },
          { id: "tap-implementation", title: "Temporary Access Pass for Onboarding", description: "New employees need to register strong authentication methods before they receive their primary device.", difficulty: "Medium", estimatedTime: "10 minutes", tags: ["tap", "onboarding", "authentication-methods"], questions: [34, 35, 36] }
        ]
      },
      {
        id: "access-management-apps",
        name: "Implement access management for applications",
        weight: "20-25%",
        scenarios: [
          { id: "app-registration", title: "Secure App Registration", description: "A web application must authenticate with Entra ID using the correct redirect URIs, permissions, and credential model.", difficulty: "Medium", estimatedTime: "10 minutes", tags: ["app-registration", "oauth", "client-secrets"], questions: [40, 41, 42, 43] },
          { id: "sso-configuration", title: "Single Sign-On for SaaS", description: "A third-party SaaS app must use Entra ID SAML-based SSO with controlled assignment and claims.", difficulty: "Hard", estimatedTime: "15 minutes", tags: ["sso", "saml", "enterprise-apps"], questions: [44, 45, 46, 47, 48] },
          { id: "managed-identities", title: "Managed Identities for Azure Resources", description: "An Azure Function needs secure access to a storage account without secrets in configuration or code.", difficulty: "Medium", estimatedTime: "12 minutes", tags: ["managed-identities", "azure-resources", "permissions"], questions: [49, 50, 51, 52] }
        ]
      },
      {
        id: "identity-governance",
        name: "Plan and implement identity governance",
        weight: "20-25%",
        scenarios: [
          { id: "pim-configuration", title: "PIM for Global Administrator", description: "Standing administrator access must be replaced with just-in-time activation, approval, and periodic review.", difficulty: "Hard", estimatedTime: "20 minutes", tags: ["pim", "jit", "approval", "access-reviews"], questions: [60, 61, 62, 63, 64, 65] },
          { id: "access-reviews", title: "Access Reviews for External Users", description: "External users in collaboration groups must be reviewed on a recurring schedule by the correct reviewers.", difficulty: "Medium", estimatedTime: "10 minutes", tags: ["access-reviews", "b2b", "governance"], questions: [66, 67, 68] },
          { id: "entitlement-management", title: "Access Packages for Contractors", description: "Contractors require temporary access to apps and groups with approval, expiry, and lifecycle rules.", difficulty: "Hard", estimatedTime: "15 minutes", tags: ["entitlement-management", "access-packages", "contractors"], questions: [69, 70, 71, 72] },
          { id: "lifecycle-workflows", title: "Employee Offboarding Automation", description: "When an employee leaves, account access must be removed quickly and consistently across identity systems.", difficulty: "Medium", estimatedTime: "12 minutes", tags: ["lifecycle-workflows", "offboarding", "automation"], questions: [73, 74, 75, 76] }
        ]
      }
    ]
  },
  "sc-500": {
    domains: [
      {
        id: "manage-identity",
        name: "Manage identity, access, and governance",
        weight: "20-25%",
        scenarios: [
          { id: "zero-trust-implementation", title: "Zero Trust for Cloud and AI Workloads", description: "Design Conditional Access, least privilege, and continuous access controls for cloud and AI workloads.", difficulty: "Hard", estimatedTime: "20 minutes", tags: ["zero-trust", "conditional-access", "least-privilege", "cae"], questions: [101, 102, 103, 104, 105] },
          { id: "entra-id-protection", title: "Identity Protection Risk Policies", description: "Configure user risk and sign-in risk policies to detect and respond to identity-based attacks.", difficulty: "Medium", estimatedTime: "15 minutes", tags: ["identity-protection", "risk-policies", "threat-detection"], questions: [106, 107, 108, 109] },
          { id: "hybrid-identity-security", title: "Secure Hybrid Identity", description: "Secure synchronized identities and monitor hybrid identity risk across on-premises AD and Entra ID.", difficulty: "Hard", estimatedTime: "18 minutes", tags: ["hybrid", "entra-id-connect", "password-hash-sync"], questions: [110, 111, 112, 113] },
          { id: "pim-for-azure-resources", title: "PIM for Azure Resources", description: "Secure Azure role access with eligible assignments, approval, justification, and time limits.", difficulty: "Medium", estimatedTime: "12 minutes", tags: ["pim", "azure-roles", "approval"], questions: [114, 115, 116] }
        ]
      },
      {
        id: "protect-storage",
        name: "Protect storage, databases, and networks",
        weight: "25-30%",
        scenarios: [
          { id: "storage-security", title: "Secure Azure Storage Accounts", description: "Configure storage firewall rules, key handling, SAS tokens, soft delete, and versioning.", difficulty: "Medium", estimatedTime: "15 minutes", tags: ["storage", "firewall", "sas", "access-keys"], questions: [120, 121, 122, 123] },
          { id: "sql-database-security", title: "Secure Azure SQL Databases", description: "Use Defender for SQL, vulnerability assessment, and access controls to protect database workloads.", difficulty: "Medium", estimatedTime: "12 minutes", tags: ["sql", "defender", "vulnerability-assessment"], questions: [124, 125, 126, 127] },
          { id: "network-security", title: "NSGs, Azure Firewall, and Private Access", description: "Restrict traffic between subnets and control ingress and egress with layered network controls.", difficulty: "Hard", estimatedTime: "20 minutes", tags: ["nsg", "azure-firewall", "ddos", "private-endpoints"], questions: [128, 129, 130, 131, 132] },
          { id: "key-vault-management", title: "Key Vault Secret Management", description: "Centralize secrets, keys, and certificates with managed identities and least privilege access.", difficulty: "Medium", estimatedTime: "15 minutes", tags: ["key-vault", "secrets", "managed-identities"], questions: [133, 134, 135, 136] }
        ]
      },
      {
        id: "secure-compute",
        name: "Secure compute",
        weight: "20-25%",
        scenarios: [
          { id: "vm-security", title: "Secure Azure Virtual Machines", description: "Harden VMs with Defender for Servers, vulnerability assessment, and just-in-time access.", difficulty: "Medium", estimatedTime: "15 minutes", tags: ["vms", "defender", "jit", "vulnerability"], questions: [140, 141, 142, 143] },
          { id: "aks-security", title: "Secure AKS Clusters", description: "Protect AKS with Defender for Containers, managed identities, and network policy controls.", difficulty: "Hard", estimatedTime: "20 minutes", tags: ["aks", "containers", "defender", "managed-identities"], questions: [144, 145, 146, 147, 148] },
          { id: "app-service-security", title: "Secure App Services", description: "Use authentication, certificate management, and network restrictions to harden web apps.", difficulty: "Medium", estimatedTime: "12 minutes", tags: ["app-service", "authentication", "certificates", "networking"], questions: [149, 150, 151, 152] },
          { id: "azure-arc", title: "Azure Arc Hybrid Server Security", description: "Manage and secure on-premises servers with Azure Arc and Defender for Servers.", difficulty: "Medium", estimatedTime: "12 minutes", tags: ["azure-arc", "hybrid", "defender"], questions: [153, 154, 155] }
        ]
      },
      {
        id: "manage-monitor",
        name: "Manage and monitor security posture",
        weight: "20-25%",
        scenarios: [
          { id: "sentinel-implementation", title: "Microsoft Sentinel Operations", description: "Ingest logs, write analytics rules, manage incidents, and automate response with playbooks.", difficulty: "Hard", estimatedTime: "20 minutes", tags: ["sentinel", "incident-response", "playbooks", "kql"], questions: [160, 161, 162, 163, 164] },
          { id: "defender-for-cloud", title: "Defender for Cloud Posture Management", description: "Use recommendations, regulatory compliance, and remediation tasks to improve cloud posture.", difficulty: "Medium", estimatedTime: "15 minutes", tags: ["defender-for-cloud", "posture", "compliance"], questions: [165, 166, 167, 168] },
          { id: "ai-security", title: "Secure AI Workloads and Model Endpoints", description: "Protect AI endpoints and model interactions while supporting responsible AI governance.", difficulty: "Hard", estimatedTime: "20 minutes", tags: ["ai-security", "model-protection", "responsible-ai"], questions: [169, 170, 171, 172, 173] },
          { id: "security-copilot", title: "Security Copilot for Investigation", description: "Use natural language prompts to accelerate incident investigation and response workflows.", difficulty: "Medium", estimatedTime: "12 minutes", tags: ["security-copilot", "ai", "incident-response"], questions: [174, 175, 176, 177] },
          { id: "dspm", title: "Data Security Posture Management", description: "Discover and protect sensitive data across cloud and AI workloads with Microsoft Purview.", difficulty: "Hard", estimatedTime: "20 minutes", tags: ["dspm", "purview", "data-protection"], questions: [178, 179, 180, 181] },
          { id: "agentic-ai-security", title: "Autonomous AI Agent Security", description: "Govern and monitor autonomous AI agents with strong identity, data, and behavior controls.", difficulty: "Hard", estimatedTime: "20 minutes", tags: ["agentic-ai", "governance", "monitoring"], questions: [182, 183, 184, 185, 186] }
        ]
      }
    ]
  }
};

export const projectScenarios: ProjectScenario[] = [
  { id: "project-gatekeeper", title: "Helix Communications Identity Security Overhaul", description: "Helix Communications has acquired Pulse Networks. New identities, inconsistent MFA, stale accounts, and standing admin privileges require a full identity security redesign.", repo: "https://github.com/BabsBBG/project-gatekeeper", tech: ["Entra ID", "Conditional Access", "PIM", "Lifecycle Workflows", "Sentinel", "Logic Apps", "Terraform"], domains: ["SC-300: All domains", "SC-500: Manage identity, access, and governance", "SC-500: Manage and monitor security posture"], questions: [23, 24, 25, 26, 27, 60, 61, 62, 73, 74, 160, 161] },
  { id: "project-citadel", title: "Nexus Financial Secure Azure Monitoring", description: "A fintech organisation needs a secure Azure environment with threat detection, monitoring, and automated incident response.", repo: "https://github.com/BabsBBG/project-citadel", tech: ["Azure", "Sentinel", "Defender for Cloud", "KQL"], domains: ["SC-500: Manage and monitor security posture"], questions: [160, 161, 162, 165, 166] },
  { id: "project-bedrock", title: "ClearVault Finance Secure Baseline", description: "A financial services company requires hardened Azure networking, storage, and compute from day one.", repo: "https://github.com/BabsBBG/project-bedrock", tech: ["Azure", "Networking", "Storage", "Compute", "Baseline"], domains: ["SC-500: Protect storage, databases, and networks", "SC-500: Secure compute"], questions: [120, 121, 122, 128, 129, 140, 141] },
  { id: "project-secops", title: "Security Operations Incident Response", description: "An organisation must detect, respond to, and recover from phishing attacks, malware infections, and account compromise.", repo: "https://github.com/BabsBBG/project-secops", tech: ["Sentinel", "Defender", "KQL", "Incident Response"], domains: ["SC-500: Manage and monitor security posture"], questions: [160, 161, 162, 163, 164] }
];
