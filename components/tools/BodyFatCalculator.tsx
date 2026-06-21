"use client";
import { useState, useMemo } from "react";

type Unit = "metric" | "imperial";
type Gender = "male" | "female";

function cmToIn(cm: number) { return cm / 2.54; }

// US Navy method — most accurate without DEXA
function navyBodyFat(gender: Gender, heightCm: number, waistCm: number, neckCm: number, hipCm: number): number | null {
  if (heightCm <= 0 || waistCm <= 0 || neckCm <= 0) return null;
  if (gender === "female" && hipCm <= 0) return null;

  const h = cmToIn(heightCm);
  const w = cmToIn(waistCm);
  const n = cmToIn(neckCm);

  if (gender === "male") {
    if (w <= n) return null;
    const bf = 86.010 * Math.log10(w - n) - 70.041 * Math.log10(h) + 36.76;
    return Math.max(0, Math.min(70, bf));
  } else {
    const hip = cmToIn(hipCm);
    if (w + hip <= n) return null;
    const bf = 163.205 * Math.log10(w + hip - n) - 97.684 * Math.log10(h) - 78.387;
    return Math.max(0, Math.min(70, bf));
  }
}

function getCategory(bf: number, gender: Gender): { label: string; color: string; bg: string } {
  if (gender === "male") {
    if (bf < 6) return { label: "Essential Fat", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" };
    if (bf < 14) return { label: "Athletic", color: "text-green-700", bg: "bg-green-50 border-green-200" };
    if (bf < 18) return { label: "Fitness", color: "text-green-600", bg: "bg-green-50 border-green-100" };
    if (bf < 25) return { label: "Average", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" };
    return { label: "Obese", color: "text-red-700", bg: "bg-red-50 border-red-200" };
  } else {
    if (bf < 14) return { label: "Essential Fat", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" };
    if (bf < 21) return { label: "Athletic", color: "text-green-700", bg: "bg-green-50 border-green-200" };
    if (bf < 25) return { label: "Fitness", color: "text-green-600", bg: "bg-green-50 border-green-100" };
    if (bf < 32) return { label: "Average", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" };
    return { label: "Obese", color: "text-red-700", bg: "bg-red-50 border-red-200" };
  }
}

export default function BodyFatCalculator() {
  const [unit, setUnit] = useState<Unit>("metric");
  const [gender, setGender] = useState<Gender>("male");
  const [height, setHeight] = useState("175");
  const [waist, setWaist] = useState("85");
  const [neck, setNeck] = useState("38");
  const [hip, setHip] = useState("95");
  const [weight, setWeight] = useState("80");

  function toMetric(val: string) {
    const n = parseFloat(val) || 0;
    return unit === "metric" ? n : n * 2.54;
  }
  function toKg(val: string) {
    const n = parseFloat(val) || 0;
    return unit === "metric" ? n : n / 2.2046;
  }

  const heightCm = toMetric(height);
  const waistCm = toMetric(waist);
  const neckCm = toMetric(neck);
  const hipCm = toMetric(hip);
  const weightKg = toKg(weight);

  const bfPct = useMemo(() =>
    navyBodyFat(gender, heightCm, waistCm, neckCm, hipCm),
    [gender, heightCm, waistCm, neckCm, hipCm]
  );

  const category = bfPct !== null ? getCategory(bfPct, gender) : null;
  const fatMass = bfPct !== null && weightKg > 0 ? (bfPct / 100) * weightKg : null;
  const leanMass = fatMass !== null && weightKg > 0 ? weightKg - fatMass : null;

  const unitLabel = unit === "metric" ? "cm" : "in";
  const weightLabel = unit === "metric" ? "kg" : "lbs";

  const ranges = gender === "male"
    ? [["Essential Fat", "< 6%"], ["Athletic", "6–13%"], ["Fitness", "14–17%"], ["Average", "18–24%"], ["Obese", "≥ 25%"]]
    : [["Essential Fat", "< 14%"], ["Athletic", "14–20%"], ["Fitness", "21–24%"], ["Average", "25–31%"], ["Obese", "≥ 32%"]];

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
        {[
          { label: `Height (${unitLabel})`, val: height, set: setHeight, placeholder: unit === "metric" ? "175" : "69" },
          { label: `Waist (${unitLabel})`, val: waist, set: setWaist, placeholder: unit === "metric" ? "85" : "33" },
          { label: `Neck (${unitLabel})`, val: neck, set: setNeck, placeholder: unit === "metric" ? "38" : "15" },
          ...(gender === "female" ? [{ label: `Hip (${unitLabel})`, val: hip, set: setHip, placeholder: unit === "metric" ? "95" : "37" }] : []),
          { label: `Weight (${weightLabel}) — optional`, val: weight, set: setWeight, placeholder: unit === "metric" ? "80" : "176" },
        ].map((field) => (
          <div key={field.label}>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{field.label}</label>
            <input type="number" min="0" step="0.1" value={field.val} onChange={(e) => field.set(e.target.value)}
              placeholder={field.placeholder}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 font-semibold text-gray-900 focus:outline-none focus:border-gray-400" />
          </div>
        ))}
      </div>

      {bfPct !== null && category ? (
        <>
          <div className="bg-gray-900 rounded-2xl p-5 text-white">
            <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Body Fat Percentage</div>
            <div className="text-5xl font-black text-white">{bfPct.toFixed(1)}<span className="text-2xl text-gray-400">%</span></div>
            <div className={`mt-3 inline-block px-3 py-1 rounded-full text-sm font-bold border ${category.bg} ${category.color}`}>
              {category.label}
            </div>
            {fatMass !== null && leanMass !== null && (
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-xs text-gray-400">Fat Mass</div>
                  <div className="font-bold text-red-400">{unit === "metric" ? `${fatMass.toFixed(1)} kg` : `${(fatMass * 2.2046).toFixed(1)} lbs`}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Lean Mass</div>
                  <div className="font-bold text-green-400">{unit === "metric" ? `${leanMass.toFixed(1)} kg` : `${(leanMass * 2.2046).toFixed(1)} lbs`}</div>
                </div>
              </div>
            )}
          </div>

          {/* Visual bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>0%</span><span>Essential</span><span>Athletic</span><span>Fitness</span><span>Average</span><span>Obese</span>
            </div>
            <div className="h-4 rounded-full bg-gradient-to-r from-blue-400 via-green-400 via-amber-400 to-red-500 relative">
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-gray-900 rounded-full shadow"
                style={{ left: `${Math.min(98, Math.max(1, bfPct / 45 * 100))}%`, transform: "translate(-50%, -50%)" }}
              />
            </div>
          </div>

          {/* Ranges */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Reference Ranges ({gender})</h3>
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full text-sm">
                <tbody className="divide-y divide-gray-50">
                  {ranges.map(([cat, rng]) => (
                    <tr key={cat} className={category.label === cat ? "bg-gray-100" : "hover:bg-gray-50"}>
                      <td className="px-4 py-2.5 font-medium text-gray-700">{cat} {category.label === cat && "◀ You"}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-gray-900">{rng}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center text-sm text-gray-400 py-8 border border-dashed border-gray-200 rounded-xl">
          Enter all measurements to calculate body fat %
        </div>
      )}

      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
        <p className="font-semibold mb-1">How to measure (US Navy Method)</p>
        <p><strong>Waist:</strong> Measure at navel level. <strong>Neck:</strong> Below larynx, sloping down slightly. <strong>Hip (women only):</strong> Widest point. All measurements in a relaxed, normal breath.</p>
      </div>
    </div>
  );
}
