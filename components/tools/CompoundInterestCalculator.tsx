"use client";
import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatShort(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

interface DataPoint {
  year: number;
  balance: number;
  principal: number;
  interest: number;
  contributions: number;
}

function calculate(
  principal: number,
  annualRate: number,
  years: number,
  compoundFreq: number,
  monthlyContribution: number
): DataPoint[] {
  const points: DataPoint[] = [];

  for (let y = 0; y <= years; y++) {
    const months = y * 12;

    // Principal grows using the nominal annual rate compounded at chosen frequency
    // Equivalent effective monthly rate stays the same: r_eff = (1 + annual/freq)^(freq/12) - 1
    const freqRate = annualRate / 100 / compoundFreq;
    const effectiveMonthlyRate =
      annualRate === 0 ? 0 : Math.pow(1 + freqRate, compoundFreq / 12) - 1;

    const principalGrowth = principal * Math.pow(1 + effectiveMonthlyRate, months);

    // FV of annuity-due (end-of-period monthly contributions)
    const contribGrowth =
      effectiveMonthlyRate === 0
        ? monthlyContribution * months
        : monthlyContribution * ((Math.pow(1 + effectiveMonthlyRate, months) - 1) / effectiveMonthlyRate);

    const balance = principalGrowth + contribGrowth;
    const totalContributions = principal + monthlyContribution * months;
    const interest = Math.max(0, balance - totalContributions);

    points.push({
      year: y,
      balance: Math.round(balance),
      principal: Math.round(totalContributions),
      interest: Math.round(interest),
      contributions: Math.round(totalContributions - principal),
    });
  }
  return points;
}

const FREQ_OPTIONS = [
  { label: "Annually", value: 1 },
  { label: "Semi-annually", value: 2 },
  { label: "Quarterly", value: 4 },
  { label: "Monthly", value: 12 },
  { label: "Daily", value: 365 },
];

export default function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState("10000");
  const [rate, setRate] = useState("7");
  const [years, setYears] = useState("20");
  const [freq, setFreq] = useState(12);
  const [monthly, setMonthly] = useState("200");

  const p = Math.max(0, parseFloat(principal) || 0);
  const r = Math.max(0, parseFloat(rate) || 0);
  const y = Math.min(50, Math.max(1, parseInt(years) || 1));
  const m = Math.max(0, parseFloat(monthly) || 0);

  const data = useMemo(() => calculate(p, r, y, freq, m), [p, r, y, freq, m]);
  const final = data[data.length - 1];

  const totalInvested = final.principal; // from calculate() — always consistent
  const totalInterest = Math.max(0, final.balance - totalInvested);
  const roi = totalInvested > 0 ? (totalInterest / totalInvested) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Initial Principal ($)</label>
          <input
            type="number"
            min="0"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:border-gray-400 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Annual Interest Rate (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:border-gray-400 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Investment Period (years)</label>
          <input
            type="number"
            min="1"
            max="50"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:border-gray-400 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Contribution ($)</label>
          <input
            type="number"
            min="0"
            value={monthly}
            onChange={(e) => setMonthly(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-gray-900 focus:outline-none focus:border-gray-400 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Compound Frequency</label>
          <div className="flex flex-wrap gap-2">
            {FREQ_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFreq(opt.value)}
                className={
                  "px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all " +
                  (freq === opt.value
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400")
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-900 text-white rounded-xl p-4">
          <div className="text-xs text-gray-400 mb-1">Final Balance</div>
          <div className="text-xl font-bold">{formatCurrency(final.balance)}</div>
        </div>
        <div className="border border-gray-100 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">Total Invested</div>
          <div className="text-xl font-bold text-gray-900">{formatCurrency(totalInvested)}</div>
        </div>
        <div className="border border-gray-100 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">Interest Earned</div>
          <div className="text-xl font-bold text-green-600">{formatCurrency(totalInterest)}</div>
        </div>
        <div className="border border-gray-100 rounded-xl p-4">
          <div className="text-xs text-gray-500 mb-1">ROI</div>
          <div className="text-xl font-bold text-blue-600">{roi.toFixed(1)}%</div>
        </div>
      </div>

      {/* Chart */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Growth Over Time</h3>
        <div className="w-full" style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6b7280" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6b7280" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#111827" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#111827" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="year"
                tickFormatter={(v) => `Yr ${v}`}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
              />
              <YAxis
                tickFormatter={formatShort}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                width={55}
              />
              <Tooltip
                formatter={(value, name) => [
                  formatCurrency(Number(value)),
                  name === "principal" ? "Total Invested" : "Interest Earned",
                ]}
                labelFormatter={(l) => `Year ${l}`}
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
              />
              <Legend
                formatter={(value) =>
                  value === "principal" ? "Total Invested" : "Interest Earned"
                }
                wrapperStyle={{ fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="principal"
                stackId="1"
                stroke="#9ca3af"
                fill="url(#colorPrincipal)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="interest"
                stackId="1"
                stroke="#111827"
                fill="url(#colorInterest)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Year-by-year table (last 5 rows) */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Year-by-Year Breakdown</h3>
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Year</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500">Invested</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500">Interest</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.filter((_, i) => i % Math.max(1, Math.floor(y / 10)) === 0 || i === data.length - 1).map((row) => (
                <tr key={row.year} className={row.year === y ? "bg-gray-50 font-semibold" : "hover:bg-gray-50"}>
                  <td className="px-4 py-2.5 text-gray-700">{row.year}</td>
                  <td className="px-4 py-2.5 text-right text-gray-600">{formatCurrency(row.principal)}</td>
                  <td className="px-4 py-2.5 text-right text-green-600">{formatCurrency(row.interest)}</td>
                  <td className="px-4 py-2.5 text-right text-gray-900">{formatCurrency(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
