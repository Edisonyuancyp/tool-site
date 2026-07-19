"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function AiImageCostCalculatorView({ variant }: ToolProps) {
  const [numImages, setNumImages] = useState("");
  const [costPerImage, setCostPerImage] = useState("");
  const [result, setResult] = useState<string | null>(null);

  function calculate() {
    const images = parseFloat(numImages);
    const cost = parseFloat(costPerImage);
    
    if (isNaN(images) || isNaN(cost) || images <= 0 || cost <= 0) {
      setResult("Please enter valid positive numbers for both fields.");
      return;
    }

    const totalCost = images * cost;
    setResult(`Total cost for generating ${images} images is $${totalCost.toFixed(2)}`);
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
          Number of Images
        </label>
        <input
          type="number"
          value={numImages}
          onChange={(e) => setNumImages(e.target.value)}
          placeholder="Enter number of images..."
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Cost per Image ($)
        </label>
        <input
          type="number"
          value={costPerImage}
          onChange={(e) => setCostPerImage(e.target.value)}
          placeholder="Enter cost per image..."
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
