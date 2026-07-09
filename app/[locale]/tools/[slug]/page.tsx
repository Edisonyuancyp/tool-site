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
import { getToolPath } from "@/lib/tools";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

// Only pre-render es/fr — zh/ja/de/pt have no translated tool pages
const STATIC_LOCALES: SupportedLocale[] = ["es", "fr", "zh", "ja", "de", "pt"];

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of STATIC_LOCALES) {
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

  const { meta, isTranslated } = result;
  const enPath = getToolPath(meta);
  const enUrl = `https://getfastcalc.com${enPath}`;
  const selfUrl = `https://getfastcalc.com/${locale}/tools/${slug}`;
  const shouldNoindex = !isTranslated || meta.noindex === true;

  return {
    title: meta.metaTitle,
    description: meta.metaDescription,
    keywords: meta.keywords,
    ...(shouldNoindex ? { robots: { index: false, follow: false } } : {}),
    alternates: {
      canonical: enUrl,
      languages: {
        en:  enUrl,
        es:  `https://getfastcalc.com/es/tools/${slug}`,
        fr:  `https://getfastcalc.com/fr/tools/${slug}`,
        zh:  `https://getfastcalc.com/zh/tools/${slug}`,
        ja:  `https://getfastcalc.com/ja/tools/${slug}`,
        de:  `https://getfastcalc.com/de/tools/${slug}`,
        pt:  `https://getfastcalc.com/pt/tools/${slug}`,
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
      <ToolLayout tool={meta} allTools={allTools} locale={locale}>
        <ToolView variant={variant} />
      </ToolLayout>
      <Footer />
    </>
  );
}
