"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

const DOMAINS = [
  {
    label: "Work Hours",
    icon: "💼",
    question: "How many hours do you work per week (including overtime)?",
    type: "number" as const,
    unit: "hrs/week",
    scoreFunc: (v: number) => v <= 40 ? 10 : v <= 50 ? 7 : v <= 60 ? 4 : 1,
  },
  {
    label: "Sleep",
    icon: "😴",
    question: "How many hours of sleep do you get per night on average?",
    type: "number" as const,
    unit: "hrs/night",
    scoreFunc: (v: number) => v >= 7 && v <= 9 ? 10 : v >= 6 ? 7 : v >= 5 ? 4 : 1,
  },
  {
    label: "Exercise",
    icon: "🏃",
    question: "How many days per week do you exercise?",
    type: "number" as const,
    unit: "days/week",
    scoreFunc: (v: number) => v >= 5 ? 10 : v >= 3 ? 8 : v >= 1 ? 5 : 2,
  },
  {
    label: "Family / Social Time",
    icon: "👨‍👩‍👧",
    question: "Rate your satisfaction with time spent with family & friends (1–10)",
    type: "slider" as const,
    unit: "",
    scoreFunc: (v: number) => v,
  },
  {
    label: "Personal Hobbies",
    icon: "🎨",
    question: "Rate how often you pursue personal hobbies/interests (1–10)",
    type: "slider" as const,
    unit: "",
    scoreFunc: (v: number) => v,
  },
  {
    label: "Stress Level",
    icon: "🧘",
    question: "Rate your overall stress level (1 = very stressed, 10 = very relaxed)",
    type: "slider" as const,
    unit: "",
    scoreFunc: (v: number) => v,
  },
];

function getLabel(score: number): { text: string; color: string } {
  if (score >= 85) return { text: "Excellent Balance",  color: "text-green-700"  };
  if (score >= 65) return { text: "Good Balance",       color: "text-blue-700"   };
  if (score >= 45) return { text: "Moderate Imbalance", color: "text-amber-700"  };
  return              { text: "Needs Attention",     color: "text-red-700"    };
}

export default function WorkLifeBalanceCalculatorView({ variant }: ToolProps) {
  const [values, setValues] = useState<string[]>(DOMAINS.map(d => d.type === "slider" ? "5" : ""));

  function set(i: number, v: string) {
    setValues(prev => prev.map((val, idx) => idx === i ? v : val));
  }

  const scores = DOMAINS.map((d, i) => {
    const v = parseFloat(values[i]);
    return isNaN(v) ? null : d.scoreFunc(v);
  });
  const filled = scores.filter(s => s !== null) as number[];
  const overall = filled.length > 0 ? Math.round(filled.reduce((a, b) => a + b, 0) / filled.length * 10) : 0;
  const { text: label, color } = getLabel(overall);

  const barColor = overall >= 85 ? "bg-green-500" : overall >= 65 ? "bg-blue-500" : overall >= 45 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="space-y-5">
      {DOMAINS.map((d, i) => (
        <div key={d.label} className="p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{d.icon}</span>
            <label className="text-sm font-medium text-gray-700">{d.question}</label>
          </div>
          {d.type === "slider" ? (
            <div className="flex items-center gap-4">
              <input type="range" min="1" max="10" value={values[i]}
                onChange={e => set(i, e.target.value)}
                className="flex-1 accent-gray-900" />
              <span className="w-8 text-center font-bold text-gray-900">{values[i]}</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <input type="number" value={values[i]} onChange={e => set(i, e.target.value)}
                placeholder="0"
                className="w-28 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400" />
              {d.unit && <span className="text-sm text-gray-400">{d.unit}</span>}
              {scores[i] !== null && (
                <span className="text-xs font-medium text-gray-500 ml-auto">Score: {scores[i]}/10</span>
              )}
            </div>
          )}
        </div>
      ))}

      {filled.length > 0 && (
        <div className="space-y-4">
          <div className="p-6 rounded-xl border border-gray-200 bg-gray-50 text-center">
            <p className="text-sm text-gray-500 mb-2">Work-Life Balance Score</p>
            <p className={`text-5xl font-bold mb-1 ${color}`}>{overall}</p>
            <p className={`text-lg font-semibold ${color}`}>{label}</p>
          </div>

          <div className="space-y-2">
            {DOMAINS.map((d, i) => scores[i] !== null && (
              <div key={d.label} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-40 shrink-0">{d.icon} {d.label}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${barColor} transition-all`}
                    style={{ width: `${(scores[i]! / 10) * 100}%` }} />
                </div>
                <span className="text-sm font-medium text-gray-700 w-8 text-right">{scores[i]}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <CopyButton text={`Work-Life Balance Score: ${overall}/100 — ${label}`} />
          </div>
        </div>
      )}
    </div>
  );
}
