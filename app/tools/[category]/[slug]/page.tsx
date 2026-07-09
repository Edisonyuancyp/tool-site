import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { tools, getToolBySlug, mergeWithRegistry, CATEGORY_URL_PREFIX, getToolPath, getCategoryListPath } from "@/lib/tools";
import { getRegistryTools, resolveRegistrySlug, registryToToolMetas } from "@/lib/registry";
import ToolLayout from "@/components/ToolLayout";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BmiCalculator from "@/components/tools/BmiCalculator";
import AgeCalculator from "@/components/tools/AgeCalculator";
import QrCodeGenerator from "@/components/tools/QrCodeGenerator";
import PasswordGenerator from "@/components/tools/PasswordGenerator";
import TextCaseConverter from "@/components/tools/TextCaseConverter";
import RandomNumberGenerator from "@/components/tools/RandomNumberGenerator";
import EmojiPicker from "@/components/tools/EmojiPicker";
import HolidayCalculator from "@/components/tools/HolidayCalculator";
import CompoundInterestCalculator from "@/components/tools/CompoundInterestCalculator";
import CurrencyConverter from "@/components/tools/CurrencyConverter";
import PercentageCalculator from "@/components/tools/PercentageCalculator";
import TpSlCalculator from "@/components/tools/TpSlCalculator";
import PositionSizeCalculator from "@/components/tools/PositionSizeCalculator";
import CryptoMarketCapComparator from "@/components/tools/CryptoMarketCapComparator";
import UnixTimestampConverter from "@/components/tools/UnixTimestampConverter";
import DiffChecker from "@/components/tools/DiffChecker";
import IdealWeightCalculator from "@/components/tools/IdealWeightCalculator";
import BodyFatCalculator from "@/components/tools/BodyFatCalculator";
import BmrTdeeCalculator from "@/components/tools/BmrTdeeCalculator";
import WaterIntakeCalculator from "@/components/tools/WaterIntakeCalculator";
import RunningPaceCalculator from "@/components/tools/RunningPaceCalculator";
import OvulationCalculator from "@/components/tools/OvulationCalculator";
import SleepCalculator from "@/components/tools/SleepCalculator";
import JsonCsvFormatter from "@/components/tools/JsonCsvFormatter";
import Base64Tool from "@/components/tools/Base64Tool";
import WordCounter from "@/components/tools/WordCounter";
import BaseConverter from "@/components/tools/BaseConverter";

interface Props {
  params: Promise<{ category: string; slug: string }>;
}

/** All valid [category] segments */
const VALID_CATEGORIES = new Set(Object.values(CATEGORY_URL_PREFIX));

