import Link from "next/link";
import { ToolMeta, tools as legacyTools } from "@/lib/tools";
import AccuracyFeedback from "@/components/AccuracyFeedback";
import FavoriteButton from "@/components/FavoriteButton";

interface ToolLayoutProps {
  tool: ToolMeta;
  children: React.ReactNode;
  allTools?: ToolMeta[];
}

/** Maps category name → URL prefix segment, mirroring generate_tool.py */
const CATEGORY_URL_PREFIX: Record<string, string> = {
  Finance:      "calc",
  Math:         "calc",
  Health:       "calc",
  Crypto:       "calc",
  Design:       "design",
  Generators:   "design",
  Developer:    "dev",
  Text:         "dev",
  Security:     "dev",
  "Date & Time": "time",
};

function getCategoryPath(category: string): string {
  const prefix = CATEGORY_URL_PREFIX[category];
  return prefix ? `/tools/${prefix}` : "/tools";
}

/** Returns up to 4 related tools from the SAME category only. */
function getAutoRelated(tool: ToolMeta, allTools: ToolMeta[]): ToolMeta[] {
  // Only consider same-category tools (excluding self)
  const sameCategory = allTools.filter(
    (t) => t.category === tool.category && t.slug !== tool.slug
  );

  // Prefer manually specified slugs that are in the same category
  const manual = tool.relatedTools
    .map((s) => sameCategory.find((t) => t.slug === s))
    .filter((t): t is ToolMeta => !!t)
    .slice(0, 4);

  if (manual.length >= 4) return manual;

  // Back-fill with remaining same-category tools
  const seen = new Set(manual.map((t) => t.slug));
  const backfill = sameCategory
    .filter((t) => !seen.has(t.slug))
    .slice(0, 4 - manual.length);

  return [...manual, ...backfill];
}

export default function ToolLayout({ tool, children, allTools }: ToolLayoutProps) {
  const pool = allTools ?? legacyTools;
  const relatedTools = getAutoRelated(tool, pool);

  const BASE_URL = "https://getfastcalc.com";
  const toolUrl = `${BASE_URL}/tools/${tool.slug}`;
  const categoryPath = getCategoryPath(tool.category);
  const categoryUrl = `${BASE_URL}${categoryPath}`;

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
        name: tool.category,
        item: categoryUrl,
      },
      {
        "@type": "ListItem",
        position: 3,
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
          <nav aria-label="breadcrumb" className="text-sm text-gray-400 mb-6">
            <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link href={categoryPath} className="hover:text-gray-600 transition-colors">{tool.category}</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-600">{tool.name}</span>
          </nav>

          {/* Title */}
          <div className="mb-8">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{tool.icon}</span>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-widest bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                  {tool.category}
                </span>
              </div>
              <FavoriteButton slug={tool.slug} />
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
            <div className="mt-6 pt-5 border-t border-gray-100">
              <AccuracyFeedback toolSlug={tool.slug} />
            </div>
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
