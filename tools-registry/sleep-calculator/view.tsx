"use client";
import { useState, useMemo } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

const ONSET = 14; // avg minutes to fall asleep
const CYCLE = 90; // minutes per sleep cycle

const BABY_SLEEP: { age: string; total: string; naps: string }[] = [
  { age: "0–3 months",  total: "14–17 hrs", naps: "Multiple naps, no set schedule" },
  { age: "4–11 months", total: "12–15 hrs", naps: "2–3 naps per day" },
  { age: "1–2 years",   total: "11–14 hrs", naps: "1–2 naps per day" },
  { age: "3–5 years",   total: "10–13 hrs", naps: "1 nap (may phase out)" },
  { age: "6–12 years",  total: "9–12 hrs",  naps: "Usually no naps needed" },
];

const NAP_OPTIONS = [
  { label: "Power Nap", duration: 20, note: "Boosts alertness, no grogginess. Best for a quick recharge." },
  { label: "Full Cycle", duration: 90, note: "Includes REM sleep. Best for memory & creativity. Allow 15 min to wake up fully." },
  { label: "Short Rest", duration: 10, note: "Micro-nap. Reduces sleepiness fast with minimal sleep inertia." },
];

function addMinutes(timeStr: string, mins: number): string {
  const [h, m] = timeStr.split(":").map(Number);
  const total = (h * 60 + m + mins + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function subtractMinutes(timeStr: string, mins: number): string {
  const [h, m] = timeStr.split(":").map(Number);
  const total = (h * 60 + m - mins + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function calcWakeTimes(bedtime: string): { time: string; cycles: number; hours: string }[] {
  const start = addMinutes(bedtime, ONSET);
  return [4, 5, 6, 7].map((cycles) => ({
    time: addMinutes(start, cycles * CYCLE),
    cycles,
    hours: `${((cycles * CYCLE) / 60).toFixed(1)} hrs`,
  }));
}

function calcBedtimes(wakeTime: string): { time: string; cycles: number; hours: string }[] {
  return [4, 5, 6, 7].map((cycles) => ({
    time: subtractMinutes(wakeTime, cycles * CYCLE + ONSET),
    cycles,
    hours: `${((cycles * CYCLE) / 60).toFixed(1)} hrs`,
  }));
}

export default function SleepCalculatorView({ variant }: ToolProps) {
  const isTeen = variant === "teen";
  const isBaby = variant === "baby";
  const isNap = variant === "nap";

  const [mode, setMode] = useState<"bedtime" | "wakeup">("wakeup");
  const [inputTime, setInputTime] = useState(mode === "wakeup" ? "07:00" : "23:00");
  const [napTime, setNapTime] = useState("14:00");

  const results = useMemo(() => {
    if (mode === "wakeup") return calcBedtimes(inputTime);
    return calcWakeTimes(inputTime);
  }, [mode, inputTime]);

  const minCycles = isTeen ? 5 : 5;

  if (isBaby) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-500">Recommended sleep hours by age (includes naps):</p>
        <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden">
          {BABY_SLEEP.map((row) => (
            <div key={row.age} className="grid grid-cols-3 px-4 py-3 text-sm hover:bg-gray-50">
              <span className="font-medium text-gray-900">{row.age}</span>
              <span className="text-green-600 font-medium">{row.total}</span>
              <span className="text-gray-500">{row.naps}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400">Source: American Academy of Sleep Medicine (AASM) guidelines.</p>
      </div>
    );
  }

  if (isNap) {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Start nap at</label>
          <input type="time" value={napTime} onChange={(e) => setNapTime(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-gray-400 text-base" />
        </div>
        <div className="space-y-3">
          {NAP_OPTIONS.map(({ label, duration, note }) => (
            <div key={label} className="p-4 border border-gray-100 rounded-xl bg-gray-50">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-gray-900">{label} ({duration} min)</span>
                <span className="text-sm font-medium text-blue-600">Wake: {addMinutes(napTime, duration)}</span>
              </div>
              <p className="text-xs text-gray-500">{note}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isTeen && (
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-700">
          Teenagers (14–17 yrs) need <strong>8–10 hours</strong> of sleep. Results below highlight the recommended range.
        </div>
      )}

      <div className="flex rounded-lg border border-gray-200 p-1 w-fit gap-1">
        {(["wakeup", "bedtime"] as const).map((m) => (
          <button key={m} onClick={() => { setMode(m); setInputTime(m === "wakeup" ? "07:00" : "23:00"); }}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === m ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-900"}`}>
            {m === "wakeup" ? "I want to wake up at…" : "I'm going to bed at…"}
          </button>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {mode === "wakeup" ? "Wake-up time" : "Bedtime"}
        </label>
        <input type="time" value={inputTime} onChange={(e) => setInputTime(e.target.value)}
          className="border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-gray-400 text-base" />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">
          {mode === "wakeup" ? "Go to bed at one of these times:" : "You should wake up at:"}
        </p>
        {results.map(({ time, cycles, hours }) => {
          const isRecommended = isTeen ? cycles >= 5 && cycles <= 7 : cycles >= 5;
          return (
            <div key={cycles} className={`flex items-center justify-between p-4 rounded-xl border ${isRecommended ? "border-green-200 bg-green-50" : "border-gray-100 bg-gray-50"}`}>
              <div>
                <span className="text-2xl font-bold text-gray-900">{time}</span>
                {isRecommended && <span className="ml-2 text-xs font-medium text-green-600">✓ Recommended</span>}
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">{cycles} cycles</p>
                <p className="text-xs text-gray-400">{hours}</p>
              </div>
            </div>
          );
        })}
      </div>

      <CopyButton text={`${mode === "wakeup" ? "Bedtime" : "Wake-up"} options: ${results.map(r => r.time).join(", ")}`} />

      <div className="pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400 mb-2">Other sleep calculators:</p>
        <div className="flex flex-wrap gap-2 text-xs">
          {variant !== undefined && <a href="/tools/sleep-calculator" className="text-blue-500 hover:underline">Standard</a>}
          {variant !== "teen" && <a href="/tools/sleep-calculator-for-teens" className="text-blue-500 hover:underline">For Teens</a>}
          {variant !== "baby" && <a href="/tools/sleep-calculator-for-babies" className="text-blue-500 hover:underline">For Babies</a>}
          {variant !== "nap" && <a href="/tools/nap-calculator" className="text-blue-500 hover:underline">Nap Calculator</a>}
        </div>
      </div>
    </div>
  );
}
