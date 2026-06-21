import { MetadataRoute } from "next";
import { mergeWithRegistry } from "@/lib/tools";
import { registryToToolMetas, getRegistrySlugs } from "@/lib/registry";

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

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const allTools = mergeWithRegistry(registryToToolMetas());
  const categories = [...new Set(allTools.map((t) => t.category))];

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE}/?category=${encodeURIComponent(cat)}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const toolPages: MetadataRoute.Sitemap = allTools.map((tool) => ({
    url: `${BASE}/tools/${tool.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: HIGH_PRIORITY.has(tool.slug) ? 0.9 : 0.8,
  }));

  // Variant slugs from registry (SEO matrix pages)
  const variantSlugs = getRegistrySlugs().filter(
    (s) => !allTools.find((t) => t.slug === s)
  );
  const variantPages: MetadataRoute.Sitemap = variantSlugs.map((slug) => ({
    url: `${BASE}/tools/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [
    { url: BASE, lastModified: now, changeFrequency: "weekly" as const, priority: 1.0 },
    ...categoryPages,
    ...toolPages,
    ...variantPages,
  ];
}
