"use client";
import { useState, useMemo } from "react";
import CopyButton from "@/components/CopyButton";
import { AI_MODELS, estimateCost, formatCost, formatTokens } from "@/lib/ai-tools";

export interface ToolProps { variant?: string; }

export default function AiCostComparatorView({ variant }: ToolProps) {
  const [inputTokens, setInputTokens] = useState<number>(1000);
  const [outputTokens, setOutputTokens] = useState<number>(500);
  const [selected, setSelected] = useState<Set<string>>(new Set(AI_MODELS.slice(0, 4).map((m) => m.id)));

  const rows = useMemo(() => {
    return AI_MODELS.map((m) => {
      const inCost = estimateCost(inputTokens, m.inputPrice);
      const outCost = estimateCost(outputTokens, m.outputPrice);
      return { ...m, inCost, outCost, total: inCost + outCost };
    }).sort((a, b) => a.total - b.total);
  }, [inputTokens, outputTokens]);

  const cheapest = rows[0];
  const summary = useMemo(() => {
    return rows
      .filter((r) => selected.has(r.id))
      .map((r) => `${r.name} (${r.provider})\n  Input: ${formatTokens(inputTokens)} tokens x $${r.inputPrice}/M = ${formatCost(r.inCost)}\n  Output: ${formatTokens(outputTokens)} tokens x $${r.outputPrice}/M = ${formatCost(r.outCost)}\n  Total: ${formatCost(r.total)}`)
      .join("\n\n");
  }, [rows, selected, inputTokens, outputTokens]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      {variant && <p className="text-sm text-blue-600 font-medium">Mode: {variant}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Input tokens</label>
          <input
            type="number"
            min={0}
            value={inputTokens}
            onChange={(e) => setInputTokens(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-gray-400 text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Output tokens</label>
          <input
            type="number"
            min={0}
            value={outputTokens}
            onChange={(e) => setOutputTokens(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-gray-400 text-base"
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-700 mb-2">Models to compare</p>
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

      {cheapest && (
        <p className="text-sm text-gray-600">
          Cheapest: <span className="font-semibold text-gray-900">{cheapest.name}</span> at {formatCost(cheapest.total)}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Model</th>
              <th className="px-4 py-3 text-left font-medium">Provider</th>
              <th className="px-4 py-3 text-right font-medium">Input</th>
              <th className="px-4 py-3 text-right font-medium">Output</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.filter((r) => selected.has(r.id)).map((r) => (
              <tr key={r.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium text-gray-900">{r.name}</td>
                <td className="px-4 py-3 text-gray-600">{r.provider}</td>
                <td className="px-4 py-3 text-right text-gray-600">{formatCost(r.inCost)}</td>
                <td className="px-4 py-3 text-right text-gray-600">{formatCost(r.outCost)}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCost(r.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {summary && (
        <div className="flex items-start justify-between p-5 rounded-xl border border-gray-200 bg-gray-50">
          <pre className="text-sm text-gray-900 whitespace-pre-wrap font-mono leading-relaxed">{summary}</pre>
          <CopyButton text={summary} />
        </div>
      )}
    </div>
  );
}
