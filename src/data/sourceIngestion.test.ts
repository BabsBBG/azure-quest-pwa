import { describe, expect, it } from "vitest";
import { FixtureSourceFetchAdapter, canonicalSourceUrl, ingestOfficialSource, sourceDomainAllowed, providers } from "./sourceIngestion";

describe("source ingestion", () => {
  it("canonicalizes official source URLs", () => {
    expect(canonicalSourceUrl("https://Learn.Microsoft.com/en-us/path/?view=old#section")).toBe("https://learn.microsoft.com/en-us/path");
  });

  it("rejects unsupported source domains", () => {
    expect(sourceDomainAllowed(providers[0], "https://learn.microsoft.com/en-us/credentials")).toBe(true);
    expect(sourceDomainAllowed(providers[0], "https://example.com/fake")).toBe(false);
  });

  it("ingests fixture sources with content hashes and knowledge units", async () => {
    const result = await ingestOfficialSource({
      adapter: new FixtureSourceFetchAdapter(),
      certificationId: "cert-sc300-2026",
      url: "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-300"
    });

    expect(result.job.status).toBe("completed");
    expect(result.sourceDocument.contentHash).toHaveLength(64);
    expect(result.knowledgeUnits.length).toBeGreaterThan(0);
  });

  it("detects unchanged source versions", async () => {
    const first = await ingestOfficialSource({
      adapter: new FixtureSourceFetchAdapter(),
      certificationId: "cert-sc500-2026",
      url: "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-500"
    });
    const second = await ingestOfficialSource({
      adapter: new FixtureSourceFetchAdapter(),
      certificationId: "cert-sc500-2026",
      url: "https://learn.microsoft.com/en-us/credentials/certifications/resources/study-guides/sc-500",
      previousHash: first.job.contentHash
    });

    expect(second.job.status).toBe("unchanged");
  });
});
