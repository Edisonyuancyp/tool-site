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

const CATEGORY_URL_PREFIX = {
  Finance: "calc",
  Math: "calc",
  Health: "calc",
  Crypto: "calc",
  Fitness: "calc",
  Quant: "calc",
  AI: "ai",
  ai: "ai",
  Design: "design",
  Generators: "design",
  Developer: "dev",
  Text: "dev",
  Security: "dev",
  Content: "dev",
  Utilities: "dev",
  "Date & Time": "time",
  Travel: "time",
  Converter: "converter",
  Cooking: "converter",
  Productivity: "converter",
  Ecommerce: "ecommerce",
  ecommerce: "ecommerce",
  SEO: "seo",
  seo: "seo",
  Social: "social",
  social: "social",
  Media: "social",
  Image: "image",
  image: "image",
  File: "file",
  file: "file",
};

function getPrefix(category) {
  if (!category) return "calc";
  const normalized = String(category).toLowerCase();
  return CATEGORY_URL_PREFIX[normalized] || "calc";
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
      const canonicalPath = `/tools/${prefix}/${baseSlug}`;
      redirects.set(`/tools/${baseSlug}`, canonicalPath);
      toolPaths[baseSlug] = canonicalPath;
      for (const v of meta.variants || []) {
        const variantPath = `/tools/${prefix}/${v.variantSlug}`;
        redirects.set(`/tools/${v.variantSlug}`, variantPath);
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
