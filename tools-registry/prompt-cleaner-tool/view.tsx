"use client";
import { useState, useMemo } from "react";
import CopyButton from "@/components/CopyButton";
import { cleanPrompt, estimateTokens, formatTokens } from "@/lib/ai-tools";

export interface ToolProps { variant?: string; }

export default function PromptCleanerToolView({ variant }: ToolProps) {
  const [input, setInput] = useState("");

  const cleaned = useMemo(() => cleanPrompt(input), [input]);
  const beforeTokens = useMemo(() => estimateTokens(input), [input]);
  const afterTokens = useMemo(() => estimateTokens(cleaned), [cleaned]);
  const saved = Math.max(0, beforeTokens - afterTokens);

  return (
    <div className="space-y-6">
      {variant && <p className="text-sm text-blue-600 font-medium">Mode: {variant}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Original prompt</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste messy prompt here..."
            rows={12}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 text-base"
          />
          <p className="text-xs text-gray-400 mt-1.5">Original: {formatTokens(beforeTokens)} tokens</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Cleaned prompt</label>
          <textarea
            value={cleaned}
            readOnly
            rows={12}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 bg-gray-50 focus:outline-none text-base"
          />
          <p className="text-xs text-gray-400 mt-1.5">Cleaned: {formatTokens(afterTokens)} tokens (saved {formatTokens(saved)})</p>
        </div>
      </div>

      <div className="flex items-center justify-between p-5 rounded-xl border border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-700">
          Smart quotes fixed, whitespace normalized, redundant filler removed.
        </p>
        <CopyButton text={cleaned} />
      </div>
    </div>
  );
}
