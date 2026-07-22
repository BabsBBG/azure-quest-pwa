export type ProviderStatus = "active" | "planned" | "retired";
export type SourceIngestionStatus = "queued" | "running" | "completed" | "failed" | "unchanged" | "changed";

export interface ProviderRegistryEntry {
  id: string;
  code: string;
  displayName: string;
  status: ProviderStatus;
  officialSourceDomains: string[];
}

export interface CertificationRegistryEntry {
  id: string;
  providerId: string;
  code: string;
  version: string;
  status: "active" | "retiring" | "retired";
  effectiveDate: string;
  retirementDate?: string;
  replacementCertification?: string;
  officialExamPage: string;
  officialStudyGuide: string;
  domains: Array<{ id: string; title: string; objectives: string[] }>;
}

export interface SourceFetchResult {
  url: string;
  title: string;
  body: string;
  fetchedAt: string;
}

export interface SourceIngestionJob {
  id: string;
  providerId: string;
  certificationId: string;
  url: string;
  status: SourceIngestionStatus;
  attempts: number;
  maxAttempts: number;
  contentHash?: string;
  previousHash?: string;
  failureReason?: string;
  createdAt: string;
  completedAt?: string;
}

export interface KnowledgeUnitDraft {
  id: string;
  certificationId: string;
  domainId: string;
  objective: string;
  concept: string;
  prerequisites: string[];
  procedures: string[];
  constraints: string[];
  exceptions: string[];
  commonConfusions: string[];
  products: string[];
  sourceUrl: string;
  sourceSection: string;
  sourceTextHash: string;
}

export interface SourceFetchAdapter {
  fetch(url: string): Promise<SourceFetchResult>;
}

export const providers: ProviderRegistryEntry[] = [
  {
    id: "provider-microsoft",
    code: "microsoft",
    displayName: "Microsoft",
    status: "active",
    officialSourceDomains: ["learn.microsoft.com", "docs.microsoft.com"]
  }
];

export const certifications: CertificationRegistryEntry[] = [
  {
    id: "cert-sc300-2026",
    providerId: "provider-microsoft",
    code: "SC-300",
    version: "2026",
    status: "active",
    effectiveDate: "2026-01-01",
    officialExamPage: "https://learn.microsoft.com/en-us/credentials/certifications/exams/sc-300/",
    officialStudyGuide: "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-300",
    domains: [
      {
        id: "sc300-auth-access",
        title: "Implement authentication and access management",
        objectives: ["Implement Conditional Access", "Implement authentication methods and access controls"]
      },
      {
        id: "sc300-identity-governance",
        title: "Plan and implement identity governance",
        objectives: ["Plan and implement access reviews", "Plan and implement entitlement management"]
      }
    ]
  },
  {
    id: "cert-sc500-2026",
    providerId: "provider-microsoft",
    code: "SC-500",
    version: "2026",
    status: "active",
    effectiveDate: "2026-01-01",
    officialExamPage: "https://learn.microsoft.com/en-us/credentials/certifications/exams/sc-500/",
    officialStudyGuide: "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-500",
    domains: [
      {
        id: "sc500-end-to-end-security",
        title: "Implement end-to-end Microsoft security",
        objectives: ["Implement identity and access controls", "Implement security operations"]
      }
    ]
  },
  {
    id: "cert-az500-2026",
    providerId: "provider-microsoft",
    code: "AZ-500",
    version: "2026-retiring",
    status: "retiring",
    effectiveDate: "2026-01-01",
    retirementDate: "2026-08-31",
    replacementCertification: "SC-500",
    officialExamPage: "https://learn.microsoft.com/en-us/credentials/certifications/exams/az-500/",
    officialStudyGuide: "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/az-500",
    domains: [
      {
        id: "az500-defender-sentinel",
        title: "Secure Azure using Microsoft Defender for Cloud and Microsoft Sentinel",
        objectives: ["Configure Microsoft Defender for Cloud", "Configure and manage Microsoft Sentinel"]
      }
    ]
  }
];

export class FixtureSourceFetchAdapter implements SourceFetchAdapter {
  async fetch(url: string): Promise<SourceFetchResult> {
    const canonicalUrl = canonicalSourceUrl(url);
    const certification = certifications.find(
      (item) =>
        canonicalSourceUrl(item.officialStudyGuide) === canonicalUrl || canonicalSourceUrl(item.officialExamPage) === canonicalUrl
    );
    if (!certification) throw new Error(`No fixture source registered for ${url}`);
    return {
      url: canonicalUrl,
      title: `${certification.code} official source fixture`,
      body: certification.domains.map((domain) => `## ${domain.title}\n${domain.objectives.map((objective) => `- ${objective}`).join("\n")}`).join("\n\n"),
      fetchedAt: new Date("2026-07-22T00:00:00.000Z").toISOString()
    };
  }
}

