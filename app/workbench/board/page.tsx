import type { Metadata } from "next";
import { Suspense } from "react";
import { mergeWithRegistry } from "@/lib/tools";
import { registryToToolMetas } from "@/lib/registry";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WorkbenchBoard from "@/components/WorkbenchBoard";

export const metadata: Metadata = {
  title: "Workbench Board – Free Personal Calculator Dashboard | GetFastCalc",
  description: "Drag, resize & combine 100+ free calculators on one screen. Build your trading, FBA, or finance dashboard in seconds — no signup, auto-saved in your browser.",
  keywords: [
    "personal calculator dashboard",
    "drag and drop calculator board",
    "multi tool workspace online",
    "free calculator dashboard",
    "crypto trading dashboard free",
    "fba seller dashboard",
    "online tool organizer",
    "combine calculators online",
    "quant trading tools dashboard",
    "workbench board",
  ],
  alternates: { canonical: "https://getfastcalc.com/workbench/board" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Workbench Board – GetFastCalc",
  "description": "Build your personal dashboard with draggable calculator cards. Combine FBA, math, health, and finance tools on one screen.",
  "url": "https://www.getfastcalc.com/workbench/board",
};

export default function WorkbenchBoardPage() {
  const allTools = mergeWithRegistry(registryToToolMetas());
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header allTools={allTools} />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <Suspense fallback={
            <div className="p-10 text-center text-sm text-gray-400">
              Loading your workbench…
            </div>
          }>
            <WorkbenchBoard allTools={allTools} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
