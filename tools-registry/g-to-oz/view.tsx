"use client";
import { useState } from "react";
import ContextualTip, { type Tip } from "@/components/ContextualTip";

export interface ToolProps { variant?: string; }

const FACTOR = 0.03527396195; // 1 g = 0.035274 oz

const TIP: Tip = {
  trigger: "Grams vs ounces in cooking — what's the difference?",
  title: "Grams & Ounces in the Kitchen",
  body: `European recipes use **grams**. American recipes use **ounces** (and cups). Here's your kitchen conversion cheat sheet.

**Key cooking benchmarks:**

1. 1 oz = 28.35 g
2. 100 g ≈ 3.5 oz (standard chocolate bar)
3. 1 cup of flour ≈ 120–130 g ≈ 4.2–4.6 oz

**Dry vs liquid ounce:**

- **Dry ounce (oz)** = weight = 28.35 g ← this tool uses this
- **Fluid ounce (fl oz)** = volume ≠ weight (depends on density)

⚠️ Don't confuse them! Water: 1 fl oz ≈ 29.57 g. Olive oil: 1 fl oz ≈ 27 g.

**Common baking conversions:**

1. Butter: 1 stick = 4 oz = 113 g
2. Sugar: 1 cup = 200 g = 7.05 oz
3. Salt: 1 tsp = 6 g = 0.21 oz

💡 For precise baking, always weigh in grams — it's more accurate than volume measures.`,
};

function fmt(n: number) {
  if (isNaN(n) || !isFinite(n)) return "";
  if (n === 0) return "0";
  return Math.abs(n) >= 100
    ? n.toLocaleString("en-US", { maximumFractionDigits: 2 })
    : parseFloat(n.toFixed(4)).toString();
}

const QUICK = [
  { g: 28.35,  label: "1 oz (standard)" },
  { g: 100,    label: "100 g (chocolate bar)" },
  { g: 113,    label: "1 stick of butter" },
  { g: 200,    label: "1 cup sugar" },
  { g: 453.59, label: "1 lb (16 oz)" },
];

export default function GToOzView({ variant }: ToolProps) {
  const initFlipped = variant === "oz-to-g";
  const [flipped, setFlipped] = useState(initFlipped);
  const [val, setVal] = useState("");

  const numVal    = parseFloat(val) || 0;
  const converted = flipped ? numVal / FACTOR : numVal * FACTOR;

  const fromUnit  = flipped ? "oz" : "g";
  const toUnit    = flipped ? "g"  : "oz";
  const fromLabel = flipped ? "Ounces (oz)" : "Grams (g)";
  const toLabel   = flipped ? "Grams (g)" : "Ounces (oz)";

  return (
    <div className="space-y-6">
      <ContextualTip tip={TIP} />

      {/* Direction toggle */}
      <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setFlipped(false)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${!flipped ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          g → oz
        </button>
        <button
          onClick={() => setFlipped(true)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${flipped ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          oz → g
        </button>
      </div>

      {/* Input */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
          {fromLabel}
        </label>
        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-gray-400 bg-white transition-colors">
          <input
            type="number"
            value={val}
            onChange={e => setVal(e.target.value)}
            placeholder="0"
            step="any"
            min={0}
            className="flex-1 px-4 py-4 text-2xl font-mono focus:outline-none"
          />
          <span className="px-4 text-gray-400 font-medium bg-gray-50 border-l border-gray-200 self-stretch flex items-center">
            {fromUnit}
          </span>
        </div>
      </div>

      {/* Result */}
      <div className={`rounded-xl p-5 border ${val ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-100"}`}>
        <p className={`text-[10px] font-semibold uppercase tracking-widest mb-1 ${val ? "text-gray-400" : "text-gray-400"}`}>
          {toLabel}
        </p>
        <p className={`text-4xl font-bold font-mono ${val ? "text-white" : "text-gray-300"}`}>
          {val ? fmt(converted) : "—"} <span className="text-2xl">{val ? toUnit : ""}</span>
        </p>
      </div>

      {/* Quick reference */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Cooking Quick Reference</p>
        <div className="space-y-2">
          {QUICK.map(({ g, label }) => (
            <button
              key={g}
              onClick={() => { setVal(String(g)); setFlipped(false); }}
              className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-100 rounded-lg hover:border-gray-300 transition-all text-left"
            >
              <span className="text-xs text-gray-500">{label}</span>
              <span className="text-xs font-mono text-gray-700">
                {g} g = {fmt(g * FACTOR)} oz
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
