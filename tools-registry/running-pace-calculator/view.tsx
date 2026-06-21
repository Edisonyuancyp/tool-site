"use client";
import { useState, useMemo } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

const DISTANCES: Record<string, number> = {
  "5k": 5,
  "10k": 10,
  "half-marathon": 21.0975,
  "marathon": 42.195,
};

const SPLIT_KM: Record<string, number> = {
  "5k": 1,
  "10k": 2,
  "half-marathon": 5,
  "marathon": 5,
};

function parsePace(str: string): number | null {
  const parts = str.split(":").map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return parts[0] * 60 + parts[1];
  return null;
}

function parseTime(str: string): number | null {
  const parts = str.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return null;
}

function secsToMMSS(secs: number) {
  const m = Math.floor(secs / 60);
  const s = Math.round(secs % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function secsToHHMMSS(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.round(secs % 60);
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function RunningPaceView({ variant }: ToolProps) {
  const raceKm = variant ? (DISTANCES[variant] ?? null) : null;
  const splitKm = variant ? (SPLIT_KM[variant] ?? 5) : null;

  const [mode, setMode] = useState<"pace-to-time" | "time-to-pace">("pace-to-time");
  const [pace, setPace] = useState("");
  const [targetTime, setTargetTime] = useState("");
  const [customDist, setCustomDist] = useState("10");
  const [unit, setUnit] = useState<"km" | "mile">("km");

  const dist = raceKm ?? parseFloat(customDist);

  const result = useMemo(() => {
    if (mode === "pace-to-time") {
      const pSecs = parsePace(pace);
      if (!pSecs || !dist) return null;
      const totalSecs = pSecs * dist;
      const splits: { label: string; time: string }[] = [];
      if (splitKm) {
        for (let k = splitKm; k <= dist; k += splitKm) {
          splits.push({ label: `${k}km`, time: secsToHHMMSS(pSecs * k) });
        }
      }
      return { finishTime: secsToHHMMSS(totalSecs), paceKm: pace, paceMile: secsToMMSS(pSecs * 1.60934), splits };
    } else {
      const tSecs = parseTime(targetTime);
      if (!tSecs || !dist) return null;
      const pSecs = tSecs / dist;
      const splits: { label: string; time: string }[] = [];
      if (splitKm) {
        for (let k = splitKm; k <= dist; k += splitKm) {
          splits.push({ label: `${k}km`, time: secsToHHMMSS(pSecs * k) });
        }
      }
      return { finishTime: secsToHHMMSS(tSecs), paceKm: secsToMMSS(pSecs), paceMile: secsToMMSS(pSecs * 1.60934), splits };
    }
  }, [mode, pace, targetTime, dist, splitKm]);

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex rounded-lg border border-gray-200 p-1 w-fit gap-1">
        {(["pace-to-time", "time-to-pace"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === m ? "bg-gray-900 text-white" : "text-gray-500 hover:text-gray-900"}`}>
            {m === "pace-to-time" ? "Pace → Finish Time" : "Target Time → Pace"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Distance input — only show for non-race variants */}
        {!raceKm && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Distance (km)</label>
            <input type="number" value={customDist} onChange={(e) => setCustomDist(e.target.value)}
              placeholder="10"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 text-base" />
          </div>
        )}

        {raceKm && (
          <div className="sm:col-span-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
              🏁 Race distance: <span className="font-semibold text-gray-900">{raceKm}km</span>
            </div>
          </div>
        )}

        {mode === "pace-to-time" ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Pace (mm:ss per km)</label>
            <input type="text" value={pace} onChange={(e) => setPace(e.target.value)}
              placeholder="5:30"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 text-base" />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Finish Time (h:mm:ss)</label>
            <input type="text" value={targetTime} onChange={(e) => setTargetTime(e.target.value)}
              placeholder="0:55:00"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 text-base" />
          </div>
        )}
      </div>

      {result && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Finish Time</p>
              <p className="text-xl font-bold text-gray-900">{result.finishTime}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Pace /km</p>
              <p className="text-xl font-bold text-gray-900">{result.paceKm}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-xs text-gray-400 mb-1">Pace /mile</p>
              <p className="text-xl font-bold text-gray-900">{result.paceMile}</p>
            </div>
          </div>

          {result.splits.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Split Times</p>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {result.splits.map((s) => (
                  <div key={s.label} className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-400">{s.label}</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">{s.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <CopyButton text={`Finish: ${result.finishTime} | Pace/km: ${result.paceKm} | Pace/mile: ${result.paceMile}`} />
        </>
      )}

      {/* Cross-links */}
      <div className="pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400 mb-2">Race-specific calculators:</p>
        <div className="flex flex-wrap gap-2 text-xs">
          {variant !== undefined && <a href="/tools/running-pace-calculator" className="text-blue-500 hover:underline">General Pace</a>}
          {variant !== "5k" && <a href="/tools/5k-pace-calculator" className="text-blue-500 hover:underline">5K</a>}
          {variant !== "10k" && <a href="/tools/10k-pace-calculator" className="text-blue-500 hover:underline">10K</a>}
          {variant !== "half-marathon" && <a href="/tools/half-marathon-pace-calculator" className="text-blue-500 hover:underline">Half Marathon</a>}
          {variant !== "marathon" && <a href="/tools/marathon-pace-calculator" className="text-blue-500 hover:underline">Marathon</a>}
        </div>
      </div>
    </div>
  );
}
