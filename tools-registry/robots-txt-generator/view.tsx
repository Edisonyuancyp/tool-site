"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function RobotsTxtGeneratorView({ variant }: ToolProps) {
  const [userAgent, setUserAgent] = useState("");
  const [disallow, setDisallow] = useState("");
  const [allow, setAllow] = useState("");
  const [result, setResult] = useState<string | null>(null);

  function generateRobotsTxt() {
    let lines: string[] = [];
    
    if (userAgent) {
      lines.push(`User-agent: ${userAgent}`);
    }
    if (disallow) {
      lines.push(`Disallow: ${disallow}`);
    }
    if (allow) {
      lines.push(`Allow: ${allow}`);
    }

    setResult(lines.join('\n') || "No rules defined.");
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
          User-agent
        </label>
        <input
          type="text"
          value={userAgent}
          onChange={(e) => setUserAgent(e.target.value)}
          placeholder="Enter user-agent..."
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Disallow
        </label>
        <input
          type="text"
          value={disallow}
          onChange={(e) => setDisallow(e.target.value)}
          placeholder="Enter path to disallow..."
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Allow
        </label>
        <input
          type="text"
          value={allow}
          onChange={(e) => setAllow(e.target.value)}
          placeholder="Enter path to allow..."
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button
        onClick={generateRobotsTxt}
        className="bg-blue-600 text-white rounded px-4 py-2"
      >
        Generate
      </button>

      {result && (
        <div className="flex items-center justify-between p-5 rounded-xl border border-gray-200 bg-gray-50">
          <pre className="text-xl font-bold text-gray-900 whitespace-pre-wrap">{result}</pre>
          <CopyButton text={result} />
        </div>
      )}
    </div>
  );
}
