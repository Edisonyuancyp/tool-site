"use client";
import Link from "next/link";
import { useFavorites } from "@/components/FavoriteButton";
import type { ToolMeta } from "@/lib/tools";
import { getToolPath } from "@/lib/tools";

export default function FavoritesSection({ allTools }: { allTools: ToolMeta[] }) {
  const { favs, toggle } = useFavorites();

  const favTools = favs
    .map((slug) => allTools.find((t) => t.slug === slug))
    .filter((t): t is ToolMeta => !!t);

  if (favTools.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-500">
          <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
        </svg>
        <h2 className="text-lg font-bold text-gray-900">Your Saved Tools</h2>
        <span className="text-xs text-gray-400 font-medium ml-1">({favTools.length})</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {favTools.map((tool) => (
          <div key={tool.slug} className="group relative flex items-center gap-3 p-4 border border-red-100 rounded-xl bg-red-50 hover:border-red-200 hover:bg-red-50 transition-all">
            <Link href={getToolPath(tool)} className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-2xl shrink-0">{tool.icon}</span>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{tool.name}</p>
                <p className="text-xs text-gray-400 truncate">{tool.tagline}</p>
              </div>
            </Link>
            <button
              onClick={() => toggle(tool.slug)}
              aria-label="Remove from favorites"
              className="shrink-0 text-red-300 hover:text-red-500 transition-colors p-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
