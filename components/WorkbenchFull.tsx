"use client";
import { useState, useCallback } from "react";
import Link from "next/link";
import { useWorkbench } from "@/lib/WorkbenchContext";
import type { ToolCollection } from "@/lib/WorkbenchContext";
import type { ToolMeta } from "@/lib/tools";
import { getToolPath } from "@/lib/tools";
import WorkbenchTour from "@/components/WorkbenchTour";

// ── Preset collections that users can install with one click ──────────────────
const PRESETS = [
  {
    name: "FBA Seller Kit",
    emoji: "📦",
    slugs: ["fba-profit-calculator", "fba-fee-calculator", "amazon-acos-calculator",
            "fba-reorder-calculator", "fba-packing-calculator", "import-duty-calculator"],
    desc: "6 tools every Amazon FBA seller uses daily",
  },
  {
    name: "Health & Fitness",
    emoji: "💪",
    slugs: ["bmi-calculator", "body-fat-calculator", "ideal-weight-calculator",
            "calorie-calculator", "water-intake-calculator"],
    desc: "Track your body stats and fitness goals",
  },
  {
    name: "Finance & Money",
    emoji: "💰",
    slugs: ["compound-interest-calculator", "percentage-calculator", "tip-calculator",
            "currency-converter", "loan-calculator"],
    desc: "Everyday financial calculations",
  },
];

