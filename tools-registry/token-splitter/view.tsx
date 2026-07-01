"use client";
import { useState, useMemo } from "react";
import CopyButton from "@/components/CopyButton";
import { splitByTokens, estimateTokens, formatTokens } from "@/lib/ai-tools";

export interface ToolProps { variant?: string; }

export default function TokenSplitterView({ variant }: ToolProps) {
  const [text, setText] = useState("");
  const [chunkSize, setChunkSize] = useState<number>(500);

  const chunks = useMemo(() => splitByTokens(text, chunkSize), [text, chunkSize]);
  const totalTokens = useMemo(() => estimateTokens(text), [text]);

  const summary = useMemo(() => {
    return `Total tokens: ${formatTokens(totalTokens)}\nChunk size: ${formatTokens(chunkSize)} tokens\nChunks: ${chunks.length}`;
  }, [totalTokens, chunkSize, chunks.length]);

  return (
    <div className="space-y-6">
      {variant && <p className="text-sm text-blue-600 font-medium">Mode: {variant}</p>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Text</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste long text to split..."
          rows={8}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 text-base"
        />
        <p className="text-xs text-gray-400 mt-1.5">Estimated tokens: {formatTokens(totalTokens)}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Chunk size (tokens)</label>
        <input
          type="number"
          min={1}
          value={chunkSize}
          onChange={(e) => setChunkSize(Number(e.target.value))}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-gray-400 text-base"
        />
      </div>

      {chunks.length > 0 && (
        <div className="space-y-3">
          {chunks.map((chunk, i) => (
            <div key={i} className="p-4 rounded-xl border border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">Chunk {i + 1} / {chunks.length} — ~{formatTokens(estimateTokens(chunk))} tokens</span>
                <CopyButton text={chunk} />
              </div>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{chunk}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-start justify-between p-5 rounded-xl border border-gray-200 bg-gray-50">
        <pre className="text-sm text-gray-900 whitespace-pre-wrap font-mono leading-relaxed">{summary}</pre>
        <CopyButton text={summary} />
      </div>
    </div>
  );
}