export function canonicalSourceUrl(value: string) {
  const url = new URL(value);
  url.hash = "";
  url.search = "";
  url.hostname = url.hostname.toLowerCase();
  url.pathname = url.pathname.replace(/\/$/, "");
  return url.toString();
}

export function sourceHash(value: string) {
  let hashA = 0x811c9dc5;
  let hashB = 0x01000193;
  for (let index = 0; index < value.length; index += 1) {
    const char = value.charCodeAt(index);
    hashA ^= char;
    hashA = Math.imul(hashA, 0x01000193);
    hashB ^= char + index;
    hashB = Math.imul(hashB, 0x85ebca6b);
  }
  const segment = (input: number) => (input >>> 0).toString(16).padStart(8, "0");
  return [
    segment(hashA),
    segment(hashB),
    segment(Math.imul(hashA ^ hashB, 0xc2b2ae35)),
    segment(Math.imul(hashA + hashB, 0x27d4eb2f)),
    segment(Math.imul(hashA - hashB, 0x165667b1)),
    segment(Math.imul(hashB ^ value.length, 0xd3a2646c)),
    segment(Math.imul(hashA | value.length, 0x9e3779b1)),
    segment(Math.imul(hashB | value.length, 0x7f4a7c15))
  ].join("");
}

export function sourceDomainAllowed(provider: ProviderRegistryEntry, url: string) {
  const hostname = new URL(url).hostname.toLowerCase();
  return provider.officialSourceDomains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));
}

export async function ingestOfficialSource(args: {
  adapter: SourceFetchAdapter;
  certificationId: string;
  url: string;
  previousHash?: string;
  now?: string;
}) {
  const certification = certifications.find((item) => item.id === args.certificationId);
  if (!certification) throw new Error(`Unknown certification ${args.certificationId}`);
  const provider = providers.find((item) => item.id === certification.providerId);
  if (!provider) throw new Error(`Unknown provider ${certification.providerId}`);
  const canonicalUrl = canonicalSourceUrl(args.url);
  if (!sourceDomainAllowed(provider, canonicalUrl)) throw new Error(`Unsupported official source domain: ${canonicalUrl}`);

  const fetched = await args.adapter.fetch(canonicalUrl);
  const contentHash = sourceHash(fetched.body);
  const status: SourceIngestionStatus = args.previousHash
    ? args.previousHash === contentHash ? "unchanged" : "changed"
    : "completed";

  const job: SourceIngestionJob = {
    id: sourceHash(`${args.certificationId}:${canonicalUrl}`).slice(0, 24),
    providerId: provider.id,
    certificationId: certification.id,
    url: canonicalUrl,
    status,
    attempts: 1,
    maxAttempts: 3,
    contentHash,
    previousHash: args.previousHash,
    createdAt: args.now ?? fetched.fetchedAt,
    completedAt: args.now ?? fetched.fetchedAt
  };

  return {
    job,
    sourceDocument: {
      id: job.id,
      providerId: provider.id,
      certificationId: certification.id,
      title: fetched.title,
      url: canonicalUrl,
      contentHash,
      fetchedAt: fetched.fetchedAt
    },
    knowledgeUnits: extractKnowledgeUnits(certification, canonicalUrl, fetched.body)
  };
}

export function extractKnowledgeUnits(certification: CertificationRegistryEntry, sourceUrl: string, body: string): KnowledgeUnitDraft[] {
  return certification.domains.flatMap((domain) => domain.objectives.map((objective) => ({
    id: sourceHash(`${certification.id}:${domain.id}:${objective}`).slice(0, 24),
    certificationId: certification.id,
    domainId: domain.id,
    objective,
    concept: objective.replace(/^Plan and implement\s+/i, "").replace(/^Implement\s+/i, ""),
    prerequisites: [],
    procedures: body.includes(objective) ? [objective] : [],
    constraints: ["Use only official provider sources for production content."],
    exceptions: [],
    commonConfusions: [],
    products: certification.providerId === "provider-microsoft" ? ["Microsoft Entra", "Microsoft security"] : [],
    sourceUrl,
    sourceSection: domain.title,
    sourceTextHash: sourceHash(`${domain.title}:${objective}`)
  })));
}
