/**
 * enrich-keywords.mjs
 * Fetches Google Autocomplete suggestions for each tool and merges
 * new keywords into tools-registry/[slug]/meta.json
 *
 * Usage:  node scripts/enrich-keywords.mjs
 *         node scripts/enrich-keywords.mjs --slug bmi-calculator   (single tool)
 *         node scripts/enrich-keywords.mjs --dry-run               (preview only)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REGISTRY = path.join(__dirname, "../tools-registry");

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const SINGLE = args.includes("--slug") ? args[args.indexOf("--slug") + 1] : null;
const DELAY_MS = 300; // polite delay between requests

// ── Google Suggest fetch ──────────────────────────────────────────────────────
async function fetchSuggestions(query) {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; keyword-enricher/1.0)" },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const json = await res.json();
    // Firefox client returns [query, [suggestions]]
    return Array.isArray(json[1]) ? json[1].slice(0, 8) : [];
  } catch {
    return [];
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Keyword cleaning ──────────────────────────────────────────────────────────
function clean(kw) {
  return kw.toLowerCase().trim().replace(/\s+/g, " ");
}

function isJunk(kw) {
  // Filter out non-English, very short, or overly generic terms
  return (
    kw.length < 5 ||
    /[^\x00-\x7F]/.test(kw) ||               // non-ASCII
    /^\d+$/.test(kw) ||                        // only digits
    ["calculator", "online", "free"].includes(kw)
  );
}

// ── Build query seeds from tool meta ─────────────────────────────────────────
function buildSeeds(meta) {
  const seeds = new Set();
  const name = meta.name.toLowerCase();
  seeds.add(name);
  seeds.add(`${name} online`);
  seeds.add(`free ${name}`);
  seeds.add(`how to use ${name}`);
  // Add existing keyword seeds
  for (const kw of (meta.keywords ?? []).slice(0, 3)) {
    seeds.add(kw);
  }
  return [...seeds];
}

// ── Process one tool ──────────────────────────────────────────────────────────
async function enrichTool(slug) {
  const metaPath = path.join(REGISTRY, slug, "meta.json");
  if (!fs.existsSync(metaPath)) {
    console.log(`  ⚠️  no meta.json for ${slug}`);
    return;
  }

  const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
  const existing = new Set((meta.keywords ?? []).map(clean));
  const collected = new Set();

  const seeds = buildSeeds(meta);
  for (const seed of seeds) {
    const suggestions = await fetchSuggestions(seed);
    for (const s of suggestions) {
      const c = clean(s);
      if (!existing.has(c) && !isJunk(c)) collected.add(c);
    }
    await sleep(DELAY_MS);
  }

  if (collected.size === 0) {
    console.log(`  ✓  ${slug} — no new keywords found`);
    return;
  }

  // Merge: existing first, then new (deduped), cap at 20
  const merged = [...existing, ...collected];
  const unique = [...new Set(merged)].slice(0, 20);

  console.log(`  ✓  ${slug} — added ${collected.size} keyword(s):`);
  for (const kw of collected) console.log(`       + "${kw}"`);

  if (!DRY_RUN) {
    meta.keywords = unique;
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n", "utf8");
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  if (DRY_RUN) console.log("🔍 DRY RUN — no files will be modified\n");

  let slugs;
  if (SINGLE) {
    slugs = [SINGLE];
  } else {
    slugs = fs
      .readdirSync(REGISTRY)
      .filter((d) => {
        if (d === "_template") return false;
        return fs.existsSync(path.join(REGISTRY, d, "meta.json"));
      });
  }

  console.log(`\n🚀 Enriching keywords for ${slugs.length} tool(s)...\n`);

  for (const slug of slugs) {
    process.stdout.write(`${slug}...\n`);
    await enrichTool(slug);
    await sleep(DELAY_MS);
  }

  console.log("\n✅ Done!");
  if (DRY_RUN) console.log("   Run without --dry-run to write changes.");
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
