"use client";
import { useState } from "react";

type Mode = "encode" | "decode";
type InputType = "text" | "url";

function safeEncode(input: string): { output: string; error: string | null } {
  try {
    const bytes = new TextEncoder().encode(input);
    let binary = "";
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    return { output: btoa(binary), error: null };
  } catch {
    return { output: "", error: "Encoding failed" };
  }
}

function safeDecode(input: string): { output: string; error: string | null } {
  try {
    const cleaned = input.trim().replace(/\s/g, "");
    const binary = atob(cleaned);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return { output: new TextDecoder("utf-8").decode(bytes), error: null };
  } catch {
    return { output: "", error: "Invalid Base64 string — check your input" };
  }
}

function encodeUrl(input: string): { output: string; error: string | null } {
  try {
    return { output: encodeURIComponent(input), error: null };
  } catch {
    return { output: "", error: "URL encoding failed" };
  }
}

function decodeUrl(input: string): { output: string; error: string | null } {
  try {
    return { output: decodeURIComponent(input.trim()), error: null };
  } catch {
    return { output: "", error: "Invalid URL-encoded string" };
  }
}

function isValidBase64(str: string): boolean {
  const cleaned = str.trim().replace(/\s/g, "");
  if (cleaned.length % 4 !== 0) return false;
  return /^[A-Za-z0-9+/]*={0,2}$/.test(cleaned);
}

export default function Base64Tool() {
  const [mode, setMode] = useState<Mode>("encode");
  const [inputType, setInputType] = useState<InputType>("text");
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const isB64Mode = inputType === "text";

  const result = (() => {
    if (!input.trim()) return null;
    if (isB64Mode) {
      return mode === "encode" ? safeEncode(input) : safeDecode(input);
    } else {
      return mode === "encode" ? encodeUrl(input) : decodeUrl(input);
    }
  })();

  const output = result?.output ?? "";
  const error = result?.error ?? null;

  const b64Valid = mode === "decode" && isB64Mode && input.trim()
    ? isValidBase64(input) : null;

  function handleCopy() {
    navigator.clipboard?.writeText(output).catch(() => {
      const el = document.createElement("textarea");
      el.value = output;
      el.style.position = "fixed"; el.style.left = "-9999px";
      document.body.appendChild(el); el.focus(); el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function swap() {
    setInput(output);
    setMode((m) => m === "encode" ? "decode" : "encode");
  }

  const EXAMPLES = isB64Mode
    ? [
        { label: "Hello World", value: mode === "encode" ? "Hello, World!" : "SGVsbG8sIFdvcmxkIQ==" },
        { label: "JSON", value: mode === "encode" ? '{"user":"alice","role":"admin"}' : "eyJ1c2VyIjoiYWxpY2UiLCJyb2xlIjoiYWRtaW4ifQ==" },
        { label: "URL", value: mode === "encode" ? "https://example.com/path?q=hello world" : "aHR0cHM6Ly9leGFtcGxlLmNvbS9wYXRoP3E9aGVsbG8gd29ybGQ=" },
      ]
    : [
        { label: "URL with spaces", value: mode === "encode" ? "hello world & more" : "hello%20world%20%26%20more" },
        { label: "Search query", value: mode === "encode" ? "site:example.com \"exact phrase\"" : "site%3Aexample.com%20%22exact%20phrase%22" },
      ];

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex">
          {(["text", "url"] as InputType[]).map((t) => (
            <button key={t} type="button" onClick={() => { setInputType(t); setInput(""); }}
              className={"px-4 py-2 text-sm font-bold border transition-all first:rounded-l-xl last:rounded-r-xl " +
                (inputType === t ? "bg-gray-900 text-white border-gray-900 z-10" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400")}>
              {t === "text" ? "Base64" : "URL Encode"}
            </button>
          ))}
        </div>
        <div className="flex">
          {(["encode", "decode"] as Mode[]).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)}
              className={"px-4 py-2 text-sm font-semibold border transition-all first:rounded-l-xl last:rounded-r-xl capitalize " +
                (mode === m ? "bg-blue-600 text-white border-blue-600 z-10" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400")}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Decode validity */}
      {b64Valid !== null && input.trim() && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border ${
          b64Valid ? "bg-green-50 border-green-200 text-green-700" : "bg-amber-50 border-amber-200 text-amber-700"
        }`}>
          <span>{b64Valid ? "✓" : "⚠"}</span>
          <span>{b64Valid ? "Looks like valid Base64" : "String may not be valid Base64"}</span>
        </div>
      )}

      {/* Example loader */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-gray-400">Examples:</span>
        {EXAMPLES.map((ex) => (
          <button key={ex.label} type="button" onClick={() => setInput(ex.value)}
            className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900 transition-all">
            {ex.label}
          </button>
        ))}
      </div>

      {/* Input / Output */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {mode === "encode" ? "Plain Text" : (isB64Mode ? "Base64" : "URL-encoded")}
            </label>
            <span className="text-xs text-gray-400">{input.length} chars</span>
          </div>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={10}
            placeholder={mode === "encode" ? "Paste text to encode…" : "Paste encoded string to decode…"}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 font-mono text-sm text-gray-900 focus:outline-none focus:border-gray-400 resize-y" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {mode === "encode" ? (isB64Mode ? "Base64" : "URL-encoded") : "Decoded Text"}
            </label>
            <div className="flex gap-2">
              {output && (
                <>
                  <button type="button" onClick={swap}
                    className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900 transition-all">
                    ⇄ Swap
                  </button>
                  <button type="button" onClick={handleCopy}
                    className="text-xs px-2.5 py-1 rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900 transition-all">
                    {copied ? "✓" : "Copy"}
                  </button>
                </>
              )}
            </div>
          </div>
          {error ? (
            <div className="w-full bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 font-mono text-xs text-red-700 min-h-40">
              {error}
            </div>
          ) : (
            <textarea readOnly value={output} rows={10}
              placeholder="Output appears here…"
              className="w-full border border-gray-100 bg-gray-50 rounded-xl px-3 py-2.5 font-mono text-sm text-gray-900 resize-y" />
          )}
          {output && <div className="text-xs text-gray-400 mt-1 text-right">{output.length} chars</div>}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
        <p className="font-semibold mb-1">Common uses of Base64</p>
        <p>Embedding images in HTML/CSS (data URIs), encoding API credentials, transmitting binary data in JSON, encoding email attachments (MIME), and storing binary data in databases or environment variables.</p>
      </div>
    </div>
  );
}
