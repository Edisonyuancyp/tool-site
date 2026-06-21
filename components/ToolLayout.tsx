import Link from "next/link";
import { ToolMeta, tools, getRelatedTools } from "@/lib/tools";

interface ToolLayoutProps {
  tool: ToolMeta;
  children: React.ReactNode;
}

function getAutoRelated(tool: ToolMeta): ToolMeta[] {
  // 1. Use manually specified relatedTools first (up to 4)
  const manual = getRelatedTools(tool.relatedTools).slice(0, 4);
  if (manual.length >= 3) return manual;

  // 2. Auto-fill from same category, excluding self
  const sameCat = tools
    .filter((t) => t.category === tool.category && t.slug !== tool.slug)
    .slice(0, 4 - manual.length);

  const seen = new Set(manual.map((t) => t.slug));
  return [...manual, ...sameCat.filter((t) => !seen.has(t.slug))];
}

export default function ToolLayout({ tool, children }: ToolLayoutProps) {
  const relatedTools = getAutoRelated(tool);

  const BASE_URL = "https://getfastcalc.com";
  const toolUrl = `${BASE_URL}/tools/${tool.slug}`;

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    url: toolUrl,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any (Web Browser)",
    description: tool.description,
    keywords: tool.keywords.join(", "),
    inLanguage: "en",
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@type": "Organization",
      name: "GetFastCalc",
      url: BASE_URL,
    },
  };

  const faqSchema = tool.faqs.length > 0
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: tool.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
      }
    : null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: tool.name,
        item: toolUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-10">
          {/* Breadcrumb */}
          <nav className="text-sm text-gray-400 mb-6">
            <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-600">{tool.name}</span>
          </nav>

          {/* Title */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{tool.icon}</span>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-widest bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                {tool.category}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-3">
              {tool.name}
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed max-w-2xl">
              {tool.description}
            </p>
          </div>

          {/* Tool UI */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 sm:p-8 mb-10 shadow-sm">
            {children}
          </div>

          {/* How it works */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">How it works</h2>
            <p className="text-gray-500 leading-relaxed">
              This {tool.name.toLowerCase()} runs entirely in your browser — no data is sent to any server.
              Simply fill in the fields above and the result updates instantly. You can copy the output
              with the copy button provided.
            </p>
          </section>

          {/* FAQ */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold text-gray-900 mb-5">
              Frequently Asked Questions
            </h2>
            <div className="space-y-5">
              {tool.faqs.map((faq, i) => (
                <div key={i} className="border border-gray-100 rounded-lg p-5">
                  <h3 className="font-medium text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related tools */}
          {relatedTools.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Related Tools</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relatedTools.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/tools/${t.slug}`}
                    className="flex items-center gap-3 p-4 border border-gray-100 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all group"
                  >
                    <span className="text-2xl">{t.icon}</span>
                    <div>
                      <p className="font-medium text-gray-900 group-hover:text-black text-sm">
                        {t.name}
                      </p>
                      <p className="text-xs text-gray-400">{t.tagline}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
