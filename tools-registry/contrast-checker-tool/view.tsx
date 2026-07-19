"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function ContrastCheckerToolView({ variant }: ToolProps) {
  const [color1, setColor1] = useState<string>("#000000");
  const [color2, setColor2] = useState<string>("#FFFFFF");
  const [result, setResult] = useState<string | null>(null);

  function calculateContrast(color1: string, color2: string): string {
    const luminance = (color: string) => {
      const rgb = parseInt(color.slice(1), 16);
      const r = ((rgb >> 16) & 0xff) / 255;
      const g = ((rgb >> 8) & 0xff) / 255;
      const b = (rgb & 0xff) / 255;

      const a = [r, g, b].map((v) => {
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });

      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    };

    const lum1 = luminance(color1);
    const lum2 = luminance(color2);

    const contrastRatio =
      lum1 > lum2
        ? (lum1 + 0.05) / (lum2 + 0.05)
        : (lum2 + 0.05) / (lum1 + 0.05);

    return `Contrast Ratio: ${contrastRatio.toFixed(2)}:1`;
  }

  const handleCalculate = () => {
    if (!/^#[0-9A-F]{6}$/i.test(color1) || !/^#[0-9A-F]{6}$/i.test(color2)) {
      setResult("Invalid color format. Please use hex format (e.g., #FFFFFF).");
      return;
    }

    const contrastResult = calculateContrast(color1, color2);
    setResult(contrastResult);
  };

  return (
    <div className="space-y-6">
      {variant && (
        <p className="text-sm text-blue-600 font-medium">
          Mode: {variant}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Color 1
        </label>
        <input
          type="text"
          value={color1}
          onChange={(e) => setColor1(e.target.value)}
          placeholder="#000000"
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Color 2
        </label>
        <input
          type="text"
          value={color2}
          onChange={(e) => setColor2(e.target.value)}
          placeholder="#FFFFFF"
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button
        onClick={handleCalculate}
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
