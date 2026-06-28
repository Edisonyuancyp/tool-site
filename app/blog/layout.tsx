import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { mergeWithRegistry } from "@/lib/tools";
import { registryToToolMetas } from "@/lib/registry";

export const metadata: Metadata = {
  title: { default: "Blog – Quant Tools, Crypto Charts & Calculator Guides | GetFastCalc", template: "%s | GetFastCalc Blog" },
  description: "Free guides on crypto trading tools, quantitative analysis calculators, position sizing, Sharpe ratio, and building your personal calculator dashboard.",
  alternates: { canonical: "https://getfastcalc.com/blog" },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  const allTools = mergeWithRegistry(registryToToolMetas());
  return (
    <>
      <Header allTools={allTools} />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
