import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { mergeWithRegistry } from "@/lib/tools";
import { registryToToolMetas } from "@/lib/registry";
import { BOARD_PRESETS, getPresetById } from "@/lib/board-presets";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PresetBoard from "@/components/PresetBoard";

interface Props {
  params: Promise<{ boardId: string }>;
}

export async function generateStaticParams() {
  return BOARD_PRESETS.map((preset) => ({ boardId: preset.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { boardId } = await params;
  const preset = getPresetById(boardId);
  if (!preset) return {};
  return {
    title: preset.metaTitle,
    description: preset.metaDescription,
    keywords: preset.keywords,
    alternates: {
      canonical: `https://getfastcalc.com/boards/${preset.id}`,
    },
    openGraph: {
      title: preset.metaTitle,
      description: preset.metaDescription,
      url: `https://getfastcalc.com/boards/${preset.id}`,
      type: "website",
      siteName: "GetFastCalc",
    },
  };
}

export default async function BoardPage({ params }: Props) {
  const { boardId } = await params;
  const preset = getPresetById(boardId);
  if (!preset) notFound();

  const allTools = mergeWithRegistry(registryToToolMetas());

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: preset.metaTitle,
    description: preset.metaDescription,
    url: `https://getfastcalc.com/boards/${preset.id}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: preset.slugs.map((slug, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: allTools.find((t) => t.slug === slug)?.name ?? slug,
        url: `https://getfastcalc.com/tools/${slug}`,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header allTools={allTools} />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-10">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="text-sm text-gray-400 mb-6">
            <Link href="/" className="hover:text-gray-600 transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link href="/boards" className="hover:text-gray-600 transition-colors">
              Boards
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-600">{preset.name}</span>
          </nav>

          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
              <span className="text-4xl">{preset.emoji}</span>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                {preset.name}
              </h1>
            </div>
            <p className="text-lg text-gray-500 leading-relaxed max-w-3xl">
              {preset.description}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Link
                href={`/workbench/board?preset=${preset.id}`}
                className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
              >
                Open in Workbench
              </Link>
              <Link
                href={`/boards/${preset.id}#tutorial`}
                className="text-sm text-gray-600 hover:text-gray-900 border border-gray-200 px-4 py-2 rounded-lg transition-colors"
              >
                How to use
              </Link>
            </div>
          </div>

          {/* Live board */}
          <section aria-label={`${preset.name} tools`}>
            <PresetBoard
              slugs={preset.slugs}
              sizes={preset.sizes}
              allTools={allTools}
            />
          </section>

          {/* Tutorial */}
          <section
            id="tutorial"
            className="mt-12 border-t border-gray-100 pt-10"
            aria-label={`${preset.name} tutorial`}
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-5">
              {preset.tutorial.title}
            </h2>
            <ol className="space-y-4">
              {preset.tutorial.steps.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-semibold text-sm flex items-center justify-center">
                    {i + 1}
                  </span>
                  <p className="text-gray-600 leading-relaxed pt-1">{step}</p>
                </li>
              ))}
            </ol>
            {preset.tutorial.tip && (
              <div className="mt-6 p-4 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-800">
                <span className="font-semibold">Tip:</span> {preset.tutorial.tip}
              </div>
            )}
          </section>

          {/* SEO text */}
          <section
            className="mt-12 border-t border-gray-100 pt-10"
            aria-label="About this board"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              About the {preset.name}
            </h2>
            <p className="text-gray-500 leading-relaxed text-sm">
              {preset.description} Every tool runs entirely in your browser — no
              signup, no data stored, and no server-side processing. Use this
              board directly, or click “Open in Workbench” to customize the layout,
              reorder cards, and add your own tools.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
