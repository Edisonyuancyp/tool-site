import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LocalizedToolGrid from "@/components/LocalizedToolGrid";
import WorkbenchDashboard from "@/components/WorkbenchDashboard";
import { SUPPORTED_LOCALES, type SupportedLocale, getI18nToolMetas } from "@/lib/i18n-registry";

interface Props {
  params: Promise<{ locale: string }>;
}

const COPY: Record<SupportedLocale, {
  title: string;
  metaTitle: string;
  metaDesc: string;
  h1: string;
  subtitle: string;
  trust: string;
  all: string;
  useTool: string;
}> = {
  es: {
    title: "Herramientas y Calculadoras Online Gratis – GetFastCalc",
    metaTitle: "Herramientas y Calculadoras Online Gratis – GetFastCalc",
    metaDesc: "Herramientas online gratuitas: calculadora de IMC, edad, interés compuesto, conversor de monedas, generador de QR y mucho más. Resultados instantáneos, sin registro.",
    h1: "Herramientas y\nCalculadoras Gratis",
    subtitle: "Herramientas rápidas y gratuitas que funcionan al instante en tu navegador. Sin registro. Sin anuncios. Solo resultados.",
    trust: "Todas las herramientas funcionan 100% en tu navegador · Sin almacenamiento de datos · Sin cuenta requerida",
    all: "Todas",
    useTool: "Usar herramienta",
  },
  fr: {
    title: "Outils et Calculatrices Gratuits en Ligne – GetFastCalc",
    metaTitle: "Outils et Calculatrices Gratuits en Ligne – GetFastCalc",
    metaDesc: "Outils en ligne gratuits : calculateur d'IMC, d'âge, d'intérêts composés, convertisseur de devises, générateur QR et bien plus. Résultats instantanés, sans inscription.",
    h1: "Outils et\nCalculatrices Gratuits",
    subtitle: "Des outils rapides et gratuits qui fonctionnent instantanément dans votre navigateur. Sans inscription. Sans publicités. Juste des résultats.",
    trust: "Tous les outils fonctionnent 100% dans votre navigateur · Aucune donnée stockée · Aucun compte requis",
    all: "Tous",
    useTool: "Utiliser l'outil",
  },
  zh: {
    title: "免费在线计算器与工具 – GetFastCalc",
    metaTitle: "免费在线计算器与工具 – GetFastCalc",
    metaDesc: "免费在线工具：BMI计算器、年龄计算器、复利计算器、汇率转换、二维码生成等100+工具。无需注册，即时出结果。",
    h1: "免费在线\n计算器与工具",
    subtitle: "快速、免费，直接在浏览器运行。无需注册，无广告，即刻得到结果。",
    trust: "所有工具100%在浏览器本地运行 · 不存储任何数据 · 无需账号",
    all: "全部",
    useTool: "使用工具",
  },
  ja: {
    title: "無料オンライン計算ツール – GetFastCalc",
    metaTitle: "無料オンライン計算ツール – GetFastCalc",
    metaDesc: "BMI、年齢、複利計算、通貨換算、QRコード生成など100種類以上の無料ツール。登録不要、瞬時に結果が得られます。",
    h1: "無料オンライン\n計算ツール",
    subtitle: "ブラウザで即動作するシンプルな無料ツール。登録不要・広告なし・すぐ使える。",
    trust: "全てのツールはブラウザ内で完結 · データ保存なし · アカウント不要",
    all: "すべて",
    useTool: "ツールを使う",
  },
  de: {
    title: "Kostenlose Online-Rechner & Tools – GetFastCalc",
    metaTitle: "Kostenlose Online-Rechner & Tools – GetFastCalc",
    metaDesc: "Kostenlose Online-Tools: BMI-Rechner, Altersrechner, Zinseszinsrechner, Währungsumrechner, QR-Generator und über 100 weitere. Keine Anmeldung, sofortige Ergebnisse.",
    h1: "Kostenlose Online-\nRechner & Tools",
    subtitle: "Schnelle, kostenlose Tools, die sofort im Browser laufen. Keine Anmeldung. Keine Werbung. Nur Ergebnisse.",
    trust: "Alle Tools laufen 100% im Browser · Keine Datenspeicherung · Kein Konto erforderlich",
    all: "Alle",
    useTool: "Tool verwenden",
  },
  pt: {
    title: "Calculadoras e Ferramentas Online Grátis – GetFastCalc",
    metaTitle: "Calculadoras e Ferramentas Online Grátis – GetFastCalc",
    metaDesc: "Ferramentas online gratuitas: calculadora de IMC, idade, juros compostos, conversor de moedas, gerador de QR e mais de 100 ferramentas. Sem cadastro, resultados instantâneos.",
    h1: "Calculadoras e\nFerramentas Grátis",
    subtitle: "Ferramentas rápidas e gratuitas que funcionam instantaneamente no seu navegador. Sem cadastro. Sem anúncios. Só resultados.",
    trust: "Todas as ferramentas funcionam 100% no navegador · Sem armazenamento de dados · Sem conta necessária",
    all: "Todas",
    useTool: "Usar ferramenta",
  },
};

export async function generateStaticParams() {
  // Only pre-render es/fr — zh/ja/de/pt served on-demand
  return (["es", "fr"] as SupportedLocale[]).map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!SUPPORTED_LOCALES.includes(locale as SupportedLocale)) return {};
  const c = COPY[locale as SupportedLocale];
  const selfUrl = `https://getfastcalc.com/${locale}`;
  return {
    title: c.metaTitle,
    description: c.metaDesc,
    alternates: {
      canonical: selfUrl,
      languages: {
        en: "https://getfastcalc.com",
        es: "https://getfastcalc.com/es",
        fr: "https://getfastcalc.com/fr",
        zh: "https://getfastcalc.com/zh",
        ja: "https://getfastcalc.com/ja",
        de: "https://getfastcalc.com/de",
        pt: "https://getfastcalc.com/pt",
        "x-default": "https://getfastcalc.com",
      },
    },
    openGraph: {
      title: c.metaTitle,
      description: c.metaDesc,
      url: selfUrl,
      type: "website",
      siteName: "GetFastCalc",
    },
  };
}

export default async function LocalizedHome({ params }: Props) {
  const { locale } = await params;
  if (!SUPPORTED_LOCALES.includes(locale as SupportedLocale)) notFound();

  const c = COPY[locale as SupportedLocale];
  const allTools = getI18nToolMetas(locale as SupportedLocale);

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-14">
          {/* Hero */}
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-4 leading-tight">
              {c.h1.split("\n").map((line, i) => (
                <span key={i}>
                  {line}
                  {i === 0 && <br className="hidden sm:block" />}
                </span>
              ))}
            </h1>
            <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
              {c.subtitle}
            </p>
          </div>

          {/* Workbench */}
          <WorkbenchDashboard allTools={allTools} />

          <LocalizedToolGrid
            tools={allTools}
            locale={locale}
            labels={{ all: c.all, useTool: c.useTool }}
          />

          <div className="mt-12 text-center">
            <p className="text-sm text-gray-400">{c.trust}</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
