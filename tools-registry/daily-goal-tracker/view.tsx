"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

type Goal = { name: string; target: string; current: string; unit: string };

const DEFAULTS: Goal[] = [
  { name: "Steps",        target: "10000", current: "", unit: "steps" },
  { name: "Water",        target: "8",     current: "", unit: "cups"  },
  { name: "Reading",      target: "30",    current: "", unit: "min"   },
  { name: "Exercise",     target: "45",    current: "", unit: "min"   },
  { name: "Calories",     target: "2000",  current: "", unit: "kcal"  },
];

export default function DailyGoalTrackerView({ variant }: ToolProps) {
  const [goals, setGoals] = useState<Goal[]>(DEFAULTS);

  function update(i: number, field: keyof Goal, val: string) {
    setGoals(prev => prev.map((g, idx) => idx === i ? { ...g, [field]: val } : g));
  }
  function addGoal()      { setGoals(p => [...p, { name: "", target: "", current: "", unit: "" }]); }
  function removeGoal(i: number) { setGoals(p => p.filter((_, idx) => idx !== i)); }

  const withPct = goals.map(g => {
    const t = parseFloat(g.target) || 0;
    const c = parseFloat(g.current) || 0;
    const pct = t > 0 ? Math.min(100, Math.round((c / t) * 100)) : 0;
    return { ...g, pct, done: pct >= 100 };
  });

  const completed = withPct.filter(g => g.done && g.name).length;
  const totalNamed = withPct.filter(g => g.name).length;
  const overallPct = totalNamed > 0 ? Math.round((completed / totalNamed) * 100) : 0;

  return (
    <div className="space-y-5">
      {withPct.map((g, i) => (
        <div key={i} className={`p-4 rounded-xl border transition-colors ${g.done && g.name ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"}`}>
          <div className="flex gap-3 items-center mb-3">
            <input value={g.name} onChange={e => update(i, "name", e.target.value)}
              placeholder="Goal name"
              className="flex-1 font-medium border-b border-transparent focus:border-gray-300 outline-none bg-transparent py-0.5" />
            {g.done && g.name && <span className="text-green-600 font-bold text-sm">✓ Done!</span>}
            <button onClick={() => removeGoal(i)} className="text-gray-300 hover:text-red-400 text-lg">×</button>
          </div>
          <div className="flex gap-3 items-center mb-2">
            <div className="flex-1 flex gap-2">
              <input type="number" value={g.current} onChange={e => update(i, "current", e.target.value)}
                placeholder="0"
                className="w-24 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400" />
              <span className="text-gray-400 text-sm flex items-center">/</span>
              <input type="number" value={g.target} onChange={e => update(i, "target", e.target.value)}
                placeholder="target"
                className="w-24 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400" />
              <input value={g.unit} onChange={e => update(i, "unit", e.target.value)}
                placeholder="unit"
                className="w-20 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-gray-400" />
            </div>
            <span className="text-sm font-bold text-gray-700 w-12 text-right">{g.pct}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${g.done ? "bg-green-500" : "bg-gray-900"}`}
              style={{ width: `${g.pct}%` }} />
          </div>
        </div>
      ))}

      <button onClick={addGoal} className="text-sm text-gray-400 hover:text-gray-700 border border-dashed border-gray-300 rounded-lg px-4 py-2 w-full hover:border-gray-400 transition-colors">
        + Add goal
      </button>

      {totalNamed > 0 && (
        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Today's Progress</p>
            <p className="text-xs text-gray-500">{completed} of {totalNamed} goals completed</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{overallPct}%</p>
        </div>
      )}
    </div>
  );
}
