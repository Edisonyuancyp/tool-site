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

const CATEGORY_NORMALIZATION = {
  ai: "AI",
  seo: "SEO",
  ecommerce: "Ecommerce",
  social: "Social",
  image: "Image",
  file: "File",
  math: "Math",
  finance: "Finance",
  health: "Health",
  crypto: "Crypto",
  fitness: "Fitness",
  quant: "Quant",
  design: "Design",
  generators: "Generators",
  developer: "Developer",
  text: "Text",
  security: "Security",
  content: "Content",
  utilities: "Utilities",
  "date & time": "Date & Time",
  travel: "Travel",
  converter: "Converter",
  cooking: "Cooking",
  productivity: "Productivity",
  media: "Media",
  home: "Home",
};

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
