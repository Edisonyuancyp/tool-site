"use client";
import { useState, useMemo } from "react";

type Mode = "paceFromTime" | "timeFromPace" | "distanceFromPace";
type DistUnit = "km" | "miles";

const RACE_DISTANCES = [
  { label: "1K", km: 1 },
  { label: "5K", km: 5 },
  { label: "10K", km: 10 },
  { label: "Half Marathon", km: 21.0975 },
  { label: "Marathon", km: 42.195 },
];

function totalSecondsFromHMS(h: string, m: string, s: string): number {
  return (parseInt(h) || 0) * 3600 + (parseInt(m) || 0) * 60 + (parseFloat(s) || 0);
}

function secondsFromMS(m: string, s: string): number {
  return (parseInt(m) || 0) * 60 + (parseFloat(s) || 0);
}

function fmtSeconds(total: number): string {
  if (!isFinite(total) || total < 0) return "—";
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = Math.round(total % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function fmtPace(secPerUnit: number, unit: DistUnit): string {
  if (!isFinite(secPerUnit) || secPerUnit <= 0) return "—";
  const m = Math.floor(secPerUnit / 60);
  const s = Math.round(secPerUnit % 60);
  return `${m}:${String(s).padStart(2, "0")} /${unit === "km" ? "km" : "mi"}`;
}

export default function RunningPaceCalculator() {
  const [mode, setMode] = useState<Mode>("paceFromTime");
  const [distUnit, setDistUnit] = useState<DistUnit>("km");

  // Inputs
  const [distStr, setDist] = useState("10");
  const [timeH, setTimeH] = useState("0");
  const [timeM, setTimeM] = useState("55");
  const [timeS, setTimeS] = useState("0");
  const [paceM, setPaceM] = useState("5");
  const [paceS, setPaceS] = useState("30");

  const distVal = parseFloat(distStr) || 0;
  const timeSec = totalSecondsFromHMS(timeH, timeM, timeS);
  const paceSec = secondsFromMS(paceM, paceS);

  const result = useMemo(() => {
    if (mode === "paceFromTime") {
      if (distVal <= 0 || timeSec <= 0) return null;
      const pacePerUnit = timeSec / distVal;
      const paceKm = distUnit === "km" ? pacePerUnit : pacePerUnit / 1.60934;
      const paceMile = distUnit === "miles" ? pacePerUnit : pacePerUnit * 1.60934;
      const speedKph = 3600 / paceKm;
      const speedMph = 3600 / paceMile;
      return { pacePerUnit, paceKm, paceMile, speedKph, speedMph };
    } else if (mode === "timeFromPace") {
      if (distVal <= 0 || paceSec <= 0) return null;
      const totalSec = distVal * paceSec;
      const paceKm = distUnit === "km" ? paceSec : paceSec / 1.60934;
      const paceMile = distUnit === "miles" ? paceSec : paceSec * 1.60934;
      const speedKph = 3600 / paceKm;
      const speedMph = 3600 / paceMile;
      return { totalSec, paceKm, paceMile, speedKph, speedMph };
    } else {
      // distance from pace and time
      if (paceSec <= 0 || timeSec <= 0) return null;
      const dist = timeSec / paceSec;
      const paceKm = distUnit === "km" ? paceSec : paceSec / 1.60934;
      const paceMile = distUnit === "miles" ? paceSec : paceSec * 1.60934;
      const speedKph = 3600 / paceKm;
      const speedMph = 3600 / paceMile;
      return { dist, paceKm, paceMile, speedKph, speedMph };
    }
  }, [mode, distVal, timeSec, paceSec, distUnit]);

  const racePredictions = useMemo(() => {
    if (!result) return [];
    const pacePerKm = "paceKm" in result ? result.paceKm : null;
    if (!pacePerKm) return [];
    return RACE_DISTANCES.map((r) => ({
      label: r.label,
      km: r.km,
      time: pacePerKm * r.km,
    }));
  }, [result]);

  const MODES: { id: Mode; label: string }[] = [
    { id: "paceFromTime", label: "Find Pace" },
    { id: "timeFromPace", label: "Find Time" },
    { id: "distanceFromPace", label: "Find Distance" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <div className="flex">
          {MODES.map((m) => (
            <button key={m.id} type="button" onClick={() => setMode(m.id)}
              className={"px-4 py-2 text-sm font-semibold border transition-all first:rounded-l-xl last:rounded-r-xl " +
                (mode === m.id ? "bg-gray-900 text-white border-gray-900 z-10" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400")}>
              {m.label}
            </button>
          ))}
        </div>
        <div className="flex">
          {(["km", "miles"] as DistUnit[]).map((u) => (
            <button key={u} type="button" onClick={() => setDistUnit(u)}
              className={"px-4 py-2 text-sm font-semibold border transition-all first:rounded-l-xl last:rounded-r-xl " +
                (distUnit === u ? "bg-gray-900 text-white border-gray-900 z-10" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400")}>
              {u}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Distance input */}
        {mode !== "distanceFromPace" && (
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Distance ({distUnit})</label>
            <div className="space-y-1.5">
              <input type="number" min="0" step="0.01" value={distStr} onChange={(e) => setDist(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 font-semibold text-gray-900 focus:outline-none focus:border-gray-400" />
              <div className="flex flex-wrap gap-1">
                {RACE_DISTANCES.map((r) => {
                  const d = distUnit === "km" ? r.km : r.km / 1.60934;
                  return (
                    <button key={r.label} type="button"
                      onClick={() => setDist(d.toFixed(distUnit === "km" ? 4 : 4))}
                      className="text-xs px-2 py-1 rounded-lg border border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900 transition-all">
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Time input */}
        {mode !== "timeFromPace" && (
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Time (h : m : s)</label>
            <div className="flex gap-2">
              <input type="number" min="0" max="23" value={timeH} onChange={(e) => setTimeH(e.target.value)}
                placeholder="0" className="w-16 border border-gray-200 rounded-xl px-2 py-2.5 font-mono font-semibold text-gray-900 text-center focus:outline-none focus:border-gray-400" />
              <span className="self-center text-gray-400">:</span>
              <input type="number" min="0" max="59" value={timeM} onChange={(e) => setTimeM(e.target.value)}
                placeholder="55" className="w-16 border border-gray-200 rounded-xl px-2 py-2.5 font-mono font-semibold text-gray-900 text-center focus:outline-none focus:border-gray-400" />
              <span className="self-center text-gray-400">:</span>
              <input type="number" min="0" max="59" value={timeS} onChange={(e) => setTimeS(e.target.value)}
                placeholder="0" className="w-16 border border-gray-200 rounded-xl px-2 py-2.5 font-mono font-semibold text-gray-900 text-center focus:outline-none focus:border-gray-400" />
            </div>
          </div>
        )}

        {/* Pace input */}
        {mode !== "paceFromTime" && (
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Pace (m : s / {distUnit})</label>
            <div className="flex gap-2">
              <input type="number" min="0" max="59" value={paceM} onChange={(e) => setPaceM(e.target.value)}
                placeholder="5" className="w-16 border border-gray-200 rounded-xl px-2 py-2.5 font-mono font-semibold text-gray-900 text-center focus:outline-none focus:border-gray-400" />
              <span className="self-center text-gray-400">:</span>
              <input type="number" min="0" max="59" value={paceS} onChange={(e) => setPaceS(e.target.value)}
                placeholder="30" className="w-16 border border-gray-200 rounded-xl px-2 py-2.5 font-mono font-semibold text-gray-900 text-center focus:outline-none focus:border-gray-400" />
            </div>
          </div>
        )}
      </div>

      {result ? (
        <>
          <div className="bg-gray-900 rounded-2xl p-5 text-white">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {mode === "paceFromTime" && "pacePerUnit" in result && typeof result.pacePerUnit === "number" && (
                <div className="col-span-2">
                  <div className="text-xs text-gray-400 mb-1">Your Pace</div>
                  <div className="text-3xl font-black text-green-400">{fmtPace(result.pacePerUnit, distUnit)}</div>
                </div>
              )}
              {mode === "timeFromPace" && "totalSec" in result && typeof result.totalSec === "number" && (
                <div className="col-span-2">
                  <div className="text-xs text-gray-400 mb-1">Finish Time</div>
                  <div className="text-3xl font-black text-green-400">{fmtSeconds(result.totalSec)}</div>
                </div>
              )}
              {mode === "distanceFromPace" && "dist" in result && typeof result.dist === "number" && (
                <div className="col-span-2">
                  <div className="text-xs text-gray-400 mb-1">Distance</div>
                  <div className="text-3xl font-black text-green-400">{result.dist.toFixed(2)} {distUnit}</div>
                </div>
              )}
              <div>
                <div className="text-xs text-gray-400 mb-1">Speed (km/h)</div>
                <div className="text-xl font-bold text-white">{result.speedKph.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Speed (mph)</div>
                <div className="text-xl font-bold text-white">{result.speedMph.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Pace /km</div>
                <div className="text-xl font-bold text-white">{fmtPace(result.paceKm, "km")}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Pace /mile</div>
                <div className="text-xl font-bold text-white">{fmtPace(result.paceMile, "miles")}</div>
              </div>
            </div>
          </div>

          {racePredictions.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Race Finish Time Predictions</h3>
              <div className="overflow-hidden rounded-xl border border-gray-100">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Race</th>
                      <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500">Distance</th>
                      <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500">Predicted Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {racePredictions.map((r) => (
                      <tr key={r.label} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 font-medium text-gray-800">{r.label}</td>
                        <td className="px-4 py-2.5 text-right text-gray-500">{r.km} km</td>
                        <td className="px-4 py-2.5 text-right font-bold text-gray-900">{fmtSeconds(r.time)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-sm text-gray-400 py-8 border border-dashed border-gray-200 rounded-xl">
          Enter values above to calculate
        </div>
      )}
    </div>
  );
}
