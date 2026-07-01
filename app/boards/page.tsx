import type { Metadata } from "next";
import Link from "next/link";
import { mergeWithRegistry } from "@/lib/tools";
import { registryToToolMetas } from "@/lib/registry";
import { BOARD_PRESETS } from "@/lib/board-presets";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Ready-Made Tool Boards – Free Calculator Dashboards | GetFastCalc",
  description:
    "Jump straight into a ready-made dashboard: AI prompt tools, FBA seller kit, quant trading desk, developer toolkit, finance hub, health tracker, and designer toolkit. No signup.",
  keywords: [
    "calculator dashboard",
    "tool board online",
    "AI prompt workspace",
    "Amazon FBA dashboard",
    "quant trading desk",
    "developer toolkit",
    "finance calculator hub",
  ],
  alternates: { canonical: "https://getfastcalc.com/boards" },
  openGraph: {
    title: "Ready-Made Tool Boards | GetFastCalc",
    description:
      "Free pre-built dashboards for AI, FBA, trading, development, finance, health, and design — use instantly, no signup.",
    url: "https://getfastcalc.com/boards",
    type: "website",
    siteName: "GetFastCalc",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "GetFastCalc Tool Boards",
  itemListElement: BOARD_PRESETS.map((preset, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: preset.name,
    description: preset.shortDesc,
    url: `https://getfastcalc.com/boards/${preset.id}`,
  })),
};

export default function BoardsIndexPage() {
  const allTools = mergeWithRegistry(registryToToolMetas());

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header allTools={allTools} />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-10">
          <nav aria-label="breadcrumb" className="text-sm text-gray-400 mb-6">
            <Link href="/" className="hover:text-gray-600 transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-600">Boards</span>
          </nav>

          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-3">
              Ready-Made Tool Boards
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed max-w-2xl">
              Pick a board and start working immediately. Each board loads the right
              tools on one screen — no setup, no signup.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {BOARD_PRESETS.map((preset) => (
              <Link
                key={preset.id}
                href={`/boards/${preset.id}`}
                className="group flex flex-col gap-3 p-5 border border-gray-100 rounded-xl bg-white hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{preset.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-gray-900 group-hover:text-black transition-colors">
                      {preset.name}
                    </h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {preset.slugs.length} tools
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {preset.shortDesc}
                </p>
                <div className="flex items-center text-xs text-blue-600 font-medium mt-auto">
                  Use this board
                  <svg
                    className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
