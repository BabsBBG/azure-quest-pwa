import type { Cert } from "../types";

export interface KqlTask {
  id: string;
  cert: Cert;
  title: string;
  prompt: string;
  snippet: string;
  options: { id: "A"|"B"|"C"|"D"; text: string }[];
  answer: "A"|"B"|"C"|"D";
  explanation: string;
  tags: string[];
}

export const kqlTasks: KqlTask[] = [
  { id: "kql-foreign-ip", cert: "AZ-500", title: "Foreign IP sign-ins", prompt: "Nexus Financial wants a Sentinel query for successful sign-ins from non-approved countries. Which line completes the filter?", snippet: "SigninLogs\n| where ResultType == 0\n| where ____\n| summarize Count=count() by UserPrincipalName, Location, IPAddress", options: [{id:"A",text:"Location !in ('GB','US')"},{id:"B",text:"ResultType != 0"},{id:"C",text:"TimeGenerated < ago(90d)"},{id:"D",text:"IPAddress == ''"}], answer: "A", explanation: "Location filtering isolates successful sign-ins outside approved geographies.", tags: ["sentinel","kql","signinlogs"] },
  { id: "kql-bruteforce", cert: "AZ-500", title: "SSH brute force", prompt: "Project SecOps needs to detect repeated failed SSH attempts from the same IP in 10 minutes. Which aggregation is best?", snippet: "Syslog\n| where ProcessName == 'sshd' and SyslogMessage has 'Failed password'\n| summarize Failed=count() by SourceIP=HostIP, bin(TimeGenerated, 10m)\n| where ____", options: [{id:"A",text:"Failed >= 10"},{id:"B",text:"Failed == 0"},{id:"C",text:"SourceIP == UserPrincipalName"},{id:"D",text:"TimeGenerated > now()"}], answer: "A", explanation: "A threshold over a time bin is the common pattern for brute-force analytics.", tags: ["sentinel","kql","bruteforce"] },
  { id: "kql-risky-users", cert: "SC-300", title: "Risky users", prompt: "Helix wants to review users with high user risk. Which table should the analyst query first?", snippet: "____\n| where RiskLevel == 'high'\n| project UserPrincipalName, RiskState, TimeGenerated", options: [{id:"A",text:"AADUserRiskEvents"},{id:"B",text:"AzureActivity"},{id:"C",text:"StorageBlobLogs"},{id:"D",text:"Heartbeat"}], answer: "A", explanation: "Risk events belong in Entra risk event data, not Azure resource or storage logs.", tags: ["identity-protection","kql","entra"] },
  { id: "kql-ai-sensitive", cert: "SC-500", title: "Sensitive AI exposure", prompt: "FortisAid is triaging Copilot-related data exposure. Which result should be prioritized first?", snippet: "PurviewDataSecurityEvents\n| where Workload has 'Copilot'\n| summarize Exposures=count() by SensitivityLabel, SiteUrl\n| order by Exposures desc", options: [{id:"A",text:"High exposures with Confidential or Highly Confidential labels"},{id:"B",text:"Public marketing content with no label"},{id:"C",text:"Empty sites with no activity"},{id:"D",text:"Personal bookmarks only"}], answer: "A", explanation: "Sensitive labeled content with broad exposure creates the highest business risk.", tags: ["dspm","ai-security","purview"] },
  { id: "kql-phishing", cert: "AZ-500", title: "Phishing campaign", prompt: "Which query pattern best groups suspicious email clicks by user after a phishing alert?", snippet: "EmailUrlInfo\n| where Url has 'login-verify'\n| join kind=inner UrlClickEvents on Url\n| summarize Clicks=count() by ____", options: [{id:"A",text:"AccountUpn"},{id:"B",text:"_ResourceId"},{id:"C",text:"TenantId, bin(TimeGenerated, 365d)"},{id:"D",text:"ReportId == 0"}], answer: "A", explanation: "Grouping by user identifies who interacted with the phishing URL.", tags: ["sentinel","phishing","kql"] },
  { id: "kql-pim", cert: "SC-300", title: "PIM activation review", prompt: "SecurityTeam wants PIM activations outside business hours. Which condition is most useful?", snippet: "AuditLogs\n| where OperationName has 'Add member to role completed'\n| extend Hour=datetime_part('hour', TimeGenerated)\n| where ____", options: [{id:"A",text:"Hour < 8 or Hour > 18"},{id:"B",text:"Hour == 12"},{id:"C",text:"Result == 'success' and Hour between (9..17)"},{id:"D",text:"Category == 'StorageRead'"}], answer: "A", explanation: "Out-of-hours role activation is a useful signal for privileged access review.", tags: ["pim","kql","auditlogs"] }
];
