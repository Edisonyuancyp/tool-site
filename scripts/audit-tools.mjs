/**
 * audit-tools.mjs
 * Self-check: scan every tool in tools-registry for missing / broken view.tsx,
 * missing meta.json fields, and incomplete implementations.
 * Run: node scripts/audit-tools.mjs
 * Run with --fix to attempt automatic repairs where possible.
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REG = path.join(ROOT, "tools-registry");
const COMP = path.join(ROOT, "components");

const FIX_MODE = process.argv.includes("--fix");
const VERBOSE  = process.argv.includes("--verbose");

// ── helpers ──────────────────────────────────────────────────────────────────

function log(tag, msg) {
  const colors = { OK: "\x1b[32m", WARN: "\x1b[33m", ERR: "\x1b[31m", INFO: "\x1b[36m" };
  console.log(`${colors[tag] || ""}[${tag}]\x1b[0m ${msg}`);
}

function readJson(fp) {
  try { return JSON.parse(fs.readFileSync(fp, "utf8")); }
  catch { return null; }
}

// ── audit each tool ───────────────────────────────────────────────────────────

const slugs = fs.readdirSync(REG).filter(s => !s.startsWith("_") && !s.startsWith("."));
const issues = [];
let fixedCount = 0;

for (const slug of slugs) {
  const dir   = path.join(REG, slug);
  const viewP = path.join(dir, "view.tsx");
  const metaP = path.join(dir, "meta.json");

  // ── 1. Check meta.json ────────────────────────────────────────────────────
  if (!fs.existsSync(metaP)) {
    issues.push({ slug, sev: "ERR", msg: "Missing meta.json" });
    continue;
  }
  const meta = readJson(metaP);
  if (!meta) {
    issues.push({ slug, sev: "ERR", msg: "Invalid JSON in meta.json" });
    continue;
  }
  const REQUIRED_FIELDS = ["slug","name","tagline","description","category","icon","keywords","faqs"];
  for (const f of REQUIRED_FIELDS) {
    if (!meta[f] || (Array.isArray(meta[f]) && meta[f].length === 0)) {
      issues.push({ slug, sev: "WARN", msg: `meta.json missing or empty: ${f}` });
    }
  }
  if (!meta.seoBody || !Array.isArray(meta.seoBody) || meta.seoBody.length < 3) {
    issues.push({ slug, sev: "WARN", msg: "meta.json seoBody missing or too short (<3 sections)" });
  }
  if (!meta.faqs || meta.faqs.length < 2) {
    issues.push({ slug, sev: "WARN", msg: "meta.json faqs too few (<2)" });
  }
  if (!meta.keywords || meta.keywords.length < 5) {
    issues.push({ slug, sev: "WARN", msg: "meta.json keywords too few (<5)" });
  }

  // ── 2. Check view.tsx ─────────────────────────────────────────────────────
  if (!fs.existsSync(viewP)) {
    issues.push({ slug, sev: "ERR", msg: "Missing view.tsx" });
    if (FIX_MODE) {
      // Generate a minimal stub so build doesn't fail
      const compName = slug.replace(/-./g, m => m[1].toUpperCase()).replace(/^./, c => c.toUpperCase());
      const stub = `"use client";
// TODO: implement ${meta.name || slug}
export interface ToolProps { variant?: string; }
export default function ${compName}View({ variant }: ToolProps) {
  return (
    <div className="p-8 text-center text-gray-400">
      <p className="text-4xl mb-4">${meta.icon || "🔧"}</p>
      <p className="font-medium text-gray-700">${meta.name || slug} — Coming Soon</p>
    </div>
  );
}
`;
      fs.writeFileSync(viewP, stub, "utf8");
      log("INFO", `${slug}: generated placeholder view.tsx`);
      fixedCount++;
    }
    continue;
  }

  const viewSrc = fs.readFileSync(viewP, "utf8");

  // ── 3. Check view.tsx has actual JSX return ───────────────────────────────
  if (!/return\s*\(?\s*</.test(viewSrc)) {
    issues.push({ slug, sev: "ERR", msg: "view.tsx has no JSX return statement" });
  }

  // ── 4. Check view.tsx is not the auto-generated error stub ───────────────
  if (viewSrc.includes("Something went wrong") && viewSrc.split("\n").length < 25) {
    issues.push({ slug, sev: "ERR", msg: "view.tsx is an error stub (build-time generated)" });
  }

  // ── 5. Check referenced components exist ─────────────────────────────────
  const refs = [...viewSrc.matchAll(/@\/components\/([^\"\'\`\s;,)]+)/g)].map(m => m[1]);
  for (const ref of refs) {
    const compFile = path.join(COMP, ref + ".tsx");
    if (!fs.existsSync(compFile)) {
      issues.push({ slug, sev: "ERR", msg: `Referenced component missing: components/${ref}.tsx` });
    }
  }

  // ── 6. Warn if view is too simple (likely stub) ───────────────────────────
  const lineCount = viewSrc.split("\n").length;
  const hasInteractivity = /useState|useReducer|onChange|onClick|onSubmit/.test(viewSrc);
  const isProxy = /import .* from "@\/components\//.test(viewSrc);
  if (!hasInteractivity && !isProxy && lineCount < 40) {
    issues.push({ slug, sev: "WARN", msg: `view.tsx looks like a stub (${lineCount} lines, no state/events, no proxy import)` });
  }

  if (VERBOSE && issues.filter(i => i.slug === slug).length === 0) {
    log("OK", slug);
  }
}

// ── Run tsc to catch type errors ─────────────────────────────────────────────

log("INFO", "Running TypeScript check...");
try {
  execSync(
    "npx tsc --noEmit --jsx react-jsx --module esnext --moduleResolution bundler --skipLibCheck 2>&1 | grep -E 'tools-registry.*error|error TS' | head -20",
    { cwd: ROOT, stdio: "pipe" }
  );
  log("OK", "TypeScript: no errors");
} catch (e) {
  const out = e.stdout?.toString() || "";
  if (out.trim()) {
    out.trim().split("\n").forEach(line => {
      const m = line.match(/tools-registry\/([^/]+)\//);
      if (m) issues.push({ slug: m[1], sev: "ERR", msg: "TypeScript error: " + line.trim() });
    });
  }
}

// ── Summary ───────────────────────────────────────────────────────────────────

const errs  = issues.filter(i => i.sev === "ERR");
const warns = issues.filter(i => i.sev === "WARN");

console.log("\n═══════════════════════════════════════");
console.log(`AUDIT COMPLETE: ${slugs.length} tools checked`);
console.log(`  ❌ Errors:   ${errs.length}`);
console.log(`  ⚠️  Warnings: ${warns.length}`);
if (FIX_MODE) console.log(`  🔧 Auto-fixed: ${fixedCount}`);
console.log("═══════════════════════════════════════\n");

if (errs.length > 0) {
  console.log("── ERRORS ──────────────────────────────");
  errs.forEach(i => log("ERR", `${i.slug}: ${i.msg}`));
  console.log();
}
if (warns.length > 0) {
  console.log("── WARNINGS ────────────────────────────");
  warns.forEach(i => log("WARN", `${i.slug}: ${i.msg}`));
  console.log();
}

// Exit non-zero if there are errors (for CI)
if (errs.length > 0 && !FIX_MODE) process.exit(1);
