"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function DevCostEstimatorView({ variant }: ToolProps) {
  const [hours, setHours] = useState<number | "">("");
  const [rate, setRate] = useState<number | "">("");
  const [result, setResult] = useState<string | null>(null);

  function calculate() {
    if (typeof hours !== "number" || typeof rate !== "number" || hours <= 0 || rate <= 0) {
      setResult("Please enter valid positive numbers for hours and rate.");
      return;
    }
    const totalCost = hours * rate;
    setResult(`Estimated Development Cost: $${totalCost.toFixed(2)}`);
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
          Estimated Hours
        </label>
        <input
          type="number"
          value={hours}
          onChange={(e) => setHours(e.target.value ? parseFloat(e.target.value) : "")}
          placeholder="Enter estimated hours..."
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Hourly Rate ($)
        </label>
        <input
          type="number"
          value={rate}
          onChange={(e) => setRate(e.target.value ? parseFloat(e.target.value) : "")}
          placeholder="Enter hourly rate..."
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
