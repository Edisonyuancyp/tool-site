import { MetadataRoute } from "next";
import { mergeWithRegistry } from "@/lib/tools";
import { registryToToolMetas, getRegistryTools } from "@/lib/registry";

export const dynamic = "force-static";

const BASE = "https://getfastcalc.com";

const HIGH_PRIORITY = new Set([
  "bmi-calculator", "age-calculator", "qr-code-generator", "password-generator",
  "compound-interest-calculator", "currency-converter", "percentage-calculator",
  "unix-timestamp-converter", "base64-tool", "word-counter", "base-converter",
  "json-csv-formatter", "diff-checker", "sleep-calculator", "bmr-tdee-calculator",
  "tax-calculator", "retirement-savings-calculator", "investment-return-calculator",
  "debt-repayment-calculator", "budget-calculator", "loan-calculator",
  "tip-calculator", "gpa-calculator", "body-fat-calculator", "ideal-weight-calculator",
  "water-intake-calculator", "running-pace-calculator",
]);

/** Mirrors generate_tool.py CATEGORY_URL_PREFIX */
const CATEGORY_URL_PREFIX: Record<string, string> = {
  Finance:       "calc",
  Math:          "calc",
  Health:        "calc",
  Crypto:        "calc",
  Design:        "design",
  Generators:    "design",
  Developer:     "dev",
  Text:          "dev",
  Security:      "dev",
  "Date & Time": "time",
};

function toolUrl(slug: string, category: string): string {
  const prefix = CATEGORY_URL_PREFIX[category];
  return prefix
    ? `${BASE}/tools/${prefix}/${slug}`
    : `${BASE}/tools/${slug}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const allTools = mergeWithRegistry(registryToToolMetas());

  // ── Category index pages (one per unique prefix, e.g. /tools/calc) ─────────
  const usedPrefixes = new Set<string>();
  for (const tool of allTools) {
    const prefix = CATEGORY_URL_PREFIX[tool.category];
    if (prefix) usedPrefixes.add(prefix);
  }
  const categoryIndexPages: MetadataRoute.Sitemap = [...usedPrefixes].map((prefix) => ({
    url: `${BASE}/tools/${prefix}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // ── Individual tool pages, grouped under category prefix ──────────────────
  const toolPages: MetadataRoute.Sitemap = allTools.map((tool) => ({
    url: toolUrl(tool.slug, tool.category),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: HIGH_PRIORITY.has(tool.slug) ? 0.9 : 0.8,
  }));

  // ── Variant pages (SEO matrix) — inherit the base tool's category ─────────
  const registryMetas = getRegistryTools();
  const baseSlugs = new Set(allTools.map((t) => t.slug));
  const variantPages: MetadataRoute.Sitemap = registryMetas.flatMap((meta) =>
    meta.variants
      .filter((v) => !baseSlugs.has(v.variantSlug))
      .map((v) => ({
        url: toolUrl(v.variantSlug, meta.category),
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.75,
      }))
  );

  return [
    { url: BASE, lastModified: now, changeFrequency: "weekly" as const, priority: 1.0 },
    ...categoryIndexPages,
    ...toolPages,
    ...variantPages,
  ];
}
