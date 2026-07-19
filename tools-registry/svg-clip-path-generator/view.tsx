"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function SvgClipPathGeneratorView({ variant }: ToolProps) {
  const [shape, setShape] = useState<string>("circle");
  const [size, setSize] = useState<string>("");
  const [positionX, setPositionX] = useState<string>("");
  const [positionY, setPositionY] = useState<string>("");
  const [result, setResult] = useState<string | null>(null);

  function calculate() {
    const sizeNum = parseFloat(size);
    const posXNum = parseFloat(positionX);
    const posYNum = parseFloat(positionY);

    if (isNaN(sizeNum) || sizeNum <= 0 || isNaN(posXNum) || isNaN(posYNum)) {
      setResult("Invalid input. Please enter positive numeric values.");
      return;
    }

    let clipPath = "";
    switch (shape) {
      case "circle":
        clipPath = `circle(${sizeNum}px at ${posXNum}px ${posYNum}px)`;
        break;
      case "ellipse":
        clipPath = `ellipse(${sizeNum}px ${sizeNum / 2}px at ${posXNum}px ${posYNum}px)`;
        break;
      case "polygon":
        clipPath = `polygon(${sizeNum}px ${sizeNum}px, 0 ${sizeNum}px, ${sizeNum}px 0)`;
        break;
      default:
        clipPath = `circle(${sizeNum}px at ${posXNum}px ${posYNum}px)`;
    }

    setResult(clipPath);
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
          Shape
        </label>
        <select
          value={shape}
          onChange={(e) => setShape(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          <option value="circle">Circle</option>
          <option value="ellipse">Ellipse</option>
          <option value="polygon">Polygon</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Size (px)
        </label>
        <input
          type="text"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          placeholder="Enter size..."
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div className="flex space-x-4">
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Position X (px)
          </label>
          <input
            type="text"
            value={positionX}
            onChange={(e) => setPositionX(e.target.value)}
            placeholder="Enter X position..."
            className="w-full border rounded px-3 py-2"
          />
        </div>
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Position Y (px)
          </label>
          <input
            type="text"
            value={positionY}
            onChange={(e) => setPositionY(e.target.value)}
            placeholder="Enter Y position..."
            className="w-full border rounded px-3 py-2"
          />
        </div>
      </div>

      <button
        onClick={calculate}
        className="bg-blue-600 text-white rounded px-4 py-2"
      >
        Generate Clip Path
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
