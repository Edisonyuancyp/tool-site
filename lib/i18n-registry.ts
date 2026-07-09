import "server-only";
import fs from "fs";
import path from "path";
import type { ToolMeta } from "./tools";
import type { RegistryMeta, ToolVariant } from "./registry";

export type SupportedLocale = "es" | "fr" | "zh" | "ja" | "de" | "pt";
export const SUPPORTED_LOCALES: SupportedLocale[] = ["es", "fr", "zh", "ja", "de", "pt"];
export const LOCALE_LABELS: Record<SupportedLocale, string> = {
  es: "Español",
  fr: "Français",
  zh: "中文",
  ja: "日本語",
  de: "Deutsch",
  pt: "Português",
};
export const LOCALE_FLAGS: Record<SupportedLocale, string> = {
  es: "🇪🇸",
  fr: "🇫🇷",
  zh: "🇨🇳",
  ja: "🇯🇵",
  de: "🇩🇪",
  pt: "🇧🇷",
};

const REGISTRY_DIR = path.join(process.cwd(), "tools-registry");

function loadLocalizedMeta(
  slug: string,
  locale: SupportedLocale
): { meta: RegistryMeta; isTranslated: boolean } | null {
  const localePath = path.join(REGISTRY_DIR, slug, `meta.${locale}.json`);
  const fallbackPath = path.join(REGISTRY_DIR, slug, "meta.json");
  const isTranslated = fs.existsSync(localePath);
  const filePath = isTranslated ? localePath : fallbackPath;
  if (!fs.existsSync(filePath)) return null;

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const meta = JSON.parse(raw) as RegistryMeta;
    if (!meta.variants) meta.variants = [];
    // Always use the base English slug for routing
    meta.slug = slug;
    return { meta, isTranslated };
  } catch {
    return null;
  }
}

export function getI18nRegistrySlugs(locale: SupportedLocale): string[] {
  if (!fs.existsSync(REGISTRY_DIR)) return [];
  const slugs: string[] = [];

  for (const entry of fs.readdirSync(REGISTRY_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith("_")) continue;
    const result = loadLocalizedMeta(entry.name, locale);
    if (!result) continue;
    const { meta } = result;
    slugs.push(meta.slug);
    for (const v of meta.variants) {
      slugs.push(v.variantSlug);
    }
  }
  return slugs;
}

export function resolveI18nSlug(
  slug: string,
  locale: SupportedLocale
): { meta: RegistryMeta; variant?: string; baseSlug: string; isTranslated: boolean } | null {
  if (!fs.existsSync(REGISTRY_DIR)) return null;

  for (const entry of fs.readdirSync(REGISTRY_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith("_")) continue;

    const result = loadLocalizedMeta(entry.name, locale);
    if (!result) continue;
    const { meta, isTranslated } = result;

    // Base slug match
    if (meta.slug === slug) {
      return { meta, baseSlug: meta.slug, isTranslated };
    }

    // Variant slug match
    for (const v of meta.variants) {
      if (v.variantSlug === slug) {
        const merged: RegistryMeta = {
          ...meta,
          slug: v.variantSlug,
          metaTitle: v.metaTitle,
          metaDescription: v.metaDescription,
          keywords: v.keywords ?? meta.keywords,
          description: v.headline ?? meta.description,
          noindex: v.noindex ?? meta.noindex,
        };
        return { meta: merged, variant: v.defaultVariant, baseSlug: meta.slug, isTranslated };
      }
    }
  }
  return null;
}

export function getI18nToolMetas(locale: SupportedLocale): ToolMeta[] {
  if (!fs.existsSync(REGISTRY_DIR)) return [];
  const metas: ToolMeta[] = [];

  for (const entry of fs.readdirSync(REGISTRY_DIR, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith("_")) continue;
    const result = loadLocalizedMeta(entry.name, locale);
    if (!result) continue;
    const { variants: _v, ...rest } = result.meta;
    metas.push(rest);
  }
  return metas;
}
