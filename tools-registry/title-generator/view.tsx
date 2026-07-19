"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function TitleGeneratorView({ variant }: ToolProps) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);

  function generateTitle() {
    if (!input.trim()) {
      setResult("Please enter a valid topic.");
      return;
    }

    const formattedInput = input.trim().toLowerCase().replace(/\s+/g, '-');
    const generatedTitle = `SEO Friendly Title for: ${formattedInput.charAt(0).toUpperCase() + formattedInput.slice(1)}`;
    setResult(generatedTitle);
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
          Topic Input
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter topic..."
          className="w-full border border-gray-200 rounded px-3 py-2 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400"
        />
      </div>

      <button
        onClick={generateTitle}
        className="bg-blue-600 text-white rounded px-4 py-2 w-full hover:bg-blue-700 transition-colors"
      >
        Generate Title
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
