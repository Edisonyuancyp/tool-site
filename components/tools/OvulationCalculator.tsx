"use client";
import { useState, useMemo } from "react";

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function dayName(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

export default function OvulationCalculator() {
  const [lastPeriod, setLastPeriod] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return isoDate(d);
  });
  const [cycleLen, setCycleLen] = useState("28");
  const [periodLen, setPeriodLen] = useState("5");
  const [showCycles, setShowCycles] = useState(3);

  const result = useMemo(() => {
    const start = new Date(lastPeriod + "T00:00:00");
    if (isNaN(start.getTime())) return null;
    const cycle = parseInt(cycleLen) || 28;
    const period = parseInt(periodLen) || 5;
    if (cycle < 21 || cycle > 45) return null;

    const cycles = [];
    for (let i = 0; i < showCycles; i++) {
      const periodStart = addDays(start, cycle * i);
      const periodEnd = addDays(periodStart, period - 1);
      // Ovulation: ~14 days before next period
      const ovulation = addDays(periodStart, cycle - 14);
      // Fertile window: 5 days before ovulation + ovulation day
      const fertileStart = addDays(ovulation, -5);
      const fertileEnd = addDays(ovulation, 1);
      const nextPeriod = addDays(periodStart, cycle);
      cycles.push({ periodStart, periodEnd, ovulation, fertileStart, fertileEnd, nextPeriod });
    }

    const current = cycles[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntilOvulation = Math.round((current.ovulation.getTime() - today.getTime()) / 86400000);
    const daysUntilFertile = Math.round((current.fertileStart.getTime() - today.getTime()) / 86400000);

    // Current phase
    let phase = "Menstruation";
    let phaseColor = "text-red-600";
    let phaseBg = "bg-red-50 border-red-200";
    if (today > current.periodEnd && today < current.fertileStart) {
      phase = "Follicular Phase"; phaseColor = "text-blue-600"; phaseBg = "bg-blue-50 border-blue-200";
    } else if (today >= current.fertileStart && today <= current.fertileEnd) {
      phase = "Fertile Window 🌟"; phaseColor = "text-green-600"; phaseBg = "bg-green-50 border-green-200";
    } else if (today > current.fertileEnd && today < addDays(current.nextPeriod, -5)) {
      phase = "Luteal Phase"; phaseColor = "text-purple-600"; phaseBg = "bg-purple-50 border-purple-200";
    }

    return { cycles, daysUntilOvulation, daysUntilFertile, phase, phaseColor, phaseBg };
  }, [lastPeriod, cycleLen, periodLen, showCycles]);

  return (
    <div className="space-y-6">
      {/* Privacy notice */}
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
        <span className="text-base shrink-0">🔒</span>
        <span>All calculations happen entirely in your browser. No data is sent to any server or stored anywhere.</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">First day of last period</label>
          <input type="date" value={lastPeriod} onChange={(e) => setLastPeriod(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 font-semibold focus:outline-none focus:border-gray-400" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Cycle length (days)</label>
          <input type="number" min="21" max="45" value={cycleLen} onChange={(e) => setCycleLen(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 font-semibold text-gray-900 focus:outline-none focus:border-gray-400" />
          <p className="text-xs text-gray-400 mt-1">Typical: 21–35 days</p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Period duration (days)</label>
          <input type="number" min="1" max="10" value={periodLen} onChange={(e) => setPeriodLen(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 font-semibold text-gray-900 focus:outline-none focus:border-gray-400" />
        </div>
      </div>

      {result ? (
        <>
          {/* Current phase */}
          <div className={`rounded-2xl border px-5 py-4 ${result.phaseBg}`}>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Current Phase</div>
            <div className={`text-2xl font-black ${result.phaseColor}`}>{result.phase}</div>
            <div className="mt-2 text-sm text-gray-600 flex flex-wrap gap-4">
              <span>
                Ovulation: <strong>{result.daysUntilOvulation === 0 ? "Today!" : result.daysUntilOvulation > 0 ? `in ${result.daysUntilOvulation} days` : `${Math.abs(result.daysUntilOvulation)} days ago`}</strong>
              </span>
              <span>
                Fertile window starts: <strong>{result.daysUntilFertile === 0 ? "Today" : result.daysUntilFertile > 0 ? `in ${result.daysUntilFertile} days` : `${Math.abs(result.daysUntilFertile)} days ago`}</strong>
              </span>
            </div>
          </div>

          {/* Cycle details */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-700">Cycle Predictions</h3>
              <div className="flex gap-1">
                {[1, 2, 3, 6].map((n) => (
                  <button key={n} type="button" onClick={() => setShowCycles(n)}
                    className={"px-2.5 py-1 text-xs rounded-lg border font-semibold transition-all " +
                      (showCycles === n ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400")}>
                    {n}
                  </button>
                ))}
                <span className="self-center text-xs text-gray-400 ml-1">cycles</span>
              </div>
            </div>

            <div className="space-y-3">
              {result.cycles.map((c, i) => (
                <div key={i} className={`rounded-xl border overflow-hidden ${i === 0 ? "border-gray-300" : "border-gray-100"}`}>
                  <div className={`px-4 py-2 text-xs font-bold uppercase tracking-wide ${i === 0 ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-600"}`}>
                    Cycle {i + 1}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-gray-100">
                    {[
                      { label: "🔴 Period", from: c.periodStart, to: c.periodEnd, color: "text-red-600" },
                      { label: "🌿 Fertile", from: c.fertileStart, to: c.fertileEnd, color: "text-green-600" },
                      { label: "⭐ Ovulation", from: c.ovulation, to: null, color: "text-blue-600" },
                      { label: "🔄 Next Period", from: c.nextPeriod, to: null, color: "text-purple-600" },
                    ].map((row) => (
                      <div key={row.label} className="px-3 py-2.5">
                        <div className="text-xs text-gray-400 mb-0.5">{row.label}</div>
                        <div className={`text-xs font-bold ${row.color}`}>
                          {dayName(row.from)} {formatDate(row.from)}
                          {row.to && <><br /><span className="font-normal text-gray-400">→ {dayName(row.to)} {formatDate(row.to)}</span></>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
            <p className="font-semibold mb-1">How to read your results</p>
            <p>The <strong>fertile window</strong> is the 5 days before ovulation plus ovulation day — when pregnancy is possible. These are estimates based on average cycle patterns. Actual ovulation can vary by several days due to stress, illness, or hormonal changes. Use ovulation test strips for precision.</p>
          </div>
        </>
      ) : (
        <div className="text-center text-sm text-gray-400 py-8 border border-dashed border-gray-200 rounded-xl">
          Enter your cycle details to see predictions
        </div>
      )}
    </div>
  );
}
