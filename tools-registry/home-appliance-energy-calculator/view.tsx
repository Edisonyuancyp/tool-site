"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function HomeApplianceEnergyCalculatorView({ variant }: ToolProps) {
  const [power, setPower] = useState<string>("");
  const [hours, setHours] = useState<string>("");
  const [costPerKWh, setCostPerKWh] = useState<string>("");
  const [result, setResult] = useState<string | null>(null);

  function calculate() {
    const powerNum = parseFloat(power);
    const hoursNum = parseFloat(hours);
    const costNum = parseFloat(costPerKWh);

    if (isNaN(powerNum) || isNaN(hoursNum) || isNaN(costNum) || powerNum <= 0 || hoursNum <= 0 || costNum <= 0) {
      setResult("Please enter valid positive numbers for power, hours, and cost per kWh.");
      return;
    }

    const energyConsumed = (powerNum * hoursNum) / 1000; // Convert watts to kilowatts
    const totalCost = energyConsumed * costNum;

    setResult(`Energy consumed: ${energyConsumed.toFixed(2)} kWh, Total cost: $${totalCost.toFixed(2)}`);
  }

  return (
    <div className="space-y-6">
      {variant && (
        <p className="text-sm text-blue-600 font-medium">
          Mode: {variant}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Power (W)
        </label>
        <input
          type="number"
          value={power}
          onChange={(e) => setPower(e.target.value)}
          placeholder="Enter power in watts..."
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Usage Hours
        </label>
        <input
          type="number"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          placeholder="Enter usage hours..."
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Cost per kWh ($)
        </label>
        <input
          type="number"
          value={costPerKWh}
          onChange={(e) => setCostPerKWh(e.target.value)}
          placeholder="Enter cost per kWh..."
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
        <div className="flex items-center justify-between p-5 rounded-xl border border-gray-200 bg-gray-50">
          <p className="text-xl font-bold text-gray-900">{result}</p>
          <CopyButton text={result} />
        </div>
      )}
    </div>
  );
}
