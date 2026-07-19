"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function DevDependencyAnalyzerView({ variant }: ToolProps) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function calculate() {
    setError(null);
    if (!input) {
      setError("Input cannot be empty.");
      return;
    }

    const dependencies = input.split(',').map(dep => dep.trim());
    if (dependencies.length === 0) {
      setError("Please provide valid dependencies.");
      return;
    }

    // Simple analysis logic: Count dependencies and identify duplicates
    const uniqueDeps = new Set(dependencies);
    const duplicates = dependencies.filter((dep, index) => dependencies.indexOf(dep) !== index);

    const resultMessage = `Total Dependencies: ${dependencies.length}, Unique Dependencies: ${uniqueDeps.size}, Duplicates: ${duplicates.length ? duplicates.join(', ') : 'None'}`;
    setResult(resultMessage);
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
          Enter Dependencies (comma-separated)
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. react, react-dom, axios"
          className="w-full border border-gray-200 rounded px-3 py-2 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400"
        />
      </div>

      <button
        onClick={calculate}
        className="bg-blue-600 text-white rounded px-4 py-2"
      >
        Analyze
      </button>

      {error && (
        <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded">
          {error}
        </div>
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
