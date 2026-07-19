"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function KeywordDensityCheckerView({ variant }: ToolProps) {
  const [input, setInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [result, setResult] = useState<string | null>(null);

  function calculate() {
    if (!input || !keyword) {
      setResult("Please provide both content and keyword.");
      return;
    }

    const content = input.toLowerCase();
    const keywordLower = keyword.toLowerCase();
    const keywordCount = content.split(keywordLower).length - 1;
    const totalWords = content.split(/\s+/).filter(Boolean).length;

    if (totalWords === 0) {
      setResult("Content should contain words.");
      return;
    }

    const density = ((keywordCount / totalWords) * 100).toFixed(2);
    setResult(`Keyword Density: ${density}% (${keywordCount} occurrences in ${totalWords} words)`);
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
          Content
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your content here..."
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Keyword
        </label>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Enter keyword..."
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
