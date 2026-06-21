import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ToolLayout from "@/components/ToolLayout";
import {
  SUPPORTED_LOCALES,
  type SupportedLocale,
  getI18nRegistrySlugs,
  resolveI18nSlug,
  getI18nToolMetas,
} from "@/lib/i18n-registry";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of SUPPORTED_LOCALES) {
    for (const slug of getI18nRegistrySlugs(locale)) {
      params.push({ locale, slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!SUPPORTED_LOCALES.includes(locale as SupportedLocale)) return {};

  const result = resolveI18nSlug(slug, locale as SupportedLocale);
  if (!result) return {};

  const { meta } = result;
  const enUrl  = `https://getfastcalc.com/tools/${slug}`;
  const esUrl  = `https://getfastcalc.com/es/tools/${slug}`;
  const frUrl  = `https://getfastcalc.com/fr/tools/${slug}`;
  const selfUrl = `https://getfastcalc.com/${locale}/tools/${slug}`;

  return {
    title: meta.metaTitle,
    description: meta.metaDescription,
    keywords: meta.keywords,
    alternates: {
      canonical: selfUrl,
      languages: {
        "en":    enUrl,
        "es":    esUrl,
        "fr":    frUrl,
        "x-default": enUrl,
      },
    },
    openGraph: {
      title: meta.metaTitle,
      description: meta.metaDescription,
      url: selfUrl,
      type: "website",
      siteName: "GetFastCalc",
    },
    twitter: {
      card: "summary_large_image",
      title: meta.metaTitle,
      description: meta.metaDescription,
    },
  };
}

export default async function LocalizedToolPage({ params }: Props) {
  const { locale, slug } = await params;

  if (!SUPPORTED_LOCALES.includes(locale as SupportedLocale)) notFound();

  const result = resolveI18nSlug(slug, locale as SupportedLocale);
  if (!result) notFound();

  const { meta, variant, baseSlug } = result;
  const allTools = getI18nToolMetas(locale as SupportedLocale);

  let mod: { default: React.ComponentType<{ variant?: string }> };
  try {
    mod = await import(`@/tools-registry/${baseSlug}/view`);
  } catch {
    notFound();
  }

  const ToolView = mod!.default;

  return (
    <>
      <Header />
      <ToolLayout tool={meta} allTools={allTools}>
        <ToolView variant={variant} />
      </ToolLayout>
      <Footer />
    </>
  );
}
