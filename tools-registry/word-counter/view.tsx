"use client";
import { useState, useMemo } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

const TWITTER_LIMIT = 280;
const SEO_TARGETS = { min: 1500, ideal: 2000, max: 2500 };

function analyze(text: string) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const charsNoSpace = text.replace(/\s/g, "").length;
  const sentences = text.trim() ? (text.match(/[.!?]+/g) || []).length || 1 : 0;
  const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(Boolean).length || 1 : 0;
  const readTime = Math.ceil(words / 225);
  return { words, chars, charsNoSpace, sentences, paragraphs, readTime };
}

function keywordDensity(text: string, topN = 5): { word: string; count: number; pct: string }[] {
  if (!text.trim()) return [];
  const stopWords = new Set(["the","a","an","and","or","but","in","on","at","to","for","of","with","by","from","is","are","was","were","be","been","it","this","that","as","i","you","we","they","have","has","had","not","do","did","will","can","my","your","his","her","its","our","their"]);
  const freq: Record<string, number> = {};
  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  for (const w of words) {
    if (!stopWords.has(w)) freq[w] = (freq[w] || 0) + 1;
  }
  const total = words.length || 1;
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word, count]) => ({ word, count, pct: ((count / total) * 100).toFixed(1) }));
}

export default function WordCounterView({ variant }: ToolProps) {
  const isTwitter = variant === "twitter";
  const isEssay = variant === "essay";
  const isSeo = variant === "seo";

  const [text, setText] = useState("");
  const [target, setTarget] = useState(1000);

  const stats = useMemo(() => analyze(text), [text]);
  const density = useMemo(() => isSeo ? keywordDensity(text) : [], [text, isSeo]);

  const twitterRemaining = TWITTER_LIMIT - (text.length);
  const twitterOver = twitterRemaining < 0;

  return (
    <div className="space-y-6">
      {isEssay && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 shrink-0">Target words:</label>
          <input type="number" value={target} onChange={(e) => setTarget(Number(e.target.value))}
            className="w-28 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400" />
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-400 rounded-full transition-all"
              style={{ width: `${Math.min(100, (stats.words / target) * 100)}%` }} />
          </div>
          <span className="text-sm text-gray-500 shrink-0">{stats.words}/{target}</span>
        </div>
      )}

      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            isTwitter ? "Type your tweet here (280 character limit)..."
            : isEssay ? "Paste your essay or paper here..."
            : isSeo ? "Paste your article or blog post content here..."
            : "Paste or type your text here..."
          }
          rows={isTwitter ? 4 : 8}
          className={`w-full border rounded-lg px-4 py-3 text-gray-900 placeholder-gray-300 focus:outline-none text-base resize-none transition-colors ${
            isTwitter && twitterOver ? "border-red-400 focus:border-red-500" : "border-gray-200 focus:border-gray-400"
          }`}
        />
        {isTwitter && (
          <span className={`absolute bottom-3 right-3 text-sm font-medium ${twitterOver ? "text-red-500" : twitterRemaining <= 20 ? "text-yellow-500" : "text-gray-400"}`}>
            {twitterRemaining}
          </span>
        )}
      </div>

      {/* Stats grid */}
      <div className={`grid gap-3 ${isTwitter ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}`}>
        {isTwitter ? (
          <>
            <StatCard label="Characters" value={stats.chars} highlight={twitterOver} />
            <StatCard label="Remaining" value={twitterRemaining} highlight={twitterOver} />
          </>
        ) : (
          <>
            <StatCard label="Words" value={stats.words} />
            <StatCard label="Characters" value={stats.chars} />
            <StatCard label="Sentences" value={stats.sentences} />
            <StatCard label="Read time" value={`${stats.readTime} min`} />
          </>
        )}
      </div>

      {/* SEO analysis */}
      {isSeo && text.trim() && (
        <div className="space-y-4">
          <div className={`p-4 rounded-xl border text-sm ${
            stats.words < SEO_TARGETS.min ? "border-yellow-200 bg-yellow-50 text-yellow-800"
            : stats.words <= SEO_TARGETS.max ? "border-green-200 bg-green-50 text-green-800"
            : "border-blue-200 bg-blue-50 text-blue-800"
          }`}>
            {stats.words < SEO_TARGETS.min
              ? `⚠️ ${stats.words} words — below ideal SEO length (${SEO_TARGETS.min}–${SEO_TARGETS.max} words recommended)`
              : stats.words <= SEO_TARGETS.max
              ? `✅ ${stats.words} words — in the ideal SEO range (${SEO_TARGETS.min}–${SEO_TARGETS.max} words)`
              : `ℹ️ ${stats.words} words — above average, make sure content quality justifies length`}
          </div>
          {density.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Top Keywords</p>
              <div className="space-y-1.5">
                {density.map(({ word, count, pct }) => (
                  <div key={word} className="flex items-center gap-3 text-sm">
                    <span className="w-28 font-mono text-gray-800">{word}</span>
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full">
                      <div className="h-full bg-blue-400 rounded-full" style={{ width: `${Math.min(100, parseFloat(pct) * 10)}%` }} />
                    </div>
                    <span className="text-gray-400 w-16 text-right">{count}× ({pct}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {text && <CopyButton text={text} />}

      {/* Cross-links */}
      <div className="pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400 mb-2">Other word count tools:</p>
        <div className="flex flex-wrap gap-2 text-xs">
          {variant !== undefined && <a href="/tools/word-counter" className="text-blue-500 hover:underline">Standard Counter</a>}
          {variant !== "twitter" && <a href="/tools/twitter-character-counter" className="text-blue-500 hover:underline">Twitter Counter</a>}
          {variant !== "essay" && <a href="/tools/essay-word-counter" className="text-blue-500 hover:underline">Essay Counter</a>}
          {variant !== "seo" && <a href="/tools/seo-content-analyzer" className="text-blue-500 hover:underline">SEO Analyzer</a>}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-4 border ${highlight ? "border-red-200 bg-red-50" : "border-gray-100 bg-gray-50"}`}>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-xl font-bold ${highlight ? "text-red-600" : "text-gray-900"}`}>{value}</p>
    </div>
  );
}
