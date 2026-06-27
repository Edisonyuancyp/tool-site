"use client";
import { useState, useCallback } from "react";

const REFERRAL_RATES: Record<string, number> = {
  "Electronics": 8, "Clothing & Accessories": 17, "Home & Kitchen": 15,
  "Beauty & Personal Care": 8, "Toys & Games": 15, "Sports & Outdoors": 15,
  "Health & Household": 8, "Grocery": 8, "Pet Supplies": 15,
  "Books": 15, "Office Products": 15, "Tools & Home Improvement": 15,
  "Baby Products": 8, "Automotive": 12, "Other": 15,
};

const FBA_TIERS = [
  { label: "Small Standard (≤16 oz)",    fee: 3.22 },
  { label: "Large Standard (≤20 lb)",    fee: 5.42 },
  { label: "Small Oversize (≤70 lb)",    fee: 9.73 },
  { label: "Medium Oversize (≤150 lb)",  fee: 19.05 },
  { label: "Large Oversize (>150 lb)",   fee: 89.98 },
];

function fmt(n: number) { return n.toFixed(2); }
function pct(n: number) { return n.toFixed(1) + "%"; }

export default function FbaProfitCalculator({ variant, compact }: { variant?: string; compact?: boolean }) {
  const [price,       setPrice]       = useState("29.99");
  const [cogs,        setCogs]        = useState("8.00");
  const [shipping,    setShipping]    = useState("2.50");
  const [storage,     setStorage]     = useState("0.50");
  const [ppcSpend,    setPpcSpend]    = useState("2.00");
  const [category,    setCategory]    = useState("Home & Kitchen");
  const [fbaTier,     setFbaTier]     = useState(0);
  const [showBreak,   setShowBreak]   = useState(false);

  const sp       = parseFloat(price)    || 0;
  const cost     = parseFloat(cogs)     || 0;
  const ship     = parseFloat(shipping) || 0;
  const stor     = parseFloat(storage)  || 0;
  const ppc      = parseFloat(ppcSpend) || 0;
  const refRate  = REFERRAL_RATES[category] / 100;
  const fbaFee   = FBA_TIERS[fbaTier].fee;
  const refFee   = sp * refRate;
  const totalCost= cost + ship + stor + fbaFee + refFee + ppc;
  const netProfit= sp - totalCost;
  const margin   = sp > 0 ? (netProfit / sp) * 100 : 0;
  const roi      = totalCost > 0 ? (netProfit / (cost + ship)) * 100 : 0;
  const breakEven= cost + ship + stor + fbaFee + (cost + ship + stor + fbaFee) * refRate;

  const profitColor = netProfit > 0 ? "text-green-600" : "text-red-500";
  const marginColor = margin >= 20 ? "text-green-600" : margin >= 10 ? "text-amber-500" : "text-red-500";

  if (compact) {
    return (
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <label>
            <span className="text-[10px] text-gray-500 block">Price</span>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} step="0.01" min="0"
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
          </label>
          <label>
            <span className="text-[10px] text-gray-500 block">COGS</span>
            <input type="number" value={cogs} onChange={e => setCogs(e.target.value)} step="0.01" min="0"
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
          </label>
          <label>
            <span className="text-[10px] text-gray-500 block">Ship</span>
            <input type="number" value={shipping} onChange={e => setShipping(e.target.value)} step="0.01" min="0"
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
          </label>
          <label>
            <span className="text-[10px] text-gray-500 block">PPC</span>
            <input type="number" value={ppcSpend} onChange={e => setPpcSpend(e.target.value)} step="0.01" min="0"
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-gray-50 rounded-lg p-2">
            <div className={`text-lg font-bold ${profitColor}`}>${fmt(netProfit)}</div>
            <div className="text-[10px] text-gray-400">Net Profit</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <div className={`text-lg font-bold ${marginColor}`}>{pct(margin)}</div>
            <div className="text-[10px] text-gray-400">Margin</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-lg font-bold text-blue-600">{pct(roi)}</div>
            <div className="text-[10px] text-gray-400">ROI</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-lg font-bold text-gray-700">${fmt(breakEven)}</div>
            <div className="text-[10px] text-gray-400">Break-even</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Left: Inputs */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Product Details</h3>

          <label className="block">
            <span className="text-xs text-gray-500 mb-1 block">Selling Price ($)</span>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} step="0.01" min="0"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>

          <label className="block">
            <span className="text-xs text-gray-500 mb-1 block">Product Cost / COGS ($)</span>
            <input type="number" value={cogs} onChange={e => setCogs(e.target.value)} step="0.01" min="0"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>

          <label className="block">
            <span className="text-xs text-gray-500 mb-1 block">Shipping to Amazon ($/unit)</span>
            <input type="number" value={shipping} onChange={e => setShipping(e.target.value)} step="0.01" min="0"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>

          <label className="block">
            <span className="text-xs text-gray-500 mb-1 block">Monthly Storage Fee ($/unit)</span>
            <input type="number" value={storage} onChange={e => setStorage(e.target.value)} step="0.01" min="0"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>

          <label className="block">
            <span className="text-xs text-gray-500 mb-1 block">PPC Ad Spend ($/unit sold)</span>
            <input type="number" value={ppcSpend} onChange={e => setPpcSpend(e.target.value)} step="0.01" min="0"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>

          <label className="block">
            <span className="text-xs text-gray-500 mb-1 block">Product Category</span>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {Object.keys(REFERRAL_RATES).map(c => <option key={c}>{c}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="text-xs text-gray-500 mb-1 block">FBA Size Tier</span>
            <select value={fbaTier} onChange={e => setFbaTier(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {FBA_TIERS.map((t, i) => <option key={i} value={i}>{t.label} — ${t.fee}</option>)}
            </select>
          </label>
        </div>

        {/* Right: Results */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Results</h3>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Selling Price</span><span>${fmt(sp)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Amazon Referral Fee ({REFERRAL_RATES[category]}%)</span><span>−${fmt(refFee)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">FBA Fulfillment Fee</span><span>−${fmt(fbaFee)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Product Cost</span><span>−${fmt(cost)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Shipping to Amazon</span><span>−${fmt(ship)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Storage Fee</span><span>−${fmt(stor)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">PPC Spend</span><span>−${fmt(ppc)}</span></div>
            <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
              <span>Total Costs</span><span>−${fmt(totalCost)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <div className={`text-2xl font-bold ${profitColor}`}>${fmt(netProfit)}</div>
              <div className="text-xs text-gray-400 mt-0.5">Net Profit / Unit</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <div className={`text-2xl font-bold ${marginColor}`}>{pct(margin)}</div>
              <div className="text-xs text-gray-400 mt-0.5">Margin</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{pct(roi)}</div>
              <div className="text-xs text-gray-400 mt-0.5">ROI</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-gray-700">${fmt(breakEven)}</div>
              <div className="text-xs text-gray-400 mt-0.5">Break-Even Price</div>
            </div>
          </div>

          {/* Health indicator */}
          <div className={`rounded-xl p-3 text-sm font-medium text-center ${
            margin >= 25 ? "bg-green-50 text-green-700 border border-green-200" :
            margin >= 15 ? "bg-amber-50 text-amber-700 border border-amber-200" :
            "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {margin >= 25 ? "✅ Healthy margin — good to list" :
             margin >= 15 ? "⚠️ Tight margin — watch PPC spend" :
             margin > 0   ? "🔴 Thin margin — renegotiate costs" :
                            "❌ Unprofitable at current price"}
          </div>
        </div>
      </div>
    </div>
  );
}
