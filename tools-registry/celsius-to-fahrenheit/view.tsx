"use client";
import { useState } from "react";
import ContextualTip, { type Tip } from "@/components/ContextualTip";

export interface ToolProps { variant?: string; }

const TIP: Tip = {
  trigger: "Temperature benchmarks every traveler should know",
  title: "Temperature Quick Guide for Travelers",
  body: `If you travel between the US and the rest of the world, Celsius vs Fahrenheit is a daily confusion. Here are the benchmarks that matter.

**Body & health:**

1. 37°C = 98.6°F — normal body temperature
2. 38°C = 100.4°F — fever threshold
3. 40°C = 104°F — high fever, seek medical attention

**Weather:**

1. 0°C = 32°F — freezing point of water
2. 10°C = 50°F — cold, need a jacket
3. 20°C = 68°F — comfortable room temperature
4. 35°C = 95°F — very hot summer day
5. -40°C = -40°F — the point where both scales are equal!

**Cooking:**

1. 180°C = 356°F — standard baking temperature
2. 200°C = 392°F — roasting
3. 100°C = 212°F — boiling water

💡 **Mental shortcut:** Double the Celsius and add 30 for a rough °F. E.g. 25°C → 50+30 = 80°F (actual 77°F).`,
};

// °F = (°C × 9/5) + 32
// °C = (°F − 32) × 5/9
function cToF(c: number) { return c * 9 / 5 + 32; }
function fToC(f: number) { return (f - 32) * 5 / 9; }

function fmt(n: number) {
  if (isNaN(n) || !isFinite(n)) return "";
  return parseFloat(n.toFixed(2)).toString();
}

// Visual thermometer color
function tempColor(celsius: number) {
  if (celsius <= 0)  return "#60a5fa"; // blue
  if (celsius <= 15) return "#34d399"; // teal
  if (celsius <= 25) return "#fbbf24"; // yellow
  if (celsius <= 35) return "#f97316"; // orange
  return "#ef4444";                    // red
}

function tempLabel(celsius: number) {
  if (celsius <= 0)  return "❄️ Freezing";
  if (celsius <= 10) return "🧥 Very cold";
  if (celsius <= 18) return "🌤️ Cool";
  if (celsius <= 24) return "😊 Comfortable";
  if (celsius <= 30) return "☀️ Warm";
  if (celsius <= 37) return "🥵 Hot";
  return "🔥 Extreme heat";
}

const QUICK_C = [
  { c: -40,  label: "C = F crossover" },
  { c: 0,    label: "Freezing point" },
  { c: 20,   label: "Room temperature" },
  { c: 37,   label: "Body temperature" },
  { c: 100,  label: "Boiling point" },
];

export default function CelsiusToFahrenheitView({ variant }: ToolProps) {
  const initFlipped = variant === "f-to-c";
  const [flipped, setFlipped] = useState(initFlipped);
  const [val, setVal] = useState("");

  const numVal    = parseFloat(val);
  const hasVal    = val !== "" && !isNaN(numVal);
  const converted = hasVal ? (flipped ? fToC(numVal) : cToF(numVal)) : NaN;
  const celsius   = flipped ? converted : numVal;

  const fromUnit  = flipped ? "°F" : "°C";
  const toUnit    = flipped ? "°C" : "°F";
  const fromLabel = flipped ? "Fahrenheit" : "Celsius";
  const toLabel   = flipped ? "Celsius" : "Fahrenheit";

  const color = hasVal ? tempColor(celsius) : "#d1d5db";
  const pct   = hasVal ? Math.max(0, Math.min(100, ((celsius + 40) / 140) * 100)) : 0;

  return (
    <div className="space-y-6">
      <ContextualTip tip={TIP} />

      {/* Direction toggle */}
      <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setFlipped(false)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${!flipped ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          °C → °F
        </button>
        <button
          onClick={() => setFlipped(true)}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${flipped ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          °F → °C
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
          <span className="px-4 text-gray-400 font-medium bg-gray-50 border-l border-gray-200 self-stretch flex items-center text-lg">
            {fromUnit}
          </span>
        </div>
      </div>

      {/* Result + visual gauge */}
      <div className={`rounded-xl p-5 border ${hasVal ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-100"}`}>
        <p className={`text-[10px] font-semibold uppercase tracking-widest mb-1 ${hasVal ? "text-gray-400" : "text-gray-400"}`}>
          {toLabel}
        </p>
        <p className={`text-4xl font-bold font-mono ${hasVal ? "text-white" : "text-gray-300"}`}>
          {hasVal ? fmt(converted) : "—"} <span className="text-2xl">{hasVal ? toUnit : ""}</span>
        </p>
        {hasVal && (
          <div className="mt-4 space-y-2">
            {/* Gradient bar */}
            <div className="relative w-full h-3 rounded-full overflow-hidden"
              style={{ background: "linear-gradient(to right, #60a5fa, #34d399, #fbbf24, #f97316, #ef4444)" }}>
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white shadow"
                style={{ left: `${pct}%`, backgroundColor: color, transform: "translate(-50%, -50%)" }}
              />
            </div>
            <div className="flex justify-between text-[9px] text-gray-500">
              <span>-40°</span><span>0°</span><span>20°</span><span>37°</span><span>100°</span>
            </div>
            <p className="text-sm mt-1" style={{ color }}>{tempLabel(celsius)}</p>
          </div>
        )}
      </div>

      {/* Quick reference */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Quick Reference</p>
        <div className="space-y-2">
          {QUICK_C.map(({ c, label }) => (
            <button
              key={c}
              onClick={() => { setVal(String(c)); setFlipped(false); }}
              className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-100 rounded-lg hover:border-gray-300 transition-all text-left"
            >
              <span className="text-xs text-gray-500">{label}</span>
              <span className="text-xs font-mono text-gray-700">
                {c}°C = {fmt(cToF(c))}°F
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
