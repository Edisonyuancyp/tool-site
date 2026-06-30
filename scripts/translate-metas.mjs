/**
 * Translate all tools-registry meta.json files into es / fr variants.
 * Usage:  node scripts/translate-metas.mjs [--locale es] [--slug loan-calculator]
 *
 * Supports multi-provider LLM fallback: OPENAI_API_KEY, CLAUDE_API_KEY, GEMINI_API_KEY
 * (loaded automatically from .env.local).
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

const LLM_PROVIDER_PRIORITY = (process.env.LLM_PROVIDER_PRIORITY || "claude,openai,gemini")
  .split(",")
  .map(p => p.trim().toLowerCase())
  .filter(p => ["claude", "openai", "gemini"].includes(p));

function getProviderKey(provider) {
  if (provider === "openai") return process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_BACKUP;
  if (provider === "claude") return process.env.CLAUDE_API_KEY || process.env.CLAUDE_API_KEY_BACKUP || process.env.ANTHROPIC_API_KEY;
  if (provider === "gemini") return process.env.GEMINI_API_KEY;
  return undefined;
}

function getAvailableProviders() {
  return LLM_PROVIDER_PRIORITY.filter(p => !!getProviderKey(p));
}

const args = process.argv.slice(2);
const onlyLocale = args.includes("--locale") ? args[args.indexOf("--locale") + 1] : null;
const onlySlug   = args.includes("--slug")   ? args[args.indexOf("--slug")   + 1] : null;
const locales    = onlyLocale ? [onlyLocale] : LOCALES;

async function callLLM(prompt) {
  const providers = getAvailableProviders();
  if (!providers.length) throw new Error("No LLM API keys found. Set OPENAI_API_KEY, CLAUDE_API_KEY, or GEMINI_API_KEY.");
  const system = "You are an expert SEO translator. Return valid JSON only, no markdown, no explanation.";
  let lastError = null;

  for (const provider of providers) {
    const key = getProviderKey(provider);
    if (!key) continue;
    try {
      let content;
      if (provider === "openai") {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            temperature: 0.3,
            messages: [{ role: "system", content: system }, { role: "user", content: prompt }],
            response_format: { type: "json_object" },
          }),
        });
        if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
        content = (await res.json()).choices?.[0]?.message?.content;
      } else if (provider === "claude") {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
          body: JSON.stringify({
            model: "claude-3-5-haiku-20241022",
            max_tokens: 4096,
            system,
            messages: [{ role: "user", content: prompt }],
          }),
        });
        if (!res.ok) throw new Error(`Claude ${res.status}: ${await res.text()}`);
        content = (await res.json()).content?.[0]?.text;
      } else if (provider === "gemini") {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 4096, temperature: 0.3 },
          }),
        });
        if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
        content = (await res.json()).candidates?.[0]?.content?.parts?.map(p => p.text).join("");
      }
      if (!content) throw new Error(`Empty response from ${provider}`);
      return JSON.parse(content);
    } catch (e) {
      console.log(`  ⚠️ ${provider} failed: ${e.message}`);
      lastError = e;
    }
  }
  throw new Error(`All LLM providers failed. Last error: ${lastError?.message}`);
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
  return callLLM(prompt);
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
