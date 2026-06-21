"use client";
import { useState } from "react";

export interface ToolProps { variant?: string; }

const UNITS = ["px", "rem", "em", "vw", "vh", "pt", "%"] as const;
type Unit = typeof UNITS[number];

function convert(value: number, from: Unit, to: Unit, base: number, viewport: number): number {
  // Convert everything to px first
  const toPx: Record<Unit, () => number> = {
    px:  () => value,
    rem: () => value * base,
    em:  () => value * base,
    vw:  () => (value / 100) * viewport,
    vh:  () => (value / 100) * viewport,
    pt:  () => value * 1.3333,
    "%": () => (value / 100) * base,
  };
  const fromPx: Record<Unit, (px: number) => number> = {
    px:  px => px,
    rem: px => px / base,
    em:  px => px / base,
    vw:  px => (px / viewport) * 100,
    vh:  px => (px / viewport) * 100,
    pt:  px => px / 1.3333,
    "%": px => (px / base) * 100,
  };
  return fromPx[to](toPx[from]());
}

function fmt(n: number) {
  if (isNaN(n) || !isFinite(n)) return "—";
  return parseFloat(n.toFixed(5)).toString();
}

export default function CssUnitConverterView() {
  const [value, setValue] = useState("16");
  const [from, setFrom] = useState<Unit>("px");
  const [base, setBase] = useState("16");
  const [viewport, setViewport] = useState("1440");
  const [copied, setCopied] = useState<string | null>(null);

  const numVal = parseFloat(value) || 0;
  const numBase = parseFloat(base) || 16;
  const numVp = parseFloat(viewport) || 1440;

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Settings row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Value</label>
          <input type="number" value={value} onChange={e => setValue(e.target.value)} step="any"
            className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm font-mono focus:outline-none focus:border-gray-400" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">From unit</label>
          <select value={from} onChange={e => setFrom(e.target.value as Unit)}
            className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:border-gray-400 bg-white">
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Base (px)</label>
            <input type="number" value={base} onChange={e => setBase(e.target.value)} min={1}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm font-mono focus:outline-none focus:border-gray-400" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Viewport (px)</label>
            <input type="number" value={viewport} onChange={e => setViewport(e.target.value)} min={1}
              className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm font-mono focus:outline-none focus:border-gray-400" />
          </div>
        </div>
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {UNITS.filter(u => u !== from).map(to => {
          const result = convert(numVal, from, to, numBase, numVp);
          const display = fmt(result);
          const isCopied = copied === `${display}${to}`;
          return (
            <button key={to} onClick={() => copy(`${display}${to}`)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all text-center group ${
                isCopied ? "border-green-300 bg-green-50" : "border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm"
              }`}>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">{to}</span>
              <span className={`text-lg font-bold font-mono ${isCopied ? "text-green-700" : "text-gray-900"}`}>
                {display}
              </span>
              <span className="text-[10px] text-gray-300 mt-1">{isCopied ? "✓ copied" : "click to copy"}</span>
            </button>
          );
        })}
      </div>

      {/* Common sizes cheatsheet */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Common px → rem (base 16px)</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {[12, 14, 16, 18, 20, 24, 32, 48, 64, 80, 96, 128].map(px => (
            <div key={px} className="bg-white border border-gray-100 rounded-lg px-2 py-1.5 text-xs font-mono text-center">
              <div className="text-gray-500">{px}px</div>
              <div className="text-gray-700 font-semibold">{fmt(px / 16)}rem</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
