"use client";
// Delegates to the legacy component; variant controls the default compounding frequency
import { useState, useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export interface ToolProps { variant?: string; }

const FREQ_MAP: Record<string, number> = {
  daily: 365,
  monthly: 12,
  quarterly: 4,
  annually: 1,
};
const FREQ_LABELS: Record<number, string> = { 365: "Daily", 12: "Monthly", 4: "Quarterly", 1: "Annually" };

function formatCurrency(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
}

interface DataPoint { year: number; balance: number; principal: number; interest: number; contributions: number; }

function calcData(principal: number, rate: number, years: number, freq: number, monthly: number): DataPoint[] {
  const points: DataPoint[] = [];
  for (let y = 0; y <= years; y++) {
    const freqRate = rate / 100 / freq;
    const periodsPerYear = freq;
    const n = y * periodsPerYear;
    const p = principal * Math.pow(1 + freqRate, n);
    const contrib = monthly > 0
      ? monthly * 12 / freq * ((Math.pow(1 + freqRate, n) - 1) / freqRate)
      : 0;
    const balance = p + contrib;
    points.push({ year: y, balance: Math.round(balance), principal: Math.round(principal), interest: Math.round(balance - principal - y * monthly * 12), contributions: Math.round(y * monthly * 12) });
  }
  return points;
}

export default function CompoundInterestView({ variant }: ToolProps) {
  const defaultFreq = FREQ_MAP[variant ?? "monthly"] ?? 12;
  const [principal, setPrincipal] = useState("10000");
  const [rate, setRate] = useState("7");
  const [years, setYears] = useState("10");
  const [freq, setFreq] = useState(defaultFreq);
  const [monthly, setMonthly] = useState("100");

  const data = useMemo(() => {
    const p = parseFloat(principal) || 0;
    const r = parseFloat(rate) || 0;
    const y = parseInt(years) || 0;
    const m = parseFloat(monthly) || 0;
    if (!p || !r || !y) return [];
    return calcData(p, r, y, freq, m);
  }, [principal, rate, years, freq, monthly]);

  const last = data[data.length - 1];

  return (
    <div className="space-y-6">
      {/* Compounding frequency selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Compounding Frequency</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(FREQ_LABELS).map(([f, label]) => (
            <button key={f} onClick={() => setFreq(Number(f))}
              className={`px-4 py-1.5 rounded-md text-sm font-medium border transition-all ${Number(f) === freq ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-500 hover:border-gray-400"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: "Initial Principal ($)", value: principal, set: setPrincipal, placeholder: "10000" },
          { label: "Annual Interest Rate (%)", value: rate, set: setRate, placeholder: "7" },
          { label: "Investment Period (years)", value: years, set: setYears, placeholder: "10" },
          { label: "Monthly Contribution ($)", value: monthly, set: setMonthly, placeholder: "100" },
        ].map(({ label, value, set, placeholder }) => (
          <div key={label}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            <input type="number" value={value} onChange={(e) => set(e.target.value)} placeholder={placeholder}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 text-base" />
          </div>
        ))}
      </div>

      {last && (
        <>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Final Balance", value: formatCurrency(last.balance), color: "text-green-600" },
              { label: "Total Interest", value: formatCurrency(last.interest), color: "text-blue-600" },
              { label: "Total Contributions", value: formatCurrency(last.contributions + parseFloat(principal || "0")), color: "text-gray-700" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="year" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `Yr ${v}`} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(Number(v ?? 0))} />
              <Legend />
              <Area type="monotone" dataKey="principal" stackId="1" stroke="#e5e7eb" fill="#f9fafb" name="Principal" />
              <Area type="monotone" dataKey="contributions" stackId="1" stroke="#93c5fd" fill="#dbeafe" name="Contributions" />
              <Area type="monotone" dataKey="interest" stackId="1" stroke="#6ee7b7" fill="#d1fae5" name="Interest" />
            </AreaChart>
          </ResponsiveContainer>
        </>
      )}

      {/* Cross-links to other frequency variants */}
      <div className="pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400 mb-2">Other compounding frequencies:</p>
        <div className="flex flex-wrap gap-2 text-xs">
          {variant !== undefined && <a href="/tools/compound-interest-calculator" className="text-blue-500 hover:underline">Standard</a>}
          {variant !== "monthly" && <a href="/tools/compound-interest-calculator-monthly" className="text-blue-500 hover:underline">Monthly</a>}
          {variant !== "daily" && <a href="/tools/compound-interest-calculator-daily" className="text-blue-500 hover:underline">Daily</a>}
          {variant !== "annually" && <a href="/tools/compound-interest-calculator-annually" className="text-blue-500 hover:underline">Annually</a>}
        </div>
      </div>
    </div>
  );
}
