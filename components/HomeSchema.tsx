import { tools } from "@/lib/tools";

const BASE_URL = "https://getfastcalc.com";

export default function HomeSchema() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "GetFastCalc",
    url: BASE_URL,
    description:
      "Free online tools and calculators for health, finance, developer utilities, date & time, and more. No signup required.",
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
    name: "Free Online Tools & Calculators",
    url: BASE_URL,
    numberOfItems: tools.length,
    itemListElement: tools.map((tool, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: tool.name,
      url: `${BASE_URL}/tools/${tool.slug}`,
      description: tool.tagline,
    })),
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "GetFastCalc",
    url: BASE_URL,
    description: "Free browser-based tools and calculators for everyone.",
  };

  return (
    <>
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
