"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function HomeLoanAffordabilityCalculatorView({ variant }: ToolProps) {
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState("");
  const [result, setResult] = useState<string | null>(null);

  function calculate() {
    const incomeNumber = parseFloat(income);
    const expensesNumber = parseFloat(expenses);
    
    if (isNaN(incomeNumber) || isNaN(expensesNumber) || incomeNumber <= 0 || expensesNumber < 0) {
      setResult("Please enter valid income and expenses.");
      return;
    }

    const affordability = (incomeNumber - expensesNumber) * 3; // Simplified calculation
    setResult(`Your estimated home loan affordability is: $${affordability.toFixed(2)}`);
  }

  return (
    <div className="space-y-6">
      {variant && (
        <p className="text-sm text-blue-600 font-medium">
          Mode: {variant}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Monthly Income
        </label>
        <input
          type="text"
          value={income}
          onChange={(e) => setIncome(e.target.value)}
          placeholder="Enter your monthly income..."
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Monthly Expenses
        </label>
        <input
          type="text"
          value={expenses}
          onChange={(e) => setExpenses(e.target.value)}
          placeholder="Enter your monthly expenses..."
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button
        onClick={calculate}
        className="bg-blue-600 text-white rounded px-4 py-2"
      >
        Calculate
      </button>

      {result && (
        <div className="flex items-center justify-between p-5 rounded-xl border border-gray-200 bg-gray-50">
          <p className="text-xl font-bold text-gray-900">{result}</p>
          <CopyButton text={result} />
        </div>
      )}
    </div>
  );
}
