/**
 * AI-powered meta translation script
 * Translates meta.json → meta.[locale].json using OpenAI API
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-ant-xxx node scripts/ai-translate.mjs --locale zh --slugs bmi-calculator,loan-calculator
 *   ANTHROPIC_API_KEY=sk-ant-xxx node scripts/ai-translate.mjs --locale ja --all
 *   ANTHROPIC_API_KEY=sk-ant-xxx node scripts/ai-translate.mjs --locale de --all --overwrite
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

// Auto-load .env.local (same directory as project root)
const envPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const REGISTRY = path.join(ROOT, "tools-registry");

// ── Multi-provider LLM config ──────────────────────────────────────────────
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

const availableProviders = getAvailableProviders();
if (availableProviders.length === 0 && !dryRun) {
  console.error("❌ Set at least one LLM key: OPENAI_API_KEY, CLAUDE_API_KEY, or GEMINI_API_KEY in .env.local");
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

// ── Multi-provider LLM call ─────────────────────────────────────────────────
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

  const systemPrompt = "You are a professional translator and SEO copywriter. Return ONLY valid JSON with the exact same structure as the input. No markdown, no explanation.";
  const providers = availableProviders.length ? availableProviders : getAvailableProviders();

  let lastError = null;
  for (const provider of providers) {
    const key = getProviderKey(provider);
    if (!key) continue;

    try {
      let content;
      if (provider === "claude") {
        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": key,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-3-5-haiku-20241022",
            max_tokens: 4096,
            system: systemPrompt,
            messages: [{ role: "user", content: prompt }],
          }),
        });
        if (!response.ok) throw new Error(`Claude API ${response.status}: ${await response.text()}`);
        content = (await response.json()).content?.[0]?.text;
      } else if (provider === "openai") {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${key}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: prompt },
            ],
            max_tokens: 4096,
            temperature: 0.3,
          }),
        });
        if (!response.ok) throw new Error(`OpenAI API ${response.status}: ${await response.text()}`);
        content = (await response.json()).choices?.[0]?.message?.content;
      } else if (provider === "gemini") {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 4096, temperature: 0.3 },
          }),
        });
        if (!response.ok) throw new Error(`Gemini API ${response.status}: ${await response.text()}`);
        const parts = (await response.json()).candidates?.[0]?.content?.parts;
        content = parts?.map(p => p.text).join("");
      } else {
        continue;
      }

      if (!content) throw new Error(`Empty response from ${provider}`);
      console.log(`  [translated via ${provider}] ${slug}`);
      return extractTranslatedJSON(content);
    } catch (err) {
      console.log(`  ⚠️ ${provider} failed: ${err.message}`);
      lastError = err;
    }
  }

  throw new Error(`All LLM providers failed. Last error: ${lastError?.message}`);
}

function extractTranslatedJSON(content) {
  // Extract the outermost JSON object, stripping any markdown fences or prose
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in response");
  let cleaned = content.slice(start, end + 1);

  // Fix common LLM JSON issues: unescaped control chars inside strings
  // Replace literal newlines inside JSON string values with \n
  cleaned = cleaned.replace(/("(?:[^"\\]|\\.)*")/g, (match) => {
    return match.replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
  });

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    throw new Error(`JSON_PARSE_FAILED: ${e.message}`);
  }
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
    let translated;
    let faqFallback = false;

    try {
      translated = await translateWithAI(slug, meta);
    } catch (e) {
      if (e.message.startsWith("JSON_PARSE_FAILED")) {
        // Retry without faqs to avoid complex JSON escaping issues
        process.stdout.write(`(retrying without faqs) `);
        const metaNoFaq = { ...meta, faqs: [] };
        translated = await translateWithAI(slug, metaNoFaq);
        faqFallback = true;
      } else {
        throw e;
      }
    }

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
      faqs: faqFallback ? meta.faqs : (translated.faqs ?? meta.faqs),
      relatedTools: meta.relatedTools ?? [],
      variants: [],  // no variant pages for non-EN/ES/FR locales
    };

    fs.writeFileSync(outPath, JSON.stringify(output, null, 2), "utf8");
    console.log(faqFallback ? `✓ (faqs kept in English)` : `✓`);
    success++;

    // Rough cost estimate: claude-haiku-4-5 input ~$0.80/1M tokens, output ~$4/1M tokens
    // Average tool meta ≈ 800 tokens in, 600 out → ~$0.0009 per tool
    cost += 0.0009;

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
