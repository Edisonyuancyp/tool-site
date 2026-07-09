import "server-only";

/**
 * Tool Registry Loader
 *
 * Scans tools-registry/<slug>/meta.json to build the list of registered tools.
 * Also handles variant slugs (e.g. bmi-calculator-metric → bmi-calculator + variant:"metric").
 *
 * Adding a new tool:
 *   1. mkdir tools-registry/your-slug
 *   2. Add meta.json  (copy _template/meta.json)
 *   3. Add view.tsx   (copy _template/view.tsx)
 *   Done — it appears on the homepage automatically.
 *
 * Adding a variant (SEO matrix):
 *   In meta.json, add to "variants":
 *   { "variantSlug": "bmi-calculator-metric", "metaTitle": "...", "metaDescription": "...", "defaultVariant": "metric" }
 */

import fs from "fs";
import path from "path";
import type { ToolMeta } from "./tools";

export interface ToolVariant {
  variantSlug: string;
  metaTitle: string;
  metaDescription: string;
  keywords?: string[];
  defaultVariant: string;
  /** Short intro shown at top of variant page (replaces generic description) */
  headline?: string;
  /** If true, this variant page will be marked noindex in meta */
  noindex?: boolean;
}

export interface RegistryMeta extends ToolMeta {
  variants: ToolVariant[];
  /** If true, this tool page will be marked noindex in meta */
  noindex?: boolean;
}

const REGISTRY_DIR = path.join(process.cwd(), "tools-registry");

function loadRegistryMetas(): RegistryMeta[] {
  if (!fs.existsSync(REGISTRY_DIR)) return [];

  const entries = fs.readdirSync(REGISTRY_DIR, { withFileTypes: true });
  const metas: RegistryMeta[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith("_")) continue;

    const metaPath = path.join(REGISTRY_DIR, entry.name, "meta.json");
    if (!fs.existsSync(metaPath)) continue;

    try {
      const raw = fs.readFileSync(metaPath, "utf-8");
      const meta = JSON.parse(raw) as RegistryMeta;
      if (!meta.variants) meta.variants = [];
      metas.push(meta);
    } catch {
      console.warn(`[registry] Failed to parse ${metaPath}`);
    }
  }

  return metas;
}

// All base tools from registry (no variants expanded)
export function getRegistryTools(): RegistryMeta[] {
  return loadRegistryMetas();
}

// All slugs including variant slugs — used in generateStaticParams
export function getRegistrySlugs(): string[] {
  const slugs: string[] = [];
  for (const meta of loadRegistryMetas()) {
    slugs.push(meta.slug);
    for (const v of meta.variants) {
      slugs.push(v.variantSlug);
    }
  }
  return slugs;
}

// Resolve a slug to { baseMeta, variant, baseSlug } — handles both base and variant slugs
export function resolveRegistrySlug(slug: string): {
  meta: RegistryMeta;
  variant?: string;
  baseSlug: string;
  headline?: string;
} | null {
  for (const meta of loadRegistryMetas()) {
    if (meta.slug === slug) return { meta, baseSlug: meta.slug };
    for (const v of meta.variants) {
      if (v.variantSlug === slug) {
        const merged: RegistryMeta = {
          ...meta,
          slug: v.variantSlug,
          metaTitle: v.metaTitle,
          metaDescription: v.metaDescription,
          keywords: v.keywords ?? meta.keywords,
          // Override description with variant headline if provided
          description: v.headline ?? meta.description,
          noindex: v.noindex ?? meta.noindex,
        };
        return {
          meta: merged,
          variant: v.defaultVariant,
          baseSlug: meta.slug,
          headline: v.headline,
        };
      }
    }
  }
  return null;
}

// Convert registry metas to ToolMeta[] for homepage listing
export function registryToToolMetas(): ToolMeta[] {
  return loadRegistryMetas().map(({ variants: _v, ...rest }) => rest);
}
