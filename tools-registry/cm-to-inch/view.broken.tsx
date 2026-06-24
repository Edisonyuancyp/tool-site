"use client";
import { useState } from "react";
import ContextualTip, { type Tip } from "@/components/ContextualTip";

export interface ToolProps { variant?: string; }

const FACTOR = 2.54; // 1 inch = 2.54 cm exactly

const TIP: Tip = {
  trigger: "When do I need cm vs inches?",
  title: "CM vs Inches: A Quick Reference",
  body: `The world is split: most countries use **centimeters**, while the US, UK (partially), and a few others use **inches**.

**Common references to memorize:**

1. 1 inch = 2.54 cm (exact)
2. 30 cm ≈ 1 foot (actually 30.48 cm)
3. A credit card is 85.6 mm wide (3.37 inches)

**Where you'll need this:**

- 🛏️ Mattress sizes (US Queen = 60×80 in = 152×203 cm)
- 👕 Clothing — US uses inches for waist/chest, EU uses cm
- 📺 TV screens are measured diagonally in inches worldwide
- ✈️ Carry-on luggage: airlines use cm in Europe, inches in the US

💡 **Quick trick:** To go from cm to inches mentally, divide by 2.5 (close enough for everyday use).`,
};

function fmt(n: number) {
  if (isNaN(n) || !isFinite(n)) return "";
  if (n === 0) return "0";
  const abs = Math.abs(n);
  return abs >= 1000
    ? n.toLocaleString("en-US", { maximumFractionDigits: 2 })
    : abs >= 1
    ? parseFloat(n.toFixed(4)).toString()
    : n.toFixed(6);
}

const QUICK = [
  { cm: 1, label: "1 cm (thumbnail width)" },
  { cm: 30.48, label: "1 foot" },
  { cm: 100, label: "1 meter" },
  { cm: 170, label: "5'7\" (avg height)" },
  { cm: 190, label: "6'3\" (tall)" },
];

export default function CmToInchView({ variant }: ToolProps) {
  const initFlipped = variant === "in-to-cm";
  const [flipped, setFlipped] = useState(initFlipped);
  const [val, setVal] = useState("");

  const numVal = parseFloat(val) || 0;
  const converted = flipped ? numVal * FACTOR : numVal / FACTOR;

  const fromUnit = flipped ? "in" : "cm";
  const toUnit   = flipped ? "cm" : "in";
  const fromLabel = flipped ? "Inches" : "Centimeters";
  const toLabel   = flipped ? "Centimeters" : "Inches";

  // For inches output: also show ft+in breakdown
  const showFtIn = !flipped && converted > 0;
  const totalIn  = converted;
  const feet     = Math.floor(totalIn / 12);
  const remIn    = totalIn - feet * 12;

  return (
    <div className="space-y-6">
      <ContextualTip tip={TIP} />

      {/* Direction toggle */}
      <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setFlipped(false)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${!flipped ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          cm → in
        </button>
        <button
          onClick={() => setFlipped(true)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${flipped ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          in → cm
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
        {showFtIn && val && feet > 0 && (
          <p className="text-sm text-gray-400 mt-2 font-mono">
            = {feet} ft {fmt(remIn)} in
          </p>
        )}
      </div>

      {/* Quick reference */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Quick Reference</p>
        <div className="space-y-2">
          {QUICK.map(({ cm, label }) => {
            const inches = cm / FACTOR;
            const ft = Math.floor(inches / 12);
            const remI = inches - ft * 12;
            return (
              <button
                key={cm}
                onClick={() => { setVal(flipped ? String(parseFloat(fmt(inches))) : String(cm)); setFlipped(false); }}
                className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-100 rounded-lg hover:border-gray-300 transition-all text-left"
              >
                <span className="text-xs text-gray-500">{label}</span>
                <span className="text-xs font-mono text-gray-700">
                  {cm} cm = {fmt(inches)} in
                  {ft > 0 && <span className="text-gray-400"> ({ft}′{fmt(remI)}″)</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
