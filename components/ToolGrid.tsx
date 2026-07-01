"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import type { ToolMeta } from "@/lib/tools";
import { getToolPath, normalizeCategory } from "@/lib/tools";
import { useWorkbench } from "@/lib/WorkbenchContext";

function ToolCard({ tool, showCategory = false }: { tool: ToolMeta; showCategory?: boolean }) {
  const { isFav, toggleFav } = useWorkbench();
  const faved = isFav(tool.slug);

  return (
    <div className="group relative flex flex-col gap-3 p-5 border border-gray-100 rounded-xl bg-white hover:border-gray-300 hover:shadow-sm transition-all">
      {/* Favorite button — visible on hover or when saved */}
      <button
        onClick={(e) => { e.preventDefault(); toggleFav(tool.slug); }}
        aria-label={faved ? "Remove from favorites" : "Save to favorites"}
        title={faved ? "Remove from favorites" : "Save to favorites"}
        className={`absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full border transition-all
          ${faved
            ? "border-red-200 bg-red-50 text-red-500"
            : "border-transparent bg-transparent text-gray-200 opacity-0 group-hover:opacity-100 group-hover:border-gray-200 group-hover:bg-white group-hover:text-gray-400 hover:!text-red-400 hover:!border-red-200 hover:!bg-red-50"
          }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
          fill={faved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}
          className="w-3.5 h-3.5">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
      </button>

      <Link href={getToolPath(tool)} className="flex flex-col gap-3 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-2xl">{tool.icon}</span>
          {showCategory && (
            <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
              {tool.category}
            </span>
          )}
        </div>
        <div>
          <h2 className="font-semibold text-gray-900 group-hover:text-black transition-colors pr-6">
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
    </div>
  );
}

export default function ToolGrid({ tools }: { tools: ToolMeta[] }) {
  const normalizedTools = tools.map((t) => ({ ...t, category: normalizeCategory(t.category) }));
  const categories = [...new Set(normalizedTools.map((t) => t.category))];
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // Listen for search queries fired by HeroSearch
  useEffect(() => {
    const handler = (e: Event) => {
      const q = (e as CustomEvent<string>).detail;
      setQuery(q);
      setActiveCategory(null);
    };
    window.addEventListener("hero-search", handler);
    return () => window.removeEventListener("hero-search", handler);
  }, []);

  const q = query.trim().toLowerCase();

  return (
    <div id="tool-grid">
      {/* Search bar — inside grid for direct filtering */}
      <div className="relative mb-6">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={e => { setQuery(e.target.value); setActiveCategory(null); }}
          placeholder={`Search ${tools.length} tools…`}
          className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
            aria-label="Clear search"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Category filter pills — hidden during search */}
      {!q && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setActiveCategory(null)}
              className={"px-4 py-2 rounded-full text-sm font-medium border transition-all " +
                (activeCategory === null
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900")}>
              All ({normalizedTools.length})
            </button>
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button type="button" key={cat}
                  onClick={() => setActiveCategory(isActive ? null : cat)}
                  className={"px-4 py-2 rounded-full text-sm font-medium border transition-all " +
                    (isActive
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900")}>
                  {cat} ({normalizedTools.filter(t => t.category === cat).length})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── SEARCH results (flat, with category badge) ── */}
      {q && (() => {
        const results = normalizedTools.filter(t =>
          t.name.toLowerCase().includes(q) ||
          (t.tagline ?? "").toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
        );
        return results.length > 0 ? (
          <>
            <p className="text-sm text-gray-400 mb-4">
              {results.length} result{results.length === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map(tool => <ToolCard key={tool.slug} tool={tool} showCategory />)}
            </div>
          </>
        ) : (
          <div className="py-16 text-center">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-500 font-medium">No tools match &ldquo;{query}&rdquo;</p>
            <p className="text-sm text-gray-400 mt-1">Try a different keyword or browse by category</p>
            <button onClick={() => setQuery("")} className="mt-4 text-sm text-gray-600 underline hover:text-gray-900">Clear search</button>
          </div>
        );
      })()}

      {/* ── FILTERED by single category (flat, no badge) ── */}
      {!q && activeCategory && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {normalizedTools.filter(t => t.category === activeCategory).map(tool => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      )}

      {/* ── DEFAULT grouped by category (section headings, no badge) ── */}
      {!q && !activeCategory && (
        <div className="space-y-12">
          {categories.map(cat => {
            const catTools = normalizedTools.filter(t => t.category === cat);
            return (
              <section key={cat}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-5 bg-gray-300 rounded-full" />
                  <h2 className="text-base font-semibold text-gray-700">{cat}</h2>
                  <span className="text-xs text-gray-400">{catTools.length} tools</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catTools.map(tool => <ToolCard key={tool.slug} tool={tool} />)}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
