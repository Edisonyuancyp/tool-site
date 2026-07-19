"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function MetaDescriptionGeneratorView({ variant }: ToolProps) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function calculate() {
    setError(null);
    if (!input.trim()) {
      setError("Input cannot be empty.");
      return;
    }
    if (input.length > 160) {
      setError("Meta description must be 160 characters or less.");
      return;
    }
    
    const metaDescription = `Optimized Meta Description: ${input}. Enhance your SEO for better visibility.`;
    setResult(metaDescription);
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
          Input
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your content..."
          className="w-full border rounded px-3 py-2 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400"
        />
      </div>

      {error && <p className="text-red-600">{error}</p>}

      <button
        onClick={calculate}
        className="bg-blue-600 text-white rounded px-4 py-2"
      >
        Generate Meta Description
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
