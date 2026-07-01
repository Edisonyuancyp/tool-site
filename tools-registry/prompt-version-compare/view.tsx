"use client";
import { useState, useMemo } from "react";
import CopyButton from "@/components/CopyButton";
import { diffLines, estimateTokens, formatTokens } from "@/lib/ai-tools";

export interface ToolProps { variant?: string; }

export default function PromptVersionCompareView({ variant }: ToolProps) {
  const [versionA, setVersionA] = useState("");
  const [versionB, setVersionB] = useState("");

  const diff = useMemo(() => diffLines(versionA, versionB), [versionA, versionB]);
  const aTokens = useMemo(() => estimateTokens(versionA), [versionA]);
  const bTokens = useMemo(() => estimateTokens(versionB), [versionB]);

  const summary = useMemo(() => {
    const added = diff.filter((d) => d.type === "added").length;
    const removed = diff.filter((d) => d.type === "removed").length;
    return `Version A: ${formatTokens(aTokens)} tokens\nVersion B: ${formatTokens(bTokens)} tokens\nLines added: ${added}\nLines removed: ${removed}`;
  }, [diff, aTokens, bTokens]);

  return (
    <div className="space-y-6">
      {variant && <p className="text-sm text-blue-600 font-medium">Mode: {variant}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Version A</label>
          <textarea
            value={versionA}
            onChange={(e) => setVersionA(e.target.value)}
            placeholder="Paste version A..."
            rows={10}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 text-base"
          />
          <p className="text-xs text-gray-400 mt-1.5">{formatTokens(aTokens)} tokens</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Version B</label>
          <textarea
            value={versionB}
            onChange={(e) => setVersionB(e.target.value)}
            placeholder="Paste version B..."
            rows={10}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 text-base"
          />
          <p className="text-xs text-gray-400 mt-1.5">{formatTokens(bTokens)} tokens</p>
        </div>
      </div>

      <div className="p-5 rounded-xl border border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-gray-700">Comparison</p>
          <CopyButton text={diff.map((d) => `${d.type === "removed" ? "- " : d.type === "added" ? "+ " : "  "}${d.text}`).join("\n")} />
        </div>
        <div className="space-y-1 font-mono text-sm leading-relaxed">
          {diff.map((d, i) => (
            <div
              key={i}
              className={`px-2 py-1 rounded ${d.type === "removed" ? "bg-red-50 text-red-700" : d.type === "added" ? "bg-green-50 text-green-700" : "text-gray-700"}`}
            >
              {d.type === "removed" ? "- " : d.type === "added" ? "+ " : "  "}
              {d.text || " "}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-start justify-between p-5 rounded-xl border border-gray-200 bg-gray-50">
        <pre className="text-sm text-gray-900 whitespace-pre-wrap font-mono leading-relaxed">{summary}</pre>
        <CopyButton text={summary} />
      </div>
    </div>
  );
}
