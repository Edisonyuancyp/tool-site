"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function DevToolPerformanceCalculatorView({ variant }: ToolProps) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function calculate() {
    const parsedInput = parseFloat(input);

    if (isNaN(parsedInput) || parsedInput <= 0) {
      setError("Please enter a valid positive number.");
      setResult(null);
      return;
    }

    setError(null);
    const efficiency = (parsedInput * 1.5).toFixed(2); // Example calculation logic
    const effectiveness = (parsedInput * 2).toFixed(2); // Example calculation logic
    setResult(`Efficiency: ${efficiency}, Effectiveness: ${effectiveness}`);
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
          Input (e.g., hours spent):
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter value..."
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button
        onClick={calculate}
        className="bg-blue-600 text-white rounded px-4 py-2 w-full"
      >
        Calculate
      </button>

      {error && (
        <p className="text-red-600">{error}</p>
      )}

      {result && (
        <div className="flex items-center justify-between p-5 rounded-xl border border-gray-200 bg-gray-50">
          <p className="text-xl font-bold text-gray-900">{result}</p>
          <CopyButton text={result} />
        </div>
      )}
    </div>
  );
}
