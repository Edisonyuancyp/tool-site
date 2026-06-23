import type { ToolMeta } from "@/lib/tools";

interface SeoContentData {
  h1Tendency?: string;
  painPoints?: string[];
  trustSignals?: string[];
}

interface SeoBodySection {
  heading: string;
  body: string;
}

type RichToolMeta = ToolMeta & {
  seoContent?: SeoContentData;
  seoBody?: SeoBodySection[];
};

interface Props {
  tool: ToolMeta;
}

export default function SEOContent({ tool }: Props) {
  const rich = tool as RichToolMeta;
  const seo  = rich.seoContent;
  const body = rich.seoBody;

  const hasPainPoints  = seo && (seo.painPoints ?? []).length > 0;
  const hasSeoBody     = body && body.length > 0;

  if (!hasPainPoints && !hasSeoBody) return null;

  const toolWord = tool.name.toLowerCase().includes("calculator") ? "calculator" : "tool";

  return (
    <section aria-label={`Guide: ${tool.name}`} className="mt-10 border-t border-gray-100 pt-8 space-y-8">

      {/* Pain-points / Why-use block */}
      {hasPainPoints && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Why use this {toolWord}?
          </h2>
          <ul className="space-y-2 mb-5">
            {seo!.painPoints!.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
                <span className="mt-0.5 text-gray-300">›</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
          {(seo!.trustSignals ?? []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {seo!.trustSignals!.map((signal, i) => (
                <span
                  key={i}
                  className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-3 py-1"
                >
                  ✓ {signal}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* AI-generated SEO body sections (~800 words) */}
      {hasSeoBody && body!.map((section, i) => (
        <div key={i}>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">{section.heading}</h2>
          <div className="space-y-3">
            {section.body.split("\n\n").map((para, j) => (
              <p key={j} className="text-sm text-gray-500 leading-relaxed">
                {para.trim()}
              </p>
            ))}
          </div>
        </div>
      ))}

    </section>
  );
}
