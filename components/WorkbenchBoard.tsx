"use client";
import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useWorkbench, type BoardWidgetSize } from "@/lib/WorkbenchContext";
import type { ToolMeta } from "@/lib/tools";
import { getToolPath } from "@/lib/tools";
import ToolWidget from "@/components/ToolWidget";

const PRESET_BOARDS = [
  {
    name: "FBA Seller Dashboard",
    emoji: "📦",
    slugs: [
      "fba-profit-calculator",
      "fba-fee-calculator",
      "amazon-acos-calculator",
      "fba-reorder-calculator",
      "import-duty-calculator",
    ],
    sizes: ["large", "medium", "medium", "medium", "medium"] as BoardWidgetSize[],
  },
  {
    name: "Quick Math",
    emoji: "🧮",
    slugs: ["percentage-calculator", "tip-calculator", "compound-interest-calculator", "currency-converter"],
    sizes: ["medium", "small", "medium", "small"] as BoardWidgetSize[],
  },
  {
    name: "Health Tracker",
    emoji: "💪",
    slugs: ["bmi-calculator", "body-fat-calculator", "water-intake-calculator", "bmr-tdee-calculator"],
    sizes: ["medium", "medium", "small", "small"] as BoardWidgetSize[],
  },
];

function sizeClasses(size: BoardWidgetSize): string {
  switch (size) {
    case "small":  return "col-span-1 row-span-1";
    case "medium": return "col-span-1 md:col-span-2 row-span-1";
    case "large":  return "col-span-1 md:col-span-2 lg:col-span-3 row-span-1";
    default: return "col-span-1 md:col-span-2";
  }
}

