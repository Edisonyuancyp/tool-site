"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";
import { AI_MODELS, formatTokens } from "@/lib/ai-tools";

export interface ToolProps { variant?: string; }

export default function AiModelComparatorView({ variant }: ToolProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(AI_MODELS.map((m) => m.id)));

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const summary = AI_MODELS.filter((m) => selected.has(m.id))
    .map((m) => `${m.name} (${m.provider})\n  Context: ${formatTokens(m.contextWindow)}\n  Output: ${formatTokens(m.outputLimit)}\n  Input: $${m.inputPrice}/M\n  Output: $${m.outputPrice}/M`)
    .join("\n\n");

  return (
    <div className="space-y-6">
      {variant && <p className="text-sm text-blue-600 font-medium">Mode: {variant}</p>}

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Models to show</p>
        <div className="flex flex-wrap gap-2">
          {AI_MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => toggle(m.id)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-all ${selected.has(m.id) ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}
            >
              {m.name}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Model</th>
              <th className="px-4 py-3 text-left font-medium">Provider</th>
              <th className="px-4 py-3 text-right font-medium">Context</th>
              <th className="px-4 py-3 text-right font-medium">Max output</th>
              <th className="px-4 py-3 text-right font-medium">Input / 1M</th>
              <th className="px-4 py-3 text-right font-medium">Output / 1M</th>
            </tr>
          </thead>
          <tbody>
            {AI_MODELS.filter((m) => selected.has(m.id)).map((m) => (
              <tr key={m.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium text-gray-900">{m.name}</td>
                <td className="px-4 py-3 text-gray-600">{m.provider}</td>
                <td className="px-4 py-3 text-right text-gray-600">{formatTokens(m.contextWindow)}</td>
                <td className="px-4 py-3 text-right text-gray-600">{formatTokens(m.outputLimit)}</td>
                <td className="px-4 py-3 text-right text-gray-600">${m.inputPrice}</td>
                <td className="px-4 py-3 text-right text-gray-600">${m.outputPrice}</td>
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
