"use client";
import { useState } from "react";
import ContextualTip, { type Tip } from "@/components/ContextualTip";

const DISCOUNT_TIP: Tip = {
  trigger: "Discount % vs Margin % — what's the difference?",
  title: "Discount vs Margin: Don't Confuse Them",
  body: `These two look similar but mean completely different things.

**Discount %** is taken off the **original (selling) price**:

1. Original price: $100
2. 20% discount — you pay **$80**
3. Seller loses $20 in revenue

**Margin %** is calculated from the **selling price** (not cost):

1. Cost: $60, Sell: $100 — Profit: $40
2. Margin = 40% (profit / revenue)

⚠️ A 40% margin is NOT a 40% markup. Markup = (Profit / Cost) = 66.7%.

✅ Use the **Find % off** tab to reverse-engineer an original price from a sale tag — great for auditing invoices or spotting fake discounts.

💡 **Stacked discounts** are multiplicative, not additive. 20% + 10% = 28% off total, not 30%.`,
};

export interface ToolProps { variant?: string; }

type Mode = "sale-price" | "original-price" | "find-percent";

function fmt2(n: number) { return isNaN(n) || !isFinite(n) ? "—" : n.toFixed(2); }

function ResultCard({ label, value, sub, accent = false }: { label: string; value: string; sub?: string; accent?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <div onClick={() => { if (value !== "—") { navigator.clipboard?.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); } }}
      className={`p-4 rounded-xl border cursor-pointer transition-all ${accent ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-100 hover:border-gray-200"}`}>
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-2xl font-bold font-mono ${accent ? "text-white" : "text-gray-900"}`}>
        {value} {copied && <span className="text-sm text-green-500 font-normal">✓</span>}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function DiscountCalculatorView() {
  const [mode, setMode] = useState<Mode>("sale-price");
  const [original, setOriginal] = useState("100");
  const [pct, setPct] = useState("20");
  const [sale, setSale] = useState("80");

  const o = parseFloat(original) || 0;
  const p = parseFloat(pct) || 0;
  const s = parseFloat(sale) || 0;

  const salePrice    = o * (1 - p / 100);
  const savings      = o - salePrice;
  const origFromSale = s / (1 - p / 100);
  const discountPct  = o > 0 ? ((o - s) / o) * 100 : NaN;
  const savingsFromPct = o - s;

  const tabs: { key: Mode; label: string }[] = [
    { key: "sale-price",     label: "Sale price" },
    { key: "original-price", label: "Original price" },
    { key: "find-percent",   label: "Find % off" },
  ];

  const Field = ({ label, value, onChange, prefix, suffix }: { label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">{label}</label>
      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-gray-400">
        {prefix && <span className="px-3 py-3 text-sm text-gray-400 bg-gray-50 border-r border-gray-200">{prefix}</span>}
        <input type="number" value={value} onChange={e => onChange(e.target.value)} min={0} step="any"
          className="flex-1 px-3 py-3 text-sm font-mono focus:outline-none" />
        {suffix && <span className="px-3 py-3 text-sm text-gray-400 bg-gray-50 border-l border-gray-200">{suffix}</span>}
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <ContextualTip tip={DISCOUNT_TIP} />
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setMode(t.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${mode === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {mode === "sale-price" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Original price" value={original} onChange={setOriginal} prefix="$" />
            <Field label="Discount" value={pct} onChange={setPct} suffix="%" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ResultCard label="Sale price" value={`$${fmt2(salePrice)}`} accent />
            <ResultCard label="You save" value={`$${fmt2(savings)}`} sub={`${fmt2(p)}% off`} />
          </div>
        </>
      )}

      {mode === "original-price" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Sale price" value={sale} onChange={setSale} prefix="$" />
            <Field label="Discount applied" value={pct} onChange={setPct} suffix="%" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ResultCard label="Original price" value={`$${fmt2(origFromSale)}`} accent />
            <ResultCard label="Amount saved" value={`$${fmt2(origFromSale - s)}`} sub={`${fmt2(p)}% off`} />
          </div>
        </>
      )}

      {mode === "find-percent" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Original price" value={original} onChange={setOriginal} prefix="$" />
            <Field label="Sale price" value={sale} onChange={setSale} prefix="$" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <ResultCard label="Discount %" value={`${fmt2(discountPct)}%`} accent />
            <ResultCard label="Amount saved" value={`$${fmt2(savingsFromPct)}`} sub="off original price" />
          </div>
        </>
      )}

      {/* Quick examples */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Quick examples</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[[100, 10], [200, 25], [50, 15], [80, 30]].map(([op, dp]) => (
            <button key={`${op}-${dp}`}
              onClick={() => { setOriginal(String(op)); setPct(String(dp)); setMode("sale-price"); }}
              className="bg-white border border-gray-100 rounded-lg px-2.5 py-2 text-xs font-mono text-gray-600 hover:border-gray-300 transition-all text-left">
              <span className="text-gray-400">${op} </span>
              <span className="text-red-500">-{dp}%</span>
              <br />
              <span className="font-semibold text-gray-900">${(op * (1 - dp / 100)).toFixed(2)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
