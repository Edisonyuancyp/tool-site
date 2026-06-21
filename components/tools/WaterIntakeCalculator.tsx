"use client";
import { useState, useMemo } from "react";

type Unit = "metric" | "imperial";

const ACTIVITY_LEVELS = [
  { label: "Sedentary", desc: "Desk job, minimal movement", extra: 0 },
  { label: "Light", desc: "Walk 30 min/day", extra: 350 },
  { label: "Moderate", desc: "Exercise 3–5×/week", extra: 700 },
  { label: "Active", desc: "Daily intense exercise", extra: 1050 },
  { label: "Athlete", desc: "2× daily training", extra: 1400 },
];

const CLIMATE_LEVELS = [
  { label: "Cool / AC", extra: 0 },
  { label: "Temperate", extra: 250 },
  { label: "Hot & humid", extra: 600 },
  { label: "Very hot", extra: 1000 },
];

export default function WaterIntakeCalculator() {
  const [unit, setUnit] = useState<Unit>("metric");
  const [weight, setWeight] = useState("70");
  const [activity, setActivity] = useState(700);
  const [climate, setClimate] = useState(0);
  const [pregnant, setPregnant] = useState(false);
  const [breastfeeding, setBreastfeeding] = useState(false);

  const weightKg = unit === "metric"
    ? parseFloat(weight) || 0
    : (parseFloat(weight) || 0) / 2.2046;

  const result = useMemo(() => {
    if (weightKg <= 0) return null;
    // Base: 35 ml per kg (WHO recommendation)
    const base = weightKg * 35;
    const extra = activity + climate
      + (pregnant ? 300 : 0)
      + (breastfeeding ? 500 : 0);
    const total = base + extra;
    return { base, extra, total, cups: total / 240, bottles500: total / 500 };
  }, [weightKg, activity, climate, pregnant, breastfeeding]);

  function fmtMl(ml: number) {
    if (ml >= 1000) return `${(ml / 1000).toFixed(1)} L`;
    return `${Math.round(ml)} mL`;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Unit</label>
          <div className="flex">
            {(["metric", "imperial"] as Unit[]).map((u) => (
              <button key={u} type="button" onClick={() => setUnit(u)}
                className={"flex-1 py-2.5 text-sm font-semibold border transition-all first:rounded-l-xl last:rounded-r-xl capitalize " +
                  (unit === u ? "bg-gray-900 text-white border-gray-900 z-10" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400")}>
                {u}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Body Weight ({unit === "metric" ? "kg" : "lbs"})
          </label>
          <input type="number" min="20" max="300" step="0.5" value={weight} onChange={(e) => setWeight(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 font-semibold text-gray-900 focus:outline-none focus:border-gray-400" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Activity Level</label>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          {ACTIVITY_LEVELS.map((a) => (
            <button key={a.label} type="button" onClick={() => setActivity(a.extra)}
              className={"py-2.5 px-2 text-center rounded-xl border transition-all " +
                (activity === a.extra ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400")}>
              <div className="text-xs font-bold">{a.label}</div>
              <div className={`text-xs mt-0.5 ${activity === a.extra ? "text-gray-400" : "text-gray-400"}`}>{a.desc}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Climate / Temperature</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CLIMATE_LEVELS.map((c) => (
            <button key={c.label} type="button" onClick={() => setClimate(c.extra)}
              className={"py-2.5 px-3 text-center rounded-xl border transition-all text-sm font-semibold " +
                (climate === c.extra ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400")}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={pregnant} onChange={(e) => setPregnant(e.target.checked)} className="w-4 h-4 accent-gray-900" />
          <span className="text-sm text-gray-700">Pregnant (+300 mL)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={breastfeeding} onChange={(e) => setBreastfeeding(e.target.checked)} className="w-4 h-4 accent-gray-900" />
          <span className="text-sm text-gray-700">Breastfeeding (+500 mL)</span>
        </label>
      </div>

      {result ? (
        <>
          <div className="bg-gray-900 rounded-2xl p-5 text-white">
            <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Daily Water Target</div>
            <div className="text-5xl font-black text-blue-400">{fmtMl(result.total)}</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 text-sm">
              <div>
                <div className="text-xs text-gray-400">≈ Cups (240 mL)</div>
                <div className="font-bold text-white">{result.cups.toFixed(1)} cups</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">≈ Bottles (500 mL)</div>
                <div className="font-bold text-white">{result.bottles500.toFixed(1)} bottles</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Base (body weight)</div>
                <div className="font-bold text-blue-300">{fmtMl(result.base)}</div>
              </div>
            </div>
          </div>

          {/* Hourly breakdown */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Hourly Schedule (16 waking hours)</h3>
            <div className="grid grid-cols-4 gap-2">
              {["Morning", "Mid-morning", "Afternoon", "Evening"].map((period, i) => (
                <div key={period} className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                  <div className="text-xs text-blue-500 font-semibold mb-1">{period}</div>
                  <div className="text-lg font-black text-blue-700">{fmtMl(result.total / 4)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
            <p className="font-semibold mb-1">How to read your results</p>
            <p>This is a minimum target. Thirst, urine color (aim for pale yellow), and energy levels are better real-time indicators. Coffee and tea count toward hydration — they're about 90% water.</p>
          </div>
        </>
      ) : (
        <div className="text-center text-sm text-gray-400 py-8 border border-dashed border-gray-200 rounded-xl">
          Enter your body weight to calculate
        </div>
      )}
    </div>
  );
}
