"use client";
import { useState, useMemo } from "react";

type Unit = "metric" | "imperial";
type Gender = "male" | "female";

function calcIdealWeights(heightCm: number, gender: Gender) {
  const isMale = gender === "male";
  const heightIn = heightCm / 2.54;
  const inchesOver5ft = Math.max(0, heightIn - 60);

  // Robinson (1983)
  const robinson = isMale
    ? 52 + 1.9 * inchesOver5ft
    : 49 + 1.7 * inchesOver5ft;

  // Miller (1983)
  const miller = isMale
    ? 56.2 + 1.41 * inchesOver5ft
    : 53.1 + 1.36 * inchesOver5ft;

  // Devine (1974)
  const devine = isMale
    ? 50 + 2.3 * inchesOver5ft
    : 45.5 + 2.3 * inchesOver5ft;

  // Hamwi (1964)
  const hamwi = isMale
    ? 48 + 2.7 * inchesOver5ft
    : 45.5 + 2.2 * inchesOver5ft;

  // Healthy BMI range (18.5–24.9)
  const heightM = heightCm / 100;
  const bmiLow = 18.5 * heightM * heightM;
  const bmiHigh = 24.9 * heightM * heightM;

  return { robinson, miller, devine, hamwi, bmiLow, bmiHigh };
}

export default function IdealWeightCalculator() {
  const [unit, setUnit] = useState<Unit>("metric");
  const [gender, setGender] = useState<Gender>("male");
  const [heightCm, setHeightCm] = useState("175");
  const [heightFt, setHeightFt] = useState("5");
  const [heightIn, setHeightIn] = useState("9");
  const [currentWeight, setCurrentWeight] = useState("");

  const heightCmVal = unit === "metric"
    ? parseFloat(heightCm) || 0
    : ((parseInt(heightFt) || 0) * 12 + (parseFloat(heightIn) || 0)) * 2.54;

  const result = useMemo(() => {
    if (heightCmVal < 100 || heightCmVal > 250) return null;
    return calcIdealWeights(heightCmVal, gender);
  }, [heightCmVal, gender]);

  const currentKg = unit === "metric"
    ? parseFloat(currentWeight) || null
    : currentWeight ? parseFloat(currentWeight) / 2.2046 : null;

  function fmt(kg: number) {
    if (unit === "metric") return `${kg.toFixed(1)} kg`;
    return `${(kg * 2.2046).toFixed(1)} lbs`;
  }

  const formulas = result
    ? [
        { name: "Robinson (1983)", kg: result.robinson, desc: "Most widely cited" },
        { name: "Miller (1983)", kg: result.miller, desc: "Conservative estimate" },
        { name: "Devine (1974)", kg: result.devine, desc: "Used in clinical dosing" },
        { name: "Hamwi (1964)", kg: result.hamwi, desc: "Classic dietitian formula" },
      ]
    : [];

  const avg = formulas.length
    ? formulas.reduce((s, f) => s + f.kg, 0) / formulas.length
    : null;

  return (
    <div className="space-y-6">
      {/* Unit + Gender */}
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
              className={"px-4 py-2 text-sm font-semibold border transition-all first:rounded-l-xl last:rounded-r-xl capitalize " +
                (gender === g ? "bg-gray-900 text-white border-gray-900 z-10" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400")}>
              {g === "male" ? "♂ Male" : "♀ Female"}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Height</label>
          {unit === "metric" ? (
            <div className="flex items-center gap-2">
              <input type="number" min="100" max="250" value={heightCm} onChange={(e) => setHeightCm(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 font-semibold text-gray-900 focus:outline-none focus:border-gray-400" />
              <span className="text-sm text-gray-400 shrink-0">cm</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input type="number" min="0" max="9" value={heightFt} onChange={(e) => setHeightFt(e.target.value)}
                className="w-20 border border-gray-200 rounded-xl px-3 py-2.5 font-semibold text-gray-900 focus:outline-none focus:border-gray-400" />
              <span className="text-sm text-gray-400">ft</span>
              <input type="number" min="0" max="11" value={heightIn} onChange={(e) => setHeightIn(e.target.value)}
                className="w-20 border border-gray-200 rounded-xl px-3 py-2.5 font-semibold text-gray-900 focus:outline-none focus:border-gray-400" />
              <span className="text-sm text-gray-400">in</span>
            </div>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Current Weight (optional)
          </label>
          <div className="flex items-center gap-2">
            <input type="number" min="0" value={currentWeight} onChange={(e) => setCurrentWeight(e.target.value)}
              placeholder="e.g. 80"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 font-semibold text-gray-900 focus:outline-none focus:border-gray-400" />
            <span className="text-sm text-gray-400 shrink-0">{unit === "metric" ? "kg" : "lbs"}</span>
          </div>
        </div>
      </div>

      {result ? (
        <>
          {/* Avg result hero */}
          <div className="bg-gray-900 rounded-2xl p-5 text-white">
            <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Average Ideal Weight</div>
            <div className="text-4xl font-black text-green-400">{avg !== null ? fmt(avg) : "—"}</div>
            <div className="text-xs text-gray-400 mt-2">
              Healthy BMI range: {result ? `${fmt(result.bmiLow)} – ${fmt(result.bmiHigh)}` : "—"}
            </div>
            {currentKg && avg !== null && (
              <div className={`mt-3 text-sm font-semibold ${Math.abs(currentKg - avg) < 5 ? "text-green-400" : "text-amber-400"}`}>
                {currentKg > avg
                  ? `${fmt(currentKg - avg)} above average ideal weight`
                  : currentKg < avg
                  ? `${fmt(avg - currentKg)} below average ideal weight`
                  : "At ideal weight"}
              </div>
            )}
          </div>

          {/* Formula table */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">By Formula</h3>
            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Formula</th>
                    <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500">Ideal Weight</th>
                    <th className="hidden sm:table-cell text-right px-4 py-2.5 text-xs font-semibold text-gray-500">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {formulas.map((f) => (
                    <tr key={f.name} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 font-medium text-gray-800">{f.name}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-gray-900">{fmt(f.kg)}</td>
                      <td className="hidden sm:table-cell px-4 py-2.5 text-right text-xs text-gray-400">{f.desc}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td className="px-4 py-2.5 font-semibold text-gray-700">BMI 18.5–24.9 range</td>
                    <td className="px-4 py-2.5 text-right font-bold text-blue-600">{fmt(result.bmiLow)} – {fmt(result.bmiHigh)}</td>
                    <td className="hidden sm:table-cell px-4 py-2.5 text-right text-xs text-gray-400">WHO standard</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700 space-y-1">
            <p className="font-semibold">How to read your results</p>
            <p>These formulas estimate ideal weight for average-framed adults. Athletes with high muscle mass may exceed these ranges while remaining healthy. Always consult a healthcare provider for personalized advice.</p>
          </div>
        </>
      ) : (
        <div className="text-center text-sm text-gray-400 py-8 border border-dashed border-gray-200 rounded-xl">
          Enter a valid height (100–250 cm) to see results
        </div>
      )}
    </div>
  );
}
