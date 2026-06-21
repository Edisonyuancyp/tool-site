import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { tools, getToolBySlug, mergeWithRegistry } from "@/lib/tools";
import { getRegistrySlugs, resolveRegistrySlug, registryToToolMetas } from "@/lib/registry";
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
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const legacySlugs = tools.map((t) => ({ slug: t.slug }));
  const registrySlugs = getRegistrySlugs().map((s) => ({ slug: s }));
  // Merge, registry slugs override duplicates
  const seen = new Set(registrySlugs.map((r) => r.slug));
  return [
    ...legacySlugs.filter((l) => !seen.has(l.slug)),
    ...registrySlugs,
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  // Registry-first
  const registryResult = resolveRegistrySlug(slug);
  const tool = registryResult?.meta ?? getToolBySlug(slug);
  if (!tool) return {};

  const toolUrl = `https://getfastcalc.com/tools/${slug}`;
  return {
    title: tool.metaTitle,
    description: tool.metaDescription,
    keywords: tool.keywords,
    alternates: {
      canonical: toolUrl,
      languages: {
        "en":        toolUrl,
        "es":        `https://getfastcalc.com/es/tools/${slug}`,
        "fr":        `https://getfastcalc.com/fr/tools/${slug}`,
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

// Legacy tool components (unchanged)
const legacyComponents: Record<string, React.ReactNode> = {
  "bmi-calculator": <BmiCalculator />,
  "age-calculator": <AgeCalculator />,
  "qr-code-generator": <QrCodeGenerator />,
  "password-generator": <PasswordGenerator />,
  "text-case-converter": <TextCaseConverter />,
  "random-number-generator": <RandomNumberGenerator />,
  "emoji-picker": <EmojiPicker />,
  "holiday-calculator": <HolidayCalculator />,
  "compound-interest-calculator": <CompoundInterestCalculator />,
  "currency-converter": <CurrencyConverter />,
  "percentage-calculator": <PercentageCalculator />,
  "tp-sl-calculator": <TpSlCalculator />,
  "position-size-calculator": <PositionSizeCalculator />,
  "crypto-market-cap-comparator": <CryptoMarketCapComparator />,
  "unix-timestamp-converter": <UnixTimestampConverter />,
  "diff-checker": <DiffChecker />,
  "ideal-weight-calculator": <IdealWeightCalculator />,
  "body-fat-calculator": <BodyFatCalculator />,
  "bmr-tdee-calculator": <BmrTdeeCalculator />,
  "water-intake-calculator": <WaterIntakeCalculator />,
  "running-pace-calculator": <RunningPaceCalculator />,
  "ovulation-calculator": <OvulationCalculator />,
  "sleep-calculator": <SleepCalculator />,
  "json-csv-formatter": <JsonCsvFormatter />,
  "base64-tool": <Base64Tool />,
  "word-counter": <WordCounter />,
  "base-converter": <BaseConverter />,
};

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const allTools = mergeWithRegistry(registryToToolMetas());

  // 1. Try registry first (new architecture)
  const registryResult = resolveRegistrySlug(slug);
  if (registryResult) {
    const { meta, variant, baseSlug } = registryResult;
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

  // 2. Fallback to legacy components
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const toolUI = legacyComponents[slug];
  if (!toolUI) notFound();

  return (
    <>
      <Header />
      <ToolLayout tool={tool} allTools={allTools}>{toolUI}</ToolLayout>
      <Footer />
    </>
  );
}
