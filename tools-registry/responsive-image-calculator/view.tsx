"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function ResponsiveImageCalculatorView({ variant }: ToolProps) {
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [density, setDensity] = useState("");
  const [result, setResult] = useState<string | null>(null);

  function calculate() {
    const widthNum = parseFloat(width);
    const heightNum = parseFloat(height);
    const densityNum = parseFloat(density);

    if (isNaN(widthNum) || isNaN(heightNum) || isNaN(densityNum) || widthNum <= 0 || heightNum <= 0 || densityNum <= 0) {
      setResult("Please enter valid positive numbers for width, height, and density.");
      return;
    }

    const optimalWidth = widthNum * densityNum;
    const optimalHeight = heightNum * densityNum;
    
    setResult(`Optimal image size: ${optimalWidth.toFixed(0)} x ${optimalHeight.toFixed(0)} pixels`);
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
          Width (px)
        </label>
        <input
          type="number"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          placeholder="Enter width..."
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Height (px)
        </label>
        <input
          type="number"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          placeholder="Enter height..."
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Density (DPI)
        </label>
        <input
          type="number"
          value={density}
          onChange={(e) => setDensity(e.target.value)}
          placeholder="Enter density..."
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
