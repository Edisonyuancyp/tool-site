"use client";
import { useState } from "react";

function round(n: number, dp = 4): number {
  return Math.round(n * 10 ** dp) / 10 ** dp;
}

type Mode = "change" | "ofWhat" | "ofNumber" | "increase" | "reverse";

const MODES: { id: Mode; label: string; description: string }[] = [
  { id: "change", label: "% Change", description: "What is the % change from A to B?" },
  { id: "ofNumber", label: "X% of Y", description: "What is X% of Y?" },
  { id: "ofWhat", label: "X is what % of Y?", description: "X is what percent of Y?" },
  { id: "increase", label: "Increase / Decrease", description: "Increase or decrease a number by X%" },
  { id: "reverse", label: "Reverse %", description: "Y is X% of what number?" },
];

export default function PercentageCalculator() {
  const [mode, setMode] = useState<Mode>("change");

  // change
  const [fromVal, setFromVal] = useState("100");
  const [toVal, setToVal] = useState("150");

  // ofNumber: X% of Y
  const [pct, setPct] = useState("20");
  const [base, setBase] = useState("500");

  // ofWhat: X is what % of Y
  const [part, setPart] = useState("75");
  const [whole, setWhole] = useState("300");

  // increase/decrease
  const [startVal, setStartVal] = useState("200");
  const [changePct, setChangePct] = useState("15");
  const [direction, setDirection] = useState<"increase" | "decrease">("increase");

  // reverse: Y is X% of what
  const [revVal, setRevVal] = useState("60");
  const [revPct, setRevPct] = useState("75");

  // ---- Computations ----
  function computeChange() {
    const a = parseFloat(fromVal);
    const b = parseFloat(toVal);
    if (isNaN(a) || isNaN(b) || a === 0) return null;
    const pctChange = ((b - a) / Math.abs(a)) * 100;
    return round(pctChange, 4);
  }

  function computeOfNumber() {
    const p = parseFloat(pct);
    const y = parseFloat(base);
    if (isNaN(p) || isNaN(y)) return null;
    return round((p / 100) * y, 4);
  }

  function computeOfWhat() {
    const x = parseFloat(part);
    const y = parseFloat(whole);
    if (isNaN(x) || isNaN(y) || y === 0) return null;
    return round((x / y) * 100, 4);
  }

  function computeIncrease() {
    const s = parseFloat(startVal);
    const c = parseFloat(changePct);
    if (isNaN(s) || isNaN(c)) return null;
    const factor = direction === "increase" ? 1 + c / 100 : 1 - c / 100;
    return round(s * factor, 4);
  }

  function computeReverse() {
    const y = parseFloat(revVal);
    const p = parseFloat(revPct);
    if (isNaN(y) || isNaN(p) || p === 0) return null;
    return round((y / p) * 100, 4);
  }

  const changeResult = computeChange();
  const ofNumberResult = computeOfNumber();
  const ofWhatResult = computeOfWhat();
  const increaseResult = computeIncrease();
  const reverseResult = computeReverse();

  return (
    <div className="space-y-6">
      {/* Mode selector */}
      <div className="flex flex-wrap gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMode(m.id)}
            className={
              "px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all " +
              (mode === m.id
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900")
            }
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Description */}
      <p className="text-sm text-gray-500">{MODES.find((m) => m.id === mode)?.description}</p>

      {/* ---- Panels ---- */}

      {mode === "change" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From (original value)</label>
              <input type="number" value={fromVal} onChange={(e) => setFromVal(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg font-semibold text-gray-900 focus:outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To (new value)</label>
              <input type="number" value={toVal} onChange={(e) => setToVal(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg font-semibold text-gray-900 focus:outline-none focus:border-gray-400" />
            </div>
          </div>
          {parseFloat(fromVal) === 0 && (
            <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
              ⚠️ "From" value cannot be 0 — percentage change is undefined when the starting value is zero.
            </p>
          )}
          {changeResult !== null && (
            <ResultBox
              label="Percentage Change"
              value={`${changeResult > 0 ? "▲ +" : changeResult < 0 ? "▼ " : ""}${changeResult}%`}
              color={changeResult > 0 ? "green" : changeResult < 0 ? "red" : "gray"}
              detail={`From ${fromVal} to ${toVal}: ${changeResult === 0 ? "no change" : changeResult > 0 ? `increased by ${Math.abs(changeResult)}%` : `decreased by ${Math.abs(changeResult)}%`}`}
            />
          )}
        </div>
      )}

      {mode === "ofNumber" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Percentage (%)</label>
              <input type="number" value={pct} onChange={(e) => setPct(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg font-semibold text-gray-900 focus:outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Of number</label>
              <input type="number" value={base} onChange={(e) => setBase(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg font-semibold text-gray-900 focus:outline-none focus:border-gray-400" />
            </div>
          </div>
          {ofNumberResult !== null && (
            <ResultBox label={`${pct}% of ${base}`} value={String(ofNumberResult)} detail={`${pct} ÷ 100 × ${base} = ${ofNumberResult}`} />
          )}
        </div>
      )}

      {mode === "ofWhat" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Part (X)</label>
              <input type="number" value={part} onChange={(e) => setPart(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg font-semibold text-gray-900 focus:outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Whole (Y)</label>
              <input type="number" value={whole} onChange={(e) => setWhole(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg font-semibold text-gray-900 focus:outline-none focus:border-gray-400" />
            </div>
          </div>
          {ofWhatResult !== null && (
            <ResultBox label={`${part} is what % of ${whole}`} value={`${ofWhatResult}%`} detail={`${part} ÷ ${whole} × 100 = ${ofWhatResult}%`} />
          )}
        </div>
      )}

      {mode === "increase" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Starting value</label>
              <input type="number" value={startVal} onChange={(e) => setStartVal(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg font-semibold text-gray-900 focus:outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Change (%)</label>
              <input type="number" value={changePct} onChange={(e) => setChangePct(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg font-semibold text-gray-900 focus:outline-none focus:border-gray-400" />
            </div>
          </div>
          <div className="flex gap-2">
            {(["increase", "decrease"] as const).map((d) => (
              <button key={d} type="button" onClick={() => setDirection(d)}
                className={
                  "flex-1 py-2 rounded-xl text-sm font-medium border transition-all " +
                  (direction === d
                    ? d === "increase" ? "bg-green-600 text-white border-green-600" : "bg-red-600 text-white border-red-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-400")
                }
              >
                {d === "increase" ? "▲ Increase" : "▼ Decrease"}
              </button>
            ))}
          </div>
          {increaseResult !== null && (
            <ResultBox
              label={`${startVal} ${direction}d by ${changePct}%`}
              value={String(increaseResult)}
              color={direction === "increase" ? "green" : "red"}
              detail={`${startVal} × ${direction === "increase" ? `(1 + ${changePct}/100)` : `(1 - ${changePct}/100)`} = ${increaseResult}`}
            />
          )}
        </div>
      )}

      {mode === "reverse" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value (Y)</label>
              <input type="number" value={revVal} onChange={(e) => setRevVal(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg font-semibold text-gray-900 focus:outline-none focus:border-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Is X% of what?</label>
              <input type="number" value={revPct} onChange={(e) => setRevPct(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg font-semibold text-gray-900 focus:outline-none focus:border-gray-400" />
            </div>
          </div>
          {reverseResult !== null && (
            <ResultBox label={`${revVal} is ${revPct}% of`} value={String(reverseResult)} detail={`${revVal} ÷ (${revPct} / 100) = ${reverseResult}`} />
          )}
        </div>
      )}
    </div>
  );
}

function ResultBox({
  label,
  value,
  detail,
  color = "gray",
}: {
  label: string;
  value: string;
  detail: string;
  color?: "green" | "red" | "gray";
}) {
  const bg = color === "green" ? "bg-green-50 border-green-100" : color === "red" ? "bg-red-50 border-red-100" : "bg-gray-900";
  const textColor = color === "green" ? "text-green-700" : color === "red" ? "text-red-700" : "text-white";
  const labelColor = color === "gray" ? "text-gray-400" : color === "green" ? "text-green-500" : "text-red-400";
  const detailColor = color === "gray" ? "text-gray-400" : color === "green" ? "text-green-500" : "text-red-400";

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const el = document.createElement("textarea");
    el.value = value;
    el.style.position = "fixed"; el.style.left = "-9999px";
    document.body.appendChild(el); el.focus(); el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={`rounded-2xl border p-5 ${bg}`}>
      <div className={`text-xs font-medium mb-1 ${labelColor}`}>{label}</div>
      <div className="flex items-center justify-between gap-4">
        <div className={`text-4xl font-black ${textColor}`}>{value}</div>
        <button type="button" onClick={handleCopy}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-all shrink-0 ${
            color === "gray"
              ? "border-white/20 text-white hover:bg-white/10"
              : "border-gray-200 text-gray-600 hover:border-gray-400"
          }`}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <div className={`text-xs mt-2 font-mono ${detailColor}`}>{detail}</div>
    </div>
  );
}
