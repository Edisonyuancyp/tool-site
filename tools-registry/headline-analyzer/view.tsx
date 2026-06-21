"use client";
import { useState, useMemo } from "react";

export interface ToolProps { variant?: string; }

const POWER_WORDS = ["ultimate","best","proven","essential","secret","surprising","amazing","powerful","effective","easy","free","new","instant","guaranteed","critical","important","warning","stop","never","always","must","complete","simple","fast","top","only","exclusive","bonus","limited","special","advanced","comprehensive","definitive","exact","step-by-step","little-known","hidden","uncommon","controversial","insider","truth","myth","mistake","avoid","danger"];
const EMOTIONAL_POSITIVE = ["love","happy","success","win","great","excellent","outstanding","brilliant","fantastic","wonderful","joy","excited","inspired","motivated","achieve","improve","boost","grow","thrive","transform","discover","unlock","master","dominate"];
const EMOTIONAL_NEGATIVE = ["fail","mistake","wrong","error","warning","danger","risk","problem","lose","bad","worst","terrible","awful","broken","broken","struggle","pain","fear","worry","shame","regret","crisis","disaster"];
const COMMON_WORDS = new Set(["a","an","the","and","or","but","in","on","at","to","for","of","with","by","from","is","are","was","were","be","been","have","has","had","do","does","did","will","would","could","should","may","might","must","shall","can","i","you","he","she","it","we","they","this","that","these","those","my","your","his","her","its","our","their"]);

function words(s: string) { return s.toLowerCase().match(/\b[a-z]+\b/g) ?? []; }

function scoreHeadline(h: string) {
  const w = words(h);
  const len = h.length;
  const wordCount = w.length;

  // Length score (ideal: 50-60 chars)
  const lenScore = len >= 40 && len <= 65 ? 100 : len < 40 ? (len / 40) * 80 : Math.max(0, 100 - ((len - 65) / 35) * 100);

  // Power words
  const powerHits = w.filter(x => POWER_WORDS.includes(x));
  const powerScore = Math.min(100, powerHits.length * 33);

  // Emotional
  const posHits = w.filter(x => EMOTIONAL_POSITIVE.includes(x));
  const negHits = w.filter(x => EMOTIONAL_NEGATIVE.includes(x));
  const emoScore = Math.min(100, (posHits.length + negHits.length) * 40);

  // Has number
  const hasNumber = /\d+/.test(h);

  // Keyword density: non-common words as % of total
  const contentWords = w.filter(x => !COMMON_WORDS.has(x));
  const densityScore = wordCount > 0 ? Math.min(100, (contentWords.length / wordCount) * 150) : 0;

  // Starts with keyword?
  const startsStrong = !COMMON_WORDS.has(w[0] ?? "");

  // Overall
  const overall = Math.round(lenScore * 0.3 + powerScore * 0.25 + emoScore * 0.2 + densityScore * 0.15 + (hasNumber ? 10 : 0) * 1);

  const suggestions: string[] = [];
  if (len < 40) suggestions.push("Headline is too short — add more detail (aim for 50–60 characters).");
  if (len > 65) suggestions.push(`Too long at ${len} chars — Google truncates after ~60. Try cutting ${len - 58} characters.`);
  if (powerHits.length === 0) suggestions.push("Add a power word like 'proven', 'essential', 'secret', or 'ultimate' to increase CTR.");
  if (!hasNumber) suggestions.push("Consider adding a specific number (e.g., '7 ways', '3 steps') — numbered headlines get 36% more clicks.");
  if (emoScore < 40) suggestions.push("Weak emotional value — add positive ('boost', 'master') or tension ('avoid', 'mistake') words.");
  if (!startsStrong) suggestions.push("Start with a stronger word — avoid leading with articles ('A', 'The') when possible.");

  return { overall, lenScore: Math.round(lenScore), powerScore, emoScore: Math.round(emoScore), densityScore: Math.round(densityScore), hasNumber, powerHits, posHits, negHits, suggestions, wordCount, len };
}

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">{label}</span>
        <span className="text-xs font-bold text-gray-900">{score}/100</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

