/**
 * Translate all tools-registry meta.json files into es / fr variants.
 * Usage:  node scripts/translate-metas.mjs [--locale es] [--slug loan-calculator]
 *
 * Requires OPENAI_API_KEY in .env.local (loaded automatically).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

// Load .env.local
const envPath = path.join(ROOT, ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const [k, ...v] = line.split("=");
    if (k && v.length) process.env[k.trim()] = v.join("=").trim();
  }
}

const REGISTRY_DIR = path.join(ROOT, "tools-registry");
const LOCALES = ["es", "fr"];
const LOCALE_NAMES = { es: "Spanish", fr: "French" };

const args = process.argv.slice(2);
const onlyLocale = args.includes("--locale") ? args[args.indexOf("--locale") + 1] : null;
const onlySlug   = args.includes("--slug")   ? args[args.indexOf("--slug")   + 1] : null;
const locales    = onlyLocale ? [onlyLocale] : LOCALES;

async function callOpenAI(prompt) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) throw new Error(`OpenAI error ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return JSON.parse(json.choices[0].message.content);
}

async function translateMeta(meta, locale) {
  const lang = LOCALE_NAMES[locale];
  const prompt = `
You are an expert SEO translator. Translate the following calculator tool metadata into ${lang}.
Rules:
- Keep "slug", "icon", "category", "relatedTools" fields UNCHANGED (in English).
- Translate "name", "tagline", "description", "metaTitle", "metaDescription" naturally for ${lang} speakers searching on Google.
- Translate each FAQ "question" and "answer" into fluent ${lang}.
- Translate each variant "metaTitle", "metaDescription", "headline" into ${lang}.
- "keywords" should be the most-searched ${lang} equivalents (not literal translations).
- The translated content should sound natural to native ${lang} speakers, not like machine translation.
- Do NOT include "slug" changes for variants — keep all slugs as-is.
- Return valid JSON with the exact same structure as the input.

Input JSON:
${JSON.stringify(meta, null, 2)}
`;
  return callOpenAI(prompt);
}

async function main() {
  const dirs = fs.readdirSync(REGISTRY_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith("_"))
    .map(d => d.name);

  const slugs = onlySlug ? [onlySlug] : dirs;
  let done = 0, skipped = 0, failed = 0;

  for (const slug of slugs) {
    const metaPath = path.join(REGISTRY_DIR, slug, "meta.json");
    if (!fs.existsSync(metaPath)) { console.log(`  skip ${slug} — no meta.json`); skipped++; continue; }

    let meta;
    try { meta = JSON.parse(fs.readFileSync(metaPath, "utf-8")); }
    catch { console.error(`  ✗ ${slug} parse error`); failed++; continue; }

    for (const locale of locales) {
      const outPath = path.join(REGISTRY_DIR, slug, `meta.${locale}.json`);
      if (fs.existsSync(outPath)) {
        console.log(`  skip ${slug}/${locale} — already exists`);
        skipped++;
        continue;
      }

      process.stdout.write(`  translating ${slug} → ${locale} ... `);
      try {
        const translated = await translateMeta(meta, locale);
        // Ensure slug is preserved exactly
        translated.slug = meta.slug;
        fs.writeFileSync(outPath, JSON.stringify(translated, null, 2));
        console.log("✓");
        done++;
        // Small delay to avoid rate limits
        await new Promise(r => setTimeout(r, 300));
      } catch (e) {
        console.error(`✗ ${e.message}`);
        failed++;
      }
    }
  }

  console.log(`\nDone: ${done} translated, ${skipped} skipped, ${failed} failed.`);
}

main().catch(console.error);
