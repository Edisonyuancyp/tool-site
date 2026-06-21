"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

const TIP_PRESETS = [10, 15, 18, 20, 25];

export default function TipCalculatorView({ variant }: ToolProps) {
  const [bill,    setBill]    = useState("");
  const [tipPct,  setTipPct]  = useState(variant === "delivery" || variant === "taxi" ? "18" : "18");
  const [custom,  setCustom]  = useState(false);
  const [people,  setPeople]  = useState(variant === "split" ? "4" : "1");

  const bill$ = parseFloat(bill) || 0;
  const pct   = parseFloat(tipPct) || 0;
  const n     = Math.max(1, parseInt(people) || 1);

  const tipAmt   = bill$ * pct / 100;
  const total    = bill$ + tipAmt;
  const perPerson = total / n;
  const tipPer   = tipAmt / n;

  const fmt = (v: number) => v.toLocaleString("en-US", { style: "currency", currency: "USD" });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Bill Amount ($)</label>
          <input type="number" value={bill} onChange={e => setBill(e.target.value)}
            placeholder="0.00"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400 text-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Number of People</label>
          <input type="number" value={people} min="1" onChange={e => setPeople(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400 text-lg" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tip Percentage</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {TIP_PRESETS.map(p => (
            <button key={p} onClick={() => { setTipPct(String(p)); setCustom(false); }}
              className={`px-4 py-2 rounded-lg border font-medium text-sm transition-colors ${
                !custom && tipPct === String(p) ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-700 hover:border-gray-400"
              }`}>
              {p}%
            </button>
          ))}
          <button onClick={() => setCustom(true)}
            className={`px-4 py-2 rounded-lg border font-medium text-sm transition-colors ${
              custom ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-700 hover:border-gray-400"
            }`}>
            Custom
          </button>
        </div>
        {custom && (
          <input type="number" value={tipPct} onChange={e => setTipPct(e.target.value)}
            placeholder="Enter %"
            className="w-32 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
        )}
      </div>

      {bill$ > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Tip Amount",    value: fmt(tipAmt)   },
              { label: "Total Bill",    value: fmt(total)    },
              { label: n > 1 ? `Each Person (${n})` : "You Pay", value: fmt(perPerson) },
            ].map(({ label, value }) => (
              <div key={label} className="p-5 rounded-xl border border-gray-200 bg-gray-50 text-center">
                <p className="text-sm text-gray-500 mb-1">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          {n > 1 && (
            <p className="text-sm text-gray-500 text-center">
              Each person pays <strong>{fmt(tipPer)}</strong> tip + <strong>{fmt(bill$ / n)}</strong> food = <strong>{fmt(perPerson)}</strong>
            </p>
          )}

          <div className="flex justify-end">
            <CopyButton text={`Tip: ${fmt(tipAmt)} | Total: ${fmt(total)}${n > 1 ? ` | Per person: ${fmt(perPerson)}` : ""}`} />
          </div>
        </div>
      )}
    </div>
  );
}
