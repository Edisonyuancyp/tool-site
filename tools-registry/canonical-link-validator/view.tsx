"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

export default function CanonicalLinkValidatorView({ variant }: ToolProps) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function validateCanonicalLink(link: string): boolean {
    const urlPattern = new RegExp('^(https?:\\/\\/)?' + // protocol
      '((([a-zd]([a-zd-]{0,61}[a-zd])?)\\.)+[a-z]{2,6}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-zd%_.~+]*)*' + // port and path
      '(\\?[;&a-zd%_.~+=-]*)?' + // query string
      '(\\#[-a-zd%_.~+=]*)?$', 'i'); // fragment locator
    return !!urlPattern.test(link);
  }

  function calculate() {
    setError(null);
    if (!input) {
      setError("Input cannot be empty.");
      return;
    }
    if (!validateCanonicalLink(input)) {
      setError("Invalid URL format.");
      return;
    }
    setResult(`The canonical link "${input}" is valid.`);
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
          Canonical Link
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter canonical link..."
          className="w-full border rounded px-3 py-2"
        />
      </div>

      <button
        onClick={calculate}
        className="bg-blue-600 text-white rounded px-4 py-2"
      >
        Validate
      </button>

      {error && (
        <div className="p-4 text-red-600 border border-red-300 bg-red-50 rounded">
          {error}
        </div>
      )}

      {result && (
        <div className="flex items-center justify-between p-5 rounded-xl border border-gray-200 bg-gray-50">
          <p className="text-xl font-bold text-gray-900">{result}</p>
          <CopyButton text={result} />
        </div>
      )}
    </div>
  );
}
