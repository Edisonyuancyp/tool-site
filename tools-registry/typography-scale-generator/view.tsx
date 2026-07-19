"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function TypographyScaleGeneratorView({ variant }: ToolProps) {
  const [baseSize, setBaseSize] = useState<string>("");
  const [ratio, setRatio] = useState<string>("");
  const [result, setResult] = useState<string | null>(null);

  function calculate() {
    const base = parseFloat(baseSize);
    const ratioValue = parseFloat(ratio);
    if (isNaN(base) || isNaN(ratioValue) || base <= 0 || ratioValue <= 1) {
      setResult("Please enter valid base size and ratio values.");
      return;
    }

    const scale = Array.from({ length: 8 }, (_, i) => (base * Math.pow(ratioValue, i)).toFixed(2));
    setResult(scale.join(", "));
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
          Base Size (px)
        </label>
        <input
          type="number"
          value={baseSize}
          onChange={(e) => setBaseSize(e.target.value)}
          placeholder="Enter base size..."
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Ratio
        </label>
        <input
          type="number"
          value={ratio}
          onChange={(e) => setRatio(e.target.value)}
          placeholder="Enter ratio..."
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
