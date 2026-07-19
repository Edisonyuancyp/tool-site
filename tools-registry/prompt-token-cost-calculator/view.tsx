"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

const modelPrices: Record<string, number> = {
  ChatGPT: 0.0004, // price per token
  Claude: 0.0005,   // price per token
};

export default function PromptTokenCostCalculatorView({ variant }: ToolProps) {
  const [input, setInput] = useState("");
  const [model, setModel] = useState("ChatGPT");
  const [result, setResult] = useState<string | null>(null);
  
  function calculate() {
    const tokenCount = parseInt(input);
    if (isNaN(tokenCount) || tokenCount <= 0) {
      setResult("Please enter a valid number of tokens.");
      return;
    }
    
    const cost = (tokenCount * modelPrices[model]).toFixed(6);
    setResult(`Cost for ${tokenCount} tokens using ${model}: $${cost}`);
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
          Number of Tokens
        </label>
        <input
          type="number"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter number of tokens..."
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Select Model
        </label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full border rounded px-3 py-2"
        >
          {Object.keys(modelPrices).map((modelName) => (
            <option key={modelName} value={modelName}>{modelName}</option>
          ))}
        </select>
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
