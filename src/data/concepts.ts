import type { Cert } from "../types";

export interface ConceptCard {
  id: string;
  cert: Cert;
  emoji: string;
  title: string;
  punchline: string;
  diagram: string;
  eli5: string;
  realLife: string;
  highlight: string;
}

export const concepts: ConceptCard[] = [
  {
    id: "least-privilege",
    cert: "SC-300",
    emoji: "ID",
    title: "Least privilege",
    punchline: "Give Abigail only the access required for the task.",
    diagram: "User -> Group -> Role -> Scope",
    eli5: "Like giving someone the key to one room, not the whole building.",
    realLife: "At Nexus Financial, Abigail Analyst gets Reader on one resource group so she can investigate alerts without changing production settings.",
    highlight: "Prefer group-based RBAC at the smallest useful scope."
  },
  {
    id: "pim",
    cert: "SC-300",
    emoji: "PIM",
    title: "PIM = power timer",
    punchline: "Admin power expires before it becomes dangerous.",
    diagram: "Eligible -> MFA -> Approve -> Active 4h -> Expire",
    eli5: "You borrow the boss key, use it, then it vanishes.",
    realLife: "During a FortisAid incident, SecurityTeam activates Privileged Role Administrator for 2 hours, approves the change, then the access expires automatically.",
    highlight: "Use eligible assignments, justification, MFA, approval, access reviews."
  },
  {
    id: "managed-identity",
    cert: "AZ-500",
    emoji: "KV",
    title: "No hardcoded secrets",
    punchline: "Apps should ask Azure who they are.",
    diagram: "VM/App -> Managed Identity -> Key Vault -> Secret",
    eli5: "The app gets a badge instead of carrying a password note.",
    realLife: "A ClearVault app uses its managed identity to read a Key Vault secret, so no developer has to paste credentials into code or pipelines.",
    highlight: "Managed identities + Key Vault beat secrets in code."
  },
  {
    id: "nsg",
    cert: "AZ-500",
    emoji: "NET",
    title: "NSGs are traffic lights",
    punchline: "Green for approved flows. Red for unapproved traffic.",
    diagram: "Internet ✗ → Data\nApp ✓ → Data",
    eli5: "Only the right cars can enter the right street.",
    realLife: "In a hub-spoke design, the app subnet can reach the database subnet on 1433, but random internet traffic and SSH from anywhere are blocked.",
    highlight: "Use subnet-specific rules, least-open ports, and source restrictions."
  },
  {
    id: "sentinel",
    cert: "AZ-500",
    emoji: "KQL",
    title: "Sentinel spots patterns",
    punchline: "One failed login is noise. Ten across users is a story.",
    diagram: "Logs -> KQL -> Alert -> Incident -> Playbook",
    eli5: "It connects related signals quickly so analysts can focus on response.",
    realLife: "Helix x Pulse sends Entra sign-in logs to Sentinel, then a KQL rule groups impossible travel, failed MFA, and unfamiliar IPs into one incident.",
    highlight: "Good rules correlate time, users, IPs, entities, and severity."
  }
];
