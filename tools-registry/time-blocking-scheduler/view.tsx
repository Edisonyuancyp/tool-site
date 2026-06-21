"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

type Block = { start: string; end: string; task: string; category: string };

const CATEGORIES = [
  { label: "Deep Work",    color: "bg-blue-100 border-blue-300 text-blue-800"   },
  { label: "Meetings",     color: "bg-purple-100 border-purple-300 text-purple-800" },
  { label: "Admin",        color: "bg-amber-100 border-amber-300 text-amber-800" },
  { label: "Exercise",     color: "bg-green-100 border-green-300 text-green-800" },
  { label: "Personal",     color: "bg-rose-100 border-rose-300 text-rose-800"   },
  { label: "Break",        color: "bg-gray-100 border-gray-300 text-gray-700"   },
];

const DEFAULT_BLOCKS: Block[] = [
  { start: "09:00", end: "10:30", task: "Deep work — project A",    category: "Deep Work" },
  { start: "10:30", end: "11:00", task: "Email & Slack",             category: "Admin"     },
  { start: "11:00", end: "12:00", task: "Team standup / meetings",   category: "Meetings"  },
  { start: "12:00", end: "13:00", task: "Lunch break",               category: "Break"     },
  { start: "13:00", end: "15:00", task: "Deep work — project B",    category: "Deep Work" },
];

function toMins(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

export default function TimeBlockingSchedulerView({ variant }: ToolProps) {
  const [blocks, setBlocks] = useState<Block[]>(DEFAULT_BLOCKS);

  function update(i: number, field: keyof Block, val: string) {
    setBlocks(prev => prev.map((b, idx) => idx === i ? { ...b, [field]: val } : b));
  }
  function addBlock()      { setBlocks(p => [...p, { start: "09:00", end: "10:00", task: "", category: "Deep Work" }]); }
  function removeBlock(i: number) { setBlocks(p => p.filter((_, idx) => idx !== i)); }

  const sorted = [...blocks].sort((a, b) => toMins(a.start) - toMins(b.start));
  const totalMin = blocks.reduce((s, b) => {
    const dur = toMins(b.end) - toMins(b.start);
    return s + (dur > 0 ? dur : 0);
  }, 0);
  const byCategory = CATEGORIES.map(c => ({
    ...c,
    mins: blocks.filter(b => b.category === c.label).reduce((s, b) => {
      const d = toMins(b.end) - toMins(b.start); return s + (d > 0 ? d : 0);
    }, 0),
  })).filter(c => c.mins > 0);

  const getCatColor = (cat: string) => CATEGORIES.find(c => c.label === cat)?.color || "bg-gray-100 border-gray-300 text-gray-700";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {blocks.map((b, i) => (
          <div key={i} className={`flex gap-2 items-center p-3 rounded-xl border ${getCatColor(b.category)}`}>
            <input type="time" value={b.start} onChange={e => update(i, "start", e.target.value)}
              className="border border-current/20 rounded-lg px-2 py-1 text-sm bg-white/60 focus:outline-none w-24" />
            <span className="text-sm opacity-60">—</span>
            <input type="time" value={b.end} onChange={e => update(i, "end", e.target.value)}
              className="border border-current/20 rounded-lg px-2 py-1 text-sm bg-white/60 focus:outline-none w-24" />
            <input value={b.task} onChange={e => update(i, "task", e.target.value)}
              placeholder="Task / activity"
              className="flex-1 border border-current/20 rounded-lg px-3 py-1 text-sm bg-white/60 focus:outline-none" />
            <select value={b.category} onChange={e => update(i, "category", e.target.value)}
              className="border border-current/20 rounded-lg px-2 py-1 text-sm bg-white/60 focus:outline-none">
              {CATEGORIES.map(c => <option key={c.label}>{c.label}</option>)}
            </select>
            <button onClick={() => removeBlock(i)} className="opacity-40 hover:opacity-100 text-lg">×</button>
          </div>
        ))}
        <button onClick={addBlock} className="text-sm text-gray-400 hover:text-gray-700 border border-dashed border-gray-300 rounded-lg px-4 py-2 w-full hover:border-gray-400 transition-colors">
          + Add time block
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {byCategory.map(c => (
          <div key={c.label} className={`p-3 rounded-xl border text-sm ${c.color}`}>
            <p className="font-medium">{c.label}</p>
            <p className="text-xs opacity-70">{Math.floor(c.mins/60)}h {c.mins%60}m</p>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between">
        <p className="text-sm text-gray-600">Total scheduled: <strong>{Math.floor(totalMin/60)}h {totalMin%60}m</strong></p>
        <CopyButton text={sorted.map(b => `${b.start}–${b.end} ${b.task} (${b.category})`).join("\n")} />
      </div>
    </div>
  );
}
