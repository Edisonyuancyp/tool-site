"use client";
import { useState } from "react";
import Link from "next/link";
import type { ToolMeta } from "@/lib/tools";
import { getToolPath } from "@/lib/tools";
import { useWorkbench } from "@/lib/WorkbenchContext";

function ToolCard({ tool }: { tool: ToolMeta }) {
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
          <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
            {tool.category}
          </span>
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
  const categories = [...new Set(tools.map((t) => t.category))];
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = activeCategory
    ? tools.filter((t) => t.category === activeCategory)
    : tools;

  return (
    <>
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
          <ToolCard key={tool.slug} tool={tool} />
        ))}
      </div>
    </>
  );
}
