"use client";
import Link from "next/link";
import { useWorkbench } from "@/lib/WorkbenchContext";
import type { ToolMeta } from "@/lib/tools";

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}
    className="w-3.5 h-3.5">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

function ToolCard({ tool, onUnfav, isFav }: { tool: ToolMeta; onUnfav?: () => void; isFav: boolean }) {
  return (
    <div className="group relative flex items-center gap-3 p-3.5 border border-gray-100 rounded-xl bg-white hover:border-gray-200 hover:shadow-sm transition-all">
      <Link href={`/tools/${tool.slug}`} className="flex items-center gap-3 flex-1 min-w-0">
        <span className="text-xl shrink-0">{tool.icon}</span>
        <div className="min-w-0">
          <p className="font-medium text-gray-900 text-sm truncate">{tool.name}</p>
          <p className="text-xs text-gray-400 truncate">{tool.tagline}</p>
        </div>
      </Link>
      {onUnfav && (
        <button onClick={onUnfav} aria-label="Remove from favorites"
          className="shrink-0 text-red-400 hover:text-red-600 transition-colors p-1">
          <HeartIcon filled={isFav} />
        </button>
      )}
    </div>
  );
}

export default function WorkbenchDashboard({ allTools }: { allTools: ToolMeta[] }) {
  const { favorites, recents, isFav, toggleFav, clearRecents, savedPalettes, deletePalette, savedQuantConfigs, deleteQuantConfig } = useWorkbench();

  const favTools = favorites
    .map(s => allTools.find(t => t.slug === s))
    .filter((t): t is ToolMeta => !!t);

  const recentTools = recents
    .map(r => allTools.find(t => t.slug === r.slug))
    .filter((t): t is ToolMeta => !!t);

  const hasAnything = favTools.length > 0 || recentTools.length > 0 || savedPalettes.length > 0 || savedQuantConfigs.length > 0;

  // New-user onboarding: show featured picks to save
  if (!hasAnything) {
    const featured = allTools
      .filter(t => ["bmi-calculator", "password-generator", "percentage-calculator",
                    "currency-converter", "qr-code-generator", "typography-compare-lab"].includes(t.slug))
      .slice(0, 4);
    if (featured.length === 0) return null;
    return (
      <div className="mb-10 p-4 border border-dashed border-gray-200 rounded-2xl bg-gray-50/60">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-base">♡</span>
          <p className="text-sm font-semibold text-gray-700">Save your favorite tools</p>
          <span className="text-xs text-gray-400">— hover any card and click ♡ to save</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {featured.map(tool => (
            <div key={tool.slug}
              className="group relative flex items-center gap-2 p-2.5 border border-gray-200 rounded-xl bg-white hover:border-gray-300 transition-all">
              <Link href={`/tools/${tool.slug}`} className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-lg shrink-0">{tool.icon}</span>
                <span className="text-xs font-medium text-gray-700 truncate">{tool.name}</span>
              </Link>
              <button onClick={() => toggleFav(tool.slug)}
                aria-label="Save to favorites"
                className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full border border-gray-200 text-gray-300 hover:text-red-400 hover:border-red-200 hover:bg-red-50 transition-all">
                <HeartIcon filled={false} />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10 space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <span>🗂️</span> Your Workbench
        </h2>
        <Link href="/workbench"
          className="text-xs text-gray-400 hover:text-gray-700 transition-colors underline underline-offset-2">
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Favorites */}
        {favTools.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <span className="text-red-500">♥</span> Saved ({favTools.length})
            </p>
            <div className="space-y-2">
              {favTools.map(tool => (
                <ToolCard key={tool.slug} tool={tool}
                  isFav={isFav(tool.slug)}
                  onUnfav={() => toggleFav(tool.slug)} />
              ))}
            </div>
          </div>
        )}

        {/* Recents */}
        {recentTools.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                <span>🕐</span> Recently Visited
              </p>
              <button onClick={clearRecents}
                className="text-xs text-gray-300 hover:text-gray-500 transition-colors">
                Clear
              </button>
            </div>
            <div className="space-y-2">
              {recentTools.slice(0, 5).map(tool => (
                <ToolCard key={tool.slug} tool={tool}
                  isFav={isFav(tool.slug)} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Saved Palettes */}
      {savedPalettes.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <span>🎨</span> Saved Palettes ({savedPalettes.length})
            </p>
            <Link href="/tools/color-palette-explorer" className="text-xs text-gray-400 hover:text-gray-700 transition-colors underline underline-offset-2">
              Open ColorLab →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {savedPalettes.map(p => (
              <div key={p.id} className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="flex h-8">
                  {p.colors.slice(0, 6).map((c, i) => (
                    <div key={i} className="w-5 h-8" style={{ backgroundColor: c.hex }} />
                  ))}
                </div>
                <span className="px-2 text-xs text-gray-700 font-medium max-w-[100px] truncate">{p.name}</span>
                <button onClick={() => deletePalette(p.id)}
                  className="px-2 text-gray-300 hover:text-red-500 transition-colors border-l border-gray-100 h-8 text-sm"
                  aria-label="Remove palette">×</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Saved Quant Configs */}
      {savedQuantConfigs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <span>📐</span> Quant Configs ({savedQuantConfigs.length})
            </p>
            <Link href="/tools/risk-calculator" className="text-xs text-gray-400 hover:text-gray-700 transition-colors underline underline-offset-2">
              Open Calculator →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {savedQuantConfigs.map(c => (
              <div key={c.id} className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
                <Link
                  href={`/tools/risk-calculator?${new URLSearchParams(c.params).toString()}`}
                  className="px-3 py-1.5 text-xs text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors font-medium">
                  {c.label}
                </Link>
                <button onClick={() => deleteQuantConfig(c.id)}
                  className="px-1.5 py-1.5 text-gray-300 hover:text-red-500 transition-colors text-sm border-l border-gray-100"
                  aria-label="Remove config">×</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
