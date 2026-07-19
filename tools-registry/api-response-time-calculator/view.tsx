"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function ApiResponseTimeCalculatorView({ variant }: ToolProps) {
  const [requestTime, setRequestTime] = useState<string>("");
  const [responseTime, setResponseTime] = useState<string>("");
  const [result, setResult] = useState<string | null>(null);

  function calculate() {
    const reqTime = parseFloat(requestTime);
    const resTime = parseFloat(responseTime);

    if (isNaN(reqTime) || isNaN(resTime) || reqTime <= 0 || resTime <= 0) {
      setResult("Please enter valid positive numbers for both request and response times.");
      return;
    }

    const average = (reqTime + resTime) / 2;
    const best = Math.min(reqTime, resTime);
    const worst = Math.max(reqTime, resTime);

    setResult(`Average: ${average.toFixed(2)} ms, Best: ${best.toFixed(2)} ms, Worst: ${worst.toFixed(2)} ms`);
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
          Request Time (ms)
        </label>
        <input
          type="text"
          value={requestTime}
          onChange={(e) => setRequestTime(e.target.value)}
          placeholder="Enter request time..."
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Response Time (ms)
        </label>
        <input
          type="text"
          value={responseTime}
          onChange={(e) => setResponseTime(e.target.value)}
          placeholder="Enter response time..."
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
