#!/usr/bin/env node
/**
 * Generate Netlify _redirects file so legacy /tools/<slug> URLs redirect to
 * the canonical category-based path /tools/<category>/<slug>.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REGISTRY_DIR = path.join(ROOT, "tools-registry");
const REDIRECTS_FILE = path.join(ROOT, "_redirects");
const PATHS_FILE = path.join(ROOT, "lib", "tool-paths.json");
const RULES_FILE = path.join(ROOT, "lib", "category-rules.json");

const categoryRules = JSON.parse(fs.readFileSync(RULES_FILE, "utf-8"));
const CATEGORY_CANONICAL_NAMES = categoryRules.canonicalNames || {};
const CATEGORY_URL_PREFIX = categoryRules.prefixMap || {};

function getPrefix(category) {
  if (!category) return null;
  const canonical = CATEGORY_CANONICAL_NAMES[String(category).toLowerCase()] || category;
  return CATEGORY_URL_PREFIX[canonical] || null;
}

const redirects = new Map();
const toolPaths = {};

if (fs.existsSync(REGISTRY_DIR)) {
  for (const entry of fs.readdirSync(REGISTRY_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith("_")) continue;
    const metaPath = path.join(REGISTRY_DIR, entry.name, "meta.json");
    if (!fs.existsSync(metaPath)) continue;
    try {
      const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
      const prefix = getPrefix(meta.category);
      const baseSlug = meta.slug || entry.name;
      const canonicalPath = prefix ? `/tools/${prefix}/${baseSlug}` : `/tools/${baseSlug}`;
      if (prefix) redirects.set(`/tools/${baseSlug}`, canonicalPath);
      toolPaths[baseSlug] = canonicalPath;
      for (const v of meta.variants || []) {
        const variantPath = prefix ? `/tools/${prefix}/${v.variantSlug}` : `/tools/${v.variantSlug}`;
        if (prefix) redirects.set(`/tools/${v.variantSlug}`, variantPath);
        toolPaths[v.variantSlug] = variantPath;
      }
    } catch (e) {
      console.warn(`[redirects] Failed to parse ${metaPath}: ${e.message}`);
    }
  }
}

// Preserve existing non-tool redirects (e.g. custom rules) and the 404 catch-all.
let existing = "";
if (fs.existsSync(REDIRECTS_FILE)) {
  existing = fs.readFileSync(REDIRECTS_FILE, "utf-8");
}

const existingLines = existing
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("/tools/") && !l.includes(" 404"));

const lines = [];
for (const [from, to] of redirects) {
  lines.push(`${from} ${to} 301`);
}
lines.push(...existingLines);
lines.push("/* /404.html 404");

fs.writeFileSync(REDIRECTS_FILE, lines.join("\n") + "\n");
console.log(`[redirects] Wrote ${redirects.size} tool redirects to ${REDIRECTS_FILE}`);

// Also write a lightweight client-side slug -> canonical path map for components.
fs.writeFileSync(PATHS_FILE, JSON.stringify(toolPaths, null, 2) + "\n");
console.log(`[redirects] Wrote ${Object.keys(toolPaths).length} tool paths to ${PATHS_FILE}`);
