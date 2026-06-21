"use client";
import { useState } from "react";
import ContextualTip, { type Tip } from "@/components/ContextualTip";

export interface ToolProps { variant?: string; }

const FACTOR = 3.280839895; // 1 m = 3.280839895 ft

const TIP: Tip = {
  trigger: "Common meter ↔ feet references for travelers",
  title: "Meters vs Feet: Travel & Real-Life References",
  body: `If you travel between metric and imperial countries, these benchmarks will save you every time.

**Key conversions to memorize:**

1. 1 meter ≈ 3 feet 3 inches (3.28 ft)
2. 1.8 m = 5 ft 11 in (the classic "tall person" benchmark)
3. 100 m = 328 ft (Olympic sprint distance)

**Real-estate & travel uses:**

- 🏠 Room dimensions: a 4×5m room = 13×16 ft
- 🏔️ Altitude: 1000m = 3281 ft (common in hiking)
- 🏊 Swimming pool: standard 50m = 164 ft
- ✈️ Cruising altitude: 10,000m = 32,808 ft

💡 **Quick mental trick:** Multiply meters by 3, then add 10% of that result. E.g. 5m → 15 + 1.5 = 16.5 ft (actual: 16.4 ft).`,
};

function fmt(n: number) {
  if (isNaN(n) || !isFinite(n)) return "";
  if (n === 0) return "0";
  return Math.abs(n) >= 100
    ? n.toLocaleString("en-US", { maximumFractionDigits: 2 })
    : parseFloat(n.toFixed(4)).toString();
}

function toFtIn(meters: number) {
  const totalFt = meters * FACTOR;
  const ft = Math.floor(totalFt);
  const inches = (totalFt - ft) * 12;
  return { ft, inches };
}

const QUICK = [
  { m: 1,    label: "1 m (doorframe height ~)" },
  { m: 1.8,  label: "1.8 m (avg adult height)" },
  { m: 10,   label: "10 m (3-story building ~)" },
  { m: 100,  label: "100 m (sprint distance)" },
  { m: 1000, label: "1 km (1000 m)" },
];

export default function MToFeetView({ variant }: ToolProps) {
  const initFlipped = variant === "ft-to-m";
  const [flipped, setFlipped] = useState(initFlipped);
  const [val, setVal] = useState("");

  const numVal = parseFloat(val) || 0;
  const converted = flipped ? numVal / FACTOR : numVal * FACTOR;
  const { ft, inches } = toFtIn(flipped ? converted : numVal);

  const fromUnit  = flipped ? "ft" : "m";
  const toUnit    = flipped ? "m"  : "ft";
  const fromLabel = flipped ? "Feet" : "Meters";
  const toLabel   = flipped ? "Meters" : "Feet";

  return (
    <div className="space-y-6">
      <ContextualTip tip={TIP} />

      {/* Direction toggle */}
      <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setFlipped(false)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${!flipped ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          m → ft
        </button>
        <button
          onClick={() => setFlipped(true)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${flipped ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          ft → m
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
        {!flipped && val && ft > 0 && (
          <p className="text-sm text-gray-400 mt-2 font-mono">
            = {ft} ft {fmt(inches)} in
          </p>
        )}
      </div>

      {/* Quick reference */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Quick Reference</p>
        <div className="space-y-2">
          {QUICK.map(({ m, label }) => {
            const totalFt = m * FACTOR;
            const f = Math.floor(totalFt);
            const i = (totalFt - f) * 12;
            return (
              <button
                key={m}
                onClick={() => { setVal(String(m)); setFlipped(false); }}
                className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-100 rounded-lg hover:border-gray-300 transition-all text-left"
              >
                <span className="text-xs text-gray-500">{label}</span>
                <span className="text-xs font-mono text-gray-700">
                  {m} m = {fmt(totalFt)} ft
                  {f > 0 && <span className="text-gray-400"> ({f}′{fmt(i)}″)</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
