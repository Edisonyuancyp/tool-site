"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function CodeOptimizationCalculatorView({ variant }: ToolProps) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function calculate() {
    setError(null);
    if (!input || isNaN(Number(input)) || Number(input) <= 0) {
      setError("Please enter a valid positive number.");
      setResult(null);
      return;
    }

    const optimizationScore = Math.max(0, Math.min(100, 100 - (Number(input) * 10))); // Mock optimization logic
    setResult(`Optimization Score: ${optimizationScore}% (variant: ${variant ?? "default"})`);
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
          Input (e.g., lines of code, complexity)
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter value..."
          className="w-full border rounded px-3 py-2"
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
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
