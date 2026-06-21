"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";
import ShareResultCard from "@/components/ShareResultCard";

export interface ToolProps { variant?: string; }

export default function SavingsGoalCalculatorView({ variant }: ToolProps) {
  const [goal,    setGoal]    = useState("10000");
  const [current, setCurrent] = useState("0");
  const [months,  setMonths]  = useState("24");
  const [rate,    setRate]    = useState("4");

  const G   = parseFloat(goal)    || 0;
  const C   = parseFloat(current) || 0;
  const n   = parseInt(months)    || 1;
  const r   = (parseFloat(rate) || 0) / 100 / 12;
  const needed = G - C;

  let monthly: number;
  if (r === 0) {
    monthly = needed / n;
  } else {
    monthly = (needed * r) / (Math.pow(1 + r, n) - 1);
  }

  const totalContributions = monthly * n;
  const interestEarned = G - C - totalContributions;
  const pctFromInterest = G > 0 ? (interestEarned / G) * 100 : 0;

  const fmt = (v: number) => v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Savings Goal ($)</label>
          <input type="number" value={goal} onChange={e => setGoal(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Savings ($)</label>
          <input type="number" value={current} onChange={e => setCurrent(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Time to Reach Goal (months)</label>
          <input type="number" value={months} min="1" onChange={e => setMonths(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Annual Interest Rate (%) <span className="text-gray-400 font-normal">e.g. HYSA</span></label>
          <input type="number" value={rate} step="0.1" onChange={e => setRate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
        </div>
      </div>

      {G > 0 && monthly > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl border border-gray-900 bg-gray-900 text-center">
              <p className="text-sm text-gray-400 mb-1">Monthly Savings Needed</p>
              <p className="text-3xl font-bold text-white">{fmt(monthly)}</p>
            </div>
            <div className="p-5 rounded-xl border border-gray-200 bg-gray-50 text-center">
              <p className="text-sm text-gray-500 mb-1">Total You Contribute</p>
              <p className="text-2xl font-bold text-gray-900">{fmt(Math.max(0, totalContributions))}</p>
            </div>
            <div className="p-5 rounded-xl border border-gray-200 bg-gray-50 text-center">
              <p className="text-sm text-gray-500 mb-1">Interest Earned</p>
              <p className="text-2xl font-bold text-gray-900">{fmt(Math.max(0, interestEarned))}</p>
              <p className="text-xs text-gray-400 mt-1">{pctFromInterest > 0 ? `${pctFromInterest.toFixed(1)}% of goal` : "at 0% rate"}</p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-600">
            Save <strong>{fmt(monthly)}/month</strong> for <strong>{n} months ({(n/12).toFixed(1)} years)</strong> at <strong>{rate}% APY</strong> to reach your <strong>{fmt(G)}</strong> goal.
          </div>

          <div className="flex justify-end">
            <CopyButton text={`Save ${fmt(monthly)}/month for ${n} months to reach ${fmt(G)}`} />
          </div>

          <ShareResultCard
            toolName="Savings Goal Calculator"
            toolIcon="🎯"
            slug="savings-goal-calculator"
            results={[
              { label: "Monthly Savings Needed", value: fmt(monthly) },
              { label: "Savings Goal",           value: fmt(G) },
              { label: "Time Frame",             value: `${n} months` },
              { label: "Interest Earned",        value: fmt(Math.max(0, interestEarned)) },
            ]}
          />
        </div>
      )}
    </div>
  );
}
