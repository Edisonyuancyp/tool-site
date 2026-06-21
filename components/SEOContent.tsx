import type { ToolMeta } from "@/lib/tools";

interface SeoContentData {
  h1Tendency?: string;
  painPoints?: string[];
  trustSignals?: string[];
}

interface Props {
  tool: ToolMeta;
}

export default function SEOContent({ tool }: Props) {
  const seo = (tool as ToolMeta & { seoContent?: SeoContentData }).seoContent;
  if (!seo) return null;

  const { painPoints = [], trustSignals = [] } = seo;
  if (painPoints.length === 0) return null;

  return (
    <section
      aria-label="Common questions about this tool"
      className="mt-10 border-t border-gray-100 pt-8"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Why use this {tool.name.toLowerCase().includes("calculator") ? "calculator" : "tool"}?
      </h2>

      <ul className="space-y-2 mb-5">
        {painPoints.map((point, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
            <span className="mt-0.5 text-gray-300">›</span>
            <span>{point}</span>
          </li>
        ))}
      </ul>

      {trustSignals.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {trustSignals.map((signal, i) => (
            <span
              key={i}
              className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-3 py-1"
            >
              ✓ {signal}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
