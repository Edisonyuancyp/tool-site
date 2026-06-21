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
};

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
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
