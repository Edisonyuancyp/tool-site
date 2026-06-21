import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { mergeWithRegistry, CATEGORY_URL_PREFIX } from "@/lib/tools";
import { registryToToolMetas } from "@/lib/registry";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryPage from "@/components/CategoryPage";

interface Props {
  params: Promise<{ category: string }>;
}

const VALID_CATEGORIES = new Set(Object.values(CATEGORY_URL_PREFIX));

const CATEGORY_TITLES: Record<string, { title: string; description: string }> = {
  calc:      { title: "Calculators",        description: "Finance, health, math, and crypto calculators — free, instant, no signup." },
  dev:       { title: "Developer Tools",    description: "Encoding, decoding, formatting, and security tools for developers." },
  design:    { title: "Design & Generators",description: "Color tools, QR codes, generators, and design utilities." },
  time:      { title: "Date & Time Tools",  description: "Timestamps, age calculators, holiday finders, and more." },
  converter: { title: "Unit Converters",    description: "Convert length, weight, temperature, and other units instantly." },
};

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
