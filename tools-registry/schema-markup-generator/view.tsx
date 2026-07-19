"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function SchemaMarkupGeneratorView({ variant }: ToolProps) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function generateSchemaMarkup() {
    if (!input.trim()) {
      setError("Input cannot be empty.");
      setResult(null);
      return;
    }

    const schema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: input,
      url: `https://www.example.com/${input.replace(/\s+/g, '-').toLowerCase()}`
    };

    setResult(JSON.stringify(schema, null, 2));
    setError(null);
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
          Website Name
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter website name..."
          className="w-full border border-gray-200 rounded px-3 py-2 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400"
        />
      </div>

      <button
        onClick={generateSchemaMarkup}
        className="w-full sm:w-auto bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition-colors"
      >
        Generate Schema Markup
      </button>

      {error && (
        <p className="text-red-600">{error}</p>
      )}

      {result && (
        <div className="flex items-center justify-between p-5 rounded-xl border border-gray-200 bg-gray-50">
          <pre className="text-gray-900 whitespace-pre-wrap">{result}</pre>
          <CopyButton text={result} />
        </div>
      )}
    </div>
  );
}
