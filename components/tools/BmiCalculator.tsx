"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

type Unit = "metric" | "imperial";

const categories = [
  { max: 18.5, label: "Underweight", color: "text-blue-600 bg-blue-50 border-blue-100" },
  { max: 25, label: "Normal weight", color: "text-green-600 bg-green-50 border-green-100" },
  { max: 30, label: "Overweight", color: "text-yellow-600 bg-yellow-50 border-yellow-100" },
  { max: Infinity, label: "Obese", color: "text-red-600 bg-red-50 border-red-100" },
];

function getCategory(bmi: number) {
  return categories.find((c) => bmi < c.max)!;
}

export default function BmiCalculator() {
  const [unit, setUnit] = useState<Unit>("metric");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [weightLb, setWeightLb] = useState("");
  const [bmi, setBmi] = useState<number | null>(null);

  const calculate = () => {
    let w: number, h: number;
    if (unit === "metric") {
      w = parseFloat(weight);
      h = parseFloat(height) / 100;
    } else {
      w = parseFloat(weightLb) * 0.453592;
      const totalIn = parseFloat(heightFt) * 12 + parseFloat(heightIn || "0");
      h = totalIn * 0.0254;
    }
    if (!w || !h || w <= 0 || h <= 0) return;
    setBmi(Math.round((w / (h * h)) * 10) / 10);
  };

  const category = bmi !== null ? getCategory(bmi) : null;
  const resultText = bmi !== null ? `BMI: ${bmi} — ${category?.label}` : "";

  return (
    <div className="space-y-6">
      {/* Unit toggle */}
      <div className="flex rounded-lg border border-gray-200 p-1 w-fit gap-1">
        {(["metric", "imperial"] as Unit[]).map((u) => (
          <button
            key={u}
            onClick={() => { setUnit(u); setBmi(null); }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
              unit === u ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {u}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {unit === "metric" ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Weight (kg)
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="70"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Height (cm)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="175"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 text-base"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Weight (lbs)
              </label>
              <input
                type="number"
                value={weightLb}
                onChange={(e) => setWeightLb(e.target.value)}
                placeholder="154"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Height
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={heightFt}
                  onChange={(e) => setHeightFt(e.target.value)}
                  placeholder="5 ft"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 text-base"
                />
                <input
                  type="number"
                  value={heightIn}
                  onChange={(e) => setHeightIn(e.target.value)}
                  placeholder="9 in"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 text-base"
                />
              </div>
            </div>
          </>
        )}
      </div>

      <button
        onClick={calculate}
        className="w-full sm:w-auto px-8 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors text-base"
      >
        Calculate BMI
      </button>

      {/* Result */}
      {bmi !== null && category && (
        <div className={`flex items-center justify-between p-5 rounded-xl border ${category.color}`}>
          <div>
            <p className="text-3xl font-bold">{bmi}</p>
            <p className="text-sm font-medium mt-0.5">{category.label}</p>
          </div>
          <CopyButton text={resultText} />
        </div>
      )}

      {/* Chart */}
      <div className="text-xs text-gray-400 grid grid-cols-4 gap-1.5 pt-2">
        {categories.map((c) => (
          <div key={c.label} className={`text-center py-2 px-1 rounded-lg border ${c.color}`}>
            {c.label}
          </div>
        ))}
      </div>
    </div>
  );
}
