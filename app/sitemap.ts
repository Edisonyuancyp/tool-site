import { MetadataRoute } from "next";
import { mergeWithRegistry, CATEGORY_URL_PREFIX, getToolPath } from "@/lib/tools";
import { registryToToolMetas, getRegistryTools } from "@/lib/registry";
import { SUPPORTED_LOCALES, getI18nRegistrySlugs } from "@/lib/i18n-registry";

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

function toolUrl(tool: { slug: string; category: string }): string {
  return `${BASE}${getToolPath(tool)}`;
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
    url: toolUrl(tool),
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
        url: toolUrl({ slug: v.variantSlug, category: meta.category }),
        lastModified: now,
        changeFrequency: "monthly" as const,
        priority: 0.75,
      }))
  );

  // ── i18n homepages (/es, /fr) ────────────────────────────────────────────
  const i18nHomePages: MetadataRoute.Sitemap = SUPPORTED_LOCALES.map((locale) => ({
    url: `${BASE}/${locale}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // ── i18n tool pages (/es/tools/slug, /fr/tools/slug) ─────────────────────
  const i18nToolPages: MetadataRoute.Sitemap = SUPPORTED_LOCALES.flatMap((locale) =>
    getI18nRegistrySlugs(locale).map((slug) => ({
      url: `${BASE}/${locale}/tools/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: HIGH_PRIORITY.has(slug) ? 0.8 : 0.7,
    }))
  );

  const blogPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.85 },
    { url: `${BASE}/blog/free-tradingview-alternative-crypto-chart-analyzer`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${BASE}/blog/workbench-board-personal-calculator-dashboard`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.9 },
    { url: `${BASE}/blog/crypto-position-sizing-kelly-criterion`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.85 },
    { url: `${BASE}/blog/sharpe-ratio-calculator-guide`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.85 },
  ];

  return [
    { url: BASE, lastModified: now, changeFrequency: "weekly" as const, priority: 1.0 },
    { url: `${BASE}/workbench`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.85 },
    { url: `${BASE}/workbench/board`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${BASE}/workbench/guide`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 },
    ...blogPages,
    ...i18nHomePages,
    ...categoryIndexPages,
    ...toolPages,
    ...variantPages,
    ...i18nToolPages,
  ];
}
