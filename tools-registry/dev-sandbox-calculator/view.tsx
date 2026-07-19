"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function DevSandboxCalculatorView({ variant }: ToolProps) {
  const [numDevelopers, setNumDevelopers] = useState("");
  const [devHours, setDevHours] = useState("");
  const [result, setResult] = useState<string | null>(null);

  function calculate() {
    const developers = parseFloat(numDevelopers);
    const hours = parseFloat(devHours);

    if (isNaN(developers) || isNaN(hours) || developers <= 0 || hours <= 0) {
      setResult("Please enter valid positive numbers for developers and hours.");
      return;
    }

    const totalHours = developers * hours;
    setResult(`Estimated total development hours: ${totalHours}`);
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
          Number of Developers
        </label>
        <input
          type="number"
          value={numDevelopers}
          onChange={(e) => setNumDevelopers(e.target.value)}
          placeholder="Enter number of developers..."
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Development Hours per Developer
        </label>
        <input
          type="number"
          value={devHours}
          onChange={(e) => setDevHours(e.target.value)}
          placeholder="Enter hours per developer..."
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