export default function WorkbenchBoard({ allTools }: { allTools: ToolMeta[] }) {
  const {
    boardWidgets, addBoardWidget, removeBoardWidget, reorderBoardWidgets,
    resizeBoardWidget, resetBoard,
  } = useWorkbench();

  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const dragIdx = useRef<number | null>(null);

  const toolBySlug = (slug: string) => allTools.find((t) => t.slug === slug);

  const filteredTools = search.trim().length > 1
    ? allTools.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.tagline.toLowerCase().includes(search.toLowerCase())
      ).slice(0, 10)
    : allTools.slice(0, 8);

  const handleDragStart = useCallback((id: string, index: number) => (e: React.DragEvent) => {
    setDraggingId(id);
    dragIdx.current = index;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  }, []);

  const handleDragOver = useCallback((id: string, index: number) => (e: React.DragEvent) => {
    e.preventDefault();
    if (draggingId && draggingId !== id) setDragOverId(id);
  }, [draggingId]);

  const handleDrop = useCallback((toIndex: number) => (e: React.DragEvent) => {
    e.preventDefault();
    const fromIndex = dragIdx.current;
    if (fromIndex !== null && fromIndex !== toIndex) {
      reorderBoardWidgets(fromIndex, toIndex);
    }
    setDraggingId(null);
    setDragOverId(null);
    dragIdx.current = null;
  }, [reorderBoardWidgets]);

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    setDragOverId(null);
    dragIdx.current = null;
  }, []);

  const installPreset = useCallback((preset: typeof PRESET_BOARDS[0]) => {
    resetBoard([]);
    const widgets = preset.slugs.map((slug, i) => ({
      id: Math.random().toString(36).slice(2, 10),
      slug,
      size: preset.sizes[i] ?? "medium" as BoardWidgetSize,
      createdAt: Date.now() + i,
    }));
    // Insert via addBoardWidget isn't ideal for batch; manually reset + set
    resetBoard([]);
    // We need to bypass resetBoard with sizes, so we directly manipulate the state setter
    // But we don't have setBoardWidgets exposed. Better: addBoardWidget one by one, then resize.
    widgets.forEach((w, i) => {
      setTimeout(() => {
        addBoardWidget(w.slug, w.size);
      }, i * 10);
    });
  }, [addBoardWidget, resetBoard]);

  // Better batch replacement: expose via resetBoard doesn't accept sizes. We'll use addBoardWidget sequentially.
  const installPresetBatch = useCallback((preset: typeof PRESET_BOARDS[0]) => {
    // clear existing first
    resetBoard([]);
    // We need to add with sizes. resetBoard doesn't support sizes. We'll add and resize immediately.
    preset.slugs.forEach((slug, i) => {
      const size = preset.sizes[i] ?? "medium";
      addBoardWidget(slug, size);
    });
  }, [addBoardWidget, resetBoard]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">🧩 Workbench Board</h1>
          <p className="text-gray-500 text-sm">Drag cards to arrange your workspace. Add, resize, or remove tools to build your own dashboard.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowAdd((v) => !v)}
            className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            + Add tool
          </button>
          {boardWidgets.length > 0 && (
            <button
              onClick={() => resetBoard([])}
              className="text-sm text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-200 px-3 py-2 rounded-lg transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Add tool panel */}
      {showAdd && (
        <div className="border border-blue-100 bg-blue-50 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">Add a tool to your board</p>
            <button onClick={() => setShowAdd(false)} className="text-xs text-gray-400 hover:text-gray-600">Close</button>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
            {filteredTools.map((tool) => (
              <button
                key={tool.slug}
                onClick={() => { addBoardWidget(tool.slug, "medium"); setSearch(""); }}
                className="flex items-center gap-2 text-left p-2.5 border border-gray-200 bg-white rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <span className="text-lg shrink-0">{tool.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{tool.name}</p>
                  <p className="text-xs text-gray-400 truncate">{tool.tagline}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state with presets */}
      {boardWidgets.length === 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400 py-6 text-center border border-dashed border-gray-200 rounded-xl">
            Your board is empty. Add tools above, or install a preset dashboard.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PRESET_BOARDS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => installPresetBatch(preset)}
                className="text-left p-4 border border-dashed border-gray-200 rounded-xl bg-gray-50 hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <p className="text-sm font-semibold text-gray-900">{preset.emoji} {preset.name}</p>
                <p className="text-xs text-gray-400 mt-1">{preset.slugs.length} tools · one-click setup</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Board grid */}
      {boardWidgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
          {boardWidgets.map((widget, index) => {
            const tool = toolBySlug(widget.slug);
            if (!tool) return null;
            const isDragging = draggingId === widget.id;
            const isOver = dragOverId === widget.id;
            return (
              <div
                key={widget.id}
                draggable
                onDragStart={handleDragStart(widget.id, index)}
                onDragOver={handleDragOver(widget.id, index)}
                onDrop={handleDrop(index)}
                onDragEnd={handleDragEnd}
                className={`
                  ${sizeClasses(widget.size)}
                  bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col
                  hover:border-blue-300 transition-all
                  ${isDragging ? "opacity-40 ring-2 ring-blue-400" : ""}
                  ${isOver ? "ring-2 ring-blue-400 border-blue-400" : ""}
                `}
              >
                {/* Card header */}
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100 cursor-grab active:cursor-grabbing">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm">{tool.icon}</span>
                    <Link href={getToolPath(tool)} className="text-xs font-semibold text-gray-700 hover:text-blue-700 truncate">
                      {tool.name}
                    </Link>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Size toggles */}
                    {(["small", "medium", "large"] as BoardWidgetSize[]).map((size) => (
                      <button
                        key={size}
                        onClick={() => resizeBoardWidget(widget.id, size)}
                        title={size}
                        className={`text-[10px] uppercase px-1.5 py-0.5 rounded border transition-colors ${
                          widget.size === size
                            ? "bg-blue-600 text-white border-blue-600"
                            : "text-gray-400 border-gray-200 hover:text-gray-600"
                        }`}
                      >
                        {size[0]}
                      </button>
                    ))}
                    <button
                      onClick={() => removeBoardWidget(widget.id)}
                      className="ml-1 text-gray-300 hover:text-red-500 px-1.5 py-0.5 text-sm transition-colors"
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Card content */}
                <div className="flex-1 p-3 overflow-auto">
                  <ToolWidget tool={tool} compact />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-300 text-center pt-4 border-t border-gray-100">
        Drag cards to reorder. Layout is saved locally in your browser.
      </p>
    </div>
  );
}
