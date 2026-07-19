"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function DailyGoalTrackerView({ variant }: ToolProps) {
  const [goal, setGoal] = useState("");
  const [achieved, setAchieved] = useState("");
  const [result, setResult] = useState<string | null>(null);

  function calculate() {
    const goalNum = parseFloat(goal);
    const achievedNum = parseFloat(achieved);

    if (isNaN(goalNum) || isNaN(achievedNum) || goalNum <= 0) {
      setResult("Please enter valid positive numbers for goal and achieved.");
      return;
    }

    const progress = (achievedNum / goalNum) * 100;
    setResult(`You've achieved ${progress.toFixed(2)}% of your daily goal.`);
  }

  return (
    <div className="space-y-6">
      {variant && (
        <p className="text-sm text-blue-600 font-medium">Mode: {variant}</p>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Daily Goal
        </label>
        <input
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && calculate()}
          placeholder="Enter your daily goal..."
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Achieved
        </label>
        <input
          type="text"
          value={achieved}
          onChange={(e) => setAchieved(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && calculate()}
          placeholder="Enter how much you've achieved..."
          className="w-full border rounded px-3 py-2"
        />
      </div>
      <button
        onClick={calculate}
        className="bg-blue-600 text-white rounded px-4 py-2"
      >
        Calculate
      </button>
      {result && (
        <div className="p-5 rounded-xl border border-gray-200 bg-gray-50">
          <p className="text-xl font-bold text-gray-900">{result}</p>
          <CopyButton text={result} />
        </div>
      )}
    </div>
  );
}