// ── Utility ───────────────────────────────────────────────────────────────────
function timeAgo(ms: number): string {
  const diff  = Date.now() - ms;
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return "just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

// ── Collection Card ───────────────────────────────────────────────────────────
function CollectionPanel({
  col, allTools, onDelete, onRename, onRemoveTool, onAddTool,
}: {
  col: ToolCollection;
  allTools: ToolMeta[];
  onDelete: () => void;
  onRename: (name: string, emoji: string) => void;
  onRemoveTool: (slug: string) => void;
  onAddTool: (slug: string) => void;
}) {
  const [editing,  setEditing]  = useState(false);
  const [nameVal,  setNameVal]  = useState(col.name);
  const [emojiVal, setEmojiVal] = useState(col.emoji);
  const [search,   setSearch]   = useState("");
  const [showAdd,  setShowAdd]  = useState(false);

  const colTools = col.slugs
    .map(s => allTools.find(t => t.slug === s))
    .filter((t): t is ToolMeta => !!t);

  const searchResults = search.trim().length > 1
    ? allTools.filter(t =>
        !col.slugs.includes(t.slug) &&
        (t.name.toLowerCase().includes(search.toLowerCase()) ||
         t.tagline.toLowerCase().includes(search.toLowerCase()))
      ).slice(0, 6)
    : [];

  const saveRename = () => {
    onRename(nameVal.trim() || col.name, emojiVal.trim() || col.emoji);
    setEditing(false);
  };

  return (
    <div className="border border-gray-200 rounded-2xl bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
        {editing ? (
          <div className="flex items-center gap-2 flex-1">
            <input value={emojiVal} onChange={e => setEmojiVal(e.target.value)}
              className="w-10 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center" maxLength={2} />
            <input value={nameVal} onChange={e => setNameVal(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-2 py-1 text-sm" />
            <button onClick={saveRename}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded">Save</button>
            <button onClick={() => setEditing(false)}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded">Cancel</button>
          </div>
        ) : (
          <>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <span>{col.emoji}</span>{col.name}
              <span className="text-xs font-normal text-gray-400">({colTools.length})</span>
            </h3>
            <div className="flex items-center gap-1">
              <button onClick={() => setEditing(true)}
                className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors">
                Rename
              </button>
              <button onClick={onDelete}
                className="text-xs text-gray-300 hover:text-red-500 px-2 py-1 rounded hover:bg-red-50 transition-colors">
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      {/* Tools grid */}
      <div className="p-3">
        {colTools.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No tools yet — search below to add</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            {colTools.map(tool => (
              <div key={tool.slug}
                className="flex items-center gap-2 p-2.5 border border-gray-100 rounded-xl hover:border-gray-200 bg-gray-50 group">
                <Link href={getToolPath(tool)} className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-base shrink-0">{tool.icon}</span>
                  <span className="text-xs font-medium text-gray-800 truncate">{tool.name}</span>
                </Link>
                <button onClick={() => onRemoveTool(tool.slug)}
                  className="shrink-0 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 text-sm">×</button>
              </div>
            ))}
          </div>
        )}

        {/* Add tool toggle */}
        <button onClick={() => setShowAdd(v => !v)}
          className="w-full mt-1 text-xs text-blue-600 hover:text-blue-800 border border-dashed border-blue-200 hover:border-blue-400 rounded-xl py-2 transition-colors">
          {showAdd ? "▲ Close search" : "+ Add tools"}
        </button>

        {showAdd && (
          <div className="mt-2 space-y-2">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tools to add…"
              autoFocus
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchResults.length > 0 && (
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                {searchResults.map(t => (
                  <button key={t.slug} onClick={() => { onAddTool(t.slug); setSearch(""); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-blue-50 text-left transition-colors border-b border-gray-50 last:border-0">
                    <span className="text-base">{t.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{t.name}</p>
                      <p className="text-xs text-gray-400 truncate">{t.tagline}</p>
                    </div>
                    <span className="shrink-0 ml-auto text-blue-500 text-xs font-medium">Add</span>
                  </button>
                ))}
              </div>
            )}
            {search.trim().length > 1 && searchResults.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-2">No matching tools found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function WorkbenchFull({ allTools }: { allTools: ToolMeta[] }) {
  const {
    favorites, recents, isFav, toggleFav, clearRecents,
    collections, createCollection, deleteCollection, renameCollection,
    addToCollection, removeFromCollection,
  } = useWorkbench();

  const [newColName,  setNewColName]  = useState("");
  const [newColEmoji, setNewColEmoji] = useState("🗂️");
  const [showCreate,  setShowCreate]  = useState(false);

  const favTools = favorites
    .map(s => allTools.find(t => t.slug === s))
    .filter((t): t is ToolMeta => !!t);

  const recentEntries = recents
    .map(r => ({ tool: allTools.find(t => t.slug === r.slug), visitedAt: r.visitedAt }))
    .filter((e): e is { tool: ToolMeta; visitedAt: number } => !!e.tool);

  const handleCreateCollection = useCallback(() => {
    if (!newColName.trim()) return;
    createCollection(newColName.trim(), newColEmoji);
    setNewColName("");
    setNewColEmoji("🗂️");
    setShowCreate(false);
  }, [newColName, newColEmoji, createCollection]);

  const installPreset = useCallback((preset: typeof PRESETS[0]) => {
    const existingNames = collections.map(c => c.name);
    if (existingNames.includes(preset.name)) return;
    createCollection(preset.name, preset.emoji, preset.slugs);
  }, [collections, createCollection]);

  return (
    <div className="space-y-10">
      <WorkbenchTour />
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">🗂️ My Workbench</h1>
          <p className="text-gray-500 text-sm">Saved tools, collections, and recent activity — stored privately in your browser.</p>
        </div>
        <Link href="/workbench/guide"
          className="shrink-0 text-xs text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 px-3 py-1.5 rounded-lg transition-colors font-medium">
          📖 How to use
        </Link>
      </div>

      {/* ── Collections ── */}
      <section data-tour="collections-section">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            📁 My Collections
            <span className="text-sm font-normal text-gray-400">({collections.length})</span>
          </h2>
          <button data-tour="new-collection-btn" onClick={() => setShowCreate(v => !v)}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 px-3 py-1.5 rounded-lg transition-colors">
            + New collection
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="mb-4 p-4 border border-blue-100 bg-blue-50 rounded-xl flex flex-wrap items-center gap-2">
            <input value={newColEmoji} onChange={e => setNewColEmoji(e.target.value)}
              className="w-10 border border-gray-200 rounded-lg px-2 py-2 text-sm text-center bg-white" maxLength={2} />
            <input value={newColName} onChange={e => setNewColName(e.target.value)}
              placeholder="Collection name (e.g. FBA Seller Kit)"
              onKeyDown={e => e.key === "Enter" && handleCreateCollection()}
              className="flex-1 min-w-40 border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button onClick={handleCreateCollection} disabled={!newColName.trim()}
              className="text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white px-4 py-2 rounded-lg transition-colors">
              Create
            </button>
            <button onClick={() => setShowCreate(false)}
              className="text-sm text-gray-400 hover:text-gray-600 px-3 py-2 rounded-lg">
              Cancel
            </button>
          </div>
        )}

        {/* Preset banners */}
        {collections.length === 0 && (
          <div className="mb-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Starter collections — install in one click</p>
            {PRESETS.map((preset, idx) => (
              <div key={preset.name}
                {...(idx === 0 ? { "data-tour": "install-preset" } : {})}
                className="flex items-center justify-between p-3 border border-dashed border-gray-200 rounded-xl bg-gray-50 hover:border-gray-300 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{preset.emoji}</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{preset.name}</p>
                    <p className="text-xs text-gray-400">{preset.desc}</p>
                  </div>
                </div>
                <button onClick={() => installPreset(preset)}
                  className="shrink-0 text-xs font-medium text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-300 px-3 py-1.5 rounded-lg transition-colors">
                  Install
                </button>
              </div>
            ))}
          </div>
        )}

        {/* User collections */}
        {collections.length > 0 ? (
          <div className="space-y-4">
            {collections.map(col => (
              <CollectionPanel
                key={col.id}
                col={col}
                allTools={allTools}
                onDelete={() => deleteCollection(col.id)}
                onRename={(name, emoji) => renameCollection(col.id, name, emoji)}
                onRemoveTool={(slug) => removeFromCollection(col.id, slug)}
                onAddTool={(slug) => addToCollection(col.id, slug)}
              />
            ))}
            {/* Show preset install after first collection exists */}
            <div className="border border-dashed border-gray-200 rounded-2xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">More starter collections</p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.filter(p => !collections.find(c => c.name === p.name)).map(preset => (
                  <button key={preset.name} onClick={() => installPreset(preset)}
                    className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-blue-700 border border-gray-200 hover:border-blue-300 bg-white px-3 py-1.5 rounded-lg transition-colors">
                    <span>{preset.emoji}</span>{preset.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-6 text-center border border-dashed border-gray-200 rounded-xl">
            No collections yet — install a starter above or create your own.
          </p>
        )}
      </section>

      {/* ── Favorites ── */}
      <section data-tour="favorites-section">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-red-500">♥</span> Saved Tools
          <span className="text-sm font-normal text-gray-400">({favTools.length})</span>
        </h2>
        {favTools.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center border border-dashed border-gray-200 rounded-xl">
            No saved tools yet — click ♥ on any tool page to save it here.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {favTools.map(tool => (
              <div key={tool.slug}
                className="flex items-center gap-3 p-3.5 border border-red-100 bg-red-50 rounded-xl hover:border-red-200 transition-all group">
                <Link href={getToolPath(tool)} className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-xl shrink-0">{tool.icon}</span>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{tool.name}</p>
                    <p className="text-xs text-gray-400 truncate">{tool.tagline}</p>
                  </div>
                </Link>
                <button onClick={() => toggleFav(tool.slug)} aria-label="Remove"
                  className="shrink-0 text-red-400 hover:text-red-600 transition-colors">
                  <HeartIcon filled />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Recents ── */}
      <section data-tour="recents-section">
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
                <Link href={getToolPath(tool)} className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-xl shrink-0">{tool.icon}</span>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{tool.name}</p>
                    <p className="text-xs text-gray-400">{timeAgo(visitedAt)}</p>
                  </div>
                </Link>
                <button onClick={() => toggleFav(tool.slug)}
                  aria-label={isFav(tool.slug) ? "Unsave" : "Save"}
                  className={`shrink-0 p-1.5 rounded-lg border transition-all ${
                    isFav(tool.slug)
                      ? "border-red-200 text-red-500 bg-red-50"
                      : "border-gray-200 text-gray-300 hover:border-red-300 hover:text-red-400"
                  }`}>
                  <HeartIcon filled={isFav(tool.slug)} />
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