const EXAMPLES = [
  "7 Proven Ways to Double Your Freelance Income in 2024",
  "The Ultimate Guide to React Performance Optimization",
  "Why Most Startups Fail in Year 2 (And How to Avoid It)",
  "How I Built a $10K/Month SaaS in 6 Months",
];

export default function HeadlineAnalyzerView() {
  const [headline, setHeadline] = useState("");
  const score = useMemo(() => headline.trim() ? scoreHeadline(headline) : null, [headline]);

  const overall = score?.overall ?? 0;
  const grade = overall >= 80 ? { label: "Excellent", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" }
    : overall >= 60 ? { label: "Good", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" }
    : overall >= 40 ? { label: "Needs Work", color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" }
    : { label: "Weak", color: "text-red-600", bg: "bg-red-50 border-red-200" };

  return (
    <div className="space-y-5">
      {/* Input */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Your Headline</label>
          <span className={`text-xs font-mono ${(headline.length > 65) ? "text-red-500" : headline.length > 50 ? "text-yellow-500" : "text-gray-400"}`}>
            {headline.length} chars
          </span>
        </div>
        <input
          type="text"
          value={headline}
          onChange={e => setHeadline(e.target.value)}
          placeholder="Type or paste your headline here…"
          className="w-full border border-gray-200 rounded-xl px-4 py-3.5 text-base focus:outline-none focus:border-gray-400"
        />
        {/* Char ruler */}
        <div className="mt-1.5 relative h-1 bg-gray-100 rounded-full overflow-hidden">
          <div className="absolute h-full bg-blue-400 rounded-full transition-all"
            style={{ width: `${Math.min(100, (headline.length / 70) * 100)}%`,
              backgroundColor: headline.length > 65 ? "#ef4444" : headline.length > 50 ? "#f59e0b" : "#3b82f6" }} />
          <div className="absolute h-full w-px bg-green-400 opacity-50" style={{ left: `${(50 / 70) * 100}%` }} />
          <div className="absolute h-full w-px bg-orange-400 opacity-50" style={{ left: `${(65 / 70) * 100}%` }} />
        </div>
        <div className="flex justify-between mt-0.5 text-[9px] text-gray-300">
          <span>0</span><span className="text-green-500">50 (ideal start)</span><span className="text-orange-400">65 (truncate)</span><span>70</span>
        </div>
      </div>

      {score && (
        <>
          {/* Overall score */}
          <div className={`rounded-xl p-5 border ${grade.bg} flex items-center gap-5`}>
            <div className="text-center">
              <p className={`text-4xl font-black ${grade.color}`}>{score.overall}</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Score</p>
            </div>
            <div className="flex-1">
              <p className={`text-lg font-bold ${grade.color}`}>{grade.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {score.len} chars · {score.wordCount} words
                {score.hasNumber && " · ✓ has number"}
                {score.powerHits.length > 0 && ` · power: ${score.powerHits.join(", ")}`}
              </p>
            </div>
          </div>

          {/* Score bars */}
          <div className="space-y-3">
            <ScoreBar label="Length & Readability" score={score.lenScore} color="bg-blue-400" />
            <ScoreBar label="Power Words" score={score.powerScore} color="bg-purple-400" />
            <ScoreBar label="Emotional Value" score={score.emoScore} color="bg-rose-400" />
            <ScoreBar label="Keyword Density" score={score.densityScore} color="bg-amber-400" />
          </div>

          {/* Suggestions */}
          {score.suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Suggestions</p>
              {score.suggestions.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
                  <span className="text-amber-500 shrink-0">💡</span>{s}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Examples */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Try These High-Scoring Examples</p>
        <div className="space-y-2">
          {EXAMPLES.map(e => (
            <button key={e} onClick={() => setHeadline(e)}
              className="w-full text-left px-3 py-2.5 bg-white border border-gray-100 rounded-lg hover:border-gray-300 text-sm text-gray-700 transition-all">
              {e}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
