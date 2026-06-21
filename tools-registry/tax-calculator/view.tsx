"use client";
import { useState } from "react";

export interface ToolProps { variant?: string; }

// 2024 US Federal income tax brackets (single filer)
const BRACKETS_SINGLE = [
  { min: 0,       max: 11600,  rate: 0.10 },
  { min: 11600,   max: 47150,  rate: 0.12 },
  { min: 47150,   max: 100525, rate: 0.22 },
  { min: 100525,  max: 191950, rate: 0.24 },
  { min: 191950,  max: 243725, rate: 0.32 },
  { min: 243725,  max: 609350, rate: 0.35 },
  { min: 609350,  max: Infinity, rate: 0.37 },
];
const BRACKETS_MARRIED = [
  { min: 0,       max: 23200,  rate: 0.10 },
  { min: 23200,   max: 94300,  rate: 0.12 },
  { min: 94300,   max: 201050, rate: 0.22 },
  { min: 201050,  max: 383900, rate: 0.24 },
  { min: 383900,  max: 487450, rate: 0.32 },
  { min: 487450,  max: 731200, rate: 0.35 },
  { min: 731200,  max: Infinity, rate: 0.37 },
];
const STD_DEDUCTION = { single: 14600, married: 29200 };

function calcTax(income: number, brackets: typeof BRACKETS_SINGLE) {
  let tax = 0;
  for (const b of brackets) {
    if (income <= b.min) break;
    const taxable = Math.min(income, b.max) - b.min;
    tax += taxable * b.rate;
  }
  return tax;
}

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function TaxCalculatorView({ variant }: ToolProps) {
  const [income,     setIncome]     = useState("75000");
  const [filingAs,   setFilingAs]   = useState<"single"|"married">("single");
  const [deductions, setDeductions] = useState("");
  const [result,     setResult]     = useState<null | {
    taxableIncome: number; federalTax: number; effectiveRate: number; marginalRate: number; afterTax: number;
  }>(null);

  const isState = variant === "state-tax";

  function calculate() {
    const gross = parseFloat(income);
    if (isNaN(gross) || gross < 0) return;
    const stdDed = filingAs === "married" ? STD_DEDUCTION.married : STD_DEDUCTION.single;
    const itemized = parseFloat(deductions) || 0;
    const deductionUsed = Math.max(stdDed, itemized);
    const taxableIncome = Math.max(0, gross - deductionUsed);
    const brackets = filingAs === "married" ? BRACKETS_MARRIED : BRACKETS_SINGLE;
    const federalTax = calcTax(taxableIncome, brackets);
    const effectiveRate = gross > 0 ? (federalTax / gross) * 100 : 0;
    const marginalRate = brackets.find(b => taxableIncome > b.min && taxableIncome <= b.max)?.rate ?? 0.37;
    setResult({ taxableIncome, federalTax, effectiveRate, marginalRate, afterTax: gross - federalTax });
  }

  return (
    <div className="space-y-6">
      {isState && (
        <div className="p-4 bg-amber-50 rounded-xl text-sm text-amber-700">
          <strong>Note:</strong> State tax rates vary widely (0–13.3%). This calculator shows federal tax — add your state rate to the result for a complete picture.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Annual Income ($)</label>
          <input type="number" value={income} onChange={e => setIncome(e.target.value)}
            placeholder="75000"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Filing Status</label>
          <select value={filingAs} onChange={e => setFilingAs(e.target.value as "single"|"married")}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400 bg-white">
            <option value="single">Single</option>
            <option value="married">Married Filing Jointly</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Itemized Deductions ($) — leave blank to use standard deduction (${(filingAs === "married" ? STD_DEDUCTION.married : STD_DEDUCTION.single).toLocaleString()})
          </label>
          <input type="number" value={deductions} onChange={e => setDeductions(e.target.value)}
            placeholder="Leave blank for standard deduction"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
        </div>
      </div>

      <button onClick={calculate}
        className="w-full sm:w-auto px-8 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors">
        Calculate
      </button>

      {result && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Federal Tax Owed", value: fmt(result.federalTax), red: true },
            { label: "After-Tax Income",  value: fmt(result.afterTax),   red: false },
            { label: "Effective Rate",    value: `${result.effectiveRate.toFixed(1)}%`, red: false },
            { label: "Marginal Rate",     value: `${(result.marginalRate*100).toFixed(0)}%`, red: false },
          ].map(({ label, value, red }) => (
            <div key={label} className={`p-4 rounded-xl border ${red ? "border-red-200 bg-red-50" : "border-gray-200 bg-gray-50"}`}>
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`text-xl font-bold ${red ? "text-red-700" : "text-gray-900"}`}>{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
