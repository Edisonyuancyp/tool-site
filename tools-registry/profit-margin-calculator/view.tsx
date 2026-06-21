"use client";
import { useState } from "react";
import ContextualTip, { type Tip } from "@/components/ContextualTip";

const MARGIN_TIP: Tip = {
  trigger: "Gross margin vs net margin — which should I track?",
  title: "Gross Margin vs Net Margin: Which Matters More?",
  body: `Both matter, but they tell you very different things about your business health.

**Gross Margin** (what this tool calculates):

1. Revenue minus Cost of Goods Sold (COGS)
2. Measures **production efficiency**
3. Benchmarks: SaaS 70-80%, Retail 20-50%, Manufacturing 10-30%

**Net Margin** accounts for ALL expenses (salaries, rent, taxes, marketing):

1. Net Profit divided by Revenue times 100
2. The real bottom-line profitability
3. A healthy net margin is typically 10-20%+

⚠️ High gross margin but low net margin? Your **operating expenses** are eating your profit.

✅ Use the **Reverse Price** tab to work backwards: enter your cost and target margin to find the minimum price you must charge.

💡 **Pricing insight:** Most small businesses underprice. If your gross margin is below 40%, you have very little room to cover overhead and still turn a profit.`,
};

export interface ToolProps { variant?: string; }

type Mode = "margin" | "markup" | "price";

function fmt2(n: number) { return isNaN(n) || !isFinite(n) ? "—" : n.toFixed(2); }

function ResultRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { if (value !== "—") { navigator.clipboard?.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); } };
  return (
    <div className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${highlight ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-100 hover:border-gray-200"}`}
      onClick={copy}>
      <span className={`text-xs font-semibold uppercase tracking-widest ${highlight ? "text-gray-400" : "text-gray-400"}`}>{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-lg font-bold font-mono ${highlight ? "text-white" : "text-gray-900"}`}>{value}</span>
        {copied && <span className="text-[10px] text-green-500">✓</span>}
      </div>
    </div>
  );
}

export default function ProfitMarginCalculatorView() {
  const [mode, setMode] = useState<Mode>("margin");
  const [cost, setCost] = useState("60");
  const [revenue, setRevenue] = useState("100");
  const [marginPct, setMarginPct] = useState("40");

  const c = parseFloat(cost) || 0;
  const r = parseFloat(revenue) || 0;
  const m = parseFloat(marginPct) || 0;

  const profit = r - c;
  const grossMargin = r > 0 ? (profit / r) * 100 : NaN;
  const markup = c > 0 ? (profit / c) * 100 : NaN;
  const derivedPrice = mode === "price" && c > 0 && m < 100 ? c / (1 - m / 100) : NaN;

  const tabs: { key: Mode; label: string }[] = [
    { key: "margin", label: "Cost → Margin" },
    { key: "markup", label: "Cost → Markup" },
    { key: "price", label: "Reverse Price" },
  ];

  return (
    <div className="space-y-5">
      <ContextualTip tip={MARGIN_TIP} />
      {/* Mode tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setMode(t.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${mode === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Cost price</label>
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-gray-400">
            <span className="px-3 py-3 text-sm text-gray-400 bg-gray-50 border-r border-gray-200">$</span>
            <input type="number" value={cost} onChange={e => setCost(e.target.value)} min={0} step="any"
              className="flex-1 px-3 py-3 text-sm font-mono focus:outline-none" />
          </div>
        </div>

        {mode !== "price" ? (
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Revenue / Sell price</label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-gray-400">
              <span className="px-3 py-3 text-sm text-gray-400 bg-gray-50 border-r border-gray-200">$</span>
              <input type="number" value={revenue} onChange={e => setRevenue(e.target.value)} min={0} step="any"
                className="flex-1 px-3 py-3 text-sm font-mono focus:outline-none" />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Target margin %</label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-gray-400">
              <input type="number" value={marginPct} onChange={e => setMarginPct(e.target.value)} min={0} max={99} step="any"
                className="flex-1 px-3 py-3 text-sm font-mono focus:outline-none" />
              <span className="px-3 py-3 text-sm text-gray-400 bg-gray-50 border-l border-gray-200">%</span>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="space-y-2">
        {mode === "price" ? (
          <>
            <ResultRow label="Required sell price" value={isNaN(derivedPrice) ? "—" : `$${fmt2(derivedPrice)}`} highlight />
            <ResultRow label="Profit amount" value={isNaN(derivedPrice) ? "—" : `$${fmt2(derivedPrice - c)}`} />
            <ResultRow label="Markup %" value={isNaN(derivedPrice) ? "—" : `${fmt2(((derivedPrice - c) / c) * 100)}%`} />
          </>
        ) : (
          <>
            <ResultRow label="Gross margin %" value={`${fmt2(grossMargin)}%`} highlight />
            <ResultRow label="Markup %" value={`${fmt2(markup)}%`} />
            <ResultRow label="Profit amount" value={`$${fmt2(profit)}`} />
            <ResultRow label="Revenue" value={`$${fmt2(r)}`} />
          </>
        )}
      </div>

      {/* Formula box */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Formulas</p>
        <code className="text-xs font-mono text-gray-600 leading-relaxed block space-y-1">
          <span className="block">Margin % = (Revenue − Cost) ÷ Revenue × 100</span>
          <span className="block">Markup % = (Revenue − Cost) ÷ Cost × 100</span>
          <span className="block">Sell Price = Cost ÷ (1 − Margin%/100)</span>
        </code>
      </div>
    </div>
  );
}
