"use client";
import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useWorkbench, type BoardWidgetSize } from "@/lib/WorkbenchContext";
import type { ToolMeta } from "@/lib/tools";
import { getToolPath } from "@/lib/tools";
import ToolWidget from "@/components/ToolWidget";

const DEFAULT_HEIGHT: Record<BoardWidgetSize, number> = {
  small: 296, medium: 400, large: 516,
};
const MIN_HEIGHT = 200;
const MAX_HEIGHT = 900;

const PRESET_BOARDS = [
  {
    name: "FBA Seller Dashboard",
    emoji: "📦",
    desc: "Amazon卖家必备工具套装",
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
    name: "Quant Trader",
    emoji: "📈",
    desc: "量化交易风控计算套装",
    slugs: [
      "crypto-chart-analyzer",
      "position-size-calculator",
      "kelly-criterion-calculator",
      "sharpe-ratio-calculator",
      "tp-sl-calculator",
    ],
    sizes: ["large", "medium", "medium", "medium", "small"] as BoardWidgetSize[],
  },
  {
    name: "Designer Toolkit",
    emoji: "🎨",
    desc: "设计师常用工具",
    slugs: [
      "color-palette-lab",
      "contrast-checker-tool",
      "css-unit-converter",
      "typography-scale-generator",
      "responsive-image-calculator",
    ],
    sizes: ["large", "medium", "medium", "medium", "small"] as BoardWidgetSize[],
  },
  {
    name: "Dev Tools",
    emoji: "👨‍💻",
    desc: "开发者日常工具",
    slugs: [
      "base64-tool",
      "json-csv-formatter",
      "url-encoder",
      "unix-timestamp-converter",
      "jwt-decoder",
    ],
    sizes: ["medium", "medium", "small", "small", "small"] as BoardWidgetSize[],
  },
  {
    name: "Finance Hub",
    emoji: "💰",
    desc: "个人理财规划",
    slugs: [
      "compound-interest-calculator",
      "loan-calculator",
      "savings-goal-calculator",
      "investment-return-calculator",
      "budget-calculator",
    ],
    sizes: ["large", "medium", "medium", "small", "small"] as BoardWidgetSize[],
  },
  {
    name: "Quick Math",
    emoji: "🧮",
    desc: "日常快速计算",
    slugs: ["percentage-calculator", "tip-calculator", "compound-interest-calculator", "currency-converter"],
    sizes: ["medium", "small", "medium", "small"] as BoardWidgetSize[],
  },
  {
    name: "Health Tracker",
    emoji: "💪",
    desc: "健康数据追踪",
    slugs: ["bmi-calculator", "body-fat-calculator", "water-intake-calculator", "bmr-tdee-calculator"],
    sizes: ["medium", "medium", "small", "small"] as BoardWidgetSize[],
  },
];

function sizeClasses(size: BoardWidgetSize): string {
  switch (size) {
    case "small":  return "col-span-1";
    case "medium": return "col-span-1 md:col-span-2";
    case "large":  return "col-span-1 md:col-span-2 lg:col-span-3";
    default: return "col-span-1 md:col-span-2";
  }
}


