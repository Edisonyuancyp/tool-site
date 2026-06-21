import { MetadataRoute } from "next";
import { tools } from "@/lib/tools";

export const dynamic = "force-static";

const BASE = "https://toolcalc.com";

const HIGH_PRIORITY = new Set([
  "bmi-calculator", "age-calculator", "qr-code-generator", "password-generator",
  "compound-interest-calculator", "currency-converter", "percentage-calculator",
  "unix-timestamp-converter", "base64-tool", "word-counter", "base-converter",
  "json-csv-formatter", "diff-checker", "sleep-calculator", "bmr-tdee-calculator",
]);

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const categories = [...new Set(tools.map((t) => t.category))];

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE}/?category=${encodeURIComponent(cat)}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const toolPages: MetadataRoute.Sitemap = tools.map((tool) => ({
    url: `${BASE}/tools/${tool.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: HIGH_PRIORITY.has(tool.slug) ? 0.9 : 0.8,
  }));

  return [
    { url: BASE, lastModified: now, changeFrequency: "weekly" as const, priority: 1.0 },
    ...categoryPages,
    ...toolPages,
  ];
}
