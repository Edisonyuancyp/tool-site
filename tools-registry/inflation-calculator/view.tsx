"use client";
import { useState, useMemo } from "react";

export interface ToolProps { variant?: string; }

// Approximate US CPI annual rates by decade (representative values)
const HISTORICAL_RATES: Record<string, number> = {
  "1960s": 2.5, "1970s": 7.4, "1980s": 5.1, "1990s": 3.0,
  "2000s": 2.6, "2010s": 1.8, "2020s": 4.9,
};

function fmt2(n: number) { return isNaN(n) || !isFinite(n) ? "—" : n.toFixed(2); }
function fmtUSD(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function InflationCalculatorView() {
  const [amount, setAmount]   = useState("10000");
  const [fromYear, setFrom]   = useState(String(new Date().getFullYear() - 10));
  const [toYear, setTo]       = useState(String(new Date().getFullYear()));
  const [rate, setRate]       = useState("3");
  const [mode, setMode]       = useState<"past" | "future">("past");

  const currentYear = new Date().getFullYear();

  const r = useMemo(() => {
    const A = parseFloat(amount) || 0;
    const r = parseFloat(rate) / 100 || 0.03;
    const from = parseInt(fromYear) || 2014;
    const to   = parseInt(toYear)   || currentYear;
    const n    = Math.abs(to - from);

    const adjusted = A * Math.pow(1 + r, n);
    const powerLoss = A - A / Math.pow(1 + r, n);
    const totalInflation = ((adjusted - A) / A) * 100;

    // Year-by-year breakdown (max 30 points)
    const step = Math.max(1, Math.floor(n / 20));
    const curve: { year: number; value: number }[] = [];
    for (let i = 0; i <= n; i += step) {
      curve.push({ year: from + i, value: A * Math.pow(1 + r, i) });
    }
    if (curve[curve.length - 1].year < to) {
      curve.push({ year: to, value: adjusted });
    }

    return { adjusted, powerLoss, totalInflation, curve, n };
  }, [amount, fromYear, toYear, rate, mode]);

  const maxVal = Math.max(...r.curve.map(p => p.value));

  return (
    <div className="space-y-6">
      {/* Mode */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button onClick={() => setMode("past")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${mode === "past" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          Past → Today
        </button>
        <button onClick={() => setMode("future")}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${mode === "future" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
          Today → Future
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Amount */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Amount</label>
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-gray-400">
            <span className="px-3 py-3 text-sm text-gray-400 bg-gray-50 border-r border-gray-200">$</span>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min={0} step="any"
              className="flex-1 px-3 py-3 text-sm font-mono focus:outline-none" />
          </div>
        </div>

        {/* Rate */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
            Annual Inflation Rate
          </label>
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-gray-400">
            <input type="number" value={rate} onChange={e => setRate(e.target.value)} step="0.1" min={0}
              className="flex-1 px-3 py-3 text-sm font-mono focus:outline-none" />
            <span className="px-3 py-3 text-sm text-gray-400 bg-gray-50 border-l border-gray-200">%</span>
          </div>
          {/* Preset buttons */}
          <div className="flex gap-1 mt-2 flex-wrap">
            {[["2%","2"],["3%","3"],["4%","4"],["7% (peak)","7"]].map(([label, v]) => (
              <button key={v} onClick={() => setRate(v)}
                className={`px-2 py-0.5 text-[10px] rounded-full border transition-all ${rate === v ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-500 hover:border-gray-400"}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Years */}
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
            {mode === "past" ? "From Year" : "Starting Year"}
          </label>
          <input type="number" value={fromYear} onChange={e => setFrom(e.target.value)} step={1}
            className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm font-mono focus:outline-none focus:border-gray-400" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
            {mode === "past" ? "To Year" : "Target Year"}
          </label>
          <input type="number" value={toYear} onChange={e => setTo(e.target.value)} step={1}
            className="w-full border border-gray-200 rounded-xl px-3 py-3 text-sm font-mono focus:outline-none focus:border-gray-400" />
        </div>
      </div>

      {/* Result cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
            {mode === "past" ? `Equivalent in ${toYear}` : `Worth in ${toYear}`}
          </p>
          <p className="text-2xl font-bold text-white font-mono">{fmtUSD(r.adjusted)}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Purchasing Power Lost</p>
          <p className="text-2xl font-bold text-red-700 font-mono">{fmtUSD(r.powerLoss)}</p>
          <p className="text-xs text-red-500 mt-0.5">{fmt2(r.totalInflation)}% total inflation</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Years Calculated</p>
          <p className="text-2xl font-bold text-gray-900 font-mono">{r.n}</p>
          <p className="text-xs text-gray-400 mt-0.5">at {rate}% / yr</p>
        </div>
      </div>

      {/* Bar chart */}
      {r.curve.length > 1 && (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
            {mode === "past" ? "Cumulative inflation curve" : "Purchasing power decay"}
          </p>
          <div className="flex items-end gap-1 h-24">
            {r.curve.map((p, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-sm transition-all"
                  style={{
                    height: `${(p.value / maxVal) * 80}px`,
                    backgroundColor: `hsl(${220 - (i / r.curve.length) * 140}, 70%, 55%)`,
                  }}
                />
                {(i === 0 || i === r.curve.length - 1 || r.curve.length <= 6) && (
                  <span className="text-[8px] text-gray-400">{p.year}</span>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-gray-400">{fmtUSD(r.curve[0]?.value ?? 0)}</span>
            <span className="text-[10px] text-gray-700 font-semibold">{fmtUSD(r.curve[r.curve.length - 1]?.value ?? 0)}</span>
          </div>
        </div>
      )}

      {/* Historical rates reference */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">US Historical Inflation by Decade</p>
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
          {Object.entries(HISTORICAL_RATES).map(([decade, r]) => (
            <button key={decade} onClick={() => setRate(String(r))}
              className="bg-white border border-gray-200 rounded-lg p-2 text-center hover:border-gray-400 transition-all">
              <p className="text-[9px] text-gray-400">{decade}</p>
              <p className="text-sm font-bold text-gray-900">{r}%</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
