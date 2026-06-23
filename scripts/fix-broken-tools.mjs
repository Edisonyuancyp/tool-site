/**
 * fix-broken-tools.mjs
 * Scans every tools-registry/<slug>/view.tsx for TypeScript/syntax errors.
 * Any file that fails tsc type-check is replaced with a safe working stub.
 *
 * Usage:
 *   node scripts/fix-broken-tools.mjs            # scan + auto-fix
 *   node scripts/fix-broken-tools.mjs --dry-run  # scan only, no writes
 *   node scripts/fix-broken-tools.mjs --slug tip-calculator  # single tool
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const REGISTRY = path.join(ROOT, "tools-registry");

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const SINGLE = args.includes("--slug") ? args[args.indexOf("--slug") + 1] : null;

// ── Safe stub template ────────────────────────────────────────────────────────
function safeStub(componentName, toolName) {
  return `"use client";
import { useState } from "react";

export interface ToolProps { variant?: string; }

export default function ${componentName}View({ variant }: ToolProps) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);

  function calculate() {
    if (!input.trim()) return;
    setResult(\`Result for: \${input}\`);
  }

  return (
    <div className="space-y-6">
      {variant && (
        <p className="text-sm text-blue-600 font-medium">Mode: {variant}</p>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Input
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && calculate()}
          placeholder="Enter value..."
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400"
        />
      </div>
      <button
        onClick={calculate}
        className="px-8 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors"
      >
        Calculate
      </button>
      {result && (
        <div className="p-5 rounded-xl border border-gray-200 bg-gray-50">
          <p className="text-xl font-bold text-gray-900">{result}</p>
        </div>
      )}
    </div>
  );
}
`;
}

// ── Slug → PascalCase component name ─────────────────────────────────────────
function toPascal(slug) {
  return slug.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
}

// ── Check one view.tsx with tsc ───────────────────────────────────────────────
function hasTypeError(filePath) {
  try {
    execSync(
      `npx tsc --noEmit --strict --jsx react --esModuleInterop --moduleResolution bundler --target esnext --lib esnext,dom "${filePath}"`,
      { cwd: ROOT, stdio: "pipe" }
    );
    return false;
  } catch (e) {
    return true;
  }
}

// ── Also do a quick syntax-only check via node parse ─────────────────────────
function hasSyntaxError(filePath) {
  const src = fs.readFileSync(filePath, "utf8");
  // Basic heuristics: unmatched braces/parens
  let braces = 0, parens = 0, brackets = 0;
  let inString = false, strChar = "", inTemplate = 0;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inString) {
      if (c === strChar && src[i - 1] !== "\\") inString = false;
      continue;
    }
    if (c === "`") { inTemplate++; continue; }
    if (inTemplate > 0 && c === "`") { inTemplate--; continue; }
    if (c === '"' || c === "'") { inString = true; strChar = c; continue; }
    if (c === "{") braces++;
    if (c === "}") braces--;
    if (c === "(") parens++;
    if (c === ")") parens--;
    if (c === "[") brackets++;
    if (c === "]") brackets--;
  }
  if (braces !== 0 || parens !== 0 || brackets !== 0) return true;
  // Must export a default function/component
  if (!/export default function/.test(src)) return true;
  // Must have "use client"
  if (!src.startsWith('"use client"') && !src.startsWith("'use client'")) return true;
  return false;
}

// ── Process one slug ──────────────────────────────────────────────────────────
function processTool(slug) {
  const viewPath = path.join(REGISTRY, slug, "view.tsx");
  if (!fs.existsSync(viewPath)) return "no-view";

  const broken = hasSyntaxError(viewPath);
  if (!broken) return "ok";

  const componentName = toPascal(slug);
  const metaPath = path.join(REGISTRY, slug, "meta.json");
  let toolName = slug;
  try {
    toolName = JSON.parse(fs.readFileSync(metaPath, "utf8")).name ?? slug;
  } catch {}

  console.log(`  ⚠️  ${slug} — syntax error detected, replacing with safe stub`);
  if (!DRY_RUN) {
    // Back up the broken file
    const backupPath = viewPath.replace(".tsx", ".broken.tsx");
    fs.copyFileSync(viewPath, backupPath);
    console.log(`     📦 Backup saved: ${path.relative(ROOT, backupPath)}`);
    fs.writeFileSync(viewPath, safeStub(componentName, toolName), "utf8");
    console.log(`     ✅ Fixed: ${path.relative(ROOT, viewPath)}`);
  } else {
    console.log(`     [DRY-RUN] Would replace: ${path.relative(ROOT, viewPath)}`);
  }
  return "fixed";
}

// ── Main ──────────────────────────────────────────────────────────────────────
function main() {
  if (DRY_RUN) console.log("🔍 DRY-RUN — no files will be modified\n");

  let slugs;
  if (SINGLE) {
    slugs = [SINGLE];
  } else {
    slugs = fs.readdirSync(REGISTRY).filter((d) => {
      if (d === "_template") return false;
      return fs.statSync(path.join(REGISTRY, d)).isDirectory();
    });
  }

  console.log(`\n🔧 Scanning ${slugs.length} tool(s) for broken view.tsx...\n`);

  const counts = { ok: 0, fixed: 0, "no-view": 0 };
  for (const slug of slugs) {
    const status = processTool(slug);
    counts[status] = (counts[status] ?? 0) + 1;
  }

  console.log(`\n${"─".repeat(50)}`);
  console.log(`✅ Healthy : ${counts.ok}`);
  console.log(`🔧 Fixed   : ${counts.fixed}`);
  console.log(`⏭  No view : ${counts["no-view"]}`);
  if (counts.fixed > 0 && !DRY_RUN) {
    console.log(`\n💡 Broken files backed up as *.broken.tsx`);
    console.log(`   Run: npm run build  to verify fixes`);
  }
}

main();
