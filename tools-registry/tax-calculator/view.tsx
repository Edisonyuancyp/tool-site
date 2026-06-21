"use client";
import { useState, useEffect } from "react";
import { calculateTax, getSupportedCountries, getFilingStatuses, type CountryCode, type TaxResult } from "@/lib/taxEngine";

export interface ToolProps { variant?: string; }

// Map variant key → country code
const VARIANT_TO_COUNTRY: Record<string, CountryCode> = {
  "uk":            "uk",
  "ca":            "ca",
  "au":            "au",
  "de":            "de",
  "sg":            "sg",
  "fr":            "fr",
  "jp":            "jp",
  "self-employed": "us",
};

const COUNTRIES = getSupportedCountries();

function fmt(n: number, symbol: string, currency: string) {
  return n.toLocaleString("en-US", { style: "currency", currency, maximumFractionDigits: 0 });
}

function labelizeStatus(s: string): string {
  const map: Record<string, string> = {
    single: "Single", married: "Married Filing Jointly",
    individual: "Individual", resident: "Resident", nonresident: "Non-Resident",
  };
  return map[s] ?? s.charAt(0).toUpperCase() + s.slice(1);
}

export default function TaxCalculatorView({ variant }: ToolProps) {
  const defaultCountry: CountryCode = VARIANT_TO_COUNTRY[variant ?? ""] ?? "us";
  const isSelfEmployed = variant === "self-employed";

  const [country,      setCountry]      = useState<CountryCode>(defaultCountry);
  const [income,       setIncome]       = useState("75000");
  const [filingStatus, setFilingStatus] = useState("single");
  const [selfEmployed, setSelfEmployed] = useState(isSelfEmployed);
  const [result,       setResult]       = useState<TaxResult | null>(null);
  const [showBrackets, setShowBrackets] = useState(false);

  const statuses = getFilingStatuses(country);

  useEffect(() => {
    setFilingStatus(statuses[0]);
    setResult(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  function calculate() {
    const inc = parseFloat(income);
    if (isNaN(inc) || inc < 0) return;
    const res = calculateTax(country, inc, filingStatus, { isSelfEmployed: selfEmployed });
    setResult(res);
  }

  const sym = COUNTRIES.find(c => c.code === country)?.currencySymbol ?? "$";
  const currency = (result?.currency ?? "USD");

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
        <strong>Disclaimer:</strong> This tool is for estimation purposes only. Consult a tax professional for official advice. Figures based on 2024 tax year rules.
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
          <select value={country} onChange={e => setCountry(e.target.value as CountryCode)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:border-gray-400">
            {COUNTRIES.map(c => (
              <option key={c.code} value={c.code}>{c.name} ({c.currencySymbol})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Annual Income ({sym})</label>
          <input type="number" value={income} onChange={e => setIncome(e.target.value)}
            placeholder="75000"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
        </div>

        {statuses.length > 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Filing Status</label>
            <select value={filingStatus} onChange={e => setFilingStatus(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:border-gray-400">
              {statuses.map(s => <option key={s} value={s}>{labelizeStatus(s)}</option>)}
            </select>
          </div>
        )}

        {country === "us" && (
          <div className="flex items-center gap-3 sm:self-end pb-2.5">
            <input type="checkbox" id="se" checked={selfEmployed} onChange={e => setSelfEmployed(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300" />
            <label htmlFor="se" className="text-sm text-gray-700">Self-employed / Freelancer (add SE tax)</label>
          </div>
        )}
      </div>

      <button onClick={calculate}
        className="w-full sm:w-auto px-8 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors">
        Calculate
      </button>

      {result && (
        <div className="space-y-5">
          {/* Key metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Income Tax",      value: fmt(result.incomeTax,   sym, currency), accent: "red"   },
              { label: "Net Income",      value: fmt(result.netIncome,   sym, currency), accent: "green" },
              { label: "Effective Rate",  value: `${result.effectiveRate.toFixed(1)}%`,  accent: "gray"  },
              { label: "Marginal Rate",   value: `${(result.marginalRate * 100).toFixed(0)}%`, accent: "gray" },
            ].map(({ label, value, accent }) => (
              <div key={label} className={`p-4 rounded-xl border ${
                accent === "red"   ? "border-red-200 bg-red-50"   :
                accent === "green" ? "border-green-200 bg-green-50" :
                "border-gray-200 bg-gray-50"}`}>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className={`text-lg font-bold ${accent === "red" ? "text-red-700" : accent === "green" ? "text-green-700" : "text-gray-900"}`}>{value}</p>
              </div>
            ))}
          </div>

          {/* Additional charges (NI, Medicare, social security…) */}
          {result.additionalCharges.length > 0 && (
            <div className="p-4 rounded-xl border border-blue-100 bg-blue-50 space-y-1.5">
              <p className="text-xs font-medium text-blue-800 mb-2">Additional Deductions</p>
              {result.additionalCharges.map(c => (
                <div key={c.label} className="flex justify-between text-sm text-blue-700">
                  <span>{c.label}</span>
                  <span className="font-medium">{fmt(c.amount, sym, currency)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Income breakdown bar */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500">Income Breakdown</p>
            <div className="flex rounded-lg overflow-hidden h-4 text-xs">
              {[
                { label: "Tax",    amt: result.incomeTax,    color: "bg-red-400"   },
                { label: "Charges",amt: result.totalDeductions, color: "bg-orange-400"},
                { label: "Net",    amt: result.netIncome,    color: "bg-green-400" },
              ].map(({ label, amt, color }) => {
                const w = result.grossIncome > 0 ? (amt / result.grossIncome) * 100 : 0;
                return w > 0 ? <div key={label} style={{ width: `${w}%` }} className={`${color}`} title={`${label}: ${fmt(amt, sym, currency)}`} /> : null;
              })}
            </div>
            <div className="flex gap-4 text-xs text-gray-500 pt-0.5">
              {[["bg-red-400","Tax"],["bg-orange-400","Other charges"],["bg-green-400","Take-home"]].map(([c,l]) => (
                <span key={l} className="flex items-center gap-1"><span className={`w-2 h-2 rounded-full ${c}`}/>{l}</span>
              ))}
            </div>
          </div>

          {/* Tax bracket breakdown (toggle) */}
          <div>
            <button onClick={() => setShowBrackets(b => !b)}
              className="text-sm text-gray-500 underline underline-offset-2">
              {showBrackets ? "Hide" : "Show"} tax bracket breakdown
            </button>
            {showBrackets && (
              <div className="mt-3 rounded-xl border border-gray-200 overflow-hidden text-sm">
                <table className="w-full">
                  <thead className="bg-gray-50 text-xs text-gray-500">
                    <tr>
                      <th className="text-left px-4 py-2">Income Range ({sym})</th>
                      <th className="text-right px-4 py-2">Rate</th>
                      <th className="text-right px-4 py-2">Tax</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.bracketBreakdown.map((b, i) => (
                      <tr key={i} className="border-t border-gray-100">
                        <td className="px-4 py-2 text-gray-600">{b.range}</td>
                        <td className="px-4 py-2 text-right text-gray-600">{b.rate}</td>
                        <td className="px-4 py-2 text-right font-medium text-gray-900">{fmt(b.taxPaid, sym, currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Country note */}
          <p className="text-xs text-gray-400 italic">{result.notes}</p>
        </div>
      )}
    </div>
  );
}
