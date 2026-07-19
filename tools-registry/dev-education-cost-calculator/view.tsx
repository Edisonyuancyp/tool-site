"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function DevEducationCostCalculatorView({ variant }: ToolProps) {
  const [hourlyRate, setHourlyRate] = useState("");
  const [hours, setHours] = useState("");
  const [result, setResult] = useState<string | null>(null);

  function calculate() {
    const rate = parseFloat(hourlyRate);
    const hoursValue = parseFloat(hours);
    
    if (isNaN(rate) || isNaN(hoursValue) || rate <= 0 || hoursValue <= 0) {
      setResult("Please enter valid positive numbers for hourly rate and hours.");
      return;
    }

    const totalCost = rate * hoursValue;
    setResult(`Estimated total cost for training: $${totalCost.toFixed(2)}`);
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
          Hourly Rate ($)
        </label>
        <input
          type="text"
          value={hourlyRate}
          onChange={(e) => setHourlyRate(e.target.value)}
          placeholder="Enter hourly rate..."
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Hours of Training
        </label>
        <input
          type="text"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          placeholder="Enter number of hours..."
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
