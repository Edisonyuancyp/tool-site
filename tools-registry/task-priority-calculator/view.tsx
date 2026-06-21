"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

type Task = { name: string; urgency: number; importance: number; effort: number };

function getQuadrant(u: number, i: number): { label: string; action: string; color: string } {
  if (u >= 5 && i >= 5) return { label: "Do First",     action: "Critical — do immediately",     color: "bg-red-100 text-red-800 border-red-200"    };
  if (u < 5  && i >= 5) return { label: "Schedule",     action: "Important — plan & schedule",   color: "bg-blue-100 text-blue-800 border-blue-200"  };
  if (u >= 5 && i < 5)  return { label: "Delegate",     action: "Urgent but not important",      color: "bg-amber-100 text-amber-800 border-amber-200"};
  return                        { label: "Eliminate",    action: "Low value — consider dropping", color: "bg-gray-100 text-gray-700 border-gray-200"   };
}

function priorityScore(t: Task) {
  return (t.urgency * 0.4 + t.importance * 0.4 + (10 - t.effort) * 0.2);
}

const blank = (): Task => ({ name: "", urgency: 5, importance: 5, effort: 5 });

export default function TaskPriorityCalculatorView({ variant }: ToolProps) {
  const [tasks, setTasks] = useState<Task[]>([blank(), blank(), blank()]);

  function update(i: number, field: keyof Task, val: string | number) {
    setTasks(prev => prev.map((t, idx) => idx === i ? { ...t, [field]: val } : t));
  }
  function addTask()     { setTasks(p => [...p, blank()]); }
  function removeTask(i: number) { setTasks(p => p.filter((_, idx) => idx !== i)); }

  const scored = tasks
    .filter(t => t.name.trim())
    .map(t => ({ ...t, score: priorityScore(t), quad: getQuadrant(t.urgency, t.importance) }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {tasks.map((t, i) => (
          <div key={i} className="p-4 rounded-xl border border-gray-200 space-y-3">
            <div className="flex gap-3 items-center">
              <input value={t.name} onChange={e => update(i, "name", e.target.value)}
                placeholder={`Task ${i + 1}`}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400 font-medium" />
              <button onClick={() => removeTask(i)} className="text-gray-300 hover:text-red-400 text-lg">×</button>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              {([
                { field: "urgency" as const,    label: "Urgency",    hint: "How time-sensitive?" },
                { field: "importance" as const,  label: "Importance", hint: "How much does it matter?" },
                { field: "effort" as const,      label: "Effort",     hint: "How hard is it?" },
              ]).map(({ field, label, hint }) => (
                <div key={field}>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{label}</span>
                    <span className="font-bold text-gray-900">{t[field]}/10</span>
                  </div>
                  <input type="range" min="1" max="10" value={t[field]}
                    onChange={e => update(i, field, parseInt(e.target.value))}
                    className="w-full accent-gray-900" />
                  <p className="text-xs text-gray-400 mt-0.5">{hint}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
        <button onClick={addTask} className="text-sm text-gray-400 hover:text-gray-700 border border-dashed border-gray-300 rounded-lg px-4 py-2 w-full hover:border-gray-400 transition-colors">
          + Add task
        </button>
      </div>

      {scored.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-700">Priority Order</p>
          {scored.map((t, i) => (
            <div key={t.name + i} className={`flex items-center gap-4 p-4 rounded-xl border ${t.quad.color}`}>
              <span className="text-2xl font-bold opacity-40">#{i + 1}</span>
              <div className="flex-1">
                <p className="font-semibold">{t.name}</p>
                <p className="text-xs mt-0.5">{t.quad.action}</p>
              </div>
              <div className="text-right">
                <span className={`text-xs font-bold px-2 py-1 rounded-full border ${t.quad.color}`}>{t.quad.label}</span>
                <p className="text-xs mt-1 opacity-60">score {t.score.toFixed(1)}</p>
              </div>
            </div>
          ))}
          <div className="flex justify-end">
            <CopyButton text={scored.map((t, i) => `#${i + 1} ${t.name} (${t.quad.label})`).join(" → ")} />
          </div>
        </div>
      )}
    </div>
  );
}
