import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { tools, getToolBySlug } from "@/lib/tools";
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
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};
  const toolUrl = `https://toolcalc.com/tools/${tool.slug}`;
  return {
    title: tool.metaTitle,
    description: tool.metaDescription,
    keywords: tool.keywords,
    alternates: { canonical: toolUrl },
    openGraph: {
      title: tool.metaTitle,
      description: tool.metaDescription,
      url: toolUrl,
      type: "website",
      siteName: "ToolCalc",
    },
    twitter: {
      card: "summary_large_image",
      title: tool.metaTitle,
      description: tool.metaDescription,
    },
  };
}

const toolComponents: Record<string, React.ReactNode> = {
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
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  const toolUI = toolComponents[slug];
  if (!toolUI) notFound();

  return (
    <>
      <Header />
      <ToolLayout tool={tool}>{toolUI}</ToolLayout>
      <Footer />
    </>
  );
}
