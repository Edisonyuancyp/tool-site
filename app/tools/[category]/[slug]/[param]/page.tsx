import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CATEGORY_URL_PREFIX } from "@/lib/tools";
import { getRegistryTools } from "@/lib/registry";
import ToolLayout from "@/components/ToolLayout";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { mergeWithRegistry } from "@/lib/tools";
import { registryToToolMetas } from "@/lib/registry";

interface ProgrammaticPage {
  param: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  description: string;
}

interface Props {
  params: Promise<{ category: string; slug: string; param: string }>;
}

/** All valid [category] segments */
const VALID_CATEGORIES = new Set(Object.values(CATEGORY_URL_PREFIX));

function findPage(slug: string, param: string): { page: ProgrammaticPage; baseMeta: import("@/lib/registry").RegistryMeta } | null {
  for (const meta of getRegistryTools()) {
    if (meta.slug !== slug) continue;
    const pages: ProgrammaticPage[] = (meta as any).programmaticPages ?? [];
    const page = pages.find((p) => p.param === param);
    if (page) return { page, baseMeta: meta };
  }
  return null;
}

export async function generateStaticParams() {
  const params: { category: string; slug: string; param: string }[] = [];
  for (const meta of getRegistryTools()) {
    const prefix = CATEGORY_URL_PREFIX[meta.category];
    if (!prefix) continue;
    const pages: ProgrammaticPage[] = (meta as any).programmaticPages ?? [];
    for (const page of pages) {
      params.push({ category: prefix, slug: meta.slug, param: page.param });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug, param } = await params;
  if (!VALID_CATEGORIES.has(category)) return {};

  const result = findPage(slug, param);
  if (!result) return {};

  const { page } = result;
  const canonicalPath = `/tools/${category}/${slug}/${param}`;
  const toolUrl = `https://getfastcalc.com${canonicalPath}`;

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    alternates: {
      canonical: toolUrl,
      languages: {
        "en":        toolUrl,
        "x-default": toolUrl,
      },
    },
    openGraph: {
      title: page.metaTitle,
      description: page.metaDescription,
      url: toolUrl,
      type: "website",
      siteName: "GetFastCalc",
    },
    twitter: {
      card: "summary_large_image",
      title: page.metaTitle,
      description: page.metaDescription,
    },
  };
}

export default async function ProgrammaticPage({ params }: Props) {
  const { category, slug, param } = await params;

  if (!VALID_CATEGORIES.has(category)) notFound();

  const result = findPage(slug, param);
  if (!result) notFound();

  const { page, baseMeta } = result;

  // Build a synthetic ToolMeta for the layout (uses base tool's metadata + page overrides)
  const syntheticMeta = {
    ...baseMeta,
    slug: `${slug}/${param}`,
    metaTitle: page.metaTitle,
    metaDescription: page.metaDescription,
    description: page.description,
    name: page.h1,
  };

  let mod: { default: React.ComponentType<{ variant?: string }> };
  try {
    mod = await import(`@/tools-registry/${slug}/view`);
  } catch {
    notFound();
  }
  const ToolView = mod!.default;

  const allTools = mergeWithRegistry(registryToToolMetas());

  return (
    <>
      <Header allTools={allTools} />
      <ToolLayout tool={syntheticMeta as any} allTools={allTools}>
        {/* Programmatic page intro above the tool */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <h1 className="text-xl font-bold text-gray-900 mb-1">{page.h1}</h1>
          <p className="text-sm text-gray-600">{page.description}</p>
        </div>
        <ToolView />
      </ToolLayout>
      <Footer />
    </>
  );
}
