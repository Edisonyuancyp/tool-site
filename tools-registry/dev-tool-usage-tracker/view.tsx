"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function DevToolUsageTrackerView({ variant }: ToolProps) {
  const [toolName, setToolName] = useState("");
  const [timeSpent, setTimeSpent] = useState("");
  const [result, setResult] = useState<string | null>(null);

  function calculate() {
    const time = parseFloat(timeSpent);
    if (!toolName || isNaN(time) || time <= 0) {
      setResult("Please enter a valid tool name and a positive time spent.");
      return;
    }
    const efficiencyScore = (time > 8 ? 8 : time) * 10; // Example logic for efficiency score
    setResult(`Efficiency score for ${toolName}: ${efficiencyScore}`);
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
          Tool Name
        </label>
        <input
          type="text"
          value={toolName}
          onChange={(e) => setToolName(e.target.value)}
          placeholder="Enter tool name..."
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Time Spent (hours)
        </label>
        <input
          type="number"
          value={timeSpent}
          onChange={(e) => setTimeSpent(e.target.value)}
          placeholder="Enter time spent..."
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
