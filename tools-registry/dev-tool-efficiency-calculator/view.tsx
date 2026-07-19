"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function DevToolEfficiencyCalculatorView({ variant }: ToolProps) {
  const [timeBefore, setTimeBefore] = useState<string>("");
  const [timeAfter, setTimeAfter] = useState<string>("");
  const [result, setResult] = useState<string | null>(null);

  function calculate() {
    const timeBeforeNum = parseFloat(timeBefore);
    const timeAfterNum = parseFloat(timeAfter);

    if (isNaN(timeBeforeNum) || isNaN(timeAfterNum) || timeBeforeNum <= 0 || timeAfterNum < 0) {
      setResult("Please enter valid positive numbers for time.");
      return;
    }

    const efficiency = ((timeBeforeNum - timeAfterNum) / timeBeforeNum) * 100;
    setResult(`Efficiency Improvement: ${efficiency.toFixed(2)}%`);
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
          Time Spent Before Tool (in hours)
        </label>
        <input
          type="number"
          value={timeBefore}
          onChange={(e) => setTimeBefore(e.target.value)}
          placeholder="Enter time in hours..."
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Time Spent After Tool (in hours)
        </label>
        <input
          type="number"
          value={timeAfter}
          onChange={(e) => setTimeAfter(e.target.value)}
          placeholder="Enter time in hours..."
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
