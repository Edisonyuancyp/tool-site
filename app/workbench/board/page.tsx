import type { Metadata } from "next";
import { mergeWithRegistry } from "@/lib/tools";
import { registryToToolMetas } from "@/lib/registry";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WorkbenchBoard from "@/components/WorkbenchBoard";

export const metadata: Metadata = {
  title: "Workbench Board – Drag & Drop Multi-Tool Dashboard | GetFastCalc",
  description: "Build your personal dashboard with draggable calculator cards. Combine FBA, math, health, and finance tools on one screen and arrange them your way.",
  keywords: [
    "calculator dashboard",
    "drag and drop tools",
    "fba seller dashboard",
    "multi calculator workspace",
    "personal tool board",
  ],
  alternates: { canonical: "https://www.getfastcalc.com/workbench/board" },
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
          <WorkbenchBoard allTools={allTools} />
        </div>
      </main>
      <Footer />
    </>
  );
}
