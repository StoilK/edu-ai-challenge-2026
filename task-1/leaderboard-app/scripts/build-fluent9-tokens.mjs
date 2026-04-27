import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const styleDir = path.join(__dirname, "../src/styles");
const outPath = path.join(styleDir, "fluent9-tokens.css");

const argv = process.argv.slice(2);
const fromStdin = argv[0] === "-";
const explicit = (fromStdin ? [] : argv).map((a) => (path.isAbsolute(a) ? a : path.join(styleDir, a)));

const numberedPasts = fs
  .readdirSync(styleDir)
  .filter((f) => /^fluent9-paste-\d+\.txt$/.test(f))
  .sort((a, b) => {
    const na = Number(a.match(/fluent9-paste-(\d+)\.txt/)?.[1] ?? 0);
    const nb = Number(b.match(/fluent9-paste-(\d+)\.txt/)?.[1] ?? 0);
    return na - nb;
  })
  .map((f) => path.join(styleDir, f));

const defaults = (
  numberedPasts.length
    ? numberedPasts
    : ["fluent9-paste.txt", "fluent9-paste-1.txt", "fluent9-paste-2.txt", "fluent9-paste-3.txt", "fluent9-paste-4.txt"]
        .map((f) => path.join(styleDir, f))
        .filter((f) => fs.existsSync(f))
) ;
const inputPaths = fromStdin ? [] : explicit.length > 0 ? explicit : defaults;

if (!fromStdin && inputPaths.length === 0) {
  console.error("Missing paste: add src/styles/fluent9-paste.txt (your devtools copy) and run: npm run build:fluent9");
  process.exit(1);
}

const raw = fromStdin
  ? fs.readFileSync(0, "utf8")
  : inputPaths.map((p) => fs.readFileSync(p, "utf8")).join("\n");
/** @type {string[]} */
const order = [];
/** @type {Map<string, string>} */
const byName = new Map();

for (const line of raw.split("\n")) {
  const t = line.replace(/\r$/, "").trim();
  if (!t || t.startsWith("/*")) continue;
  if (!t.startsWith("--") || !t.includes(":")) continue;
  const m = t.match(/^(--[a-zA-Z0-9-]+)\s*:\s*(.*)$/);
  if (!m) continue;
  const name = m[1];
  let value = m[2].replace(/;+\s*$/, "").trim();
  if (value === "") continue;
  if (!byName.has(name)) order.push(name);
  byName.set(name, value);
}

const body = order.map((n) => `  ${n}: ${byName.get(n)};`).join("\n");
const out = `/* Auto-generated: paste devtools into fluent9-paste.txt, then npm run build:fluent9 */

:root {
${body}
}
`;
fs.writeFileSync(outPath, out, "utf8");
console.log("Wrote", outPath, "from", fromStdin ? "stdin" : inputPaths, "— unique vars:", order.length);
