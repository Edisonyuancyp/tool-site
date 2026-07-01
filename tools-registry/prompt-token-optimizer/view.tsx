"use client";
import { useState, useMemo } from "react";
import CopyButton from "@/components/CopyButton";
import { optimizePrompt, formatTokens } from "@/lib/ai-tools";

export interface ToolProps { variant?: string; }

export default function PromptTokenOptimizerView({ variant }: ToolProps) {
  const [input, setInput] = useState("");

  const result = useMemo(() => optimizePrompt(input), [input]);

  return (
    <div className="space-y-6">
      {variant && <p className="text-sm text-blue-600 font-medium">Mode: {variant}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Original prompt</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your prompt here..."
            rows={12}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 text-base"
          />
          <p className="text-xs text-gray-400 mt-1.5">Original: {formatTokens(result.originalTokens)} tokens</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Optimized prompt</label>
          <textarea
            value={result.optimized}
            readOnly
            rows={12}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-gray-50 focus:outline-none text-base"
          />
          <p className="text-xs text-gray-400 mt-1.5">Optimized: {formatTokens(result.optimizedTokens)} tokens (saved {formatTokens(result.savedTokens)})</p>
        </div>
      </div>

      {result.tips.length > 0 && (
        <div className="p-5 rounded-xl border border-gray-200 bg-gray-50">
          <p className="text-sm font-medium text-gray-700 mb-2">Optimization tips</p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            {result.tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between p-5 rounded-xl border border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-700">
          Saved approximately {formatTokens(result.savedTokens)} tokens.
        </p>
        <CopyButton text={result.optimized} />
      </div>
    </div>
  );
}
