"use client";
import { useState } from "react";

export interface ToolProps { variant?: string; }

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

const DEFAULT_CATEGORIES = [
  { name: "Housing (rent/mortgage)",  amount: "1500", type: "need"  },
  { name: "Groceries",                amount: "400",  type: "need"  },
  { name: "Transportation",           amount: "300",  type: "need"  },
  { name: "Utilities & Insurance",    amount: "200",  type: "need"  },
  { name: "Dining Out",               amount: "200",  type: "want"  },
  { name: "Entertainment",            amount: "100",  type: "want"  },
  { name: "Subscriptions",            amount: "50",   type: "want"  },
  { name: "Savings / Investments",    amount: "500",  type: "saving"},
  { name: "Emergency Fund",           amount: "100",  type: "saving"},
];

type Category = { name: string; amount: string; type: string };

export default function BudgetCalculatorView({ variant }: ToolProps) {
  const isFamily  = variant === "family-budget";
  const isStudent = variant === "student-budget";

  const initCategories: Category[] = isStudent
    ? [
        { name: "Rent / Dorm",       amount: "800",  type: "need"   },
        { name: "Groceries",         amount: "250",  type: "need"   },
        { name: "Tuition / Fees",    amount: "500",  type: "need"   },
        { name: "Transport",         amount: "100",  type: "need"   },
        { name: "Eating Out",        amount: "150",  type: "want"   },
        { name: "Entertainment",     amount: "80",   type: "want"   },
        { name: "Savings",           amount: "100",  type: "saving" },
      ]
    : isFamily
    ? [
        { name: "Mortgage / Rent",   amount: "2000", type: "need"   },
        { name: "Groceries",         amount: "700",  type: "need"   },
        { name: "Childcare / School",amount: "800",  type: "need"   },
        { name: "Transport",         amount: "500",  type: "need"   },
        { name: "Utilities",         amount: "300",  type: "need"   },
        { name: "Family Activities", amount: "300",  type: "want"   },
        { name: "Subscriptions",     amount: "100",  type: "want"   },
        { name: "Retirement / 401k", amount: "600",  type: "saving" },
        { name: "Emergency Fund",    amount: "200",  type: "saving" },
      ]
    : DEFAULT_CATEGORIES;

  const [income, setIncome]           = useState(isStudent ? "2000" : isFamily ? "8000" : "5000");
  const [categories, setCategories]   = useState<Category[]>(initCategories);
  const [calculated, setCalculated]   = useState(false);

  function updateAmount(i: number, val: string) {
    setCategories(prev => prev.map((c, idx) => idx === i ? { ...c, amount: val } : c));
  }

  function calculate() { setCalculated(true); }

  const totalExpenses = categories.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);
  const inc           = parseFloat(income) || 0;
  const remaining     = inc - totalExpenses;
  const needs         = categories.filter(c => c.type === "need").reduce((s, c)  => s + (parseFloat(c.amount)||0), 0);
  const wants         = categories.filter(c => c.type === "want").reduce((s, c)  => s + (parseFloat(c.amount)||0), 0);
  const savings       = categories.filter(c => c.type === "saving").reduce((s, c)=> s + (parseFloat(c.amount)||0), 0);

  const pct = (n: number) => inc > 0 ? `${((n / inc) * 100).toFixed(0)}%` : "—";

  return (
    <div className="space-y-6">
      {isStudent && (
        <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
          <strong>Student Budget:</strong> Pre-filled with typical student expenses. Even saving $100/month during college compounds significantly over time.
        </div>
      )}
      {isFamily && (
        <div className="p-4 bg-purple-50 rounded-xl text-sm text-purple-700">
          <strong>Family Budget:</strong> Pre-filled with typical family expenses. The 50/30/20 rule suggests 50% needs, 30% wants, 20% savings.
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Monthly Income (after tax) $</label>
        <input type="number" value={income} onChange={e => setIncome(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400 text-lg font-medium" />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Monthly Expenses</p>
        {categories.map((cat, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cat.type === "need" ? "bg-blue-400" : cat.type === "want" ? "bg-orange-400" : "bg-green-400"}`} />
            <span className="flex-1 text-sm text-gray-600">{cat.name}</span>
            <div className="flex items-center gap-1">
              <span className="text-gray-400 text-sm">$</span>
              <input type="number" value={cat.amount} onChange={e => updateAmount(i, e.target.value)}
                className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:border-gray-400" />
            </div>
          </div>
        ))}
      </div>

      <button onClick={calculate}
        className="w-full sm:w-auto px-8 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors">
        Calculate Budget
      </button>

      {calculated && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Remaining",  value: fmt(remaining),  color: remaining >= 0 ? "text-green-700" : "text-red-700", bg: remaining >= 0 ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200" },
              { label: "Needs",      value: `${fmt(needs)} (${pct(needs)})`,    color: "text-blue-700",   bg: "bg-blue-50 border-blue-200" },
              { label: "Wants",      value: `${fmt(wants)} (${pct(wants)})`,    color: "text-orange-700", bg: "bg-orange-50 border-orange-200" },
              { label: "Savings",    value: `${fmt(savings)} (${pct(savings)})`,color: "text-green-700",  bg: "bg-green-50 border-green-200" },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`p-4 rounded-xl border ${bg}`}>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className={`text-base font-bold ${color}`}>{value}</p>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-600">
            <p className="font-medium text-gray-800 mb-1">50/30/20 Rule check:</p>
            <div className="flex gap-6">
              <span>Needs: {pct(needs)} <span className={needs/inc <= 0.5 ? "text-green-600" : "text-red-500"}>{needs/inc <= 0.5 ? "✓" : "↑ high"}</span></span>
              <span>Wants: {pct(wants)} <span className={wants/inc <= 0.3 ? "text-green-600" : "text-red-500"}>{wants/inc <= 0.3 ? "✓" : "↑ high"}</span></span>
              <span>Savings: {pct(savings)} <span className={savings/inc >= 0.2 ? "text-green-600" : "text-red-500"}>{savings/inc >= 0.2 ? "✓" : "↓ low"}</span></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
