"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function PromptVersionComparerView({ variant }: ToolProps) {
  const [promptVersions, setPromptVersions] = useState<string[]>(["", ""]);
  const [results, setResults] = useState<string | null>(null);

  const handleChange = (index: number, value: string) => {
    const newVersions = [...promptVersions];
    newVersions[index] = value;
    setPromptVersions(newVersions);
  };

  function calculate() {
    const validInputs = promptVersions.filter(prompt => prompt.trim() !== "");
    
    if (validInputs.length < 2) {
      setResults("Please enter at least two valid prompts to compare.");
      return;
    }

    // Example comparison logic
    const bestPrompt = validInputs.reduce((best, current) => 
      current.length > best.length ? current : best
    );

    setResults(`The best performing prompt is: "${bestPrompt}"`);
  }

  return (
    <div className="space-y-6">
      {variant && (
        <p className="text-sm text-blue-600 font-medium">
          Mode: {variant}
        </p>
      )}

      {promptVersions.map((prompt, index) => (
        <div key={index}>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Prompt Version {index + 1}
          </label>
          <input
            type="text"
            value={prompt}
            onChange={(e) => handleChange(index, e.target.value)}
            placeholder={`Enter prompt version ${index + 1}...`}
            className="w-full border rounded px-3 py-2"
          />
        </div>
      ))}

      <button
        onClick={calculate}
        className="bg-blue-600 text-white rounded px-4 py-2"
      >
        Compare Prompts
      </button>

      {results && (
        <div className="flex items-center justify-between p-5 rounded-xl border border-gray-200 bg-gray-50">
          <p className="text-xl font-bold text-gray-900">{results}</p>
          <CopyButton text={results} />
        </div>
      )}
    </div>
  );
}
