"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";
import ShareResultCard from "@/components/ShareResultCard";

export interface ToolProps { variant?: string; }

const PRESETS: Record<string, { label: string; amount: number; rate: number; years: number }> = {
  mortgage:      { label: "Mortgage",      amount: 300000, rate: 6.5,  years: 30 },
  "car-loan":    { label: "Car Loan",      amount: 25000,  rate: 7.5,  years: 5  },
  personal:      { label: "Personal Loan", amount: 10000,  rate: 12,   years: 3  },
};

export default function LoanCalculatorView({ variant }: ToolProps) {
  const preset = variant && PRESETS[variant] ? PRESETS[variant] : PRESETS.personal;

  const [amount,   setAmount]   = useState(String(preset.amount));
  const [rate,     setRate]     = useState(String(preset.rate));
  const [years,    setYears]    = useState(String(preset.years));
  const [extra,    setExtra]    = useState("0");
  const [result,   setResult]   = useState<null | {
    monthly: number; totalPaid: number; totalInterest: number;
    monthsToPayoff: number; interestSaved: number;
  }>(null);

  function calculate() {
    const P = parseFloat(amount);
    const r = parseFloat(rate) / 100 / 12;
    const n = parseFloat(years) * 12;
    const extraPmt = parseFloat(extra) || 0;
    if (!P || !r || !n) return;

    const monthly = r === 0 ? P / n : (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPaid = monthly * n;
    const totalInterest = totalPaid - P;

    // with extra payment
    let bal = P, months = 0, interestPaid = 0;
    const pmt = monthly + extraPmt;
    while (bal > 0 && months < n * 2) {
      const int = bal * r;
      interestPaid += int;
      bal = bal + int - pmt;
      months++;
      if (bal < 0) bal = 0;
    }
    const interestSaved = totalInterest - interestPaid;

    setResult({ monthly, totalPaid, totalInterest, monthsToPayoff: months, interestSaved: Math.max(0, interestSaved) });
  }

  const fmt = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Loan Amount ($)</label>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Annual Interest Rate (%)</label>
          <input type="number" value={rate} step="0.1" onChange={e => setRate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Loan Term (years)</label>
          <input type="number" value={years} onChange={e => setYears(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Extra Monthly Payment ($) <span className="text-gray-400 font-normal">— optional</span></label>
        <input type="number" value={extra} onChange={e => setExtra(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
      </div>

      <button onClick={calculate}
        className="w-full sm:w-auto px-8 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors">
        Calculate
      </button>

      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Monthly Payment",  value: fmt(result.monthly) },
              { label: "Total Interest",   value: fmt(result.totalInterest) },
              { label: "Total Paid",       value: fmt(result.totalPaid) },
            ].map(({ label, value }) => (
              <div key={label} className="p-5 rounded-xl border border-gray-200 bg-gray-50 text-center">
                <p className="text-sm text-gray-500 mb-1">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          {parseFloat(extra) > 0 && (
            <div className="p-4 rounded-xl border border-green-200 bg-green-50 flex items-start gap-3">
              <span className="text-green-600 text-lg mt-0.5">💡</span>
              <p className="text-sm text-green-800">
                With {fmt(parseFloat(extra))} extra/month, you pay off in{" "}
                <strong>{Math.floor(result.monthsToPayoff / 12)}y {result.monthsToPayoff % 12}m</strong> and save{" "}
                <strong>{fmt(result.interestSaved)}</strong> in interest.
              </p>
            </div>
          )}

          <div className="flex justify-end">
            <CopyButton text={`Monthly: ${fmt(result.monthly)} | Total Interest: ${fmt(result.totalInterest)} | Total Paid: ${fmt(result.totalPaid)}`} />
          </div>

          <ShareResultCard
            toolName="Loan Calculator"
            toolIcon="🏦"
            slug="loan-calculator"
            results={[
              { label: "Monthly Payment",  value: fmt(result.monthly) },
              { label: "Total Interest",   value: fmt(result.totalInterest) },
              { label: "Total Paid",       value: fmt(result.totalPaid) },
            ]}
          />
        </div>
      )}
    </div>
  );
}
