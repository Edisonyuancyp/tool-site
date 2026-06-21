"use client";
import { useState, useMemo } from "react";

const READING_SPEED_WPM = 238; // average adult reading speed
const SPEAKING_SPEED_WPM = 130;

function fmtTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m < 60) return s > 0 ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return `${h}h ${rm}m`;
}

export default function WordCounter() {
  const [text, setText] = useState("");
  const [showDetails, setShowDetails] = useState(false);

  const stats = useMemo(() => {
    if (!text) return null;

    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, "").length;
    const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
    const lines = text.split(/\n/).length;
    const readTimeSec = (words / READING_SPEED_WPM) * 60;
    const speakTimeSec = (words / SPEAKING_SPEED_WPM) * 60;

    // Avg word length
    const wordList = text.trim() === "" ? [] : text.trim().split(/\s+/);
    const avgWordLen = wordList.length
      ? wordList.reduce((s, w) => s + w.replace(/[^a-zA-Z]/g, "").length, 0) / wordList.length
      : 0;

    // Top words (freq)
    const wordFreq: Record<string, number> = {};
    wordList.forEach((w) => {
      const clean = w.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (clean.length > 2) wordFreq[clean] = (wordFreq[clean] ?? 0) + 1;
    });
    const topWords = Object.entries(wordFreq)
      .filter(([, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    // Unique words
    const uniqueWords = new Set(wordList.map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, ""))).size;

    // Byte size
    const bytes = new TextEncoder().encode(text).length;

    // Longest word
    const longestWord = wordList.reduce((a, b) => b.length > a.length ? b : a, "");

    return {
      chars, charsNoSpace, words, sentences, paragraphs, lines,
      readTimeSec, speakTimeSec, avgWordLen, topWords, uniqueWords, bytes, longestWord,
    };
  }, [text]);

  const STAT_CARDS = stats ? [
    { label: "Words", value: stats.words.toLocaleString(), color: "text-blue-600", big: true },
    { label: "Characters", value: stats.chars.toLocaleString(), color: "text-gray-900", big: true },
    { label: "No spaces", value: stats.charsNoSpace.toLocaleString(), color: "text-gray-600" },
    { label: "Sentences", value: stats.sentences.toLocaleString(), color: "text-gray-900" },
    { label: "Paragraphs", value: stats.paragraphs.toLocaleString(), color: "text-gray-900" },
    { label: "Lines", value: stats.lines.toLocaleString(), color: "text-gray-900" },
    { label: "Read time", value: fmtTime(stats.readTimeSec), color: "text-purple-600" },
    { label: "Speak time", value: fmtTime(stats.speakTimeSec), color: "text-green-600" },
    { label: "Unique words", value: stats.uniqueWords.toLocaleString(), color: "text-amber-600" },
    { label: "Avg word len", value: `${stats.avgWordLen.toFixed(1)} ch`, color: "text-gray-600" },
    { label: "Byte size", value: stats.bytes >= 1024 ? `${(stats.bytes / 1024).toFixed(1)} KB` : `${stats.bytes} B`, color: "text-gray-600" },
    { label: "Longest word", value: stats.longestWord || "—", color: "text-gray-700" },
  ] : [];

  // Character limit warnings
  const LIMITS = [
    { name: "Tweet / X", limit: 280 },
    { name: "SMS", limit: 160 },
    { name: "Meta title", limit: 60 },
    { name: "Meta description", limit: 160 },
    { name: "LinkedIn post", limit: 3000 },
    { name: "Facebook post", limit: 63206 },
  ];

  return (
    <div className="space-y-4">
      {/* Textarea */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Your Text</label>
          <div className="flex gap-2">
            {text && (
              <button type="button" onClick={() => setText("")}
                className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-500 transition-all">
                Clear
              </button>
            )}
            {!text && (
              <button type="button" onClick={() => setText("The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump! The five boxing wizards jump quickly.\n\nThis is a second paragraph with more text to analyze. Word counters are extremely useful for writers, SEO specialists, students, and anyone who needs to measure their content precisely.")}
                className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-900 transition-all">
                Load sample
              </button>
            )}
          </div>
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={10}
          placeholder="Start typing or paste your text here…"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-gray-400 resize-y" />
      </div>

      {stats ? (
        <>
          {/* Main stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {STAT_CARDS.slice(0, 8).map((card) => (
              <div key={card.label} className={`bg-gray-50 border border-gray-100 rounded-xl p-3 ${card.big ? "sm:col-span-1" : ""}`}>
                <div className="text-xs text-gray-400 mb-0.5">{card.label}</div>
                <div className={`font-black text-xl truncate ${card.color}`}>{card.value}</div>
              </div>
            ))}
          </div>

          <button type="button" onClick={() => setShowDetails((v) => !v)}
            className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-all">
            {showDetails ? "▲ Hide" : "▼ Show"} detailed stats
          </button>

          {showDetails && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {STAT_CARDS.slice(8).map((card) => (
                  <div key={card.label} className="bg-gray-50 border border-gray-100 rounded-xl p-3">
                    <div className="text-xs text-gray-400 mb-0.5">{card.label}</div>
                    <div className={`font-bold text-lg truncate ${card.color}`}>{card.value}</div>
                  </div>
                ))}
              </div>

              {/* Top words */}
              {stats.topWords.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Most Frequent Words</h3>
                  <div className="flex flex-wrap gap-2">
                    {stats.topWords.map(([word, count]) => (
                      <span key={word} className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-xs">
                        <span className="font-semibold text-blue-700">{word}</span>
                        <span className="text-blue-400">×{count}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Character limits */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Character Limit Reference</h3>
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-50">
                  {LIMITS.map((lim) => {
                    const pct = Math.min(100, (stats.chars / lim.limit) * 100);
                    const over = stats.chars > lim.limit;
                    return (
                      <tr key={lim.name} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 text-gray-600 w-36">{lim.name}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-100 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${over ? "bg-red-500" : pct > 80 ? "bg-amber-400" : "bg-green-500"}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className={`text-xs font-semibold w-24 text-right ${over ? "text-red-600" : "text-gray-500"}`}>
                              {stats.chars}/{lim.limit} {over && "⚠ over"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center text-sm text-gray-400 py-8 border border-dashed border-gray-200 rounded-xl">
          Start typing to see character and word counts
        </div>
      )}
    </div>
  );
}
