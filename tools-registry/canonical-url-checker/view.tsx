"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function CanonicalUrlCheckerView({ variant }: ToolProps) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function calculate() {
    const urlPattern = /^(https?:\/\/[^\s/$.?#].[^\s]*)$/i;
    if (!urlPattern.test(input)) {
      setError("Please enter a valid URL.");
      setResult(null);
      return;
    }
    setError(null);
    
    const canonicalTag = `<link rel="canonical" href="${input}" />`;
    setResult(`Canonical tag for ${input}: ${canonicalTag}`);
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
          Enter Canonical URL
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter URL..."
          className="w-full border rounded px-3 py-2 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400"
        />
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>

      <button
        onClick={calculate}
        className="bg-blue-600 text-white rounded px-4 py-2 w-full hover:bg-blue-700 transition-colors"
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
