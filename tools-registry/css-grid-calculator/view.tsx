"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function CssGridCalculatorView({ variant }: ToolProps) {
  const [rows, setRows] = useState<number | string>("");
  const [columns, setColumns] = useState<number | string>("");
  const [gap, setGap] = useState<number | string>("");
  const [result, setResult] = useState<string | null>(null);

  function calculate() {
    const rowNum = Number(rows);
    const colNum = Number(columns);
    const gapSize = Number(gap);

    if (isNaN(rowNum) || isNaN(colNum) || isNaN(gapSize) || rowNum <= 0 || colNum <= 0 || gapSize < 0) {
      setResult("Please enter valid positive numbers for rows and columns, and a non-negative number for gaps.");
      return;
    }

    const totalWidth = colNum * 100 + (colNum - 1) * gapSize; // Assuming each column is 100px wide
    const totalHeight = rowNum * 100 + (rowNum - 1) * gapSize; // Assuming each row is 100px high
    setResult(`Total Width: ${totalWidth}px, Total Height: ${totalHeight}px (Gap: ${gapSize}px)`);
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
          Rows
        </label>
        <input
          type="number"
          value={rows}
          onChange={(e) => setRows(e.target.value)}
          placeholder="Enter number of rows..."
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Columns
        </label>
        <input
          type="number"
          value={columns}
          onChange={(e) => setColumns(e.target.value)}
          placeholder="Enter number of columns..."
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Gap (px)
        </label>
        <input
          type="number"
          value={gap}
          onChange={(e) => setGap(e.target.value)}
          placeholder="Enter gap size..."
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
