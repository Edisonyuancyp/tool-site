"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function CarLeaseCalculatorView({ variant }: ToolProps) {
  const [msrp,       setMsrp]       = useState("35000");
  const [residual,   setResidual]   = useState("55");   // % of MSRP
  const [moneyFactor,setMoneyFactor]= useState("0.00125");
  const [leaseTerm,  setLeaseTerm]  = useState("36");
  const [downPay,    setDownPay]    = useState("2000");
  const [taxRate,    setTaxRate]    = useState("8");

  const MSRP       = parseFloat(msrp)        || 0;
  const residualVal = MSRP * (parseFloat(residual) || 0) / 100;
  const MF         = parseFloat(moneyFactor) || 0;
  const months     = parseInt(leaseTerm)     || 36;
  const down       = parseFloat(downPay)     || 0;
  const tax        = (parseFloat(taxRate) || 0) / 100;

  const capCost    = MSRP - down;
  const depreciation = (capCost - residualVal) / months;
  const financeCharge = (capCost + residualVal) * MF;
  const basePayment  = depreciation + financeCharge;
  const monthlyPayment = basePayment * (1 + tax);
  const totalLeaseCost = monthlyPayment * months + down;

  const apr = MF * 2400;
  const fmt = (v: number) => v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Vehicle MSRP ($)</label>
          <input type="number" value={msrp} onChange={e => setMsrp(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Residual Value (% of MSRP)</label>
          <input type="number" value={residual} min="0" max="100" step="1" onChange={e => setResidual(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Money Factor <span className="text-gray-400 font-normal">(e.g. 0.00125)</span></label>
          <input type="number" value={moneyFactor} step="0.00001" onChange={e => setMoneyFactor(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
          <p className="text-xs text-gray-400 mt-1">≈ {apr.toFixed(2)}% APR</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Lease Term (months)</label>
          <input type="number" value={leaseTerm} onChange={e => setLeaseTerm(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Down Payment / Cap Reduction ($)</label>
          <input type="number" value={downPay} onChange={e => setDownPay(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Sales Tax Rate (%)</label>
          <input type="number" value={taxRate} step="0.1" onChange={e => setTaxRate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
        </div>
      </div>

      {MSRP > 0 && monthlyPayment > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Monthly Payment", value: fmt(monthlyPayment), highlight: true },
              { label: "Total Lease Cost", value: fmt(totalLeaseCost), highlight: false },
              { label: "Residual Value",   value: fmt(residualVal),    highlight: false },
              { label: "Finance Charge/mo",value: fmt(financeCharge),  highlight: false },
            ].map(({ label, value, highlight }) => (
              <div key={label} className={`p-4 rounded-xl border text-center ${highlight ? "border-gray-900 bg-gray-900" : "border-gray-200 bg-gray-50"}`}>
                <p className={`text-xs mb-1 ${highlight ? "text-gray-400" : "text-gray-500"}`}>{label}</p>
                <p className={`text-xl font-bold ${highlight ? "text-white" : "text-gray-900"}`}>{value}</p>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-500 space-y-1">
            <p>Cap cost: {fmt(capCost)} · Depreciation: {fmt(depreciation)}/mo · Finance: {fmt(financeCharge)}/mo</p>
            <p>Residual: {residual}% × {fmt(MSRP)} = {fmt(residualVal)}</p>
          </div>
          <div className="flex justify-end">
            <CopyButton text={`Monthly: ${fmt(monthlyPayment)} | Total: ${fmt(totalLeaseCost)} | ${months}mo lease on ${fmt(MSRP)} MSRP`} />
          </div>
        </div>
      )}
    </div>
  );
}
