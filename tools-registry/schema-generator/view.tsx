"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function SchemaGeneratorView({ variant }: ToolProps) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);

  function generateSchemaMarkup() {
    if (!input.trim()) {
      setResult("Error: Input cannot be empty.");
      return;
    }

    const schema = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": input,
      "url": `https://example.com/${input.replace(/\s+/g, '-').toLowerCase()}`
    };

    setResult(JSON.stringify(schema, null, 2));
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
          Page Name
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter page name..."
          className="w-full border rounded px-3 py-2 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400"
        />
      </div>

      <button
        onClick={generateSchemaMarkup}
        className="bg-blue-600 text-white rounded px-4 py-2 w-full"
      >
        Generate Schema
      </button>

      {result && (
        <div className="flex items-center justify-between p-5 rounded-xl border border-gray-200 bg-gray-50">
          <pre className="text-sm text-gray-900">{result}</pre>
          <CopyButton text={result} />
        </div>
      )}
    </div>
  );
}
