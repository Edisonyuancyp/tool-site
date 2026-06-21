"use client";
import { useState } from "react";
import ContextualTip, { type Tip } from "@/components/ContextualTip";

export interface ToolProps { variant?: string; }

const FACTOR = 2.20462262185; // 1 kg = 2.20462... lbs

const TIP: Tip = {
  trigger: "KG vs LBS — gym, travel, and shipping guide",
  title: "KG vs LBS: What You Need to Know",
  body: `Most of the world uses kilograms. The US uses pounds. Here's your practical guide.

**Key benchmarks:**

1. 1 kg = 2.205 lbs
2. 100 lbs = 45.36 kg
3. A standard barbell plate: 45 lbs = 20.4 kg

**Gym use:**

- US gyms label plates in **lbs** (45, 35, 25, 10, 5)
- EU gyms use **kg** (20, 15, 10, 5, 2.5)
- A "two plate" squat in the US = 225 lbs = 102 kg

**Travel & luggage:**

- Most airlines allow 23 kg (50 lbs) checked bag
- Carry-on typically 7–10 kg (15–22 lbs)

**Shipping:**

- US Postal Service uses lbs/oz
- International couriers typically accept kg

💡 **Quick estimate:** Multiply kg by 2.2, or divide lbs by 2.2.`,
};

function fmt(n: number) {
  if (isNaN(n) || !isFinite(n)) return "";
  if (n === 0) return "0";
  return Math.abs(n) >= 100
    ? n.toLocaleString("en-US", { maximumFractionDigits: 2 })
    : parseFloat(n.toFixed(4)).toString();
}

const QUICK = [
  { kg: 1,    label: "1 kg (bag of sugar)" },
  { kg: 5,    label: "5 kg (small dumbbell)" },
  { kg: 23,   label: "23 kg (airline bag limit)" },
  { kg: 70,   label: "70 kg (avg person)" },
  { kg: 100,  label: "100 kg (athlete)" },
];

export default function KgToLbsView({ variant }: ToolProps) {
  const initFlipped = variant === "lbs-to-kg";
  const [flipped, setFlipped] = useState(initFlipped);
  const [val, setVal] = useState("");

  const numVal   = parseFloat(val) || 0;
  const converted = flipped ? numVal / FACTOR : numVal * FACTOR;

  const fromUnit  = flipped ? "lbs" : "kg";
  const toUnit    = flipped ? "kg"  : "lbs";
  const fromLabel = flipped ? "Pounds (lbs)" : "Kilograms (kg)";
  const toLabel   = flipped ? "Kilograms (kg)" : "Pounds (lbs)";

  return (
    <div className="space-y-6">
      <ContextualTip tip={TIP} />

      {/* Direction toggle */}
      <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setFlipped(false)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${!flipped ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          kg → lbs
        </button>
        <button
          onClick={() => setFlipped(true)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${flipped ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          lbs → kg
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
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Quick Reference</p>
        <div className="space-y-2">
          {QUICK.map(({ kg, label }) => (
            <button
              key={kg}
              onClick={() => { setVal(String(kg)); setFlipped(false); }}
              className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-100 rounded-lg hover:border-gray-300 transition-all text-left"
            >
              <span className="text-xs text-gray-500">{label}</span>
              <span className="text-xs font-mono text-gray-700">
                {kg} kg = {fmt(kg * FACTOR)} lbs
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
