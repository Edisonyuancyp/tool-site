"use client";
import { useState, useMemo } from "react";
import CopyButton from "@/components/CopyButton";
import { AI_MODELS, estimateTokens, formatTokens } from "@/lib/ai-tools";

export interface ToolProps { variant?: string; }

export default function ContextWindowCalculatorView({ variant }: ToolProps) {
  const [text, setText] = useState("");

  const tokens = useMemo(() => estimateTokens(text), [text]);
  const rows = AI_MODELS.map((m) => ({
    ...m,
    pct: Math.min(100, (tokens / m.contextWindow) * 100),
    remaining: Math.max(0, m.contextWindow - tokens),
  }));

  const summary = useMemo(() => {
    return `Text length: ${text.length} characters\nEstimated tokens: ${formatTokens(tokens)}\n\n` +
      rows.map((m) => `${m.name}: ${m.pct.toFixed(2)}% used (${formatTokens(m.remaining)} remaining)`).join("\n");
  }, [text.length, tokens, rows]);

  return (
    <div className="space-y-6">
      {variant && <p className="text-sm text-blue-600 font-medium">Mode: {variant}</p>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Text / prompt</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your text or prompt here..."
          rows={8}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 text-base"
        />
        <p className="text-xs text-gray-400 mt-1.5">Estimated tokens: {formatTokens(tokens)}</p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Model</th>
              <th className="px-4 py-3 text-right font-medium">Context window</th>
              <th className="px-4 py-3 text-right font-medium">Used</th>
              <th className="px-4 py-3 text-right font-medium">Remaining</th>
              <th className="px-4 py-3 text-right font-medium">% used</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium text-gray-900">{m.name}</td>
                <td className="px-4 py-3 text-right text-gray-600">{formatTokens(m.contextWindow)}</td>
                <td className="px-4 py-3 text-right text-gray-600">{formatTokens(tokens)}</td>
                <td className="px-4 py-3 text-right text-gray-600">{formatTokens(m.remaining)}</td>
                <td className={`px-4 py-3 text-right font-semibold ${m.pct > 90 ? "text-red-600" : m.pct > 70 ? "text-yellow-600" : "text-green-600"}`}>
                  {m.pct.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-start justify-between p-5 rounded-xl border border-gray-200 bg-gray-50">
        <pre className="text-sm text-gray-900 whitespace-pre-wrap font-mono leading-relaxed">{summary}</pre>
        <CopyButton text={summary} />
      </div>
    </div>
  );
}
