"use client";
import { useState } from "react";

export interface ToolProps { variant?: string; }

type Mode = "encode" | "decode";

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard?.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${copied ? "bg-green-50 border-green-300 text-green-700" : "bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-800"}`}>
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

export default function UrlEncoderView() {
  const [input, setInput] = useState("https://example.com/search?q=hello world&lang=en");
  const [mode, setMode] = useState<Mode>("encode");

  const output = (() => {
    try {
      return mode === "encode" ? encodeURIComponent(input) : decodeURIComponent(input);
    } catch {
      return "⚠️ Invalid input — could not decode this string.";
    }
  })();

  return (
    <div className="space-y-5">
      {/* Mode toggle */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(["encode", "decode"] as Mode[]).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all capitalize ${mode === m ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
            {m}
          </button>
        ))}
      </div>

      {/* Input */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Input</label>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={5}
          placeholder={mode === "encode" ? "Paste a URL or string to encode..." : "Paste a percent-encoded string to decode..."}
          className="w-full border border-gray-200 rounded-xl p-3.5 text-sm font-mono text-gray-900 focus:outline-none focus:border-gray-400 resize-none leading-relaxed"
        />
      </div>

      {/* Arrow */}
      <div className="flex items-center justify-center text-gray-300 text-xl select-none">↓</div>

      {/* Output */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            {mode === "encode" ? "Encoded output" : "Decoded output"}
          </label>
          {output && !output.startsWith("⚠️") && <CopyBtn text={output} />}
        </div>
        <code className="block w-full bg-gray-950 text-gray-100 rounded-xl p-3.5 text-sm font-mono leading-relaxed break-all whitespace-pre-wrap min-h-[100px]">
          {output || <span className="text-gray-600">Output will appear here…</span>}
        </code>
      </div>

      {/* Quick-reference */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Common encodings</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[["Space", "%20"], ["&", "%26"], ["=", "%3D"], ["#", "%23"], ["?", "%3F"], ["+", "%2B"], ["/", "%2F"], ["@", "%40"]].map(([c, e]) => (
            <div key={c} className="flex items-center justify-between bg-white border border-gray-100 rounded-lg px-2.5 py-1.5 text-xs font-mono">
              <span className="text-gray-500">{c}</span>
              <span className="text-gray-400">→</span>
              <span className="text-gray-700">{e}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
