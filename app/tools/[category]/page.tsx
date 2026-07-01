import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { mergeWithRegistry } from "@/lib/tools";
import { registryToToolMetas } from "@/lib/registry";
import categoryRules from "@/lib/category-rules.json";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryPage from "@/components/CategoryPage";

interface Props {
  params: Promise<{ category: string }>;
}

const VALID_CATEGORIES = new Set(Object.keys(categoryRules.prefixes));

const CATEGORY_TITLES: Record<string, { title: string; description: string }> = categoryRules.prefixes;

export async function generateStaticParams() {
  return Array.from(VALID_CATEGORIES).map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  if (!VALID_CATEGORIES.has(category)) return {};
  const meta = CATEGORY_TITLES[category];
  return {
    title: meta ? `${meta.title} | GetFastCalc` : "Tools | GetFastCalc",
    description: meta?.description,
    alternates: { canonical: `https://getfastcalc.com/tools/${category}` },
  };
}

export default async function CategoryRoute({ params }: Props) {
  const { category } = await params;
  if (!VALID_CATEGORIES.has(category)) notFound();

  const allTools = mergeWithRegistry(registryToToolMetas());

  return (
    <>
      <Header />
      <CategoryPage prefix={category} allTools={allTools} />
      <Footer />
    </>
  );
}
