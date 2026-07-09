import Link from "next/link";
import { ToolMeta, tools as legacyTools, getToolPath, getCategoryListPath } from "@/lib/tools";
import AccuracyFeedback from "@/components/AccuracyFeedback";
import FavoriteButton from "@/components/FavoriteButton";
import VisitTracker from "@/components/VisitTracker";
import SEOContent from "@/components/SEOContent";
import ShareButton from "@/components/ShareButton";
import ToolErrorBoundary from "@/components/ToolErrorBoundary";

/** Minimal markdown → JSX: **bold**, `code`, blank-line paragraphs */
function MdLine({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[0].startsWith("**")) parts.push(<strong key={m.index}>{m[0].slice(2, -2)}</strong>);
    else parts.push(<code key={m.index} className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-[0.85em] font-mono">{m[0].slice(1, -1)}</code>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

function ArticleBody({ body }: { body: string }) {
  const paras = body.split(/\n{2,}/);
  return (
    <div className="space-y-4 text-gray-600 leading-relaxed text-sm">
      {paras.map((para, i) => {
        const lines = para.split("\n");
        if (lines[0].match(/^\d+\.\s/)) {
          return (
            <ol key={i} className="list-decimal list-inside space-y-1.5">
              {lines.map((l, j) => <li key={j}><MdLine text={l.replace(/^\d+\.\s/, "")} /></li>)}
            </ol>
          );
        }
        if (lines[0].match(/^[-•]\s/)) {
          return (
            <ul key={i} className="list-disc list-inside space-y-1.5">
              {lines.map((l, j) => <li key={j}><MdLine text={l.replace(/^[-•]\s/, "")} /></li>)}
            </ul>
          );
        }
        if (lines[0].startsWith("> ")) {
          return (
            <blockquote key={i} className="border-l-4 border-blue-200 pl-4 text-gray-500 italic">
              {lines.map((l, j) => <p key={j}><MdLine text={l.replace(/^>\s/, "")} /></p>)}
            </blockquote>
          );
        }
        return <p key={i}>{lines.map((l, j) => <span key={j}><MdLine text={l} />{j < lines.length - 1 && <br />}</span>)}</p>;
      })}
    </div>
  );
}

interface ToolLayoutProps {
  tool: ToolMeta;
  children: React.ReactNode;
  allTools?: ToolMeta[];
  locale?: string;
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

export default function ToolLayout({ tool, children, allTools, locale }: ToolLayoutProps) {
  const pool = allTools ?? legacyTools;
  const relatedTools = getAutoRelated(tool, pool);

  const BASE_URL = "https://getfastcalc.com";
  // In locale pages, use /{locale}/tools/{slug}; in EN use /tools/{cat}/{slug}
  const localPrefix = locale ? `/${locale}` : "";
  const toolPath = locale ? `/${locale}/tools/${tool.slug}` : getToolPath(tool);
  const toolUrl = `${BASE_URL}${toolPath}`;
  const categoryPath = locale ? `/${locale}` : getCategoryListPath(tool.category);
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
            <Link href={localPrefix || "/"} className="hover:text-gray-600 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link href={categoryPath} className="hover:text-gray-600 transition-colors">{tool.category}</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-600">{tool.name}</span>
          </nav>

          <VisitTracker slug={tool.slug} name={tool.name} category={tool.category} />
          {/* Title */}
          <div className="mb-8">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{tool.icon}</span>
                <span className="text-xs font-medium text-gray-400 uppercase tracking-widest bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                  {tool.category}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ShareButton
                  url={toolUrl}
                  title={`${tool.name} — Free Online Tool | GetFastCalc`}
                  text={`Free ${tool.name}: `}
                  compact
                />
                <FavoriteButton slug={tool.slug} />
              </div>
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
            <ToolErrorBoundary toolName={tool.name}>
              {children}
            </ToolErrorBoundary>
            <div className="mt-6 pt-5 border-t border-gray-100">
              <AccuracyFeedback toolSlug={tool.slug} />
            </div>
          </div>

          {/* How it works — use first seoBody section if available, else tagline */}
          {(() => {
            const seoBody: { heading: string; body: string }[] | undefined = (tool as any).seoBody;
            const first = seoBody?.[0];
            if (first) {
              return (
                <section className="mb-10">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">{first.heading}</h2>
                  <ArticleBody body={first.body} />
                </section>
              );
            }
            return (
              <section className="mb-10">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">How it works</h2>
                <p className="text-gray-500 leading-relaxed">{tool.tagline}</p>
              </section>
            );
          })()}

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

          {/* Article sections — seoBody[1..] + legacy article.sections */}
          {(() => {
            const seoBody: { heading: string; body: string }[] | undefined = (tool as any).seoBody;
            const remainingSeo = seoBody && seoBody.length > 1 ? seoBody.slice(1) : [];
            const legacySections: { heading: string; body: string }[] = (tool as any).article?.sections ?? [];
            const sections = [...remainingSeo, ...legacySections];
            if (sections.length === 0) return null;
            return (
              <article className="mb-10 prose-none">
                <div className="space-y-8">
                  {sections.map((s, i) => (
                    <section key={i}>
                      <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <span className="w-1 h-5 bg-blue-500 rounded-full inline-block" />
                        {s.heading}
                      </h3>
                      <ArticleBody body={s.body} />
                    </section>
                  ))}
                </div>
              </article>
            );
          })()}

          {/* SEO Content — pain points + trust signals (server-rendered for crawlers) */}
          <SEOContent tool={tool} />

          {/* Related tools */}
          {relatedTools.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Related Tools</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relatedTools.map((t) => (
                  <Link
                    key={t.slug}
                    href={locale ? `/${locale}/tools/${t.slug}` : getToolPath(t)}
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
