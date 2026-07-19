"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function KeywordDensityAnalyzerView({ variant }: ToolProps) {
  const [input, setInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [result, setResult] = useState<string | null>(null);

  function calculate() {
    const text = input.trim();
    const keywordToCheck = keyword.trim();
    if (!text || !keywordToCheck || text.length === 0 || keywordToCheck.length === 0) {
      setResult("Please enter both text and keyword.");
      return;
    }

    const totalWords = text.split(/\s+/).length;
    const keywordCount = text.split(new RegExp(`\\b${keywordToCheck}\\b`, 'gi')).length - 1;

    if (totalWords === 0) {
      setResult("The input text contains no words.");
      return;
    }

    const density = ((keywordCount / totalWords) * 100).toFixed(2);
    setResult(`Keyword Density: ${density}% (${keywordCount} occurrences of "${keywordToCheck}" in ${totalWords} words)`);
  }

  return (
    <div className="space-y-6">
      {variant && (
        <p className="text-sm text-blue-600 font-medium">Mode: {variant}</p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Input Text</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your content here..."
          className="w-full border rounded px-3 py-2"
          rows={5}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Keyword</label>
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
