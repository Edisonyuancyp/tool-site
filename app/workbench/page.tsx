import type { Metadata } from "next";
import { mergeWithRegistry } from "@/lib/tools";
import { registryToToolMetas } from "@/lib/registry";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WorkbenchFull from "@/components/WorkbenchFull";

export const metadata: Metadata = {
  title: "My Workbench – GetFastCalc",
  description: "Your personal tool workbench: saved tools and recently visited calculators.",
  robots: { index: false, follow: false },
};

export default function WorkbenchPage() {
  const allTools = mergeWithRegistry(registryToToolMetas());
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <WorkbenchFull allTools={allTools} />
        </div>
      </main>
      <Footer />
    </>
  );
}
