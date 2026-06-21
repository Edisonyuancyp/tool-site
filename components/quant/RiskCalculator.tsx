"use client";
import { useState, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Inputs {
  accountBalance: string;
  riskPercent: string;
  entryPrice: string;
  stopLossPrice: string;
}

interface Result {
  positionSize: number;   // units / coins
  riskAmount: number;     // currency
  riskPerUnit: number;    // entry - stop
  rewardAmount?: number;  // optional if TP provided
  rrRatio?: number;
}

// ── Formula ───────────────────────────────────────────────────────────────────
// PositionSize = (AccountBalance × RiskPercent/100) / (EntryPrice − StopLossPrice)

function calculate(inputs: Inputs): Result | string {
  const balance   = parseFloat(inputs.accountBalance);
  const riskPct   = parseFloat(inputs.riskPercent);
  const entry     = parseFloat(inputs.entryPrice);
  const stop      = parseFloat(inputs.stopLossPrice);

  if ([balance, riskPct, entry, stop].some((v) => isNaN(v) || v <= 0))
    return "All fields must be positive numbers.";
  if (riskPct > 100) return "Risk % cannot exceed 100.";
  if (stop >= entry) return "Stop-loss price must be below entry price.";

  const riskAmount  = balance * (riskPct / 100);
  const riskPerUnit = entry - stop;
  const positionSize = riskAmount / riskPerUnit;

  return { positionSize, riskAmount, riskPerUnit };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 4) {
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return n.toFixed(decimals);
}

function RiskBar({ pct }: { pct: number }) {
  const clamped = Math.min(pct, 100);
  const color =
    clamped <= 1  ? "#10b981" :
    clamped <= 2  ? "#f59e0b" :
    clamped <= 5  ? "#f97316" : "#ef4444";
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <div
        className="h-2 rounded-full transition-all duration-500"
        style={{ width: `${clamped}%`, backgroundColor: color }}
      />
    </div>
  );
}

// ── Input row ─────────────────────────────────────────────────────────────────

