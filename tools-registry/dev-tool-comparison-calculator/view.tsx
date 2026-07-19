"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function DevToolComparisonCalculatorView({ variant }: ToolProps) {
  const [tool1, setTool1] = useState("");
  const [tool2, setTool2] = useState("");
  const [result, setResult] = useState<string | null>(null);

  function calculate() {
    const parsedTool1 = parseFloat(tool1);
    const parsedTool2 = parseFloat(tool2);

    if (isNaN(parsedTool1) || isNaN(parsedTool2) || parsedTool1 <= 0 || parsedTool2 <= 0) {
      setResult("Please enter valid positive numbers for both tools.");
      return;
    }

    const comparison = parsedTool1 > parsedTool2 ? "Tool 1 is better" : parsedTool1 < parsedTool2 ? "Tool 2 is better" : "Both tools are equal in performance";
    setResult(comparison);
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
          Tool 1 Metric
        </label>
        <input
          type="number"
          value={tool1}
          onChange={(e) => setTool1(e.target.value)}
          placeholder="Enter value for Tool 1..."
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Tool 2 Metric
        </label>
        <input
          type="number"
          value={tool2}
          onChange={(e) => setTool2(e.target.value)}
          placeholder="Enter value for Tool 2..."
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
