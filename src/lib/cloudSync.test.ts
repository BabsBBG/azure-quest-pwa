import { describe, expect, it } from "vitest";
import { fetchCloudLearningData, importedProjectRowId } from "./cloudSync";

describe("cloudSync", () => {
  it("falls back to empty cloud data when Supabase is not configured", async () => {
    await expect(fetchCloudLearningData()).resolves.toEqual({
      attempts: [],
      interviewSessions: [],
      questionFlags: [],
      importedProjects: [],
      assessmentSession: null
    });
  });

  it("scopes imported project cloud row IDs by user", () => {
    const project = { id: "same-project", contentHash: "same-content" };

    expect(importedProjectRowId("user-a", project)).toBe("user-a:same-content");
    expect(importedProjectRowId("user-b", project)).toBe("user-b:same-content");
    expect(importedProjectRowId("user-a", project)).not.toBe(importedProjectRowId("user-b", project));
  });
});
