"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

const GOALS = [
  { label: "Lose Fat",        protein: 40, carbs: 30, fat: 30 },
  { label: "Maintain",        protein: 30, carbs: 40, fat: 30 },
  { label: "Build Muscle",    protein: 35, carbs: 45, fat: 20 },
  { label: "Keto",            protein: 30, carbs: 5,  fat: 65 },
  { label: "Custom",          protein: 30, carbs: 40, fat: 30 },
];

export default function MacroTrackerCalculatorView({ variant }: ToolProps) {
  const [calories, setCalories] = useState("2000");
  const [goalIdx,  setGoalIdx]  = useState(0);
  const [custom,   setCustom]   = useState({ protein: "30", carbs: "40", fat: "30" });

  const isCustom = goalIdx === GOALS.length - 1;
  const g = isCustom
    ? { protein: parseFloat(custom.protein)||0, carbs: parseFloat(custom.carbs)||0, fat: parseFloat(custom.fat)||0 }
    : GOALS[goalIdx];

  const cal = parseFloat(calories) || 0;
  const proteinG = Math.round(cal * g.protein / 100 / 4);
  const carbsG   = Math.round(cal * g.carbs   / 100 / 4);
  const fatG     = Math.round(cal * g.fat     / 100 / 9);

  const bars = [
    { label: "Protein", grams: proteinG, pct: g.protein, color: "bg-blue-500" },
    { label: "Carbs",   grams: carbsG,   pct: g.carbs,   color: "bg-amber-400" },
    { label: "Fat",     grams: fatG,     pct: g.fat,     color: "bg-rose-400"  },
  ];

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Daily Calorie Target</label>
        <input type="number" value={calories} onChange={e => setCalories(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400 text-lg" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Goal / Split</label>
        <div className="flex flex-wrap gap-2">
          {GOALS.map((g, i) => (
            <button key={g.label} onClick={() => setGoalIdx(i)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                goalIdx === i ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-700 hover:border-gray-400"
              }`}>
              {g.label}
              {i < GOALS.length - 1 && <span className="text-xs ml-1 opacity-60">{g.protein}/{g.carbs}/{g.fat}</span>}
            </button>
          ))}
        </div>
      </div>

      {isCustom && (
        <div className="grid grid-cols-3 gap-3">
          {(["protein","carbs","fat"] as const).map(k => (
            <div key={k}>
              <label className="block text-xs font-medium text-gray-600 mb-1 capitalize">{k} %</label>
              <input type="number" value={custom[k]} onChange={e => setCustom(p => ({...p, [k]: e.target.value}))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400" />
            </div>
          ))}
        </div>
      )}

      {cal > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {bars.map(b => (
              <div key={b.label} className="p-4 rounded-xl border border-gray-200 bg-gray-50 text-center">
                <div className={`w-8 h-8 rounded-full ${b.color} mx-auto mb-2`} />
                <p className="text-2xl font-bold text-gray-900">{b.grams}g</p>
                <p className="text-sm text-gray-500">{b.label} ({b.pct}%)</p>
              </div>
            ))}
          </div>
          <div className="h-4 rounded-full overflow-hidden flex">
            {bars.map(b => (
              <div key={b.label} className={`${b.color} transition-all`} style={{ width: `${b.pct}%` }} />
            ))}
          </div>
          <div className="flex justify-end">
            <CopyButton text={`${cal} kcal: Protein ${proteinG}g | Carbs ${carbsG}g | Fat ${fatG}g`} />
          </div>
        </div>
      )}
    </div>
  );
}
