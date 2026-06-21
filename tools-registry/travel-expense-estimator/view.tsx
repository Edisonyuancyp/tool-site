"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

type Expense = { label: string; amount: string };

const DEFAULT_EXPENSES: Expense[] = [
  { label: "Flights",       amount: "" },
  { label: "Hotel",         amount: "" },
  { label: "Car Rental",    amount: "" },
  { label: "Food & Dining", amount: "" },
  { label: "Activities",    amount: "" },
  { label: "Transportation",amount: "" },
];

export default function TravelExpenseEstimatorView({ variant }: ToolProps) {
  const [expenses, setExpenses] = useState<Expense[]>(DEFAULT_EXPENSES);
  const [days,     setDays]     = useState("7");
  const [people,   setPeople]   = useState("2");
  const [buffer,   setBuffer]   = useState("10");

  function update(i: number, field: keyof Expense, val: string) {
    setExpenses(prev => prev.map((e, idx) => idx === i ? { ...e, [field]: val } : e));
  }
  function addRow() { setExpenses(p => [...p, { label: "", amount: "" }]); }

  const subtotal  = expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  const bufferAmt = subtotal * (parseFloat(buffer) || 0) / 100;
  const total     = subtotal + bufferAmt;
  const perPerson = total / Math.max(1, parseInt(people) || 1);
  const perDay    = total / Math.max(1, parseInt(days) || 1);

  const fmt = (v: number) => v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Trip Length (days)</label>
          <input type="number" value={days} min="1" onChange={e => setDays(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Number of People</label>
          <input type="number" value={people} min="1" onChange={e => setPeople(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Buffer / Misc (%)</label>
          <input type="number" value={buffer} min="0" onChange={e => setBuffer(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400" />
        </div>
      </div>

      <div className="space-y-2">
        {expenses.map((e, i) => (
          <div key={i} className="flex gap-3 items-center">
            <input value={e.label} onChange={ev => update(i, "label", ev.target.value)}
              placeholder="Category"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400 text-sm" />
            <div className="relative w-36">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <input type="number" value={e.amount} onChange={ev => update(i, "amount", ev.target.value)}
                placeholder="0"
                className="w-full border border-gray-200 rounded-lg pl-7 pr-3 py-2 focus:outline-none focus:border-gray-400 text-sm" />
            </div>
          </div>
        ))}
        <button onClick={addRow} className="text-sm text-gray-400 hover:text-gray-700 mt-1">+ Add category</button>
      </div>

      {subtotal > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Subtotal",      value: fmt(subtotal)  },
              { label: `Buffer (${buffer}%)`, value: fmt(bufferAmt) },
              { label: "Total Trip",    value: fmt(total)     },
              { label: "Per Person",    value: fmt(perPerson) },
            ].map(({ label, value }) => (
              <div key={label} className="p-4 rounded-xl border border-gray-200 bg-gray-50 text-center">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 text-center">≈ {fmt(perDay)}/day per trip · {fmt(perDay / Math.max(1, parseInt(people)||1))}/day per person</p>
          <div className="flex justify-end">
            <CopyButton text={`Trip total: ${fmt(total)} | Per person: ${fmt(perPerson)} | ${days} days`} />
          </div>
        </div>
      )}
    </div>
  );
}
