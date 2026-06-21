import Link from "next/link";
import type { ToolMeta } from "@/lib/tools";
import { getToolPath, CATEGORY_URL_PREFIX } from "@/lib/tools";

const CATEGORY_META: Record<string, {
  title: string;
  description: string;
  icon: string;
  categories: string[];
}> = {
  calc: {
    title: "Calculators",
    description: "Financial, health, math, and crypto calculators — get instant results without sign-up.",
    icon: "🧮",
    categories: ["Finance", "Math", "Health", "Crypto"],
  },
  dev: {
    title: "Developer Tools",
    description: "Encoding, decoding, formatting, security, and text tools for developers.",
    icon: "💻",
    categories: ["Developer", "Text", "Security"],
  },
  design: {
    title: "Design & Generator Tools",
    description: "Color tools, generators, and design utilities.",
    icon: "🎨",
    categories: ["Design", "Generators"],
  },
  time: {
    title: "Date & Time Tools",
    description: "Time zone converters, timestamp tools, and date calculators.",
    icon: "🕐",
    categories: ["Date & Time"],
  },
  converter: {
    title: "Converters",
    description: "Unit conversion tools for length, weight, temperature, and more.",
    icon: "🔄",
    categories: ["Converter"],
  },
};

/** Derive category group → display name for section headers */
const PREFIX_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_URL_PREFIX).map(([cat, prefix]) => [prefix + "|" + cat, cat])
);
void PREFIX_LABEL; // used implicitly via CATEGORY_META

interface Props {
  prefix: string;
  allTools: ToolMeta[];
}

export default function CategoryPage({ prefix, allTools }: Props) {
  const meta = CATEGORY_META[prefix];
  if (!meta) return null;

  const tools = allTools.filter(t => meta.categories.includes(t.category));

  // Group by category name
  const grouped: Record<string, ToolMeta[]> = {};
  for (const cat of meta.categories) {
    const items = tools.filter(t => t.category === cat);
    if (items.length) grouped[cat] = items;
  }

  return (
    <main className="flex-1">
      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-gray-600 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">{meta.title}</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{meta.icon}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-3">
            {meta.title}
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed max-w-2xl">
            {meta.description}
          </p>
          <p className="text-sm text-gray-400 mt-2">{tools.length} tools available</p>
        </div>

        {/* Grouped tool grid */}
        <div className="space-y-10">
          {Object.entries(grouped).map(([cat, items]) => (
            <section key={cat}>
              {Object.keys(grouped).length > 1 && (
                <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-gray-300 rounded-full inline-block" />
                  {cat}
                </h2>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(tool => (
                  <Link
                    key={tool.slug}
                    href={getToolPath(tool)}
                    className="group flex flex-col gap-3 p-5 border border-gray-100 rounded-xl bg-white hover:border-gray-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{tool.icon}</span>
                      <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                        {tool.category}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-black transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-sm text-gray-400 mt-0.5 leading-relaxed">
                        {tool.tagline}
                      </p>
                    </div>
                    <div className="flex items-center text-xs text-gray-400 group-hover:text-gray-600 transition-colors mt-auto">
                      Use tool
                      <svg className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
