"use client";
import { useState, useMemo } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

type Mode = "percent-of" | "increase" | "decrease" | "difference" | "reverse";

const MODES: { id: Mode; label: string }[] = [
  { id: "percent-of", label: "X% of Y" },
  { id: "increase",   label: "% Increase" },
  { id: "decrease",   label: "% Decrease" },
  { id: "difference", label: "% Difference" },
  { id: "reverse",    label: "Reverse %" },
];

function round2(n: number) { return Math.round(n * 100) / 100; }

export default function PercentageCalculatorView({ variant }: ToolProps) {
  const defaultMode: Mode =
    variant === "increase" ? "increase"
    : variant === "decrease" ? "decrease"
    : variant === "difference" ? "difference"
    : "percent-of";

  const [mode, setMode] = useState<Mode>(defaultMode);
  const [a, setA] = useState("");
  const [b, setB] = useState("");

  const result = useMemo(() => {
    const na = parseFloat(a);
    const nb = parseFloat(b);
    if (isNaN(na) || isNaN(nb)) return null;
    if (nb === 0 && mode !== "percent-of") return null;

    switch (mode) {
      case "percent-of":
        return { value: round2((na / 100) * nb), label: `${na}% of ${nb}` };
      case "increase":
        return { value: round2(((nb - na) / na) * 100), label: `% increase from ${na} to ${nb}`, unit: "%" };
      case "decrease":
        return { value: round2(((na - nb) / na) * 100), label: `% decrease from ${na} to ${nb}`, unit: "%" };
      case "difference":
        return { value: round2((Math.abs(na - nb) / ((na + nb) / 2)) * 100), label: `% difference between ${na} and ${nb}`, unit: "%" };
      case "reverse":
        if (na === 0) return null;
        return { value: round2((nb / na) * 100), label: `${nb} is what % of ${na}`, unit: "%" };
    }
  }, [mode, a, b]);

  const inputLabels: Record<Mode, [string, string]> = {
    "percent-of":  ["Percentage (%)", "Of what number"],
    "increase":    ["Original value", "New value"],
    "decrease":    ["Original value", "New value"],
    "difference":  ["Value A", "Value B"],
    "reverse":     ["Total / whole", "Part"],
  };

  const [labelA, labelB] = inputLabels[mode];

  return (
    <div className="space-y-6">
      {/* Mode selector */}
      <div className="flex flex-wrap gap-2">
        {MODES.map(({ id, label }) => (
          <button key={id} onClick={() => setMode(id)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium border transition-all ${mode === id ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-500 hover:border-gray-400"}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{labelA}</label>
          <input type="number" value={a} onChange={(e) => setA(e.target.value)}
            placeholder="e.g. 100"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 text-base" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{labelB}</label>
          <input type="number" value={b} onChange={(e) => setB(e.target.value)}
            placeholder="e.g. 200"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 text-base" />
        </div>
      </div>

      {result && (
        <div className="flex items-center justify-between p-5 rounded-xl border border-gray-200 bg-gray-50">
          <div>
            <p className="text-3xl font-bold text-gray-900">
              {result.value}{result.unit ?? ""}
            </p>
            <p className="text-sm text-gray-400 mt-0.5">{result.label}</p>
          </div>
          <CopyButton text={`${result.value}${result.unit ?? ""}`} />
        </div>
      )}

      {/* Cross-links */}
      <div className="pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400 mb-2">Specific percentage calculators:</p>
        <div className="flex flex-wrap gap-2 text-xs">
          {variant !== undefined && <a href="/tools/percentage-calculator" className="text-blue-500 hover:underline">All-in-one</a>}
          {variant !== "increase" && <a href="/tools/percentage-increase-calculator" className="text-blue-500 hover:underline">% Increase</a>}
          {variant !== "decrease" && <a href="/tools/percentage-decrease-calculator" className="text-blue-500 hover:underline">% Decrease</a>}
          {variant !== "difference" && <a href="/tools/percentage-difference-calculator" className="text-blue-500 hover:underline">% Difference</a>}
        </div>
      </div>
    </div>
  );
}
