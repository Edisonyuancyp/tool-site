import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "How to Use Your Workbench – GetFastCalc",
  description: "Learn how to build your personal tool workbench: save favorites, create collections, install starter kits, and access your tools in one place.",
};

const steps = [
  {
    num: "01",
    emoji: "♥",
    title: "Save any tool as a favorite",
    body: "On any calculator page, click the ♥ heart button in the top-right corner of the tool card. Saved tools appear instantly in your Workbench under \"Saved Tools\".",
    tip: "Tip: You can save as many tools as you like — there's no limit.",
  },
  {
    num: "02",
    emoji: "📁",
    title: "Create a collection",
    body: "Go to your Workbench (/workbench) and click \"+ New collection\". Give it a name and emoji — for example 📦 FBA Seller Kit. Collections let you group related tools so you can open all of them in one place.",
    tip: "Tip: Use one collection per workflow — e.g. one for FBA selling, one for fitness tracking.",
  },
  {
    num: "03",
    emoji: "⚡",
    title: "Install a starter collection",
    body: "Not sure where to start? On the Workbench page, click \"Install\" next to any starter collection. The FBA Seller Kit comes pre-loaded with 6 tools every Amazon seller needs daily.",
    tip: "Tip: You can install multiple starter kits and then customize each one.",
  },
  {
    num: "04",
    emoji: "🔍",
    title: "Add tools to a collection",
    body: "Inside any collection panel, click \"+ Add tools\" to open a search box. Type the name of any calculator and click Add. The tool appears in your collection immediately.",
    tip: "Tip: Hover over any tool in a collection and click × to remove it without deleting the collection.",
  },
  {
    num: "05",
    emoji: "✏️",
    title: "Rename and customize",
    body: "Click \"Rename\" on any collection to change its name or emoji. This keeps your workbench organized as your needs change.",
    tip: "Tip: Use descriptive emojis like 🇬🇧 for UK-specific tools or 📊 for analytics.",
  },
  {
    num: "06",
    emoji: "🕐",
    title: "Recently visited tools",
    body: "Your last 10 visited tools are automatically tracked in the \"Recently Visited\" section. This makes it fast to return to any tool you used today without searching for it again.",
    tip: "Tip: Click the ♥ button next to any recent tool to save it permanently.",
  },
];

const faqs = [
  {
    q: "Is my workbench saved to an account?",
    a: "No — everything is stored in your browser's localStorage. There's no account required. Your data stays private and never leaves your device.",
  },
  {
    q: "What happens if I clear my browser data?",
    a: "Your workbench data will be cleared along with it. We recommend taking a screenshot of your collections or noting the tool names if you need to preserve them.",
  },
  {
    q: "Can I use the workbench on multiple devices?",
    a: "Not automatically — since data is stored locally. Each browser/device has its own workbench. You can rebuild collections on other devices using the starter kits.",
  },
  {
    q: "How many tools can I add to a collection?",
    a: "There's no hard limit. For best usability, we suggest keeping collections to 8–12 tools so everything fits on screen without scrolling.",
  },
];

export default function WorkbenchGuidePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-12">

          {/* Hero */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full mb-4">
              📖 Getting Started Guide
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Build your personal tool workbench</h1>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Stop searching for calculators every time. Group the tools you use most into collections, access them in one click, and build a workflow that fits how you work.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link href="/workbench"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm">
                Open My Workbench →
              </Link>
              <Link href="/"
                className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl transition-colors">
                Browse all tools
              </Link>
            </div>
          </div>

          {/* Use case callout */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-12 flex gap-4">
            <span className="text-2xl shrink-0">📦</span>
            <div>
              <p className="font-semibold text-amber-900 mb-1">FBA Sellers: install the FBA Seller Kit</p>
              <p className="text-sm text-amber-800">
                We've pre-built a collection of 6 tools every Amazon FBA seller uses daily — profit calculator, fee calculator, ACoS calculator, reorder planner, import duty, and packing calculator.
                Install it in one click from your Workbench.
              </p>
              <Link href="/workbench" className="inline-block mt-2 text-xs font-medium text-amber-700 underline underline-offset-2">
                Go install it now →
              </Link>
            </div>
          </div>

          {/* Steps */}
          <div className="space-y-8 mb-16">
            <h2 className="text-2xl font-bold text-gray-900">Step-by-step guide</h2>
            {steps.map(step => (
              <div key={step.num} className="flex gap-5">
                <div className="shrink-0 w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center text-sm font-bold">
                  {step.num}
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-semibold text-gray-900 mb-1.5">
                    <span className="mr-2">{step.emoji}</span>{step.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{step.body}</p>
                  <p className="text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">{step.tip}</p>
                </div>
              </div>
            ))}
          </div>

          {/* FBA workflow example */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-16">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Example: FBA seller daily workflow</h2>
            <p className="text-sm text-gray-600 mb-4">Here's how a typical Amazon FBA seller would use their workbench in the morning:</p>
            <ol className="space-y-3">
              {[
                ["Check inventory levels", "Open FBA Reorder Calculator → enter current stock and daily sales → see if you need to reorder today"],
                ["Price a new product", "Open FBA Profit Calculator → enter COGS, price, size tier → check if margin is above 20%"],
                ["Review ad campaigns", "Open Amazon ACoS Calculator → enter yesterday's ad spend and revenue → see if campaigns are profitable"],
                ["Calculate import costs", "Open Import Duty Calculator → enter cargo value and origin → know exact landed cost before placing PO"],
                ["Plan shipment boxes", "Open FBA Packing Calculator → add products → generate packing list for your 3PL"],
              ].map(([title, desc], i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="shrink-0 w-5 h-5 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">{i+1}</span>
                  <div>
                    <span className="font-medium text-gray-900">{title}: </span>
                    <span className="text-gray-500">{desc}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* FAQ */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently asked questions</h2>
            <div className="space-y-4">
              {faqs.map(({ q, a }) => (
                <div key={q} className="border border-gray-100 rounded-xl p-4">
                  <p className="font-semibold text-gray-900 mb-1.5">{q}</p>
                  <p className="text-sm text-gray-600">{a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center border-t border-gray-100 pt-10">
            <p className="text-gray-500 mb-4">Ready to set up your workbench?</p>
            <Link href="/workbench"
              className="inline-block bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
              🗂️ Open My Workbench
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
