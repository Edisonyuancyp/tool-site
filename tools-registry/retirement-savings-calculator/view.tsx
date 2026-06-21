"use client";
import { useState } from "react";

export interface ToolProps { variant?: string; }

interface Result {
  futureValue: number;
  totalContributions: number;
  totalInterest: number;
}

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function RetirementSavingsCalculatorView({ variant }: ToolProps) {
  const [currentAge,    setCurrentAge]    = useState("30");
  const [retireAge,     setRetireAge]     = useState("65");
  const [currentSaved,  setCurrentSaved]  = useState("10000");
  const [monthlyContrib,setMonthlyContrib]= useState("500");
  const [annualReturn,  setAnnualReturn]  = useState("7");
  const [result,        setResult]        = useState<Result | null>(null);

  function calculate() {
    const age   = parseFloat(currentAge);
    const retire= parseFloat(retireAge);
    const saved = parseFloat(currentSaved);
    const mc    = parseFloat(monthlyContrib);
    const r     = parseFloat(annualReturn) / 100 / 12;
    const n     = (retire - age) * 12;

    if (isNaN(age) || isNaN(retire) || isNaN(saved) || isNaN(mc) || isNaN(r) || n <= 0) return;

    const fvSaved = saved * Math.pow(1 + r, n);
    const fvContrib = mc * ((Math.pow(1 + r, n) - 1) / r);
    const futureValue = fvSaved + fvContrib;
    const totalContributions = saved + mc * n;
    setResult({ futureValue, totalContributions, totalInterest: futureValue - totalContributions });
  }

  const isEarly = variant === "early-retirement";

  return (
    <div className="space-y-6">
      {isEarly && (
        <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
          <strong>Early Retirement Mode</strong> — adjust your target retirement age to see how retiring early affects your savings goal.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: "Current Age", value: currentAge, set: setCurrentAge, placeholder: "30" },
          { label: isEarly ? "Target Early Retirement Age" : "Retirement Age", value: retireAge, set: setRetireAge, placeholder: isEarly ? "50" : "65" },
          { label: "Current Savings ($)", value: currentSaved, set: setCurrentSaved, placeholder: "10000" },
          { label: "Monthly Contribution ($)", value: monthlyContrib, set: setMonthlyContrib, placeholder: "500" },
          { label: "Expected Annual Return (%)", value: annualReturn, set: setAnnualReturn, placeholder: "7" },
        ].map(({ label, value, set, placeholder }) => (
          <div key={label}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            <input
              type="number"
              value={value}
              onChange={e => set(e.target.value)}
              placeholder={placeholder}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-gray-400 text-base"
            />
          </div>
        ))}
      </div>

      <button
        onClick={calculate}
        className="w-full sm:w-auto px-8 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors"
      >
        Calculate
      </button>

      {result && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Retirement Savings", value: fmt(result.futureValue), highlight: true },
            { label: "Total Contributed", value: fmt(result.totalContributions), highlight: false },
            { label: "Interest Earned", value: fmt(result.totalInterest), highlight: false },
          ].map(({ label, value, highlight }) => (
            <div key={label} className={`p-5 rounded-xl border ${highlight ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"}`}>
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className={`text-2xl font-bold ${highlight ? "text-green-700" : "text-gray-900"}`}>{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