export async function generateStaticParams() {
  const allTools = mergeWithRegistry(registryToToolMetas());

  // Legacy base tool slugs
  const params: { category: string; slug: string }[] = [];
  for (const tool of allTools) {
    const prefix = CATEGORY_URL_PREFIX[tool.category];
    if (prefix) params.push({ category: prefix, slug: tool.slug });
  }

  // Registry variant slugs
  for (const meta of getRegistryTools()) {
    const prefix = CATEGORY_URL_PREFIX[meta.category];
    if (!prefix) continue;
    for (const v of meta.variants) {
      params.push({ category: prefix, slug: v.variantSlug });
    }
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  if (!VALID_CATEGORIES.has(category)) return {};

  const registryResult = resolveRegistrySlug(slug);
  const tool = registryResult?.meta ?? getToolBySlug(slug);
  if (!tool) return {};

  const prefix = CATEGORY_URL_PREFIX[tool.category] ?? category;
  const canonicalPath = `/tools/${prefix}/${slug}`;
  const toolUrl = `https://getfastcalc.com${canonicalPath}`;
  const isNoindex = (registryResult?.meta as import("@/lib/registry").RegistryMeta | undefined)?.noindex === true;
  return {
    title: tool.metaTitle,
    description: tool.metaDescription,
    keywords: tool.keywords,
    ...(isNoindex ? { robots: { index: false, follow: false } } : {}),
    alternates: {
      canonical: toolUrl,
      languages: {
        "en":        toolUrl,
        "es":        `https://getfastcalc.com/es${canonicalPath}`,
        "fr":        `https://getfastcalc.com/fr${canonicalPath}`,
        "x-default": toolUrl,
      },
    },
    openGraph: {
      title: tool.metaTitle,
      description: tool.metaDescription,
      url: toolUrl,
      type: "website",
      siteName: "GetFastCalc",
    },
    twitter: {
      card: "summary_large_image",
      title: tool.metaTitle,
      description: tool.metaDescription,
    },
  };
}

const legacyComponents: Record<string, React.ReactNode> = {
  "bmi-calculator":              <BmiCalculator />,
  "age-calculator":              <AgeCalculator />,
  "qr-code-generator":           <QrCodeGenerator />,
  "password-generator":          <PasswordGenerator />,
  "text-case-converter":         <TextCaseConverter />,
  "random-number-generator":     <RandomNumberGenerator />,
  "emoji-picker":                <EmojiPicker />,
  "holiday-calculator":          <HolidayCalculator />,
  "compound-interest-calculator":<CompoundInterestCalculator />,
  "currency-converter":          <CurrencyConverter />,
  "percentage-calculator":       <PercentageCalculator />,
  "tp-sl-calculator":            <TpSlCalculator />,
  "position-size-calculator":    <PositionSizeCalculator />,
  "crypto-market-cap-comparator":<CryptoMarketCapComparator />,
  "unix-timestamp-converter":    <UnixTimestampConverter />,
  "diff-checker":                <DiffChecker />,
  "ideal-weight-calculator":     <IdealWeightCalculator />,
  "body-fat-calculator":         <BodyFatCalculator />,
  "bmr-tdee-calculator":         <BmrTdeeCalculator />,
  "water-intake-calculator":     <WaterIntakeCalculator />,
  "running-pace-calculator":     <RunningPaceCalculator />,
  "ovulation-calculator":        <OvulationCalculator />,
  "sleep-calculator":            <SleepCalculator />,
  "json-csv-formatter":          <JsonCsvFormatter />,
  "base64-tool":                 <Base64Tool />,
  "word-counter":                <WordCounter />,
  "base-converter":              <BaseConverter />,
};

export default async function ToolPage({ params }: Props) {
  const { category, slug } = await params;

  // Validate category segment
  if (!VALID_CATEGORIES.has(category)) notFound();

  const allTools = mergeWithRegistry(registryToToolMetas());

  // 1. Registry-first (new architecture)
  const registryResult = resolveRegistrySlug(slug);
  if (registryResult) {
    const { meta, variant, baseSlug } = registryResult;

    // Guard: ensure slug belongs to this category
    const expectedPrefix = CATEGORY_URL_PREFIX[meta.category];
    if (expectedPrefix !== category) notFound();

    let mod: { default: React.ComponentType<{ variant?: string }> };
    try {
      mod = await import(`@/tools-registry/${baseSlug}/view`);
    } catch {
      notFound();
    }
    const ToolView = mod!.default;
    return (
      <>
        <Header allTools={allTools} />
        <ToolLayout tool={meta} allTools={allTools}>
          <ToolView variant={variant} />
        </ToolLayout>
        <Footer />
      </>
    );
  }

  // 2. Legacy components
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const expectedPrefix = CATEGORY_URL_PREFIX[tool.category];
  if (expectedPrefix !== category) notFound();

  const toolUI = legacyComponents[slug];
  if (!toolUI) notFound();

  return (
    <>
      <Header allTools={allTools} />
      <ToolLayout tool={tool} allTools={allTools}>{toolUI}</ToolLayout>
      <Footer />
    </>
  );
}
