"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function HomeToolCostCalculatorView({ variant }: ToolProps) {
  const [toolCount, setToolCount] = useState<string>("");
  const [toolCost, setToolCost] = useState<string>("");
  const [result, setResult] = useState<string | null>(null);

  function calculate() {
    const count = parseFloat(toolCount);
    const cost = parseFloat(toolCost);
    
    if (isNaN(count) || count <= 0 || isNaN(cost) || cost <= 0) {
      setResult("Please enter valid positive numbers for both fields.");
      return;
    }

    const totalCost = count * cost;
    setResult(`Estimated total cost for your home tool kit: $${totalCost.toFixed(2)}`);
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
          Number of Tools
        </label>
        <input
          type="text"
          value={toolCount}
          onChange={(e) => setToolCount(e.target.value)}
          placeholder="Enter the number of tools..."
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Cost per Tool
        </label>
        <input
          type="text"
          value={toolCost}
          onChange={(e) => setToolCost(e.target.value)}
          placeholder="Enter the cost per tool..."
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button
        onClick={calculate}
        className="bg-blue-600 text-white rounded px-4 py-2 w-full sm:w-auto"
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
