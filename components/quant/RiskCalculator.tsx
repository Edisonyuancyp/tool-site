"use client";
import { useState, useCallback, Suspense } from "react";
import { useToolState } from "@/lib/useToolState";
import ShareButton from "@/components/ShareButton";
import ResultCardExport from "@/components/ResultCard";
import { useWorkbench } from "@/lib/WorkbenchContext";

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

// ── Inner component (uses hooks that need Suspense for useSearchParams) ───────

function RiskCalculatorInner() {
  const { saveQuantConfig, savedQuantConfigs, deleteQuantConfig } = useWorkbench();

  const [urlInputs, setUrlInputs] = useToolState({
    accountBalance: "10000",
    riskPercent: "1",
    entryPrice: "45000",
    stopLossPrice: "43200",
  });

  const [result, setResult] = useState<Result | string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [saveLabel, setSaveLabel] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = useCallback((field: keyof typeof urlInputs) => (v: string) => {
    setUrlInputs({ [field]: v } as Partial<typeof urlInputs>);
    setResult(null);
    setShowCard(false);
  }, [setUrlInputs]);

  const handleCalc = () => {
    const r = calculate(urlInputs);
    setResult(r);
    setShowCard(false);
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

  const handleSaveConfig = () => {
    const label = saveLabel.trim() || `Config ${new Date().toLocaleTimeString()}`;
    saveQuantConfig({ label, params: { ...urlInputs } });
    setSaved(true);
    setShowSaveInput(false);
    setSaveLabel("");
    setTimeout(() => setSaved(false), 2000);
  };

  const loadConfig = (params: Record<string, string>) => {
    setUrlInputs(params as Partial<typeof urlInputs>);
    setResult(null);
    setShowCard(false);
  };

  const riskPct = parseFloat(urlInputs.riskPercent) || 0;
  const resultObj = typeof result === "object" && result !== null ? result : null;

  return (
    <div className="space-y-6">
      {/* ── Saved configs ── */}
      {savedQuantConfigs.length > 0 && (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Saved Configs</p>
          <div className="flex flex-wrap gap-2">
            {savedQuantConfigs.map((c) => (
              <div key={c.id} className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
                <button onClick={() => loadConfig(c.params)}
                  className="px-2.5 py-1 text-xs text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                  {c.label}
                </button>
                <button onClick={() => deleteQuantConfig(c.id)}
                  className="px-1.5 py-1 text-gray-300 hover:text-red-500 transition-colors text-xs border-l border-gray-100">
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Inputs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputRow
          label="Account Balance"
          prefix="$"
          value={urlInputs.accountBalance}
          onChange={set("accountBalance")}
          placeholder="10000"
          hint="Your total capital"
        />
        <div>
          <InputRow
            label="Risk Per Trade"
            suffix="%"
            value={urlInputs.riskPercent}
            onChange={set("riskPercent")}
            placeholder="1"
            hint="Recommended: 1–2%"
          />
          <div className="mt-2">
            <RiskBar pct={riskPct} />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>Conservative</span>
              <span className={riskPct <= 1 ? "text-emerald-500" : riskPct <= 2 ? "text-amber-500" : riskPct <= 5 ? "text-orange-500" : "text-red-500"}>
                {riskPct <= 1 ? "Safe" : riskPct <= 2 ? "Moderate" : riskPct <= 5 ? "High" : "Dangerous"}
              </span>
              <span>Aggressive</span>
            </div>
          </div>
        </div>
        <InputRow label="Entry Price" prefix="$" value={urlInputs.entryPrice} onChange={set("entryPrice")} placeholder="45000" hint="Where you buy" />
        <InputRow label="Stop-Loss Price" prefix="$" value={urlInputs.stopLossPrice} onChange={set("stopLossPrice")} placeholder="43200" hint="Must be below entry" />
      </div>

      {/* ── Action bar ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={handleCalc}
          className="flex-1 min-w-[180px] py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-black transition-colors text-sm tracking-wide">
          Calculate Position Size →
        </button>
        <ShareButton
          title="Position Size Calculator — GetFastCalc"
          text={`I used this free position size calculator: `}
          label="Share"
        />
        <button onClick={() => setShowSaveInput((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-500 hover:border-gray-400 hover:text-gray-800 transition-all bg-white">
          {saved ? "✓ Saved!" : "💾 Save config"}
        </button>
      </div>

      {/* Save label input */}
      {showSaveInput && (
        <div className="flex items-center gap-2">
          <input value={saveLabel} onChange={e => setSaveLabel(e.target.value)}
            placeholder='Label, e.g. "BTC 1% rule"'
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
            onKeyDown={e => e.key === "Enter" && handleSaveConfig()}
          />
          <button onClick={handleSaveConfig}
            className="px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-black transition-colors">
            Save
          </button>
        </div>
      )}

      {/* ── Error ── */}
      {typeof result === "string" && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          <span>⚠️</span> {result}
        </div>
      )}

      {/* ── Results panel ── */}
      {resultObj !== null && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ResultCard label="Position Size" value={fmt(resultObj.positionSize)} sub="units / coins" accent />
            <ResultCard label="Max Risk Amount" value={`$${fmt(resultObj.riskAmount, 2)}`} sub={`${urlInputs.riskPercent}% of account`} />
            <ResultCard label="Risk Per Unit" value={`$${fmt(resultObj.riskPerUnit, 2)}`} sub="entry − stop loss" />
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Formula Used</p>
            <code className="block text-xs font-mono text-gray-700 leading-relaxed">
              PositionSize = (${parseFloat(urlInputs.accountBalance).toLocaleString()} × {urlInputs.riskPercent}%) ÷ (${urlInputs.entryPrice} − ${urlInputs.stopLossPrice})<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= ${fmt(resultObj.riskAmount, 2)} ÷ ${fmt(resultObj.riskPerUnit, 2)}<br />
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;= <strong>{fmt(resultObj.positionSize)} units</strong>
            </code>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={handleCopy}
              className={`px-4 py-2 text-xs font-medium rounded-lg border transition-all ${copied ? "bg-green-50 border-green-300 text-green-700" : "bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-800"}`}>
              {copied ? "✓ Copied" : "Copy results"}
            </button>
            <button onClick={() => setShowCard((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-500 hover:border-gray-400 hover:text-gray-800 transition-all bg-white">
              🖼 {showCard ? "Hide card" : "Export result card"}
            </button>
          </div>

          {/* Shareable result card */}
          {showCard && (
            <ResultCardExport
              title="Position Size Calculator"
              accentColor="#111827"
              results={[
                { label: "Position Size", value: `${fmt(resultObj.positionSize)} units` },
                { label: "Max Risk Amount", value: `$${fmt(resultObj.riskAmount, 2)}`, sub: `${urlInputs.riskPercent}% of $${parseFloat(urlInputs.accountBalance).toLocaleString()}` },
                { label: "Risk Per Unit", value: `$${fmt(resultObj.riskPerUnit, 2)}` },
              ]}
            />
          )}

          {parseFloat(urlInputs.riskPercent) > 2 && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <p><strong>High risk detected ({urlInputs.riskPercent}% per trade).</strong> Professional traders typically risk no more than 1–2% per position. Consistent high risk leads to rapid account drawdown.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main export (wrapped in Suspense for useSearchParams) ─────────────────────

export default function RiskCalculator() {
  return (
    <Suspense fallback={<div className="h-48 flex items-center justify-center text-gray-400 text-sm">Loading…</div>}>
      <RiskCalculatorInner />
    </Suspense>
  );
}
