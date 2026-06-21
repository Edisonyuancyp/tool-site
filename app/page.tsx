import { mergeWithRegistry } from "@/lib/tools";
import { registryToToolMetas } from "@/lib/registry";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomeSchema from "@/components/HomeSchema";
import ToolGrid from "@/components/ToolGrid";
import ToolRequestBanner from "@/components/ToolRequestBanner";
import FavoritesSection from "@/components/FavoritesSection";

export default function Home() {
  const allTools = mergeWithRegistry(registryToToolMetas());

  return (
    <>
      <HomeSchema tools={allTools} />
      <Header />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-14">
          {/* Hero */}
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-4 leading-tight">
              Free Online Tools &amp;<br className="hidden sm:block" /> Calculators
            </h1>
            <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
              Fast, free tools that work instantly in your browser.
              No signup. No ads. Just results.
            </p>
          </div>

          {/* Tool request banner */}
          <div className="mb-10">
            <ToolRequestBanner />
          </div>

          {/* Saved tools — client-side, only shows when user has favorites */}
          <FavoritesSection allTools={allTools} />

          <ToolGrid tools={allTools} />

          {/* Trust line */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-400">
              All tools run 100% in your browser · No data stored · No account required
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
