"use client";
import { useState, useMemo } from "react";

const REFERRAL_RATES: Record<string, number> = {
  "Electronics": 8, "Clothing & Accessories": 17, "Home & Kitchen": 15,
  "Beauty & Personal Care": 8, "Toys & Games": 15, "Sports & Outdoors": 15,
  "Health & Household": 8, "Grocery & Gourmet": 8, "Pet Supplies": 15,
  "Books": 15, "Office Products": 15, "Tools & Home Improvement": 15,
  "Baby Products": 8, "Automotive": 12, "Other": 15,
};

interface Tier {
  name: string; maxW: number; maxL: number; maxLG: number;
  maxGirth: number; feeBase: number; feePerLb: number; perCubicStd: number; perCubicQ4: number;
}

const TIERS: Tier[] = [
  { name: "Small Standard",  maxW: 0.25, maxL: 15, maxLG: 12, maxGirth: 999, feeBase: 3.22,  feePerLb: 0,    perCubicStd: 0.87, perCubicQ4: 2.40 },
  { name: "Large Standard",  maxW: 20,   maxL: 18, maxLG: 14, maxGirth: 999, feeBase: 4.99,  feePerLb: 0.08, perCubicStd: 0.87, perCubicQ4: 2.40 },
  { name: "Small Oversize",  maxW: 70,   maxL: 60, maxLG: 30, maxGirth: 130, feeBase: 9.73,  feePerLb: 0.42, perCubicStd: 0.56, perCubicQ4: 1.40 },
  { name: "Medium Oversize", maxW: 150,  maxL: 108,maxLG: 999,maxGirth: 130, feeBase: 19.05, feePerLb: 0.42, perCubicStd: 0.56, perCubicQ4: 1.40 },
  { name: "Large Oversize",  maxW: 150,  maxL: 108,maxLG: 999,maxGirth: 165, feeBase: 89.98, feePerLb: 0.83, perCubicStd: 0.56, perCubicQ4: 1.40 },
];

function determineTier(wLb: number, l: number, w2: number, h: number): Tier {
  const dims = [l, w2, h].sort((a,b) => b-a);
  const longest = dims[0], median = dims[1], shortest = dims[2];
  const girth = 2*(median + shortest);
  for (const t of TIERS) {
    if (wLb <= t.maxW && longest <= t.maxL && median <= t.maxLG && girth <= t.maxGirth) return t;
  }
  return TIERS[TIERS.length - 1];
}

function fmt(n: number) { return n.toFixed(2); }
function pct(n: number) { return n.toFixed(1) + "%"; }

