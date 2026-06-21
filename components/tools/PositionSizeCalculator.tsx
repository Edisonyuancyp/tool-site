"use client";
import { useState, useMemo } from "react";

function fmtUSD(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

function fmtNum(n: number, dp = 4): string {
  if (Math.abs(n) >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return n.toFixed(dp);
}

const RISK_PRESETS = [0.5, 1, 2, 3, 5];

export default function PositionSizeCalculator() {
  const [accountSize, setAccountSize] = useState("10000");
  const [riskPct, setRiskPct] = useState("1");
  const [entryPrice, setEntryPrice] = useState("100");
  const [stopLossPrice, setStopLossPrice] = useState("95");
  const [leverage, setLeverage] = useState("1");
  const [fee, setFee] = useState("0.05"); // 0.05% taker fee

  const account = Math.max(0, parseFloat(accountSize) || 0);
  const risk = Math.min(100, Math.max(0, parseFloat(riskPct) || 0));
  const entry = Math.max(0, parseFloat(entryPrice) || 0);
  const sl = Math.max(0, parseFloat(stopLossPrice) || 0);
  const lev = Math.max(1, parseFloat(leverage) || 1);
  const feeRate = Math.max(0, parseFloat(fee) || 0) / 100;

  const result = useMemo(() => {
    if (entry === 0 || sl === 0 || account === 0) return null;

    const riskAmount = account * (risk / 100); // $ at risk
    const slDistancePct = Math.abs(entry - sl) / entry; // price move % to SL

    if (slDistancePct === 0) return null;

    // Position size in USD (before leverage)
    // Loss per USD of position = slDistancePct
    // positionUSD × slDistancePct = riskAmount
    const positionUSD = riskAmount / slDistancePct;

    // With leverage: margin needed = positionUSD / leverage
    const marginNeeded = positionUSD / lev;

    // Units of asset
    const units = positionUSD / entry;

    // Fees: open + close (taker × 2)
    const totalFees = positionUSD * feeRate * 2;
    const netRiskAmount = riskAmount + totalFees;

    // Adjusted position accounting for fees
    const positionUSDAdj = (riskAmount - totalFees) / slDistancePct;
    const marginAdj = positionUSDAdj / lev;
    const unitsAdj = positionUSDAdj / entry;

    // Kelly criterion context: optimal fraction
    // Not enough info for full Kelly, but show risk % context

    const pctOfAccount = (marginNeeded / account) * 100;

    return {
      riskAmount,
      positionUSD,
      marginNeeded,
      units,
      totalFees,
      netRiskAmount,
      positionUSDAdj,
      marginAdj,
      unitsAdj,
      pctOfAccount,
      slDistancePct: slDistancePct * 100,
    };
  }, [account, risk, entry, sl, lev, feeRate]);

  // Risk level indicator
  const getRiskLevel = (pct: number) => {
    if (pct <= 1) return { label: "Conservative", color: "text-green-600", bg: "bg-green-50 border-green-200" };
    if (pct <= 2) return { label: "Moderate", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" };
    if (pct <= 3) return { label: "Aggressive", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" };
    return { label: "Very High Risk", color: "text-red-600", bg: "bg-red-50 border-red-200" };
  };

  const riskLevel = getRiskLevel(risk);

  return (
    <div className="space-y-6">
      {/* Account & Risk */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Account Settings</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Account Size (USD)
            </label>
            <input
              type="number" min="0" step="100" value={accountSize}
              onChange={(e) => setAccountSize(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 font-semibold focus:outline-none focus:border-gray-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Risk Per Trade (%)
            </label>
            <input
              type="number" min="0.1" max="100" step="0.1" value={riskPct}
              onChange={(e) => setRiskPct(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 font-semibold focus:outline-none focus:border-gray-400"
            />
            {/* Risk presets */}
            <div className="flex gap-1.5 mt-2">
              {RISK_PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setRiskPct(String(p))}
                  className={
                    "flex-1 py-1 text-xs rounded-lg border transition-all font-medium " +
                    (parseFloat(riskPct) === p
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-500 border-gray-200 hover:border-gray-400")
                  }
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Risk level badge */}
        <div className={`mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium ${riskLevel.bg} ${riskLevel.color}`}>
          <span>{risk <= 1 ? "🟢" : risk <= 2 ? "🔵" : risk <= 3 ? "🟡" : "🔴"}</span>
          <span>{riskLevel.label} — risking {risk}% = {fmtUSD(account * risk / 100)} per trade</span>
        </div>
      </div>

      {/* Trade Setup */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Trade Setup</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Entry Price</label>
            <input
              type="number" min="0" step="any" value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 font-semibold focus:outline-none focus:border-gray-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Stop Loss Price</label>
            <input
              type="number" min="0" step="any" value={stopLossPrice}
              onChange={(e) => setStopLossPrice(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 font-semibold focus:outline-none focus:border-gray-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Leverage (×)</label>
            <input
              type="number" min="1" max="125" step="1" value={leverage}
              onChange={(e) => setLeverage(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 font-semibold focus:outline-none focus:border-gray-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Taker Fee (%)</label>
            <input
              type="number" min="0" max="1" step="0.01" value={fee}
              onChange={(e) => setFee(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 font-semibold focus:outline-none focus:border-gray-400"
            />
            <p className="text-xs text-gray-400 mt-1">Binance/OKX taker ≈ 0.05%</p>
          </div>
        </div>
      </div>

      {/* Results */}
      {result ? (
        <>
          {/* Hero result */}
          <div className="bg-gray-900 rounded-2xl p-6 text-white">
            <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-4">Recommended Position Size</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              <div>
                <div className="text-xs text-gray-400 mb-1">Position (USD)</div>
                <div className="text-2xl font-black text-white">{fmtUSD(result.positionUSD)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Margin Needed</div>
                <div className="text-2xl font-black text-blue-400">{fmtUSD(result.marginNeeded)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Units to Buy</div>
                <div className="text-2xl font-black text-green-400">{fmtNum(result.units)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">% of Account</div>
                <div className="text-2xl font-black text-amber-400">{result.pctOfAccount.toFixed(1)}%</div>
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Without fees */}
            <div className="border border-gray-100 rounded-xl p-4 space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Before Fees</div>
              <Row label="Risk Amount" value={fmtUSD(result.riskAmount)} accent="red" />
              <Row label="SL Distance" value={`${result.slDistancePct.toFixed(2)}%`} />
              <Row label="Position Size" value={fmtUSD(result.positionUSD)} />
              <Row label="Margin (÷ leverage)" value={fmtUSD(result.marginNeeded)} accent="blue" />
              <Row label="Units" value={fmtNum(result.units)} />
            </div>

            {/* After fees */}
            <div className="border border-gray-100 rounded-xl p-4 space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">After Fees (Adjusted)</div>
              <Row label="Est. Total Fees" value={fmtUSD(result.totalFees)} accent="amber" />
              <Row label="Net Risk (with fees)" value={fmtUSD(result.netRiskAmount)} accent="red" />
              <Row label="Adj. Position Size" value={fmtUSD(result.positionUSDAdj)} />
              <Row label="Adj. Margin" value={fmtUSD(result.marginAdj)} accent="blue" />
              <Row label="Adj. Units" value={fmtNum(result.unitsAdj)} />
            </div>
          </div>

          {/* Warning if margin > 25% of account */}
          {result.pctOfAccount > 25 && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              <span className="text-lg shrink-0">⚠️</span>
              <span>
                This position uses <strong>{result.pctOfAccount.toFixed(1)}%</strong> of your account as margin — significantly above the recommended 5–10%.
                Consider reducing leverage or risk percentage.
              </span>
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-sm text-gray-400 py-8 border border-dashed border-gray-200 rounded-xl">
          Enter valid entry price and stop loss to calculate position size
        </div>
      )}

      <p className="text-xs text-gray-400 border-t border-gray-100 pt-3">
        Professional traders typically risk 1–2% per trade. Never risk more than you can afford to lose.
      </p>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: "red" | "blue" | "amber" | "green" }) {
  const color =
    accent === "red" ? "text-red-600" :
    accent === "blue" ? "text-blue-600" :
    accent === "amber" ? "text-amber-600" :
    accent === "green" ? "text-green-600" :
    "text-gray-900";
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`font-semibold ${color}`}>{value}</span>
    </div>
  );
}
