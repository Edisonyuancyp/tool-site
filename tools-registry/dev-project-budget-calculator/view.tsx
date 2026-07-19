"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function DevProjectBudgetCalculatorView({ variant }: ToolProps) {
  const [laborCost, setLaborCost] = useState("");
  const [toolCost, setToolCost] = useState("");
  const [resourceCost, setResourceCost] = useState("");
  const [result, setResult] = useState<string | null>(null);

  function calculate() {
    const labor = parseFloat(laborCost);
    const tools = parseFloat(toolCost);
    const resources = parseFloat(resourceCost);

    if (isNaN(labor) || labor < 0) {
      alert("Please enter a valid labor cost.");
      return;
    }
    if (isNaN(tools) || tools < 0) {
      alert("Please enter a valid tools cost.");
      return;
    }
    if (isNaN(resources) || resources < 0) {
      alert("Please enter a valid resources cost.");
      return;
    }

    const totalBudget = labor + tools + resources;
    setResult(`Estimated Project Budget: $${totalBudget.toFixed(2)}`);
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
          Labor Cost
        </label>
        <input
          type="number"
          value={laborCost}
          onChange={(e) => setLaborCost(e.target.value)}
          placeholder="Enter labor cost..."
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Tools Cost
        </label>
        <input
          type="number"
          value={toolCost}
          onChange={(e) => setToolCost(e.target.value)}
          placeholder="Enter tools cost..."
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Resources Cost
        </label>
        <input
          type="number"
          value={resourceCost}
          onChange={(e) => setResourceCost(e.target.value)}
          placeholder="Enter resources cost..."
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
