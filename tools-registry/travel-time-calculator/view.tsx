"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

type Mode = "time" | "distance" | "speed";

export default function TravelTimeCalculatorView({ variant }: ToolProps) {
  const [solve,    setSolve]    = useState<Mode>("time");
  const [distance, setDistance] = useState("");
  const [speed,    setSpeed]    = useState("");
  const [hours,    setHours]    = useState("");
  const [minutes,  setMinutes]  = useState("");
  const [unit,     setUnit]     = useState<"mph"|"kmh">("mph");

  const D = parseFloat(distance) || 0;
  const S = parseFloat(speed) || 0;
  const T = (parseFloat(hours) || 0) + (parseFloat(minutes) || 0) / 60;

  let result: { label: string; value: string }[] = [];

  if (solve === "time" && D > 0 && S > 0) {
    const hrs = D / S;
    const h = Math.floor(hrs);
    const m = Math.round((hrs - h) * 60);
    result = [
      { label: "Travel Time", value: `${h}h ${m}m` },
      { label: "Distance",    value: `${D} ${unit === "mph" ? "mi" : "km"}` },
      { label: "Speed",       value: `${S} ${unit}` },
    ];
  } else if (solve === "distance" && S > 0 && T > 0) {
    const dist = S * T;
    result = [
      { label: "Distance",    value: `${dist.toFixed(1)} ${unit === "mph" ? "mi" : "km"}` },
      { label: "Speed",       value: `${S} ${unit}` },
      { label: "Travel Time", value: `${hours || 0}h ${minutes || 0}m` },
    ];
  } else if (solve === "speed" && D > 0 && T > 0) {
    const spd = D / T;
    result = [
      { label: "Required Speed", value: `${spd.toFixed(1)} ${unit}` },
      { label: "Distance",       value: `${D} ${unit === "mph" ? "mi" : "km"}` },
      { label: "Travel Time",    value: `${hours || 0}h ${minutes || 0}m` },
    ];
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Solve for</label>
        <div className="flex gap-2 flex-wrap">
          {(["time","distance","speed"] as Mode[]).map(m => (
            <button key={m} onClick={() => setSolve(m)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${
                solve === m ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-700 hover:border-gray-400"
              }`}>
              {m}
            </button>
          ))}
          <div className="ml-auto flex rounded-lg border border-gray-200 overflow-hidden">
            {(["mph","kmh"] as const).map(u => (
              <button key={u} onClick={() => setUnit(u)}
                className={`px-3 py-2 text-sm font-medium transition-colors ${unit === u ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"}`}>
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {solve !== "distance" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Distance ({unit === "mph" ? "miles" : "km"})
            </label>
            <input type="number" value={distance} onChange={e => setDistance(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
          </div>
        )}
        {solve !== "speed" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Speed ({unit})</label>
            <input type="number" value={speed} onChange={e => setSpeed(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
          </div>
        )}
        {solve !== "time" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Travel Time</label>
            <div className="flex gap-2">
              <input type="number" value={hours} onChange={e => setHours(e.target.value)}
                placeholder="hrs"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-gray-400" />
              <input type="number" value={minutes} onChange={e => setMinutes(e.target.value)}
                placeholder="min"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-gray-400" />
            </div>
          </div>
        )}
      </div>

      {result.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {result.map(({ label, value }) => (
              <div key={label} className="p-5 rounded-xl border border-gray-200 bg-gray-50 text-center">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <CopyButton text={result.map(r => `${r.label}: ${r.value}`).join(" | ")} />
          </div>
        </div>
      )}
    </div>
  );
}