export default function FbaFeeCalculator({ variant, compact }: { variant?: string; compact?: boolean }) {
  const [length,   setLength]   = useState("12");
  const [width,    setWidth]    = useState("8");
  const [height,   setHeight]   = useState("4");
  const [weight,   setWeight]   = useState("1.5");
  const [price,    setPrice]    = useState("24.99");
  const [category, setCategory] = useState("Home & Kitchen");
  const [isQ4,     setIsQ4]     = useState(false);

  const l = parseFloat(length) || 0;
  const w = parseFloat(width)  || 0;
  const h = parseFloat(height) || 0;
  const wLb = parseFloat(weight) || 0;
  const sp = parseFloat(price)   || 0;

  const tier = useMemo(() => determineTier(wLb, l, w, h), [wLb, l, w, h]);
  const fulfillFee = tier.feeBase + Math.max(0, wLb - 1) * tier.feePerLb;

  const volCubicFt = (l * w * h) / 1728;
  const storageFee = volCubicFt * (isQ4 ? tier.perCubicQ4 : tier.perCubicStd);

  const refRate  = REFERRAL_RATES[category] / 100;
  const refFee   = sp * refRate;
  const totalFee = fulfillFee + refFee + storageFee;
  const feePct   = sp > 0 ? (totalFee / sp) * 100 : 0;

  if (compact) {
    return (
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-3 gap-2">
          <label>
            <span className="text-[10px] text-gray-500 block">L</span>
            <input type="number" value={length} onChange={e => setLength(e.target.value)} min="0" step="0.1"
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
          </label>
          <label>
            <span className="text-[10px] text-gray-500 block">W</span>
            <input type="number" value={width} onChange={e => setWidth(e.target.value)} min="0" step="0.1"
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
          </label>
          <label>
            <span className="text-[10px] text-gray-500 block">H</span>
            <input type="number" value={height} onChange={e => setHeight(e.target.value)} min="0" step="0.1"
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <label>
            <span className="text-[10px] text-gray-500 block">Weight (lb)</span>
            <input type="number" value={weight} onChange={e => setWeight(e.target.value)} min="0" step="0.01"
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
          </label>
          <label>
            <span className="text-[10px] text-gray-500 block">Price ($)</span>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} min="0" step="0.01"
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
          </label>
        </div>
        <div className="bg-blue-50 rounded-lg p-2 text-center border border-blue-100">
          <div className="text-xs text-blue-500 font-semibold uppercase">Tier</div>
          <div className="text-sm font-bold text-blue-700">{tier.name}</div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-lg font-bold text-gray-900">${fmt(totalFee)}</div>
            <div className="text-[10px] text-gray-400">Total Fees</div>
          </div>
          <div className={`bg-gray-50 rounded-lg p-2 ${feePct > 40 ? "text-red-500" : "text-green-600"}`}>
            <div className="text-lg font-bold">{pct(feePct)}</div>
            <div className="text-[10px] text-gray-400">Fee %</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Product Details</h3>
          <div className="grid grid-cols-3 gap-2">
            {[["Length (in)", length, setLength], ["Width (in)", width, setWidth], ["Height (in)", height, setHeight]].map(([label, val, setter]) => (
              <label key={label as string} className="block">
                <span className="text-xs text-gray-500 mb-1 block">{label as string}</span>
                <input type="number" value={val as string} onChange={e => (setter as (v:string)=>void)(e.target.value)} min="0" step="0.1"
                  className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </label>
            ))}
          </div>
          <label className="block">
            <span className="text-xs text-gray-500 mb-1 block">Unit Weight (lbs)</span>
            <input type="number" value={weight} onChange={e => setWeight(e.target.value)} min="0" step="0.01"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500 mb-1 block">Selling Price ($)</span>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} min="0" step="0.01"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500 mb-1 block">Product Category</span>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {Object.keys(REFERRAL_RATES).map(c => <option key={c}>{c}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isQ4} onChange={e => setIsQ4(e.target.checked)}
              className="rounded border-gray-300 text-blue-500" />
            <span className="text-sm text-gray-600">Q4 storage rate (Oct–Dec)</span>
          </label>
        </div>

        {/* Results */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Fee Breakdown</h3>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
            <div className="text-xs text-blue-500 font-semibold uppercase tracking-wide mb-0.5">Size Tier</div>
            <div className="text-xl font-bold text-blue-700">{tier.name}</div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Fulfillment Fee</span>
              <span className="font-medium">${fmt(fulfillFee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Referral Fee ({REFERRAL_RATES[category]}%)</span>
              <span className="font-medium">${fmt(refFee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Monthly Storage ({fmt(volCubicFt)} cu ft)</span>
              <span className="font-medium">${fmt(storageFee)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-gray-900">
              <span>Total Amazon Fees</span>
              <span>${fmt(totalFee)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-gray-900">${fmt(totalFee)}</div>
              <div className="text-xs text-gray-400 mt-0.5">Total Fees / Unit</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <div className={`text-2xl font-bold ${feePct > 40 ? "text-red-500" : feePct > 30 ? "text-amber-500" : "text-green-600"}`}>
                {pct(feePct)}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">% of Selling Price</div>
            </div>
          </div>

          <div className={`rounded-xl p-3 text-sm text-center font-medium ${feePct > 40 ? "bg-red-50 text-red-700 border border-red-200" : feePct > 30 ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
            {feePct > 40 ? "⚠️ High fee ratio — consider a higher price point" :
             feePct > 30 ? "Amazon takes 30%+ — make sure margin is sufficient" :
             "✅ Fee ratio looks reasonable"}
          </div>
        </div>
      </div>
    </div>
  );
}
