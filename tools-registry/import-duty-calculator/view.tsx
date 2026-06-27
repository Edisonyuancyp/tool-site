"use client";
import { useState } from "react";

const ORIGINS = [
  { country: "China",    std: 0,    s301: 25,  note: "Section 301 List 4A: most consumer goods" },
  { country: "China",    std: 0,    s301: 7.5, note: "Section 301 List 4B: some electronics" },
  { country: "Vietnam",  std: 0,    s301: 0,   note: "No Section 301 tariffs" },
  { country: "India",    std: 0,    s301: 0,   note: "GSP suspended since 2019 for most goods" },
  { country: "Mexico",   std: 0,    s301: 0,   note: "USMCA — most goods duty-free" },
  { country: "Other",    std: 0,    s301: 0,   note: "Standard MFN rate applies" },
];

const PRODUCT_CATEGORIES = [
  { label: "Consumer Electronics",  dutyRate: 0 },
  { label: "Clothing & Apparel",    dutyRate: 12 },
  { label: "Toys & Games",          dutyRate: 0 },
  { label: "Home & Kitchen",        dutyRate: 3.7 },
  { label: "Sports & Outdoors",     dutyRate: 4 },
  { label: "Health & Beauty",       dutyRate: 0 },
  { label: "Furniture",             dutyRate: 0 },
  { label: "Tools & Hardware",      dutyRate: 3 },
  { label: "Pet Supplies",          dutyRate: 0 },
  { label: "Bags & Luggage",        dutyRate: 17.6 },
  { label: "Footwear",              dutyRate: 9 },
  { label: "Jewelry",               dutyRate: 6.5 },
  { label: "Other",                 dutyRate: 5 },
];

const MPF_RATE = 0.003464;
const MPF_MIN  = 32.71;
const MPF_MAX  = 634.62;
const HMF_RATE = 0.00125;

function fmt(n: number) { return n.toFixed(2); }
function pct(n: number) { return n.toFixed(2) + "%"; }

export default function ImportDutyCalculator({ variant }: { variant?: string }) {
  const [cargoValue,  setCargoValue]  = useState("5000");
  const [originIdx,   setOriginIdx]   = useState(0);
  const [categoryIdx, setCategoryIdx] = useState(3);
  const [useS301,     setUseS301]     = useState(true);
  const [isOcean,     setIsOcean]     = useState(true);

  const val   = parseFloat(cargoValue) || 0;
  const orig  = ORIGINS[originIdx];
  const cat   = PRODUCT_CATEGORIES[categoryIdx];

  const dutyRate   = cat.dutyRate / 100;
  const s301Rate   = useS301 ? orig.s301 / 100 : 0;
  const customsDuty = val * dutyRate;
  const s301Fee     = val * s301Rate;
  const mpf         = Math.min(MPF_MAX, Math.max(MPF_MIN, val * MPF_RATE));
  const hmf         = isOcean ? val * HMF_RATE : 0;
  const totalFees   = customsDuty + s301Fee + mpf + hmf;
  const effectiveRate = val > 0 ? (totalFees / val) * 100 : 0;
  const landedCost  = val + totalFees;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Shipment Details</h3>

          <label className="block">
            <span className="text-xs text-gray-500 mb-1 block">Declared Cargo Value (USD)</span>
            <input type="number" value={cargoValue} onChange={e => setCargoValue(e.target.value)} min="0" step="100"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>

          <label className="block">
            <span className="text-xs text-gray-500 mb-1 block">Country of Origin</span>
            <select value={originIdx} onChange={e => setOriginIdx(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {ORIGINS.map((o, i) => (
                <option key={i} value={i}>{o.country}{o.s301 > 0 ? ` (+${o.s301}% S301)` : ""}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">{orig.note}</p>
          </label>

          <label className="block">
            <span className="text-xs text-gray-500 mb-1 block">Product Category (HTS Chapter)</span>
            <select value={categoryIdx} onChange={e => setCategoryIdx(Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {PRODUCT_CATEGORIES.map((c, i) => (
                <option key={i} value={i}>{c.label} ({c.dutyRate}% duty)</option>
              ))}
            </select>
          </label>

          <div className="space-y-2">
            {orig.s301 > 0 && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={useS301} onChange={e => setUseS301(e.target.checked)}
                  className="rounded border-gray-300 text-blue-500" />
                <span className="text-sm text-gray-600">Apply Section 301 tariff ({orig.s301}%)</span>
              </label>
            )}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={isOcean} onChange={e => setIsOcean(e.target.checked)}
                className="rounded border-gray-300 text-blue-500" />
              <span className="text-sm text-gray-600">Ocean freight (adds HMF 0.125%)</span>
            </label>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Estimated Fees</h3>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Customs Duty ({pct(cat.dutyRate)})</span>
              <span>${fmt(customsDuty)}</span>
            </div>
            {useS301 && orig.s301 > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Section 301 Tariff ({orig.s301}%)</span>
                <span className="text-orange-600">${fmt(s301Fee)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">MPF (0.3464%, min $32.71)</span>
              <span>${fmt(mpf)}</span>
            </div>
            {isOcean && (
              <div className="flex justify-between">
                <span className="text-gray-500">HMF (0.125%)</span>
                <span>${fmt(hmf)}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold">
              <span>Total Import Fees</span>
              <span>${fmt(totalFees)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-red-600">${fmt(totalFees)}</div>
              <div className="text-xs text-gray-400 mt-0.5">Total Import Cost</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-orange-500">{pct(effectiveRate)}</div>
              <div className="text-xs text-gray-400 mt-0.5">Effective Rate</div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex justify-between text-sm">
            <span className="text-blue-600 font-medium">Landed Cost (value + fees)</span>
            <span className="font-bold text-blue-700">${fmt(landedCost)}</span>
          </div>

          <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500">
            <p className="font-semibold text-gray-700 mb-1">Note</p>
            <p>This is an estimate. Actual duties depend on exact HTS code classification. Consult a customs broker for shipments over $2,500 or complex products.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
