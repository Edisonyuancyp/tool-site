"use client";
import { useState, useMemo } from "react";
import CopyButton from "@/components/CopyButton";
import { splitByTokens, estimateTokens, formatTokens } from "@/lib/ai-tools";

export interface ToolProps { variant?: string; }

export default function TokenSplitterToolView({ variant }: ToolProps) {
  const [text, setText] = useState("");
  const [chunkSize, setChunkSize] = useState<number>(1000);
  const [overlap, setOverlap] = useState<number>(0);

  const chunks = useMemo(() => {
    const base = splitByTokens(text, chunkSize);
    if (overlap <= 0) return base;
    return base.map((chunk, i) => {
      const prev = base[i - 1] ?? "";
      return i === 0 ? chunk : `${prev.slice(-overlap * 4)}\n${chunk}`;
    });
  }, [text, chunkSize, overlap]);

  const totalTokens = useMemo(() => estimateTokens(text), [text]);

  const summary = useMemo(() => {
    return `Total tokens: ${formatTokens(totalTokens)}\nChunk size: ${formatTokens(chunkSize)} tokens\nOverlap: ${formatTokens(overlap)} tokens\nChunks: ${chunks.length}`;
  }, [totalTokens, chunkSize, overlap, chunks.length]);

  return (
    <div className="space-y-6">
      {variant && <p className="text-sm text-blue-600 font-medium">Mode: {variant}</p>}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Text to split</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste long text to split into token-safe chunks..."
          rows={8}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 text-base"
        />
        <p className="text-xs text-gray-400 mt-1.5">Estimated tokens: {formatTokens(totalTokens)}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Overlap (tokens)</label>
          <input
            type="number"
            min={0}
            value={overlap}
            onChange={(e) => setOverlap(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-gray-400 text-base"
          />
        </div>
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
