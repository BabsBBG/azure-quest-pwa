import { readFileSync } from "node:fs";

const styles = readFileSync("src/styles.css", "utf8");

const requiredSnippets = [
  "--aq-font-sans",
  "--aq-font-mono",
  "font-family: var(--aq-font-sans);",
  "font-family: var(--aq-font-mono);"
];

for (const snippet of requiredSnippets) {
  if (!styles.includes(snippet)) {
    console.error(`Typography validation failed: missing ${snippet}`);
    process.exit(1);
  }
}

const rootBlock = styles.slice(styles.indexOf(":root {"), styles.indexOf(".dark {"));
if (/font-family:\s*["']?JetBrains Mono/.test(rootBlock)) {
  console.error("Typography validation failed: root still uses a monospace-first stack.");
  process.exit(1);
}

const bodyBlock = styles.slice(styles.indexOf("body {"), styles.indexOf("h1, h2, h3"));
if (!bodyBlock.includes("font-family: var(--aq-font-sans);")) {
  console.error("Typography validation failed: body does not explicitly use the sans-serif stack.");
  process.exit(1);
}

const technicalSelectorPattern = /code,\s*kbd,\s*samp,\s*pre,\s*\.font-mono,\s*\.aq-technical\s*\{/;
if (!technicalSelectorPattern.test(styles)) {
  console.error("Typography validation failed: code and technical metadata selectors are not grouped for monospace.");
  process.exit(1);
}

const careerLab = readFileSync("src/pages/JobReadiness.tsx", "utf8");
if (!careerLab.includes("aq-technical")) {
  console.error("Typography validation failed: technical metadata should opt into aq-technical.");
  process.exit(1);
}

console.log("Typography validation passed: global UI uses sans-serif and technical metadata opts into monospace.");
