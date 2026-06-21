"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

const conversions = [
  {
    id: "uppercase",
    label: "UPPERCASE",
    fn: (s: string) => s.toUpperCase(),
  },
  {
    id: "lowercase",
    label: "lowercase",
    fn: (s: string) => s.toLowerCase(),
  },
  {
    id: "titlecase",
    label: "Title Case",
    fn: (s: string) =>
      s
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase()),
  },
  {
    id: "sentencecase",
    label: "Sentence case",
    fn: (s: string) =>
      s
        .toLowerCase()
        .replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase()),
  },
  {
    id: "camelcase",
    label: "camelCase",
    fn: (s: string) =>
      s
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()),
  },
  {
    id: "pascalcase",
    label: "PascalCase",
    fn: (s: string) =>
      s
        .toLowerCase()
        .replace(/(^|[^a-zA-Z0-9])(.)/g, (_, _p, c) => c.toUpperCase()),
  },
  {
    id: "snakecase",
    label: "snake_case",
    fn: (s: string) =>
      s
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, ""),
  },
  {
    id: "kebabcase",
    label: "kebab-case",
    fn: (s: string) =>
      s
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
  },
];

export default function TextCaseConverter() {
  const [input, setInput] = useState("");
  const [active, setActive] = useState("uppercase");
  const [output, setOutput] = useState("");

  const convert = (id: string) => {
    setActive(id);
    const conv = conversions.find((c) => c.id === id);
    if (conv) setOutput(conv.fn(input));
  };

  const handleInput = (val: string) => {
    setInput(val);
    const conv = conversions.find((c) => c.id === active);
    if (conv) setOutput(conv.fn(val));
  };

  return (
    <div className="space-y-5">
      {/* Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Input Text
        </label>
        <textarea
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="Type or paste your text here..."
          rows={4}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 text-base resize-none"
        />
      </div>

      {/* Conversion buttons */}
      <div className="flex flex-wrap gap-2">
        {conversions.map((conv) => (
          <button
            key={conv.id}
            onClick={() => convert(conv.id)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-all ${
              active === conv.id
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900"
            }`}
          >
            {conv.label}
          </button>
        ))}
      </div>

      {/* Output */}
      {output && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium text-gray-700">Output</label>
            <CopyButton text={output} />
          </div>
          <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl min-h-[80px]">
            <p className="text-gray-900 text-base whitespace-pre-wrap break-words select-all">{output}</p>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">{output.length} characters · {output.split(/\s+/).filter(Boolean).length} words</p>
        </div>
      )}
    </div>
  );
}
