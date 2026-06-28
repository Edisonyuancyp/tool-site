"use client";
import { useState } from "react";

interface Props { compact?: boolean; }

export default function SharpeRatioCalculator({ compact }: Props) {
  const [portfolioReturn, setPortfolioReturn] = useState("15");
  const [riskFreeRate, setRiskFreeRate] = useState("4.5");
  const [stdDev, setStdDev] = useState("10");

  const pr = parseFloat(portfolioReturn);
  const rf = parseFloat(riskFreeRate);
  const sd = parseFloat(stdDev);
  const valid = !isNaN(pr) && !isNaN(rf) && !isNaN(sd) && sd > 0;

  const sharpe = valid ? (pr - rf) / sd : null;

  function rating(s: number): { label: string; color: string; bg: string } {
    if (s >= 3)  return { label: "Excellent ✦",  color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" };
    if (s >= 2)  return { label: "Very Good",     color: "text-green-600",   bg: "bg-green-50 border-green-100"   };
    if (s >= 1)  return { label: "Acceptable",    color: "text-blue-600",    bg: "bg-blue-50 border-blue-100"     };
    if (s >= 0)  return { label: "Poor",          color: "text-orange-500",  bg: "bg-orange-50 border-orange-100" };
    return       { label: "Negative Edge",        color: "text-red-600",     bg: "bg-red-50 border-red-100"       };
  }

  if (compact) {
    return (
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Return %</label>
            <input type="number" value={portfolioReturn} onChange={e => setPortfolioReturn(e.target.value)}
              className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Risk-Free %</label>
            <input type="number" value={riskFreeRate} onChange={e => setRiskFreeRate(e.target.value)}
              className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Std Dev %</label>
            <input type="number" value={stdDev} onChange={e => setStdDev(e.target.value)}
              className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
          </div>
        </div>
        {sharpe !== null && (() => {
          const r = rating(sharpe);
          return (
            <div className={`rounded-xl p-3 text-center border ${r.bg}`}>
              <p className="text-xs text-gray-500">Sharpe Ratio</p>
              <p className={`text-2xl font-bold ${r.color}`}>{sharpe.toFixed(3)}</p>
              <p className={`text-xs ${r.color} mt-0.5`}>{r.label}</p>
            </div>
          );
        })()}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-5">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio / Strategy Return (%)</label>
          <input type="number" step="0.1" value={portfolioReturn}
            onChange={e => setPortfolioReturn(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="15" />
          <p className="text-xs text-gray-400 mt-1">Annualized return of your portfolio/strategy</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Risk-Free Rate (%)</label>
          <input type="number" step="0.1" value={riskFreeRate}
            onChange={e => setRiskFreeRate(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="4.5" />
          <p className="text-xs text-gray-400 mt-1">Current short-term government bond yield (e.g. US 3-month T-bill)</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Standard Deviation of Returns (%)</label>
          <input type="number" step="0.1" value={stdDev}
            onChange={e => setStdDev(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="10" />
          <p className="text-xs text-gray-400 mt-1">Annualized volatility of your returns</p>
        </div>
      </div>

      {sharpe !== null && (() => {
        const r = rating(sharpe);
        return (
          <div className="space-y-3">
            <div className={`rounded-2xl p-5 text-center border ${r.bg}`}>
              <p className="text-sm text-gray-500 mb-1">Sharpe Ratio</p>
              <p className={`text-5xl font-black ${r.color}`}>{sharpe.toFixed(3)}</p>
              <p className={`text-sm font-semibold mt-2 ${r.color}`}>{r.label}</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 border border-gray-100">
              <p className="font-medium text-gray-700 mb-2">Rating Scale</p>
              <div className="space-y-1">
                {[
                  ["≥ 3.0", "Excellent"],
                  ["≥ 2.0", "Very Good"],
                  ["≥ 1.0", "Acceptable"],
                  ["≥ 0.0", "Poor"],
                  ["< 0.0", "Negative edge"],
                ].map(([range, label]) => (
                  <div key={range} className="flex justify-between">
                    <span className="font-mono">{range}</span>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 border border-gray-100">
              <p className="font-medium text-gray-700 mb-1">Formula</p>
              <code className="text-blue-700">(Return − Risk-Free Rate) ÷ Std Dev</code>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
