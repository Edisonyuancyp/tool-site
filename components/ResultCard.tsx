"use client";
import { useRef, useState } from "react";

export interface ResultItem {
  label: string;
  value: string;
  sub?: string;
}

interface Props {
  title: string;         // e.g. "Position Size Calculator"
  results: ResultItem[]; // key-value pairs to display
  accentColor?: string;  // hex, default #111827
  toolUrl?: string;      // canonical URL baked into card
}

/**
 * ResultCard — renders a shareable result card and lets the user
 * download it as a PNG using the Canvas API (no external deps).
 */
export default function ResultCard({ title, results, accentColor = "#111827", toolUrl }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = toolUrl ?? (typeof window !== "undefined" ? window.location.href : "getfastcalc.com");

  async function downloadPng() {
    if (!cardRef.current) return;
    setDownloading(true);
    try {
      // Dynamically import html-to-image only when needed
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${title.replace(/\s+/g, "-").toLowerCase()}-result.png`;
      a.click();
    } catch {
      // Fallback: copy link
      navigator.clipboard?.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* The card itself */}
      <div
        ref={cardRef}
        className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
        style={{ fontFamily: "system-ui, sans-serif" }}
      >
        {/* Card header */}
        <div className="px-5 py-4" style={{ backgroundColor: accentColor }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest">GetFastCalc</p>
              <p className="text-white font-bold text-sm mt-0.5">{title}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white text-base">📊</span>
            </div>
          </div>
        </div>

        {/* Result rows */}
        <div className="bg-white px-5 py-4 space-y-3">
          {results.map((r, i) => (
            <div key={i} className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{r.label}</p>
                {r.sub && <p className="text-[10px] text-gray-300 mt-0.5">{r.sub}</p>}
              </div>
              <p className="text-lg font-bold font-mono text-gray-900">{r.value}</p>
            </div>
          ))}
        </div>

        {/* Card footer */}
        <div className="bg-gray-50 px-5 py-2.5 flex items-center justify-between border-t border-gray-100">
          <p className="text-[9px] text-gray-400 font-mono truncate max-w-[70%]">{shareUrl}</p>
          <p className="text-[9px] text-gray-300">getfastcalc.com</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={downloadPng}
          disabled={downloading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-black transition-colors disabled:opacity-60"
        >
          {downloading ? (
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          )}
          {downloading ? "Generating…" : "Download PNG"}
        </button>

        <button
          onClick={() => { navigator.clipboard?.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg border transition-all ${
            copied ? "bg-green-50 border-green-300 text-green-700" : "bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-800"
          }`}
        >
          {copied ? "✓ Link copied" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
