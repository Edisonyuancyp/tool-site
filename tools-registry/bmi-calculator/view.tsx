"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps {
  variant?: string;
}

type Unit = "metric" | "imperial";

const BMI_CATEGORIES = [
  { max: 18.5, label: "Underweight", color: "text-blue-600 bg-blue-50 border-blue-100" },
  { max: 25,   label: "Normal weight", color: "text-green-600 bg-green-50 border-green-100" },
  { max: 30,   label: "Overweight", color: "text-yellow-600 bg-yellow-50 border-yellow-100" },
  { max: Infinity, label: "Obese", color: "text-red-600 bg-red-50 border-red-100" },
];

// CDC percentile thresholds for children (simplified)
const KIDS_PERCENTILES = [
  { max: 5,   label: "Underweight (< 5th percentile)", color: "text-blue-600 bg-blue-50 border-blue-100" },
  { max: 85,  label: "Healthy weight (5th–84th percentile)", color: "text-green-600 bg-green-50 border-green-100" },
  { max: 95,  label: "Overweight (85th–94th percentile)", color: "text-yellow-600 bg-yellow-50 border-yellow-100" },
  { max: Infinity, label: "Obese (≥ 95th percentile)", color: "text-red-600 bg-red-50 border-red-100" },
];

function getCategory(bmi: number) {
  return BMI_CATEGORIES.find((c) => bmi < c.max)!;
}

// Simplified CDC lookup: maps BMI → approximate percentile for age 10
function getKidsPercentile(bmi: number): number {
  if (bmi < 13.5) return 3;
  if (bmi < 14.5) return 5;
  if (bmi < 16)   return 25;
  if (bmi < 18)   return 50;
  if (bmi < 20)   return 75;
  if (bmi < 22)   return 85;
  if (bmi < 25)   return 95;
  return 99;
}

function getKidsCategory(percentile: number) {
  return KIDS_PERCENTILES.find((c) => percentile < c.max)!;
}

export default function BmiCalculatorView({ variant }: ToolProps) {
  const isImperial = variant === "imperial";
  const isKids = variant === "kids";

  const [unit, setUnit] = useState<Unit>(isImperial ? "imperial" : "metric");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [weightLb, setWeightLb] = useState("");
  const [age, setAge] = useState("");
  const [bmi, setBmi] = useState<number | null>(null);
  const [percentile, setPercentile] = useState<number | null>(null);

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
    const result = Math.round((w / (h * h)) * 10) / 10;
    setBmi(result);
    if (isKids) setPercentile(getKidsPercentile(result));
  };

  const category = bmi !== null ? getCategory(bmi) : null;
  const kidsCategory = percentile !== null ? getKidsCategory(percentile) : null;
  const displayCategory = isKids ? kidsCategory : category;
  const resultText = bmi !== null
    ? `BMI: ${bmi}${isKids && percentile !== null ? ` — ~${percentile}th percentile` : ` — ${category?.label}`}`
    : "";

  return (
    <div className="space-y-6">
      {/* Unit toggle — hidden for imperial variant (locked to imperial) */}
      {!isImperial && (
        <div className="flex rounded-lg border border-gray-200 p-1 w-fit gap-1">
          {(["metric", "imperial"] as Unit[]).map((u) => (
            <button
              key={u}
              onClick={() => { setUnit(u); setBmi(null); setPercentile(null); }}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
                unit === u ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      )}

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {unit === "metric" ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Weight (kg)</label>
              <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)}
                placeholder="70"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Height (cm)</label>
              <input type="number" value={height} onChange={(e) => setHeight(e.target.value)}
                placeholder="175"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 text-base"
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Weight (lbs)</label>
              <input type="number" value={weightLb} onChange={(e) => setWeightLb(e.target.value)}
                placeholder="154"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Height</label>
              <div className="flex gap-2">
                <input type="number" value={heightFt} onChange={(e) => setHeightFt(e.target.value)}
                  placeholder="5 ft"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 text-base"
                />
                <input type="number" value={heightIn} onChange={(e) => setHeightIn(e.target.value)}
                  placeholder="9 in"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 text-base"
                />
              </div>
            </div>
          </>
        )}
        {isKids && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Age (years, 2–19)</label>
            <input type="number" value={age} onChange={(e) => setAge(e.target.value)}
              placeholder="10" min="2" max="19"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 text-base"
            />
          </div>
        )}
      </div>

      <button
        onClick={calculate}
        className="w-full sm:w-auto px-8 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors text-base"
      >
        Calculate BMI
      </button>

      {/* Result */}
      {bmi !== null && displayCategory && (
        <div className={`flex items-center justify-between p-5 rounded-xl border ${displayCategory.color}`}>
          <div>
            <p className="text-3xl font-bold">{bmi}</p>
            <p className="text-sm font-medium mt-0.5">
              {isKids && percentile !== null
                ? `~${percentile}th percentile · ${displayCategory.label}`
                : displayCategory.label}
            </p>
            {variant === "female" && (
              <p className="text-xs mt-1 opacity-70">Women typically carry 5–8% more body fat than men at the same BMI.</p>
            )}
          </div>
          <CopyButton text={resultText} />
        </div>
      )}

      {/* BMI scale */}
      <div className="text-xs text-gray-400 grid grid-cols-4 gap-1.5 pt-2">
        {BMI_CATEGORIES.map((c) => (
          <div key={c.label} className={`text-center py-2 px-1 rounded-lg border ${c.color}`}>
            {c.label}
          </div>
        ))}
      </div>

      {/* Variant-specific links to other BMI pages */}
      <div className="pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400 mb-2">Other BMI calculators:</p>
        <div className="flex flex-wrap gap-2 text-xs">
          {variant !== undefined && (
            <a href="/tools/bmi-calculator" className="text-blue-500 hover:underline">Standard BMI</a>
          )}
          {variant !== "female" && (
            <a href="/tools/bmi-calculator-for-women" className="text-blue-500 hover:underline">BMI for Women</a>
          )}
          {variant !== "imperial" && (
            <a href="/tools/bmi-calculator-imperial" className="text-blue-500 hover:underline">Imperial (lbs/ft)</a>
          )}
          {variant !== "kids" && (
            <a href="/tools/bmi-calculator-for-kids" className="text-blue-500 hover:underline">Kids & Teens</a>
          )}
        </div>
      </div>
    </div>
  );
}
