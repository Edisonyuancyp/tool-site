#!/usr/bin/env node
/**
 * fix-duplicate-pages.mjs
 *
 * 1. 找出完全重复的独立 slug 工具 → 在 meta.json 加 noindex + 在 _redirects 加 301
 * 2. 找出泛型无意义 variant slug (-online / -free / -for-web 等) → 在 variant 条目加 noindex: true
 *
 * 运行: node scripts/fix-duplicate-pages.mjs [--dry-run]
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, resolve } from "path";

const DRY_RUN = process.argv.includes("--dry-run");
const ROOT = resolve(process.cwd());
const REGISTRY = join(ROOT, "tools-registry");
const REDIRECTS_PATH = join(ROOT, "_redirects");

// ── 1. 手动维护的重复工具组（保留第一个，其余 301 到第一个）
const DUPLICATE_GROUPS = [
  {
    keep: "prompt-version-comparator",
    redirectFrom: ["prompt-version-compare", "prompt-version-comparer"],
  },
  {
    keep: "prompt-token-counter",
    redirectFrom: ["token-splitter", "token-splitter-tool"],
  },
  {
    keep: "prompt-optimizer-tool",
    redirectFrom: ["prompt-cleaner-tool"],
  },
];

// ── 2. 泛型无意义 variant slug 后缀 → 自动加 noindex
const GENERIC_VARIANT_SUFFIXES = [
  "-online",
  "-free",
  "-for-web",
  "-tool",
  "-calculator-online",
  "-calculator-free",
  "-online-free",
];

// ── 泛型无意义 variant slug 完全匹配
const GENERIC_VARIANT_EXACT = [
  "online-free",
  "how-to-use",
];

// ── 工具函数
function loadMeta(slug) {
  const p = join(REGISTRY, slug, "meta.json");
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function saveMeta(slug, data) {
  const p = join(REGISTRY, slug, "meta.json");
  if (!DRY_RUN) writeFileSync(p, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(`  ${DRY_RUN ? "[dry]" : "✅"} wrote ${p}`);
}

function getUrlPath(slug) {
  const meta = loadMeta(slug);
  if (!meta) return `/tools/${slug}`;
  return meta.urlPath || `/tools/${slug}`;
}

// ── Step 1: 处理重复独立 slug
console.log("\n=== Step 1: 处理重复独立 slug ===\n");
const newRedirectLines = [];

for (const group of DUPLICATE_GROUPS) {
  const keepMeta = loadMeta(group.keep);
  if (!keepMeta) {
    console.log(`  ⚠️  keep slug not found: ${group.keep}`);
    continue;
  }
  const keepUrl = keepMeta.urlPath || `/tools/${group.keep}`;

  for (const dupSlug of group.redirectFrom) {
    const dupMeta = loadMeta(dupSlug);
    if (!dupMeta) {
      console.log(`  ⚠️  dup slug not found: ${dupSlug}, skip`);
      continue;
    }

    // 加 noindex 到 dup meta.json
    if (!dupMeta.noindex) {
      dupMeta.noindex = true;
      saveMeta(dupSlug, dupMeta);
      console.log(`  noindex → ${dupSlug}`);
    } else {
      console.log(`  already noindex: ${dupSlug}`);
    }

    // 生成 301 规则（主 slug 根路径）
    const fromUrl = dupMeta.urlPath || `/tools/${dupSlug}`;
    const line301 = `${fromUrl}   ${keepUrl}   301`;
    newRedirectLines.push(line301);
    console.log(`  301: ${fromUrl} → ${keepUrl}`);

    // 也要 301 尾斜线版本
    newRedirectLines.push(`${fromUrl}/   ${keepUrl}   301`);

    // variant 也要 301
    for (const v of dupMeta.variants || []) {
      const vs = v.variantSlug;
      const vFrom = `${fromUrl}/${vs}`;
      const vTo = keepUrl;
      newRedirectLines.push(`${vFrom}   ${vTo}   301`);
      console.log(`  301: ${vFrom} → ${vTo}`);
    }
  }
}

// ── Step 2: 处理泛型 variant slug
console.log("\n=== Step 2: 处理泛型无意义 variant slug ===\n");

const allSlugs = readdirSync(REGISTRY).filter(
  (f) => !f.startsWith("_") && statSync(join(REGISTRY, f)).isDirectory()
);

let genericCount = 0;
for (const slug of allSlugs) {
  const meta = loadMeta(slug);
  if (!meta || !Array.isArray(meta.variants) || meta.variants.length === 0) continue;

  let changed = false;
  for (const v of meta.variants) {
    const vs = v.variantSlug || "";
    const isGenericSuffix = GENERIC_VARIANT_SUFFIXES.some((s) => vs.endsWith(s));
    const isGenericExact = GENERIC_VARIANT_EXACT.includes(vs);
    if ((isGenericSuffix || isGenericExact) && !v.noindex) {
      v.noindex = true;
      changed = true;
      genericCount++;
      console.log(`  noindex variant: ${slug} → ${vs}`);
    }
  }
  if (changed) saveMeta(slug, meta);
}
console.log(`\n  Total generic variants marked noindex: ${genericCount}`);

// ── Step 3: 写入 _redirects
console.log("\n=== Step 3: 更新 _redirects ===\n");

if (newRedirectLines.length > 0) {
  let existing = "";
  try {
    existing = readFileSync(REDIRECTS_PATH, "utf8");
  } catch {
    existing = "";
  }

  // 避免重复写入
  const toAdd = newRedirectLines.filter((line) => !existing.includes(line.split("   ")[0].trim()));

  if (toAdd.length > 0) {
    const block = "\n# ── duplicate-tool 301 redirects (auto-generated) ──\n" + toAdd.join("\n") + "\n";
    if (!DRY_RUN) writeFileSync(REDIRECTS_PATH, existing + block, "utf8");
    console.log(`  ${DRY_RUN ? "[dry]" : "✅"} appended ${toAdd.length} redirect rules to _redirects`);
    toAdd.forEach((l) => console.log(`    ${l}`));
  } else {
    console.log("  No new redirect rules needed.");
  }
} else {
  console.log("  No redirect rules generated.");
}

console.log("\n✅ Done." + (DRY_RUN ? " (dry-run, no files changed)" : ""));
