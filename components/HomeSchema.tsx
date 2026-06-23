import type { ToolMeta } from "@/lib/tools";
import { getToolPath } from "@/lib/tools";

const BASE_URL = "https://getfastcalc.com";

export default function HomeSchema({ tools }: { tools: ToolMeta[] }) {
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": BASE_URL,
    url: BASE_URL,
    name: "Free Online Calculator – 100+ Free Calculators & Tools | GetFastCalc",
    description:
      "Use GetFastCalc's free online calculators — percentage, BMI, mortgage, age, tax, salary, scientific, tip, compound interest and 100+ more. No signup, instant results.",
    inLanguage: "en",
    isPartOf: { "@type": "WebSite", url: BASE_URL, name: "GetFastCalc" },
    about: { "@type": "Thing", name: "Online Calculators" },
    keywords: "free online calculator, online calculator, percentage calculator, bmi calculator, scientific calculator, tax calculator",
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${BASE_URL}/#website`,
    name: "GetFastCalc",
    url: BASE_URL,
    description:
      "Free online calculators for math, finance, health, science and more. 100+ tools, no signup required.",
    inLanguage: "en",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${BASE_URL}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Free Online Calculators & Tools",
    url: BASE_URL,
    numberOfItems: tools.length,
    itemListElement: tools.map((tool, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: tool.name,
      url: `${BASE_URL}${getToolPath(tool)}`,
      description: tool.tagline,
    })),
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${BASE_URL}/#organization`,
    name: "GetFastCalc",
    url: BASE_URL,
    description: "Free browser-based calculators and tools for everyone — math, finance, health, science and more.",
    sameAs: [
      "https://twitter.com/getfastcalc",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
    </>
  );
}
