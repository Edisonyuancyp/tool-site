"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function IconLibraryBrowserView({ variant }: ToolProps) {
  const [category, setCategory] = useState("");
  const [style, setStyle] = useState("");
  const [usage, setUsage] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const categories = ["All", "Animals", "Food", "Technology", "Nature"];
  const styles = ["Outline", "Filled", "Two-tone"];
  const usages = ["Web", "Mobile", "Print"];

  function filterIcons() {
    if (!category && !style && !usage) {
      setResult("Please select at least one filter.");
      return;
    }

    const filterResult = `Icons filtered by: ${category || "All"}, ${style || "Any"}, ${usage || "Any"}`;
    setResult(filterResult);
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
          Category
        </label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Style
        </label>
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          {styles.map((sty) => (
            <option key={sty} value={sty}>
              {sty}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Usage
        </label>
        <select
          value={usage}
          onChange={(e) => setUsage(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          {usages.map((use) => (
            <option key={use} value={use}>
              {use}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={filterIcons}
        className="bg-blue-600 text-white rounded px-4 py-2"
      >
        Filter Icons
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
