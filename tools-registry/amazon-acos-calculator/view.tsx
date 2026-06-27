"use client";
import { useState } from "react";

function fmt(n: number, d = 2) { return n.toFixed(d); }
function pct(n: number) { return n.toFixed(1) + "%"; }

export default function AmazonAcosCalculator({ variant, compact }: { variant?: string; compact?: boolean }) {
  const [adSpend,    setAdSpend]    = useState("150");
  const [adRevenue,  setAdRevenue]  = useState("600");
  const [totalRev,   setTotalRev]   = useState("1800");
  const [price,      setPrice]      = useState("29.99");
  const [cvr,        setCvr]        = useState("10");
  const [targetAcos, setTargetAcos] = useState("20");
  const [grossMargin,setGrossMargin]= useState("35");

  const spend   = parseFloat(adSpend)    || 0;
  const adRev   = parseFloat(adRevenue)  || 0;
  const totRev  = parseFloat(totalRev)   || 0;
  const sp      = parseFloat(price)      || 0;
  const cvrPct  = parseFloat(cvr)        || 0;
  const tgtAcos = parseFloat(targetAcos) || 0;
  const margin  = parseFloat(grossMargin)|| 0;

  const acos       = adRev > 0   ? (spend / adRev) * 100 : 0;
  const tacos      = totRev > 0  ? (spend / totRev) * 100 : 0;
  const breakEven  = margin;
  const maxCpc     = (sp * (tgtAcos / 100) * (cvrPct / 100));
  const roas       = spend > 0   ? adRev / spend : 0;
  const isProfitable = acos <= breakEven && acos > 0;

  const acosColor = acos === 0 ? "text-gray-400" : acos <= breakEven ? "text-green-600" : "text-red-500";

  if (compact) {
    return (
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <label>
            <span className="text-[10px] text-gray-500 block">Ad Spend</span>
            <input type="number" value={adSpend} onChange={e => setAdSpend(e.target.value)} min="0" step="0.01"
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
          </label>
          <label>
            <span className="text-[10px] text-gray-500 block">Ad Rev</span>
            <input type="number" value={adRevenue} onChange={e => setAdRevenue(e.target.value)} min="0" step="0.01"
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
          </label>
          <label>
            <span className="text-[10px] text-gray-500 block">Price</span>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} min="0" step="0.01"
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
          </label>
          <label>
            <span className="text-[10px] text-gray-500 block">Margin %</span>
            <input type="number" value={grossMargin} onChange={e => setGrossMargin(e.target.value)} min="0" max="100" step="0.1"
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm" />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-gray-50 rounded-lg p-2">
            <div className={`text-lg font-bold ${acosColor}`}>{pct(acos)}</div>
            <div className="text-[10px] text-gray-400">ACoS</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <div className={`text-lg font-bold ${isProfitable ? "text-green-600" : "text-red-500"}`}>{isProfitable ? "✅" : "❌"}</div>
            <div className="text-[10px] text-gray-400">{isProfitable ? "Profitable" : "Unprofitable"}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-lg font-bold text-blue-600">{fmt(roas, 1)}x</div>
            <div className="text-[10px] text-gray-400">ROAS</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-2">
            <div className="text-lg font-bold text-orange-500">{pct(breakEven)}</div>
            <div className="text-[10px] text-gray-400">Break-even</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        {/* Left: Campaign Metrics */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Campaign Data</h3>

          <label className="block">
            <span className="text-xs text-gray-500 mb-1 block">Total Ad Spend ($)</span>
            <input type="number" value={adSpend} onChange={e => setAdSpend(e.target.value)} min="0" step="0.01"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500 mb-1 block">Ad-Attributed Revenue ($)</span>
            <input type="number" value={adRevenue} onChange={e => setAdRevenue(e.target.value)} min="0" step="0.01"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500 mb-1 block">Total Revenue (organic + ads) ($)</span>
            <input type="number" value={totalRev} onChange={e => setTotalRev(e.target.value)} min="0" step="0.01"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Max CPC Inputs</h3>
            <label className="block mb-3">
              <span className="text-xs text-gray-500 mb-1 block">Product Price ($)</span>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} min="0" step="0.01"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </label>
            <label className="block mb-3">
              <span className="text-xs text-gray-500 mb-1 block">Conversion Rate (%)</span>
              <input type="number" value={cvr} onChange={e => setCvr(e.target.value)} min="0" max="100" step="0.1"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </label>
            <label className="block mb-3">
              <span className="text-xs text-gray-500 mb-1 block">Target ACoS (%)</span>
              <input type="number" value={targetAcos} onChange={e => setTargetAcos(e.target.value)} min="0" max="100" step="0.1"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </label>
            <label className="block">
              <span className="text-xs text-gray-500 mb-1 block">Gross Margin (%) — your break-even ACoS</span>
              <input type="number" value={grossMargin} onChange={e => setGrossMargin(e.target.value)} min="0" max="100" step="0.1"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </label>
          </div>
        </div>

        {/* Right: Results */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Results</h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <div className={`text-2xl font-bold ${acosColor}`}>{pct(acos)}</div>
              <div className="text-xs text-gray-400 mt-0.5">ACoS</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">{pct(tacos)}</div>
              <div className="text-xs text-gray-400 mt-0.5">TACoS</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{fmt(roas, 1)}x</div>
              <div className="text-xs text-gray-400 mt-0.5">ROAS</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-orange-500">{pct(breakEven)}</div>
              <div className="text-xs text-gray-400 mt-0.5">Break-Even ACoS</div>
            </div>
          </div>

          {/* Max CPC */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-blue-700">${fmt(maxCpc)}</div>
            <div className="text-sm text-blue-600 mt-0.5">Max Profitable CPC Bid</div>
            <div className="text-xs text-blue-400 mt-1">at {tgtAcos}% target ACoS with {cvrPct}% CVR</div>
          </div>

          {/* Status */}
          <div className={`rounded-xl p-3 text-sm font-medium text-center ${
            acos === 0 ? "bg-gray-50 text-gray-400 border border-gray-100" :
            isProfitable ? "bg-green-50 text-green-700 border border-green-200" :
            acos <= breakEven * 1.15 ? "bg-amber-50 text-amber-700 border border-amber-200" :
            "bg-red-50 text-red-700 border border-red-200"
          }`}>
            {acos === 0 ? "Enter campaign data above" :
             isProfitable ? `✅ Profitable — ${pct(breakEven - acos)} headroom below break-even` :
             acos <= breakEven * 1.15 ? `⚠️ Near break-even — tighten bids by ~${pct(acos - breakEven)}` :
             `❌ Unprofitable — ACoS is ${pct(acos - breakEven)} above break-even`}
          </div>

          {/* Guidance */}
          <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1.5">
            <p><span className="font-semibold text-gray-700">ACoS vs TACoS:</span> Use ACoS to judge campaign-level efficiency. Use TACoS to judge your overall ad spend relative to the whole business.</p>
            <p><span className="font-semibold text-gray-700">Break-even ACoS</span> equals your gross margin. Any ACoS below this means ads are contributing profit.</p>
            <p><span className="font-semibold text-gray-700">Good targets:</span> ACoS 15–25% for established products, up to 50% for new launches to build rank.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
