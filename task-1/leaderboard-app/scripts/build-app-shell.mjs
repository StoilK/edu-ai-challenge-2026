import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, "../src/styles/fluent-app-shell.css");

const explicit = (process.argv[2] || "").split(/[\s,]+/g).filter(Boolean);
const dir = path.join(__dirname, "../src/styles");
const candidates =
  explicit.length > 0
    ? explicit.map((f) => (path.isAbsolute(f) ? f : path.join(dir, f)))
    : [
        "theme-raw-dump-1.txt",
        "theme-raw-dump-2.txt",
        "theme-raw-dump-3.txt",
        "theme-raw-dump.txt",
      ]
        .map((f) => path.join(dir, f))
        .filter((f) => fs.existsSync(f));

if (candidates.length === 0) {
  console.error("Add src/styles/theme-raw-dump-1/2/3 (or .txt) then run again.");
  process.exit(1);
}

const raw = candidates.map((p) => fs.readFileSync(p, "utf8")).join("\n");
const customProps = [];
const body = [];

for (const line of raw.split("\n")) {
  const t = line.replace(/\r$/, "").trim();
  if (!t) continue;
  if (t.startsWith("/*") || t === "*/" || t.endsWith("*/")) continue;
  if (t.startsWith("--")) {
    if (!t.includes(":")) continue;
    customProps.push("  " + (t.endsWith(";") ? t : t + ";"));
    continue;
  }
  if (t.startsWith("@")) continue;
  if (t.includes(":") && t.split(":", 1)[0].trim() !== "") {
    body.push("  " + (t.endsWith(";") ? t : t + ";"));
  }
}

const out = `/* Source: src/styles/theme-raw-dump-*.txt — regenerate: node scripts/build-app-shell.mjs */

:root {
${customProps.join("\n")}
}

html {
  min-height: 100%;
}

body {
  margin: 0;
  box-sizing: border-box;
${body.join("\n")}
}

#root {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
  min-width: 0;
}
`;

fs.writeFileSync(outPath, out, "utf8");
console.log("Wrote", outPath, { vars: customProps.length, body: body.length, inputs: candidates });
