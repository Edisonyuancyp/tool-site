"use client";
import { useState } from "react";

interface Props { compact?: boolean; }

export default function KellyCriterionCalculator({ compact }: Props) {
  const [winRate, setWinRate] = useState("55");
  const [winLoss, setWinLoss] = useState("2");

  const w = parseFloat(winRate) / 100;
  const b = parseFloat(winLoss);
  const valid = !isNaN(w) && !isNaN(b) && w > 0 && w < 1 && b > 0;

  const kelly    = valid ? w - (1 - w) / b : null;
  const halfK    = kelly !== null ? kelly / 2 : null;
  const quarterK = kelly !== null ? kelly / 4 : null;
  const negative = kelly !== null && kelly <= 0;

  const pct = (v: number | null) => v !== null ? `${(v * 100).toFixed(2)}%` : "—";

  if (compact) {
    return (
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Win Rate %</label>
            <input type="number" value={winRate} onChange={e => setWinRate(e.target.value)}
              className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Win/Loss Ratio</label>
            <input type="number" value={winLoss} onChange={e => setWinLoss(e.target.value)}
              className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400" />
          </div>
        </div>
        {kelly !== null && (
          <div className={`rounded-xl p-3 text-center ${negative ? "bg-red-50" : "bg-green-50"}`}>
            <p className="text-xs text-gray-500">Full Kelly</p>
            <p className={`text-2xl font-bold ${negative ? "text-red-600" : "text-green-600"}`}>{pct(kelly)}</p>
            {!negative && <p className="text-xs text-gray-400 mt-1">½K {pct(halfK)} · ¼K {pct(quarterK)}</p>}
            {negative && <p className="text-xs text-red-500 mt-1">No edge — skip this trade</p>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Win Rate (%)</label>
          <input
            type="number" min="1" max="99" step="0.1" value={winRate}
            onChange={e => setWinRate(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="55"
          />
          <p className="text-xs text-gray-400 mt-1">Percentage of trades that win</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Win / Loss Ratio</label>
          <input
            type="number" min="0.01" step="0.01" value={winLoss}
            onChange={e => setWinLoss(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="2"
          />
          <p className="text-xs text-gray-400 mt-1">Avg win ÷ avg loss</p>
        </div>
      </div>

      {kelly !== null && (
        <div className="space-y-3">
          <div className={`rounded-2xl p-5 text-center border ${negative ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"}`}>
            <p className="text-sm text-gray-500 mb-1">Full Kelly</p>
            <p className={`text-4xl font-black ${negative ? "text-red-600" : "text-green-600"}`}>{pct(kelly)}</p>
            {negative ? (
              <p className="text-sm text-red-500 mt-2">Negative edge — do not take this trade</p>
            ) : (
              <p className="text-xs text-gray-400 mt-2">Risk this fraction of capital per trade</p>
            )}
          </div>

          {!negative && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                <p className="text-xs text-gray-500">½ Kelly (recommended)</p>
                <p className="text-2xl font-bold text-blue-600">{pct(halfK)}</p>
                <p className="text-xs text-gray-400 mt-1">Lower drawdown</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
                <p className="text-xs text-gray-500">¼ Kelly (conservative)</p>
                <p className="text-2xl font-bold text-purple-600">{pct(quarterK)}</p>
                <p className="text-xs text-gray-400 mt-1">Very stable equity</p>
              </div>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 border border-gray-100">
            <p className="font-medium text-gray-700 mb-1">Formula</p>
            <code className="text-blue-700">Kelly = W − (1−W) / R</code>
            <p className="mt-1">W = win rate, R = win/loss ratio</p>
          </div>
        </div>
      )}
    </div>
  );
}
