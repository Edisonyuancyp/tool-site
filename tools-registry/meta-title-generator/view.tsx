"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function MetaTitleGeneratorView({ variant }: ToolProps) {
  const [input, setInput] = useState<string>("");
  const [result, setResult] = useState<string | null>(null);

  function calculate() {
    if (!input.trim()) {
      setResult("Please enter a valid input.");
      return;
    }

    const formattedTitle = `Engaging Meta Title for: ${input}`;
    setResult(formattedTitle);
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
          placeholder="Enter your topic or keywords..."
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button
        onClick={calculate}
        className="bg-blue-600 text-white rounded px-4 py-2"
      >
        Generate Meta Title
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
