"use client";
import { useState, useMemo } from "react";

export interface ToolProps { variant?: string; }

const PLATFORMS = [
  { id: "twitter",   name: "Twitter / X",  icon: "𝕏",  charLimit: 280,   wordLimit: null, note: "URLs count as 23 chars" },
  { id: "linkedin",  name: "LinkedIn Post", icon: "in", charLimit: 3000,  wordLimit: null, note: "~220 chars visible before 'see more'" },
  { id: "instagram", name: "Instagram",     icon: "📷", charLimit: 2200,  wordLimit: null, note: "125 chars visible before 'more'" },
  { id: "tiktok",    name: "TikTok",        icon: "♪",  charLimit: 2200,  wordLimit: null, note: "Bio: 80 chars" },
  { id: "youtube",   name: "YouTube Title", icon: "▶",  charLimit: 100,   wordLimit: null, note: "Recommended ≤70 chars" },
  { id: "email",     name: "Email Subject", icon: "✉",  charLimit: 78,    wordLimit: null, note: "Mobile shows ~30-35 chars" },
  { id: "meta",      name: "Meta Title",    icon: "🔍", charLimit: 60,    wordLimit: null, note: "Google truncates at ~60 chars" },
  { id: "meta_desc", name: "Meta Desc",     icon: "🔍", charLimit: 160,   wordLimit: null, note: "Google shows ~155-160 chars" },
];

function statusColor(pct: number) {
  if (pct >= 100) return "text-red-600";
  if (pct >= 90)  return "text-orange-500";
  if (pct >= 75)  return "text-yellow-600";
  return "text-emerald-600";
}
function barColor(pct: number) {
  if (pct >= 100) return "bg-red-500";
  if (pct >= 90)  return "bg-orange-400";
  if (pct >= 75)  return "bg-yellow-400";
  return "bg-emerald-400";
}

export default function CharacterCounterView() {
  const [text, setText] = useState("");
  const [selected, setSelected] = useState<string[]>(["twitter", "linkedin", "instagram"]);

  const stats = useMemo(() => {
    const chars  = text.length;
    const words  = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines  = text.split("\n").length;
    const sentences = (text.match(/[.!?]+/g) ?? []).length;
    const readTime = Math.max(1, Math.round(words / 200));
    return { chars, words, lines, sentences, readTime };
  }, [text]);

  const togglePlatform = (id: string) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const activePlatforms = PLATFORMS.filter(p => selected.includes(p.id));

  return (
    <div className="space-y-5">
      {/* Textarea */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Your Text</label>
          <button onClick={() => setText("")} className="text-xs text-gray-300 hover:text-gray-500 transition-colors">Clear</button>
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type or paste your content here…"
          rows={5}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gray-400 resize-y"
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {[
          { label: "Characters", value: stats.chars },
          { label: "Words",      value: stats.words },
          { label: "Lines",      value: stats.lines },
          { label: "Sentences",  value: stats.sentences },
          { label: "Read time",  value: `${stats.readTime} min` },
        ].map(s => (
          <div key={s.label} className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-gray-900 font-mono">{s.value}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Platform selector */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Select Platforms</p>
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map(p => (
            <button key={p.id} onClick={() => togglePlatform(p.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${selected.includes(p.id) ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}>
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Platform gauges */}
      {activePlatforms.length > 0 && (
        <div className="space-y-3">
          {activePlatforms.map(p => {
            const pct = (stats.chars / p.charLimit) * 100;
            const remaining = p.charLimit - stats.chars;
            return (
              <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-gray-400">{p.icon}</span>
                    <span className="text-sm font-semibold text-gray-900">{p.name}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold font-mono ${statusColor(pct)}`}>
                      {remaining >= 0 ? `${remaining} left` : `${Math.abs(remaining)} over`}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">{stats.chars}/{p.charLimit}</span>
                  </div>
                </div>
                {/* Bar */}
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${barColor(pct)}`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
                {p.note && <p className="text-[10px] text-gray-400 mt-1.5">💡 {p.note}</p>}
              </div>
            );
          })}
        </div>
      )}

      {/* Comparison table */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Platform Limits Quick Reference</p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400 border-b border-gray-200">
                <th className="text-left pb-2 font-semibold">Platform</th>
                <th className="text-right pb-2 font-semibold">Char Limit</th>
                <th className="text-right pb-2 font-semibold">Visible Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {PLATFORMS.map(p => (
                <tr key={p.id}>
                  <td className="py-1.5 text-gray-700">{p.name}</td>
                  <td className="py-1.5 text-right font-mono text-gray-900">{p.charLimit.toLocaleString()}</td>
                  <td className="py-1.5 text-right text-gray-400">{p.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
