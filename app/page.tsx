"use client";
import { useState } from "react";
import Link from "next/link";
import { tools } from "@/lib/tools";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomeSchema from "@/components/HomeSchema";

const categories = [...new Set(tools.map((t) => t.category))];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? tools.filter((t) => t.category === activeCategory)
    : tools;

  return (
    <>
      <HomeSchema />
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

          {/* Category filter */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                className={
                  "px-4 py-2 rounded-full text-sm font-medium border transition-all " +
                  (activeCategory === null
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900")
                }
              >
                All ({tools.length})
              </button>
              {categories.map((cat) => {
                const count = tools.filter((t) => t.category === cat).length;
                const isActive = activeCategory === cat;
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setActiveCategory(isActive ? null : cat)}
                    className={
                      "px-4 py-2 rounded-full text-sm font-medium border transition-all " +
                      (isActive
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900")
                    }
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tool Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="group flex flex-col gap-3 p-5 border border-gray-100 rounded-xl bg-white hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{tool.icon}</span>
                  <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                    {tool.category}
                  </span>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 group-hover:text-black transition-colors">
                    {tool.name}
                  </h2>
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
