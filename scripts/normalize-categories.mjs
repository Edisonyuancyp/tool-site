#!/usr/bin/env node
/**
 * Normalize category casing in all registry meta.json files to match the
 * canonical names used in CATEGORY_URL_PREFIX.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REGISTRY_DIR = path.resolve(__dirname, "..", "tools-registry");
const RULES_PATH = path.resolve(__dirname, "..", "lib", "category-rules.json");

const categoryRules = JSON.parse(fs.readFileSync(RULES_PATH, "utf-8"));
const CATEGORY_NORMALIZATION = categoryRules.canonicalNames;
const CATEGORY_PREFIXES = categoryRules.prefixMap;

function normalizeCategory(cat) {
  if (!cat) return "Developer";
  const key = String(cat).toLowerCase();
  return CATEGORY_NORMALIZATION[key] || cat;
}

let changed = 0;
for (const entry of fs.readdirSync(REGISTRY_DIR, { withFileTypes: true })) {
  if (!entry.isDirectory() || entry.name.startsWith("_")) continue;
  const metaPath = path.join(REGISTRY_DIR, entry.name, "meta.json");
  if (!fs.existsSync(metaPath)) continue;
  const raw = fs.readFileSync(metaPath, "utf-8");
  let meta;
  try {
    meta = JSON.parse(raw);
  } catch {
    continue;
  }
  const normalized = normalizeCategory(meta.category);
  if (normalized !== meta.category) {
    meta.category = normalized;
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n");
    changed++;
    console.log(`[normalize] ${entry.name}: ${meta.category} -> ${normalized}`);
  }
}
console.log(`[normalize] Updated ${changed} meta.json files`);

// Validate every tool category maps to a URL prefix
let warnings = 0;
for (const entry of fs.readdirSync(REGISTRY_DIR, { withFileTypes: true })) {
  if (!entry.isDirectory() || entry.name.startsWith("_")) continue;
  const metaPath = path.join(REGISTRY_DIR, entry.name, "meta.json");
  if (!fs.existsSync(metaPath)) continue;
  const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
  const canonical = normalizeCategory(meta.category);
  if (!CATEGORY_PREFIXES[canonical]) {
    console.warn(`[warn] ${entry.name}: category "${canonical}" has no URL prefix mapping`);
    warnings++;
  }
}
if (warnings) {
  console.warn(`[warn] ${warnings} tool(s) are missing a URL prefix. Add them to lib/category-rules.json prefixMap.`);
  process.exitCode = 1;
}
