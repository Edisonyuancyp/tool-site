"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

const METHODS = [
  { label: "Average Daily Balance", value: "adb" },
  { label: "Adjusted Balance",      value: "adj" },
  { label: "Previous Balance",      value: "prev"},
];

export default function FinanceChargeCalculatorView({ variant }: ToolProps) {
  const [balance,    setBalance]    = useState("1500");
  const [apr,        setApr]        = useState("22.99");
  const [days,       setDays]       = useState("30");
  const [payments,   setPayments]   = useState("0");
  const [methodIdx,  setMethodIdx]  = useState(0);

  const B  = parseFloat(balance)  || 0;
  const r  = (parseFloat(apr) || 0) / 100;
  const d  = parseInt(days) || 30;
  const P  = parseFloat(payments) || 0;

  const dailyRate = r / 365;
  const method = METHODS[methodIdx].value;

  let chargeBase = B;
  if (method === "adj")  chargeBase = Math.max(0, B - P);
  if (method === "prev") chargeBase = B;

  const financeCharge = chargeBase * dailyRate * d;
  const newBalance    = chargeBase + financeCharge - (method === "adb" ? P : 0);
  const annualCharge  = B * r;

  const fmt = (v: number) => v.toLocaleString("en-US", { style: "currency", currency: "USD" });

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Calculation Method</label>
        <div className="flex flex-wrap gap-2">
          {METHODS.map((m, i) => (
            <button key={m.value} onClick={() => setMethodIdx(i)}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                methodIdx === i ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-700 hover:border-gray-400"
              }`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Balance ($)</label>
          <input type="number" value={balance} onChange={e => setBalance(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Annual APR (%)</label>
          <input type="number" value={apr} step="0.01" onChange={e => setApr(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Billing Period (days)</label>
          <input type="number" value={days} onChange={e => setDays(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Payments Made ($)</label>
          <input type="number" value={payments} onChange={e => setPayments(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
        </div>
      </div>

      {B > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Finance Charge",   value: fmt(financeCharge), accent: true },
              { label: "New Balance",      value: fmt(Math.max(0, newBalance)), accent: false },
              { label: "Annual Charge Est",value: fmt(annualCharge),  accent: false },
            ].map(({ label, value, accent }) => (
              <div key={label} className={`p-5 rounded-xl border text-center ${accent ? "border-gray-900 bg-gray-900" : "border-gray-200 bg-gray-50"}`}>
                <p className={`text-sm mb-1 ${accent ? "text-gray-400" : "text-gray-500"}`}>{label}</p>
                <p className={`text-2xl font-bold ${accent ? "text-white" : "text-gray-900"}`}>{value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center">
            Daily rate: {(dailyRate * 100).toFixed(4)}% · Method: {METHODS[methodIdx].label}
          </p>
          <div className="flex justify-end">
            <CopyButton text={`Finance charge: ${fmt(financeCharge)} on ${fmt(B)} balance at ${apr}% APR (${d} days)`} />
          </div>
        </div>
      )}
    </div>
  );
}
