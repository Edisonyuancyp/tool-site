"use client";
import { useState, useMemo } from "react";

type Unit = "metric" | "imperial";
type Gender = "male" | "female";

const ACTIVITY_LEVELS = [
  { label: "Sedentary", desc: "Little or no exercise", factor: 1.2 },
  { label: "Lightly active", desc: "1–3 days/week", factor: 1.375 },
  { label: "Moderately active", desc: "3–5 days/week", factor: 1.55 },
  { label: "Very active", desc: "6–7 days/week", factor: 1.725 },
  { label: "Super active", desc: "Hard training + physical job", factor: 1.9 },
];

const GOALS = [
  { label: "Extreme cut", factor: 0.6, desc: "–40% (not recommended)" },
  { label: "Cut", factor: 0.8, desc: "–20% deficit" },
  { label: "Mild cut", factor: 0.9, desc: "–10% deficit" },
  { label: "Maintain", factor: 1.0, desc: "= TDEE" },
  { label: "Mild bulk", factor: 1.1, desc: "+10% surplus" },
  { label: "Bulk", factor: 1.2, desc: "+20% surplus" },
];

export default function BmrTdeeCalculator() {
  const [unit, setUnit] = useState<Unit>("metric");
  const [gender, setGender] = useState<Gender>("male");
  const [age, setAge] = useState("30");
  const [weightKgStr, setWeight] = useState("75");
  const [heightCmStr, setHeight] = useState("175");
  const [heightFt, setHeightFt] = useState("5");
  const [heightIn, setHeightIn] = useState("9");
  const [activity, setActivity] = useState(1.55);

  const weightKg = unit === "metric"
    ? parseFloat(weightKgStr) || 0
    : (parseFloat(weightKgStr) || 0) / 2.2046;

  const heightCm = unit === "metric"
    ? parseFloat(heightCmStr) || 0
    : ((parseInt(heightFt) || 0) * 12 + (parseFloat(heightIn) || 0)) * 2.54;

  const ageVal = parseInt(age) || 0;

  const result = useMemo(() => {
    if (weightKg <= 0 || heightCm <= 0 || ageVal <= 0) return null;

    // Mifflin-St Jeor (most accurate)
    const mifflin = gender === "male"
      ? 10 * weightKg + 6.25 * heightCm - 5 * ageVal + 5
      : 10 * weightKg + 6.25 * heightCm - 5 * ageVal - 161;

    // Harris-Benedict (revised 1984)
    const harrisBenedict = gender === "male"
      ? 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * ageVal
      : 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.330 * ageVal;

    // Katch-McArdle (needs lean mass — estimate via avg bf)
    const estBF = gender === "male" ? 0.18 : 0.25;
    const leanMass = weightKg * (1 - estBF);
    const katchMcArdle = 370 + 21.6 * leanMass;

    const bmr = mifflin;
    const tdee = bmr * activity;

    return { mifflin, harrisBenedict, katchMcArdle, bmr, tdee };
  }, [weightKg, heightCm, ageVal, gender, activity]);

  const macros = result ? {
    protein: Math.round(weightKg * 2.2),   // 2g/kg
    fat: Math.round(result.tdee * 0.25 / 9),
    carbs: Math.round((result.tdee - weightKg * 2.2 * 4 - result.tdee * 0.25) / 4),
  } : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <div className="flex">
          {(["metric", "imperial"] as Unit[]).map((u) => (
            <button key={u} type="button" onClick={() => setUnit(u)}
              className={"px-4 py-2 text-sm font-semibold border transition-all first:rounded-l-xl last:rounded-r-xl capitalize " +
                (unit === u ? "bg-gray-900 text-white border-gray-900 z-10" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400")}>
              {u}
            </button>
          ))}
        </div>
        <div className="flex">
          {(["male", "female"] as Gender[]).map((g) => (
            <button key={g} type="button" onClick={() => setGender(g)}
              className={"px-4 py-2 text-sm font-semibold border transition-all first:rounded-l-xl last:rounded-r-xl " +
                (gender === g ? "bg-gray-900 text-white border-gray-900 z-10" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400")}>
              {g === "male" ? "♂ Male" : "♀ Female"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Age</label>
          <input type="number" min="10" max="120" value={age} onChange={(e) => setAge(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 font-semibold text-gray-900 focus:outline-none focus:border-gray-400" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Weight ({unit === "metric" ? "kg" : "lbs"})</label>
          <input type="number" min="0" step="0.1" value={weightKgStr} onChange={(e) => setWeight(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 font-semibold text-gray-900 focus:outline-none focus:border-gray-400" />
        </div>
        {unit === "metric" ? (
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Height (cm)</label>
            <input type="number" min="100" max="250" value={heightCmStr} onChange={(e) => setHeight(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 font-semibold text-gray-900 focus:outline-none focus:border-gray-400" />
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Height</label>
            <div className="flex gap-2">
              <input type="number" min="0" max="9" value={heightFt} onChange={(e) => setHeightFt(e.target.value)}
                className="w-16 border border-gray-200 rounded-xl px-2 py-2.5 font-semibold text-gray-900 focus:outline-none focus:border-gray-400" />
              <span className="self-center text-sm text-gray-400">ft</span>
              <input type="number" min="0" max="11" value={heightIn} onChange={(e) => setHeightIn(e.target.value)}
                className="w-16 border border-gray-200 rounded-xl px-2 py-2.5 font-semibold text-gray-900 focus:outline-none focus:border-gray-400" />
              <span className="self-center text-sm text-gray-400">in</span>
            </div>
          </div>
        )}
      </div>

      {/* Activity */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Activity Level</label>
        <div className="space-y-2">
          {ACTIVITY_LEVELS.map((a) => (
            <button key={a.factor} type="button" onClick={() => setActivity(a.factor)}
              className={"w-full text-left px-4 py-3 rounded-xl border transition-all " +
                (activity === a.factor ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-200 hover:border-gray-400")}>
              <span className="font-semibold text-sm">{a.label}</span>
              <span className={`text-xs ml-2 ${activity === a.factor ? "text-gray-400" : "text-gray-400"}`}>{a.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {result ? (
        <>
          {/* BMR & TDEE hero */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-900 rounded-2xl p-5 text-white">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">BMR</div>
              <div className="text-3xl font-black text-blue-400">{Math.round(result.bmr)}</div>
              <div className="text-xs text-gray-400 mt-1">kcal/day at rest</div>
            </div>
            <div className="bg-gray-900 rounded-2xl p-5 text-white">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">TDEE</div>
              <div className="text-3xl font-black text-green-400">{Math.round(result.tdee)}</div>
              <div className="text-xs text-gray-400 mt-1">kcal/day total burn</div>
            </div>
          </div>

          {/* Formula comparison */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">BMR by Formula</h3>
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-50">
                  {[
                    { name: "Mifflin-St Jeor ★", val: result.mifflin, note: "Most accurate (used above)" },
                    { name: "Harris-Benedict", val: result.harrisBenedict, note: "Classic formula" },
                    { name: "Katch-McArdle", val: result.katchMcArdle, note: "Uses lean mass (est.)" },
                  ].map((f) => (
                    <tr key={f.name} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-medium text-gray-800">{f.name}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-gray-900">{Math.round(f.val)} kcal</td>
                      <td className="hidden sm:table-cell px-4 py-2.5 text-right text-xs text-gray-400">{f.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Goals */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Calorie Targets by Goal</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {GOALS.map((g) => (
                <div key={g.label} className={`rounded-xl border p-3 text-center ${g.factor === 1 ? "bg-gray-900 border-gray-900 text-white" : "bg-gray-50 border-gray-100"}`}>
                  <div className={`text-xs font-semibold mb-1 ${g.factor === 1 ? "text-gray-400" : "text-gray-500"}`}>{g.label}</div>
                  <div className={`text-lg font-black ${g.factor === 1 ? "text-green-400" : "text-gray-900"}`}>{Math.round(result.tdee * g.factor)}</div>
                  <div className={`text-xs mt-0.5 ${g.factor === 1 ? "text-gray-400" : "text-gray-400"}`}>{g.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Macros */}
          {macros && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Suggested Macros (maintenance)</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Protein", val: macros.protein, unit: "g", color: "text-blue-600" },
                  { label: "Fat", val: macros.fat, unit: "g", color: "text-amber-600" },
                  { label: "Carbs", val: Math.max(0, macros.carbs), unit: "g", color: "text-green-600" },
                ].map((m) => (
                  <div key={m.label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                    <div className="text-xs text-gray-400 mb-1">{m.label}</div>
                    <div className={`text-2xl font-black ${m.color}`}>{m.val}<span className="text-sm font-normal text-gray-400">g</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
            <p className="font-semibold mb-1">How to read your results</p>
            <p><strong>BMR</strong> is the calories you burn doing nothing. <strong>TDEE</strong> is your total daily burn. Eat below TDEE to lose weight, above to gain. Aim for 0.5–1% body weight change per week for sustainable results.</p>
          </div>
        </>
      ) : (
        <div className="text-center text-sm text-gray-400 py-8 border border-dashed border-gray-200 rounded-xl">
          Fill in all fields to calculate
        </div>
      )}
    </div>
  );
}
