import { build } from "esbuild";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const outfile = join(tmpdir(), `praxisgrid-rich-items-${Date.now()}.mjs`);

await build({
  stdin: {
    contents: `
      import { examWalkthroughItems } from "./src/data/examWalkthroughItems.ts";
      export const report = {
        count: examWalkthroughItems.length,
        itemTypes: [...new Set(examWalkthroughItems.map((item) => item.type))],
        nonWalkthrough: examWalkthroughItems.filter((item) => item.walkthroughOnly !== true).map((item) => item.id)
      };
    `,
    resolveDir: process.cwd(),
    sourcefile: "validate-rich-items-entry.ts",
    loader: "ts"
  },
  bundle: true,
  format: "esm",
  platform: "node",
  outfile,
  logLevel: "silent"
});

try {
  const { report } = await import(pathToFileURL(outfile).href);
  const required = ["SINGLE_CHOICE", "MULTIPLE_CHOICE", "ORDERING", "MATCHING", "CASE_STUDY_QUESTION"];
  const missing = required.filter((type) => !report.itemTypes.includes(type));

  if (missing.length) {
    console.error(`Rich item validation failed: missing item types ${missing.join(", ")}`);
    process.exit(1);
  }

  if (report.nonWalkthrough.length) {
    console.error(`Rich item validation failed: non-walkthrough items found ${report.nonWalkthrough.join(", ")}`);
    process.exit(1);
  }

  console.log(`Rich item validation passed: ${report.count} walkthrough-only items cover ${required.join(", ")}.`);
} finally {
  rmSync(outfile, { force: true });
}
