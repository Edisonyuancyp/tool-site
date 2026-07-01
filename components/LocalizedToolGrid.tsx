"use client";
import { useState } from "react";
import Link from "next/link";
import type { ToolMeta } from "@/lib/tools";
import { normalizeCategory } from "@/lib/tools";

export default function LocalizedToolGrid({
  tools,
  locale,
  labels,
}: {
  tools: ToolMeta[];
  locale: string;
  labels: { all: string; useTool: string };
}) {
  const normalizedTools = tools.map((t) => ({ ...t, category: normalizeCategory(t.category) }));
  const categories = [...new Set(normalizedTools.map((t) => t.category))];
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const filtered = activeCategory ? normalizedTools.filter((t) => t.category === activeCategory) : normalizedTools;
  const base = `/${locale}/tools`;

  return (
    <>
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
            {labels.all} ({normalizedTools.length})
          </button>
          {categories.map((cat) => {
            const count = normalizedTools.filter((t) => t.category === cat).length;
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((tool) => (
          <Link
            key={tool.slug}
            href={`${base}/${tool.slug}`}
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
              <p className="text-sm text-gray-400 mt-0.5 leading-relaxed">{tool.tagline}</p>
            </div>
            <div className="flex items-center text-xs text-gray-400 group-hover:text-gray-600 transition-colors mt-auto">
              {labels.useTool}
              <svg className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