export default function WorkbenchBoard({ allTools }: { allTools: ToolMeta[] }) {
  const {
    boardWidgets, addBoardWidget, removeBoardWidget, reorderBoardWidgets,
    resizeBoardWidget, setWidgetHeight, resetBoard,
  } = useWorkbench();

  // Per-widget live height while dragging (not persisted until mouseup)
  const [liveHeights, setLiveHeights] = useState<Record<string, number>>({});

  const handleResizeMouseDown = useCallback(
    (widgetId: string, currentHeight: number) =>
      (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const startY = e.clientY;
        const startH = currentHeight;

        const onMove = (ev: MouseEvent) => {
          const newH = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startH + ev.clientY - startY));
          setLiveHeights(prev => ({ ...prev, [widgetId]: newH }));
        };
        const onUp = (ev: MouseEvent) => {
          const newH = Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, startH + ev.clientY - startY));
          setWidgetHeight(widgetId, newH);
          setLiveHeights(prev => { const n = { ...prev }; delete n[widgetId]; return n; });
          window.removeEventListener("mousemove", onMove);
          window.removeEventListener("mouseup", onUp);
        };
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
      },
    [setWidgetHeight]
  );

  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [addCat, setAddCat] = useState("All");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const dragIdx = useRef<number | null>(null);

  const toolBySlug = (slug: string) => allTools.find((t) => t.slug === slug);

  const allAddCats = ["All", ...Array.from(new Set(allTools.map(t => t.category))).sort()];

  const filteredTools = (() => {
    let list = allTools;
    if (addCat !== "All") list = list.filter(t => t.category === addCat);
    const q = search.trim().toLowerCase();
    if (q.length > 0) list = list.filter(t =>
      t.name.toLowerCase().includes(q) || t.tagline.toLowerCase().includes(q)
    );
    return list.slice(0, q || addCat !== "All" ? 30 : 8);
  })();

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
            <button onClick={() => { setShowAdd(false); setSearch(""); setAddCat("All"); }} className="text-xs text-gray-400 hover:text-gray-600">✕ Close</button>
          </div>
          {/* Search */}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools by name…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          {/* Category filter pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 flex-nowrap scrollbar-none">
            {allAddCats.map(cat => (
              <button
                key={cat}
                onClick={() => setAddCat(cat)}
                className={`shrink-0 text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  addCat === cat
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-200 text-gray-600 bg-white hover:border-blue-300 hover:text-blue-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {/* Results */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
            {filteredTools.length === 0 ? (
              <p className="col-span-full text-xs text-gray-400 text-center py-4">No tools found</p>
            ) : filteredTools.map((tool) => (
              <button
                key={tool.slug}
                onClick={() => { addBoardWidget(tool.slug, "medium"); setSearch(""); }}
                className="flex items-center gap-2 text-left p-2.5 border border-gray-200 bg-white rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <span className="text-lg shrink-0">{tool.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-800 truncate">{tool.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{tool.category}</p>
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
            Your board is empty. Add tools above, or install a preset dashboard below.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {PRESET_BOARDS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => installPresetBatch(preset)}
                className="text-left p-4 border border-dashed border-gray-200 rounded-xl bg-gray-50 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
              >
                <p className="text-xl mb-1">{preset.emoji}</p>
                <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">{preset.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{preset.desc}</p>
                <p className="text-xs text-gray-300 mt-2">{preset.slugs.length} tools · one-click</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Board grid */}
      {boardWidgets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  hover:border-blue-300 transition-all relative
                  ${isDragging ? "opacity-40 ring-2 ring-blue-400" : ""}
                  ${isOver ? "ring-2 ring-blue-400 border-blue-400" : ""}
                `}
                style={{ height: liveHeights[widget.id] ?? widget.height ?? DEFAULT_HEIGHT[widget.size] }}
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
                    <button
                      onClick={() => removeBoardWidget(widget.id)}
                      className="text-gray-300 hover:text-red-500 px-1.5 py-0.5 text-sm transition-colors"
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Card content */}
                <div className="flex-1 p-3 overflow-auto min-h-0">
                  <ToolWidget tool={tool} compact />
                </div>

                {/* Resize handle */}
                <div
                  draggable={false}
                  onDragStart={e => e.stopPropagation()}
                  onMouseDown={handleResizeMouseDown(
                    widget.id,
                    liveHeights[widget.id] ?? widget.height ?? DEFAULT_HEIGHT[widget.size]
                  )}
                  className="absolute bottom-0 left-0 right-0 h-4 flex items-center justify-center cursor-ns-resize group select-none"
                  title="Drag to resize"
                >
                  <div className="w-8 h-1 rounded-full bg-gray-200 group-hover:bg-blue-400 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preset picker always visible when board has tools */}
      {boardWidgets.length > 0 && (
        <details className="border border-gray-100 rounded-xl overflow-hidden">
          <summary className="px-4 py-2.5 text-xs font-medium text-gray-500 cursor-pointer hover:bg-gray-50 transition-colors list-none flex items-center gap-2">
            <span>📋</span> Load a preset board…
          </summary>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 p-3 border-t border-gray-100 bg-gray-50">
            {PRESET_BOARDS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => installPresetBatch(preset)}
                className="text-left p-3 border border-gray-200 rounded-lg bg-white hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <span className="text-base">{preset.emoji}</span>
                <p className="text-xs font-semibold text-gray-800 mt-0.5 truncate">{preset.name}</p>
                <p className="text-[10px] text-gray-400 truncate">{preset.desc}</p>
              </button>
            ))}
          </div>
        </details>
      )}

      <p className="text-xs text-gray-300 text-center pt-4 border-t border-gray-100">
        Drag cards to reorder. Layout is saved locally in your browser.
      </p>
    </div>
  );
}
