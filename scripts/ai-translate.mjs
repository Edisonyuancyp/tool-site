/**
 * AI-powered meta translation script
 * Translates meta.json → meta.[locale].json using OpenAI API
 *
 * Usage:
 *   OPENAI_API_KEY=sk-xxx node scripts/ai-translate.mjs --locale zh --slugs bmi-calculator,loan-calculator
 *   OPENAI_API_KEY=sk-xxx node scripts/ai-translate.mjs --locale ja --all
 *   OPENAI_API_KEY=sk-xxx node scripts/ai-translate.mjs --locale de --all --overwrite
 *
 * Options:
 *   --locale    Target locale: zh | ja | de | pt | fr | es
 *   --slugs     Comma-separated list of tool slugs
 *   --all       Translate all tools that have meta.json
 *   --overwrite Overwrite existing translations
 *   --dry-run   Print what would be translated without calling API
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const REGISTRY = path.join(ROOT, "tools-registry");

// ── Locale config ─────────────────────────────────────────────────────────
const LOCALE_CONFIG = {
  zh: { name: "Simplified Chinese", nativeName: "简体中文", instruction: "Use natural Mainland Chinese (简体中文). Use professional terminology for financial/health tools." },
  ja: { name: "Japanese", nativeName: "日本語", instruction: "Use natural modern Japanese (日本語). Use katakana for technical terms where appropriate." },
  de: { name: "German", nativeName: "Deutsch", instruction: "Use natural German (Deutsch). Use formal 'Sie' for user-facing copy." },
  pt: { name: "Brazilian Portuguese", nativeName: "Português", instruction: "Use Brazilian Portuguese (Português do Brasil). Natural, friendly tone." },
  fr: { name: "French", nativeName: "Français", instruction: "Use French (Français). Natural, professional tone." },
  es: { name: "Spanish", nativeName: "Español", instruction: "Use Spanish (Español). Natural, professional tone suitable for all Spanish-speaking regions." },
};

// ── Fields to translate ───────────────────────────────────────────────────
// Only these fields are translated; slug/icon/category/relatedTools are kept as-is
const TRANSLATABLE_FIELDS = ["name", "tagline", "description", "metaTitle", "metaDescription", "keywords", "faqs"];

// ── Parse CLI args ────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const getArg = (flag) => {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
};
const hasFlag = (flag) => args.includes(flag);

const locale = getArg("--locale");
const slugsArg = getArg("--slugs");
const all = hasFlag("--all");
const overwrite = hasFlag("--overwrite");
const dryRun = hasFlag("--dry-run");

if (!locale || !LOCALE_CONFIG[locale]) {
  console.error(`❌ Invalid or missing --locale. Valid: ${Object.keys(LOCALE_CONFIG).join(", ")}`);
  process.exit(1);
}
if (!all && !slugsArg) {
  console.error("❌ Specify --all or --slugs bmi-calculator,loan-calculator");
  process.exit(1);
}

const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY && !dryRun) {
  console.error("❌ Set OPENAI_API_KEY environment variable");
  process.exit(1);
}

const config = LOCALE_CONFIG[locale];

// ── Collect slugs ─────────────────────────────────────────────────────────
let slugs;
if (all) {
  slugs = fs.readdirSync(REGISTRY).filter(d =>
    fs.existsSync(path.join(REGISTRY, d, "meta.json"))
  );
} else {
  slugs = slugsArg.split(",").map(s => s.trim());
}

if (!overwrite) {
  slugs = slugs.filter(slug => !fs.existsSync(path.join(REGISTRY, slug, `meta.${locale}.json`)));
}

console.log(`\n🌐 Translating ${slugs.length} tools → ${locale} (${config.nativeName})`);
if (dryRun) console.log("  [DRY RUN — no API calls]");
console.log(`  Tools: ${slugs.slice(0, 5).join(", ")}${slugs.length > 5 ? ` +${slugs.length - 5} more` : ""}\n`);

// ── OpenAI call ───────────────────────────────────────────────────────────
async function translateWithAI(slug, meta) {
  // Build a minimal object with only translatable fields
  const toTranslate = {};
  for (const field of TRANSLATABLE_FIELDS) {
    if (meta[field] !== undefined) toTranslate[field] = meta[field];
  }

  const prompt = `You are a professional translator and SEO copywriter.
Translate the following JSON fields for a web tool called "${meta.name}" from English to ${config.name} (${config.nativeName}).
${config.instruction}

Rules:
- Translate ALL string values naturally and idiomatically
- For "keywords": translate each keyword to its natural ${config.name} equivalent that people actually search for
- For "faqs": translate both "question" and "answer" fields
- Keep brand names, technical abbreviations (BMI, GPA, API, etc.) in their original form
- metaTitle and metaDescription must be SEO-optimised for ${config.name} search engines
- Return ONLY valid JSON with the exact same structure — no markdown, no explanation

Input JSON:
${JSON.stringify(toTranslate, null, 2)}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  return JSON.parse(content);
}

// ── Main loop ─────────────────────────────────────────────────────────────
let success = 0, failed = 0, cost = 0;

for (const slug of slugs) {
  const metaPath = path.join(REGISTRY, slug, "meta.json");
  if (!fs.existsSync(metaPath)) {
    console.log(`  ⚠ Skipped ${slug} — no meta.json`);
    continue;
  }

  const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
  const outPath = path.join(REGISTRY, slug, `meta.${locale}.json`);

  if (dryRun) {
    console.log(`  📋 [DRY RUN] Would translate: ${slug}/meta.${locale}.json`);
    success++;
    continue;
  }

  process.stdout.write(`  Translating ${slug}... `);

  try {
    const translated = await translateWithAI(slug, meta);

    // Merge translated fields into full output (preserve slug, icon, category, etc.)
    const output = {
      slug: meta.slug,
      name: translated.name ?? meta.name,
      tagline: translated.tagline ?? meta.tagline,
      description: translated.description ?? meta.description,
      metaTitle: translated.metaTitle ?? meta.metaTitle,
      metaDescription: translated.metaDescription ?? meta.metaDescription,
      keywords: translated.keywords ?? meta.keywords,
      category: meta.category,
      icon: meta.icon,
      faqs: translated.faqs ?? meta.faqs,
      relatedTools: meta.relatedTools ?? [],
      variants: [],  // no variant pages for non-EN/ES/FR locales
    };

    fs.writeFileSync(outPath, JSON.stringify(output, null, 2), "utf8");
    console.log(`✓`);
    success++;

    // Rough cost estimate: gpt-4o-mini input ~$0.15/1M tokens, output ~$0.60/1M tokens
    // Average tool meta ≈ 800 tokens in, 600 out → ~$0.00048 per tool
    cost += 0.0005;

    // Rate limit: 3 RPM on free tier, 500 RPM on paid — add small delay
    await new Promise(r => setTimeout(r, 300));

  } catch (err) {
    console.log(`✗ ERROR: ${err.message}`);
    failed++;
  }
}

console.log(`
Done: ${success} translated, ${failed} failed
Estimated cost: $${cost.toFixed(4)} (gpt-4o-mini)
`);
