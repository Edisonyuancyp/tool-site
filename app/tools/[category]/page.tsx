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
  calc:      { title: "Calculators",              description: "Finance, health, fitness, math, and crypto calculators — free, instant, no signup." },
  ai:        { title: "AI Tools",                 description: "Prompt token counters, AI cost calculators, model comparators, and prompt utilities — free, no signup." },
  seo:       { title: "SEO Tools",                description: "Title generators, meta description tools, schema generators, and keyword density checkers for SEO." },
  social:    { title: "Social Media Tools",         description: "Character counters and caption tools for Twitter, Instagram, TikTok, YouTube, LinkedIn, and Reddit." },
  image:     { title: "Image Tools",              description: "Image compressors, converters, aspect ratio calculators, and DPI checkers — all in your browser." },
  file:      { title: "File & Text Tools",        description: "JSON, XML, CSV, Markdown, HTML, and YAML formatters and validators for developers and writers." },
  dev:       { title: "Developer Tools",          description: "Encoding, decoding, formatting, security, content, and utility tools for developers." },
  design:    { title: "Design & Generators",      description: "Color tools, QR codes, generators, and design utilities." },
  time:      { title: "Date, Time & Travel Tools",description: "Timestamps, age calculators, travel tools, holiday finders, and more." },
  converter: { title: "Converters & Productivity",description: "Unit converters, cooking calculators, and productivity tools." },
  ecommerce: { title: "E-Commerce & FBA Tools",   description: "Amazon FBA, Shopify, profit margin, ROAS, and pricing calculators for online sellers." },
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
