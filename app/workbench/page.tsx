import type { Metadata } from "next";
import { mergeWithRegistry } from "@/lib/tools";
import { registryToToolMetas } from "@/lib/registry";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WorkbenchFull from "@/components/WorkbenchFull";

export const metadata: Metadata = {
  title: "My Workbench – Organize & Save Your Favorite Calculators | GetFastCalc",
  description: "Build a personal tool workbench on GetFastCalc. Save calculators, create custom collections like the FBA Seller Kit, and access 100+ tools in one place — no signup required.",
  keywords: [
    "online calculator workbench",
    "save favorite calculators",
    "fba seller tools dashboard",
    "amazon fba calculator kit",
    "personal tool collection",
    "calculator workspace",
  ],
  openGraph: {
    title: "My Workbench – GetFastCalc",
    description: "Save your favorite calculators and build custom tool collections. FBA Seller Kit, Health & Fitness kit, and more — all in one place.",
    url: "https://www.getfastcalc.com/workbench",
    siteName: "GetFastCalc",
    type: "website",
  },
  alternates: { canonical: "https://www.getfastcalc.com/workbench" },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "My Workbench – GetFastCalc",
  "description": "Build a personal tool workbench. Save calculators, create custom collections like the FBA Seller Kit, and access 100+ tools in one place.",
  "url": "https://www.getfastcalc.com/workbench",
  "isPartOf": { "@type": "WebSite", "url": "https://www.getfastcalc.com", "name": "GetFastCalc" },
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.getfastcalc.com" },
      { "@type": "ListItem", "position": 2, "name": "Workbench", "item": "https://www.getfastcalc.com/workbench" },
    ],
  },
};

export default function WorkbenchPage() {
  const allTools = mergeWithRegistry(registryToToolMetas());
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header allTools={allTools} />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <WorkbenchFull allTools={allTools} />
        </div>
      </main>
      <Footer />
    </>
  );
}
