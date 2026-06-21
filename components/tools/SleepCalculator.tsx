"use client";
import { useState, useMemo } from "react";

const CYCLE_MINUTES = 90;
const FALL_ASLEEP_MINUTES = 14; // average time to fall asleep

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

function fmtTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function parseTime(str: string): Date | null {
  const [hStr, mStr] = str.split(":");
  const h = parseInt(hStr);
  const m = parseInt(mStr);
  if (isNaN(h) || isNaN(m)) return null;
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function diffMinutes(from: Date, to: Date): number {
  let diff = (to.getTime() - from.getTime()) / 60000;
  if (diff < 0) diff += 24 * 60;
  return diff;
}

function fmtDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

const QUALITY: Record<number, { label: string; color: string; emoji: string }> = {
  1: { label: "Very short — not recommended", color: "text-red-600", emoji: "🔴" },
  2: { label: "Very short — not recommended", color: "text-red-500", emoji: "🔴" },
  3: { label: "Minimum — may feel groggy", color: "text-amber-600", emoji: "🟡" },
  4: { label: "Moderate — light sleeper", color: "text-amber-500", emoji: "🟡" },
  5: { label: "Good — recommended", color: "text-green-600", emoji: "🟢" },
  6: { label: "Ideal — 9 hours", color: "text-green-700", emoji: "🟢" },
};

export default function SleepCalculator() {
  const [mode, setMode] = useState<"wakeUp" | "bedtime" | "now">("wakeUp");
  const [wakeUpTime, setWakeUpTime] = useState("07:00");
  const [bedTime, setBedTime] = useState("23:00");

  const wakeUpResults = useMemo(() => {
    if (mode !== "wakeUp") return [];
    const wakeDate = parseTime(wakeUpTime);
    if (!wakeDate) return [];

    return [6, 5, 4, 3, 2, 1].map((cycles) => {
      const sleepDuration = cycles * CYCLE_MINUTES;
      const bedtime = addMinutes(wakeDate, -(sleepDuration + FALL_ASLEEP_MINUTES));
      return {
        cycles,
        bedtime,
        sleepDuration,
        quality: QUALITY[cycles] ?? { label: "", color: "text-gray-500", emoji: "⚪" },
      };
    });
  }, [mode, wakeUpTime]);

  const bedtimeResults = useMemo(() => {
    if (mode !== "bedtime") return [];
    const bed = parseTime(bedTime);
    if (!bed) return [];
    const asleepAt = addMinutes(bed, FALL_ASLEEP_MINUTES);

    return [1, 2, 3, 4, 5, 6].map((cycles) => {
      const sleepDuration = cycles * CYCLE_MINUTES;
      const wakeTime = addMinutes(asleepAt, sleepDuration);
      return {
        cycles,
        wakeTime,
        sleepDuration,
        quality: QUALITY[cycles] ?? { label: "", color: "text-gray-500", emoji: "⚪" },
      };
    });
  }, [mode, bedTime]);

  const nowResults = useMemo(() => {
    if (mode !== "now") return [];
    const now = new Date();
    const asleepAt = addMinutes(now, FALL_ASLEEP_MINUTES);
    return [1, 2, 3, 4, 5, 6].map((cycles) => {
      const sleepDuration = cycles * CYCLE_MINUTES;
      const wakeTime = addMinutes(asleepAt, sleepDuration);
      return {
        cycles,
        wakeTime,
        sleepDuration,
        quality: QUALITY[cycles] ?? { label: "", color: "text-gray-500", emoji: "⚪" },
      };
    });
  }, [mode]);

  // If using wakeUp mode and they entered their bedtime, show quality
  const currentSleepQuality = useMemo(() => {
    if (mode !== "wakeUp") return null;
    const wake = parseTime(wakeUpTime);
    const bed = parseTime(bedTime);
    if (!wake || !bed) return null;
    const mins = diffMinutes(bed, wake) - FALL_ASLEEP_MINUTES;
    const cycles = Math.round(mins / CYCLE_MINUTES);
    return { mins, cycles, quality: QUALITY[cycles] };
  }, [mode, wakeUpTime, bedTime]);

  const MODES = [
    { id: "wakeUp" as const, label: "I want to wake at…" },
    { id: "bedtime" as const, label: "I'm going to bed at…" },
    { id: "now" as const, label: "Sleep right now" },
  ];

  const results = mode === "wakeUp" ? wakeUpResults : mode === "bedtime" ? bedtimeResults : nowResults;

  return (
    <div className="space-y-6">
      {/* Mode tabs */}
      <div className="flex flex-col sm:flex-row gap-2">
        {MODES.map((m) => (
          <button key={m.id} type="button" onClick={() => setMode(m.id)}
            className={"flex-1 py-2.5 px-3 text-sm font-semibold rounded-xl border transition-all text-center " +
              (mode === m.id ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400")}>
            {m.label}
          </button>
        ))}
      </div>

      {/* Time inputs */}
      <div className="flex flex-wrap gap-4">
        {mode === "wakeUp" && (
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Wake-up time</label>
            <input type="time" value={wakeUpTime} onChange={(e) => setWakeUpTime(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 font-mono font-semibold text-gray-900 text-lg focus:outline-none focus:border-gray-400" />
          </div>
        )}
        {mode === "bedtime" && (
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Bedtime</label>
            <input type="time" value={bedTime} onChange={(e) => setBedTime(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 font-mono font-semibold text-gray-900 text-lg focus:outline-none focus:border-gray-400" />
          </div>
        )}
        {mode === "now" && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600">
            Calculating from <strong className="text-gray-900">{fmtTime(new Date())}</strong> + {FALL_ASLEEP_MINUTES} min to fall asleep
          </div>
        )}
      </div>

      {/* Results table */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          {mode === "wakeUp" ? "Best bedtimes to hit complete cycles:" : "Best wake-up times:"}
        </h3>
        <div className="overflow-hidden rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">
                  {mode === "wakeUp" ? "Bedtime" : "Wake up"}
                </th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500">Cycles</th>
                <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500">Sleep</th>
                <th className="hidden sm:table-cell text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Quality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {results.map((r) => {
                const timeStr = mode === "wakeUp" && "bedtime" in r
                  ? fmtTime(r.bedtime)
                  : "wakeTime" in r
                  ? fmtTime(r.wakeTime)
                  : "";
                const isRecommended = r.cycles === 5 || r.cycles === 6;
                return (
                  <tr key={r.cycles} className={isRecommended ? "bg-green-50" : "hover:bg-gray-50"}>
                    <td className={`px-4 py-3 font-mono font-bold text-base ${isRecommended ? "text-green-700" : "text-gray-900"}`}>
                      {timeStr}
                      {isRecommended && <span className="ml-2 text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Recommended</span>}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-600">{r.cycles}</td>
                    <td className="px-4 py-3 text-center font-semibold text-gray-700">{fmtDuration(r.sleepDuration)}</td>
                    <td className={`hidden sm:table-cell px-4 py-3 text-xs ${r.quality.color}`}>
                      {r.quality.emoji} {r.quality.label}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
        <p className="font-semibold mb-1">How sleep cycles work</p>
        <p>Each sleep cycle lasts ~90 minutes and moves through light sleep, deep sleep, and REM. Waking at the end of a complete cycle (rather than mid-cycle) means you'll feel more refreshed — even with fewer total hours. These times account for ~{FALL_ASLEEP_MINUTES} minutes to fall asleep.</p>
      </div>
    </div>
  );
}
