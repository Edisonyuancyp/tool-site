"use client";
import { useState } from "react";

export interface ToolProps { variant?: string; }

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
function pct(n: number) { return `${n.toFixed(2)}%`; }

export default function InvestmentReturnCalculatorView({ variant }: ToolProps) {
  const isStock     = variant === "stock-market";
  const isRealEstate= variant === "real-estate";

  const [initial,    setInitial]    = useState(isRealEstate ? "300000" : "10000");
  const [monthly,    setMonthly]    = useState(isRealEstate ? "0" : "200");
  const [annualRate, setAnnualRate] = useState(isRealEstate ? "5" : isStock ? "10" : "7");
  const [years,      setYears]      = useState("10");
  const [result, setResult] = useState<null | {
    futureValue: number; totalInvested: number; totalReturn: number; roi: number; cagr: number;
  }>(null);

  function calculate() {
    const P = parseFloat(initial);
    const m = parseFloat(monthly);
    const r = parseFloat(annualRate) / 100 / 12;
    const n = parseFloat(years) * 12;
    if ([P, m, r, n].some(isNaN) || n <= 0) return;

    const fvPrincipal = P * Math.pow(1 + r, n);
    const fvMonthly   = m > 0 ? m * ((Math.pow(1 + r, n) - 1) / r) : 0;
    const futureValue  = fvPrincipal + fvMonthly;
    const totalInvested= P + m * n;
    const totalReturn  = futureValue - totalInvested;
    const roi          = (totalReturn / totalInvested) * 100;
    const yrs          = parseFloat(years);
    const cagr         = (Math.pow(futureValue / totalInvested, 1 / yrs) - 1) * 100;
    setResult({ futureValue, totalInvested, totalReturn, roi, cagr });
  }

  const label = isRealEstate ? "Property Value ($)" : "Initial Investment ($)";
  const rateLabel = isRealEstate ? "Annual Appreciation Rate (%)" : isStock ? "Expected Annual Return (%) — S&P 500 avg ~10%" : "Annual Return (%)";

  return (
    <div className="space-y-6">
      {isStock && (
        <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
          The S&P 500 has returned ~10% annually on average over the past 30 years (before inflation). Adjust the rate to model different scenarios.
        </div>
      )}
      {isRealEstate && (
        <div className="p-4 bg-green-50 rounded-xl text-sm text-green-700">
          US residential real estate has appreciated ~4–5% annually on average. This calculator shows property value growth — rental income not included.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label, value: initial, set: setInitial },
          { label: "Monthly Contribution ($)", value: monthly, set: setMonthly },
          { label: rateLabel, value: annualRate, set: setAnnualRate },
          { label: "Investment Period (years)", value: years, set: setYears },
        ].map(({ label: l, value, set }) => (
          <div key={l}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{l}</label>
            <input type="number" value={value} onChange={e => set(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
          </div>
        ))}
      </div>

      <button onClick={calculate}
        className="w-full sm:w-auto px-8 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors">
        Calculate
      </button>

      {result && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Future Value",     value: fmt(result.futureValue),    highlight: true },
            { label: "Total Invested",   value: fmt(result.totalInvested),  highlight: false },
            { label: "Total Return",     value: fmt(result.totalReturn),    highlight: false },
            { label: "ROI",              value: pct(result.roi),            highlight: false },
          ].map(({ label: l, value, highlight }) => (
            <div key={l} className={`p-4 rounded-xl border ${highlight ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"}`}>
              <p className="text-xs text-gray-500 mb-1">{l}</p>
              <p className={`text-xl font-bold ${highlight ? "text-green-700" : "text-gray-900"}`}>{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