function InputRow({
  label, value, onChange, prefix, suffix, placeholder, hint,
}: {
  label: string; value: string; onChange: (v: string) => void;
  prefix?: string; suffix?: string; placeholder?: string; hint?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{label}</label>
        {hint && <span className="text-[10px] text-gray-400">{hint}</span>}
      </div>
      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-gray-400 bg-white transition-colors">
        {prefix && (
          <span className="px-3 py-3 text-sm text-gray-400 bg-gray-50 border-r border-gray-200 select-none">{prefix}</span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "0"}
          min={0}
          step="any"
          className="flex-1 px-3 py-3 text-sm text-gray-900 focus:outline-none font-mono bg-transparent"
        />
        {suffix && (
          <span className="px-3 py-3 text-sm text-gray-400 bg-gray-50 border-l border-gray-200 select-none">{suffix}</span>
        )}
      </div>
    </div>
  );
}

// ── Result card ───────────────────────────────────────────────────────────────

function ResultCard({
  label, value, sub, accent = false,
}: {
  label: string; value: string; sub?: string; accent?: boolean;
}) {
  return (
    <div className={`rounded-xl p-4 border ${accent ? "bg-gray-900 border-gray-700" : "bg-gray-50 border-gray-100"}`}>
      <p className={`text-[10px] font-semibold uppercase tracking-widest mb-1 ${accent ? "text-gray-400" : "text-gray-400"}`}>
        {label}
      </p>
      <p className={`text-2xl font-bold font-mono ${accent ? "text-white" : "text-gray-900"}`}>
        {value}
      </p>
      {sub && (
        <p className={`text-xs mt-0.5 ${accent ? "text-gray-400" : "text-gray-400"}`}>{sub}</p>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function RiskCalculator() {
  const [inputs, setInputs] = useState<Inputs>({
    accountBalance: "10000",
    riskPercent: "1",
    entryPrice: "45000",
    stopLossPrice: "43200",
  });
  const [result, setResult] = useState<Result | string | null>(null);
  const [copied, setCopied] = useState(false);

  const set = useCallback((field: keyof Inputs) => (v: string) => {
    setInputs((prev) => ({ ...prev, [field]: v }));
    setResult(null);
  }, []);

  const handleCalc = () => {
    const r = calculate(inputs);
    setResult(r);
  };

  const handleCopy = () => {
    if (typeof result !== "object" || result === null) return;
    const text =
      `Position Size: ${fmt(result.positionSize)} units\n` +
      `Risk Amount: $${fmt(result.riskAmount, 2)}\n` +
      `Risk per Unit: $${fmt(result.riskPerUnit, 2)}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const riskPct = parseFloat(inputs.riskPercent) || 0;

  return (
    <div className="space-y-6">
      {/* ── Inputs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputRow
          label="Account Balance"
          prefix="$"
          value={inputs.accountBalance}
          onChange={set("accountBalance")}
          placeholder="10000"
          hint="Your total capital"
        />
        <div>
          <InputRow
            label="Risk Per Trade"
            suffix="%"
            value={inputs.riskPercent}
            onChange={set("riskPercent")}
            placeholder="1"
            hint="Recommended: 1–2%"
          />
          <div className="mt-2">
            <RiskBar pct={riskPct} />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>Conservative</span>
              <span
                className={
                  riskPct <= 1 ? "text-emerald-500" :
                  riskPct <= 2 ? "text-amber-500" :
                  riskPct <= 5 ? "text-orange-500" : "text-red-500"
                }
              >
                {riskPct <= 1 ? "Safe" : riskPct <= 2 ? "Moderate" : riskPct <= 5 ? "High" : "Dangerous"}
              </span>
              <span>Aggressive</span>
            </div>
          </div>
        </div>
        <InputRow
          label="Entry Price"
          prefix="$"
          value={inputs.entryPrice}
          onChange={set("entryPrice")}
          placeholder="45000"
          hint="Where you buy"
        />
        <InputRow
          label="Stop-Loss Price"
          prefix="$"
          value={inputs.stopLossPrice}
          onChange={set("stopLossPrice")}
          placeholder="43200"
          hint="Must be below entry"
        />
      </div>

      {/* ── Calculate button ── */}
      <button
        onClick={handleCalc}
        className="w-full py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-black transition-colors text-sm tracking-wide"
      >
        Calculate Position Size →
      </button>

      {/* ── Error ── */}
      {typeof result === "string" && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <span>⚠️</span> {result}
        </div>
      )}

      {/* ── Results panel ── */}
      {typeof result === "object" && result !== null && (
        <div className="space-y-4">
          {/* Main result cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ResultCard
              label="Position Size"
              value={fmt(result.positionSize)}
              sub="units / coins"
              accent
            />
            <ResultCard
              label="Max Risk Amount"
              value={`$${fmt(result.riskAmount, 2)}`}
              sub={`${inputs.riskPercent}% of account`}
            />
            <ResultCard
              label="Risk Per Unit"
              value={`$${fmt(result.riskPerUnit, 2)}`}
              sub="entry − stop loss"
            />
          </div>

          {/* Formula explanation */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Formula Used</p>
            <code className="block text-xs font-mono text-gray-700 leading-relaxed">
              PositionSize = (${parseFloat(inputs.accountBalance).toLocaleString()} × {inputs.riskPercent}%) ÷ (${inputs.entryPrice} − ${inputs.stopLossPrice})<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= ${fmt(result.riskAmount, 2)} ÷ ${fmt(result.riskPerUnit, 2)}<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= <strong>{fmt(result.positionSize)} units</strong>
            </code>
          </div>

          {/* Copy button */}
          <div className="flex justify-end">
            <button
              onClick={handleCopy}
              className={`px-4 py-2 text-xs font-medium rounded-lg border transition-all ${
                copied
                  ? "bg-green-50 border-green-300 text-green-700"
                  : "bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-800"
              }`}
            >
              {copied ? "✓ Copied to clipboard" : "Copy results"}
            </button>
          </div>

          {/* Risk warning */}
          {parseFloat(inputs.riskPercent) > 2 && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <p>
                <strong>High risk detected ({inputs.riskPercent}% per trade).</strong> Professional traders typically risk no more than 1–2% per position. Consistent high risk leads to rapid account drawdown.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
