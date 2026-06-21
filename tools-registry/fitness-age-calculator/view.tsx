"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function FitnessAgeCalculatorView({ variant }: ToolProps) {
  const [age,      setAge]      = useState("");
  const [gender,   setGender]   = useState<"male"|"female">("male");
  const [rhr,      setRhr]      = useState("");   // resting heart rate bpm
  const [height,   setHeight]   = useState("");   // cm
  const [weight,   setWeight]   = useState("");   // kg
  const [exercise, setExercise] = useState("3");  // days/week
  const [smoke,    setSmoke]    = useState(false);
  const [unit,     setUnit]     = useState<"metric"|"imperial">("metric");

  const chronoAge  = parseInt(age) || 0;
  const rhrVal     = parseInt(rhr) || 0;
  const heightCm   = unit === "metric" ? parseFloat(height) || 0 : (parseFloat(height) || 0) * 2.54;
  const weightKg   = unit === "metric" ? parseFloat(weight) || 0 : (parseFloat(weight) || 0) * 0.453592;
  const exerciseDays = parseInt(exercise) || 0;

  const bmi = heightCm > 0 ? weightKg / Math.pow(heightCm / 100, 2) : 0;

  function calcFitnessAge() {
    if (!chronoAge || !rhrVal || !heightCm || !weightKg) return null;

    let adj = 0;
    // RHR adjustments (lower = better)
    if (rhrVal < 60) adj -= 5;
    else if (rhrVal < 70) adj -= 2;
    else if (rhrVal > 90) adj += 6;
    else if (rhrVal > 80) adj += 3;

    // BMI adjustments
    if (bmi < 18.5) adj += 3;
    else if (bmi < 25) adj -= 3;
    else if (bmi < 30) adj += 2;
    else adj += 6;

    // Exercise adjustments
    if (exerciseDays >= 5) adj -= 6;
    else if (exerciseDays >= 3) adj -= 3;
    else if (exerciseDays >= 1) adj += 0;
    else adj += 5;

    // Smoking
    if (smoke) adj += 8;

    // Gender baseline RHR differs slightly
    if (gender === "female" && rhrVal < 65) adj -= 1;

    return Math.max(18, chronoAge + adj);
  }

  const fitnessAge = calcFitnessAge();
  const diff = fitnessAge !== null ? fitnessAge - chronoAge : null;

  const getColor = (d: number) => d <= -5 ? "text-green-700" : d <= 0 ? "text-blue-700" : d <= 5 ? "text-amber-700" : "text-red-700";
  const getMessage = (d: number) =>
    d <= -5 ? "Your body is significantly younger than your age — great work!" :
    d <= 0  ? "You're in good shape — fitness age is at or below chronological age." :
    d <= 5  ? "Moderate gap — regular cardio and healthy diet can help." :
              "Your fitness age is higher than chronological. Prioritize exercise and sleep.";

  return (
    <div className="space-y-6">
      <div className="flex gap-4 flex-wrap items-center">
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {(["male","female"] as const).map(g => (
            <button key={g} onClick={() => setGender(g)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${gender === g ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"}`}>
              {g}
            </button>
          ))}
        </div>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {(["metric","imperial"] as const).map(u => (
            <button key={u} onClick={() => setUnit(u)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${unit === u ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"}`}>
              {u}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Chronological Age</label>
          <input type="number" value={age} onChange={e => setAge(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Resting Heart Rate (bpm)</label>
          <input type="number" value={rhr} onChange={e => setRhr(e.target.value)}
            placeholder="60–100"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Height ({unit === "metric" ? "cm" : "inches"})</label>
          <input type="number" value={height} onChange={e => setHeight(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Weight ({unit === "metric" ? "kg" : "lbs"})</label>
          <input type="number" value={weight} onChange={e => setWeight(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Exercise (days/week)</label>
          <input type="number" value={exercise} min="0" max="7" onChange={e => setExercise(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
        </div>
        <div className="flex items-center gap-3 pt-6">
          <input type="checkbox" id="smoke" checked={smoke} onChange={e => setSmoke(e.target.checked)}
            className="w-4 h-4 accent-gray-900" />
          <label htmlFor="smoke" className="text-sm font-medium text-gray-700">Current smoker</label>
        </div>
      </div>

      {fitnessAge !== null && diff !== null && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-5 rounded-xl border border-gray-200 bg-gray-50 text-center">
              <p className="text-sm text-gray-500 mb-1">Your Age</p>
              <p className="text-3xl font-bold text-gray-900">{chronoAge}</p>
            </div>
            <div className={`p-5 rounded-xl border text-center ${diff <= 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
              <p className={`text-sm mb-1 ${getColor(diff)}`}>Fitness Age</p>
              <p className={`text-3xl font-bold ${getColor(diff)}`}>{fitnessAge}</p>
            </div>
            <div className="p-5 rounded-xl border border-gray-200 bg-gray-50 text-center">
              <p className="text-sm text-gray-500 mb-1">BMI</p>
              <p className="text-3xl font-bold text-gray-900">{bmi.toFixed(1)}</p>
              <p className="text-xs text-gray-400 mt-1">{bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese"}</p>
            </div>
          </div>
          <div className={`p-4 rounded-xl border text-sm ${diff <= 0 ? "border-green-200 bg-green-50 text-green-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
            <strong>{diff > 0 ? `+${diff}` : diff} years</strong> vs. chronological age — {getMessage(diff)}
          </div>
          <div className="flex justify-end">
            <CopyButton text={`Fitness Age: ${fitnessAge} (chronological: ${chronoAge}, difference: ${diff > 0 ? "+" : ""}${diff})`} />
          </div>
        </div>
      )}
    </div>
  );
}
