"use client";
import Link from "next/link";
import { useWorkbench } from "@/lib/WorkbenchContext";
import type { ToolMeta } from "@/lib/tools";

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return "just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function WorkbenchFull({ allTools }: { allTools: ToolMeta[] }) {
  const { favorites, recents, isFav, toggleFav, clearRecents } = useWorkbench();

  const favTools = favorites
    .map(s => allTools.find(t => t.slug === s))
    .filter((t): t is ToolMeta => !!t);

  const recentEntries = recents
    .map(r => ({ tool: allTools.find(t => t.slug === r.slug), visitedAt: r.visitedAt }))
    .filter((e): e is { tool: ToolMeta; visitedAt: number } => !!e.tool);

  return (
    <div className="space-y-10">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">🗂️ My Workbench</h1>
        <p className="text-gray-500 text-sm">Your saved tools and recent activity — stored privately in your browser.</p>
      </div>

      {/* Favorites */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-red-500">♥</span> Saved Tools
          <span className="text-sm font-normal text-gray-400">({favTools.length})</span>
        </h2>
        {favTools.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center border border-dashed border-gray-200 rounded-xl">
            No saved tools yet — click the ♥ button on any tool page to save it here.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {favTools.map(tool => (
              <div key={tool.slug}
                className="flex items-center gap-3 p-4 border border-red-100 bg-red-50 rounded-xl hover:border-red-200 transition-all">
                <Link href={`/tools/${tool.slug}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl shrink-0">{tool.icon}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{tool.name}</p>
                    <p className="text-xs text-gray-400 truncate">{tool.tagline}</p>
                  </div>
                </Link>
                <button onClick={() => toggleFav(tool.slug)}
                  aria-label="Remove"
                  className="shrink-0 text-red-400 hover:text-red-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recents */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span>🕐</span> Recently Visited
            <span className="text-sm font-normal text-gray-400">({recentEntries.length})</span>
          </h2>
          {recentEntries.length > 0 && (
            <button onClick={clearRecents}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-lg">
              Clear history
            </button>
          )}
        </div>
        {recentEntries.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center border border-dashed border-gray-200 rounded-xl">
            No recent activity yet — visit any tool and it will appear here.
          </p>
        ) : (
          <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
            {recentEntries.map(({ tool, visitedAt }) => (
              <div key={tool.slug} className="flex items-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 transition-colors">
                <Link href={`/tools/${tool.slug}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-xl shrink-0">{tool.icon}</span>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{tool.name}</p>
                    <p className="text-xs text-gray-400">{timeAgo(visitedAt)}</p>
                  </div>
                </Link>
                <button onClick={() => toggleFav(tool.slug)}
                  aria-label={isFav(tool.slug) ? "Unsave" : "Save"}
                  title={isFav(tool.slug) ? "Remove from favorites" : "Save this tool"}
                  className={`shrink-0 p-1.5 rounded-lg border transition-all ${
                    isFav(tool.slug)
                      ? "border-red-200 text-red-500 bg-red-50"
                      : "border-gray-200 text-gray-300 hover:border-red-300 hover:text-red-400"
                  }`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
                    fill={isFav(tool.slug) ? "currentColor" : "none"}
                    stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <p className="text-xs text-gray-300 text-center pt-4 border-t border-gray-100">
        All data is stored locally in your browser. Nothing is sent to any server.
      </p>
    </div>
  );
}
