"use client";
import { useState } from "react";

const ALPHA = "0123456789abcdefghijklmnopqrstuvwxyz";

function parseB(raw: string, base: number): bigint | null {
  const v = raw.trim().toLowerCase();
  if (!v) return 0n;
  const alpha = ALPHA.slice(0, base);
  let n = 0n;
  const b = BigInt(base);
  for (const ch of v) {
    const idx = alpha.indexOf(ch);
    if (idx === -1) return null;
    n = n * b + BigInt(idx);
  }
  return n;
}

function toB(n: bigint, base: number): string {
  if (n === 0n) return "0";
  const alpha = ALPHA.slice(0, base);
  const b = BigInt(base);
  let s = "";
  let r = n;
  while (r > 0n) { s = alpha[Number(r % b)] + s; r /= b; }
  return s;
}

// Group binary by 4, hex by 2, decimal by 3 (thousands)
function formatVal(val: string, base: number): string {
  if (!val || val === "0") return val;
  if (base === 2) {
    const pad = val.padStart(Math.ceil(val.length / 4) * 4, "0");
    return pad.match(/.{1,4}/g)?.join(" ") ?? val;
  }
  if (base === 16) {
    const pad = val.padStart(Math.ceil(val.length / 2) * 2, "0");
    return pad.match(/.{1,2}/g)?.join(" ") ?? val;
  }
  if (base === 10) {
    return val.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  return val;
}

const BASES = [
  { base: 2,  name: "Binary",      digits: "0–1",        color: "blue" },
  { base: 8,  name: "Octal",       digits: "0–7",        color: "purple" },
  { base: 10, name: "Decimal",     digits: "0–9",        color: "green" },
  { base: 16, name: "Hexadecimal", digits: "0–9, a–f",   color: "amber" },
  { base: 32, name: "Base 32",     digits: "0–9, a–v",   color: "gray" },
  { base: 36, name: "Base 36",     digits: "0–9, a–z",   color: "gray" },
];

const COLORS: Record<string, { card: string; label: string; value: string; border: string }> = {
  blue:   { card: "bg-blue-50",   label: "text-blue-500",  value: "text-blue-900",  border: "border-blue-200" },
  purple: { card: "bg-purple-50", label: "text-purple-500",value: "text-purple-900",border: "border-purple-200" },
  green:  { card: "bg-green-50",  label: "text-green-600", value: "text-green-900", border: "border-green-200" },
  amber:  { card: "bg-amber-50",  label: "text-amber-600", value: "text-amber-900", border: "border-amber-200" },
  gray:   { card: "bg-gray-50",   label: "text-gray-500",  value: "text-gray-800",  border: "border-gray-200" },
};

// All bases 2-36 with labels for common ones
const ALL_INPUT_BASES = Array.from({ length: 35 }, (_, i) => {
  const b = i + 2;
  const names: Record<number, string> = {
    2: "Binary", 3: "Ternary", 4: "Base 4", 5: "Base 5", 6: "Base 6",
    7: "Base 7", 8: "Octal", 9: "Base 9", 10: "Decimal",
    11: "Base 11", 12: "Duodecimal", 13: "Base 13", 14: "Base 14",
    15: "Base 15", 16: "Hexadecimal", 17: "Base 17", 18: "Base 18",
    19: "Base 19", 20: "Vigesimal", 21: "Base 21", 22: "Base 22",
    23: "Base 23", 24: "Base 24", 25: "Base 25", 26: "Base 26",
    27: "Base 27", 28: "Base 28", 29: "Base 29", 30: "Base 30",
    31: "Base 31", 32: "Base 32", 33: "Base 33", 34: "Base 34",
    35: "Base 35", 36: "Base 36",
  };
  return { base: b, label: `Base ${b}${names[b] !== `Base ${b}` ? ` — ${names[b]}` : ""}` };
});

export default function BaseConverter() {
  const [input, setInput] = useState("255");
  const [fromBase, setFromBase] = useState(10);
  const [copied, setCopied] = useState<number | null>(null);

  const parsed = parseB(input, fromBase);
  const hasError = input.trim() !== "" && parsed === null;

  function handleCopy(val: string, base: number) {
    navigator.clipboard?.writeText(val).catch(() => {
      const el = document.createElement("textarea");
      el.value = val; el.style.position = "fixed"; el.style.left = "-9999px";
      document.body.appendChild(el); el.focus(); el.select();
      document.execCommand("copy"); document.body.removeChild(el);
    });
    setCopied(base);
    setTimeout(() => setCopied(null), 1500);
  }

  // Valid digits hint for current fromBase
  const digitHint = fromBase <= 10
    ? `0–${ALPHA[fromBase - 1]}`
    : `0–9, a–${ALPHA[fromBase - 1]}`;

  return (
    <div className="space-y-6">

      {/* ── Step 1: choose input base via dropdown ── */}
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
          ① Select input base
        </label>
        <div className="relative">
          <select
            value={fromBase}
            onChange={(e) => { setFromBase(Number(e.target.value)); setInput(""); }}
            className="w-full appearance-none bg-white border-2 border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-semibold text-gray-800 focus:outline-none focus:border-gray-900 cursor-pointer transition-all"
          >
            {ALL_INPUT_BASES.map(({ base, label }) => (
              <option key={base} value={base}>{label}</option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <p className="mt-1.5 text-xs text-gray-400">Valid digits: <span className="font-mono font-semibold">{digitHint}</span></p>
      </div>

      {/* ── Step 2: big input box ── */}
      <div>
        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">② Enter a number</div>
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value.toLowerCase().trim())}
            placeholder={fromBase === 10 ? "e.g. 255" : fromBase === 16 ? "e.g. ff" : fromBase === 2 ? "e.g. 11111111" : "e.g. 377"}
            spellCheck={false}
            autoComplete="off"
            className={`w-full text-3xl font-black font-mono rounded-2xl border-2 px-5 py-5 outline-none transition-all shadow-sm ${
              hasError
                ? "border-red-400 bg-red-50 text-red-700 placeholder-red-300"
                : "border-gray-300 bg-white text-gray-900 placeholder-gray-300 focus:border-gray-900 focus:shadow-md"
            }`}
          />
          {input && (
            <button type="button" onClick={() => setInput("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 text-2xl font-light transition-colors">
              ×
            </button>
          )}
        </div>
        {hasError && (
          <p className="mt-2 text-sm text-red-600 font-medium">
            ⚠ Invalid digit — {fromBase === 2 ? "only 0 and 1 allowed" : fromBase === 8 ? "only 0–7 allowed" : fromBase === 16 ? "only 0–9 and a–f allowed" : "check your input"}
          </p>
        )}
        {!hasError && parsed !== null && input.trim() && (
          <p className="mt-2 text-xs text-gray-400">
            = Decimal <span className="font-bold text-gray-700">{parsed.toLocaleString()}</span>
          </p>
        )}
      </div>

      {/* ── Step 3: results ── */}
      {parsed !== null && input.trim() && !hasError && (
        <div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">③ Results</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BASES.map((b) => {
              const raw = toB(parsed, b.base);
              const formatted = formatVal(raw, b.base);
              const isSource = b.base === fromBase;
              const c = COLORS[b.color];

              return (
                <div key={b.base}
                  className={`rounded-2xl border-2 px-4 py-3.5 flex items-start justify-between gap-3 transition-all ${
                    isSource
                      ? "border-gray-900 bg-gray-900 shadow-md"
                      : `${c.card} ${c.border}`
                  }`}>
                  <div className="min-w-0 flex-1">
                    <div className={`text-xs font-bold uppercase tracking-wide mb-1 ${isSource ? "text-gray-400" : c.label}`}>
                      {b.name} (Base {b.base})
                      {isSource && <span className="ml-2 normal-case text-gray-500 font-normal">← input</span>}
                    </div>
                    <div className={`font-mono font-black text-xl sm:text-2xl break-all ${isSource ? "text-white" : c.value}`}>
                      {formatted}
                    </div>
                    {formatted !== raw && (
                      <div className={`font-mono text-xs mt-1 break-all ${isSource ? "text-gray-500" : "text-gray-400"}`}>
                        {raw}
                      </div>
                    )}
                  </div>
                  <button type="button"
                    onClick={() => handleCopy(raw, b.base)}
                    className={`shrink-0 text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition-all mt-1 ${
                      isSource
                        ? "border-gray-600 text-gray-400 hover:border-white hover:text-white"
                        : "border-gray-200 text-gray-400 hover:border-gray-500 hover:text-gray-700 bg-white/60"
                    }`}>
                    {copied === b.base ? "✓" : "Copy"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {(!input.trim() || parsed === null) && !hasError && (
        <div className="text-center py-10 text-gray-300 text-sm border-2 border-dashed border-gray-100 rounded-2xl">
          Enter a number above to see all base conversions
        </div>
      )}

      {/* Quick examples */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-gray-400">Examples:</span>
        {[
          { label: "255 (dec)", val: "255", base: 10 },
          { label: "FF (hex)", val: "ff", base: 16 },
          { label: "11111111 (bin)", val: "11111111", base: 2 },
          { label: "1024 (dec)", val: "1024", base: 10 },
          { label: "DEADBEEF (hex)", val: "deadbeef", base: 16 },
        ].map((ex) => (
          <button key={ex.label} type="button"
            onClick={() => { setFromBase(ex.base); setInput(ex.val); }}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 font-mono text-gray-500 hover:border-gray-400 hover:text-gray-900 transition-all">
            {ex.label}
          </button>
        ))}
      </div>
    </div>
  );
}
