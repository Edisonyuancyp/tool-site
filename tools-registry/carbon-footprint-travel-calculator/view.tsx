"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

// kg CO₂ per passenger-km (approximate IPCC/DEFRA values)
const MODES = [
  { label: "✈️ Flight (economy)", icon: "✈️", kgPerKm: 0.255  },
  { label: "🚗 Car (average)",    icon: "🚗", kgPerKm: 0.171  },
  { label: "🚗 Car (electric)",   icon: "🚗", kgPerKm: 0.053  },
  { label: "🚌 Bus",              icon: "🚌", kgPerKm: 0.089  },
  { label: "🚂 Train",            icon: "🚂", kgPerKm: 0.041  },
  { label: "🚢 Ferry",            icon: "🚢", kgPerKm: 0.113  },
  { label: "🛵 Motorbike",        icon: "🛵", kgPerKm: 0.114  },
];

// Average tree absorbs ~21 kg CO₂/year
const KG_PER_TREE_YEAR = 21;

export default function CarbonFootprintTravelCalculatorView({ variant }: ToolProps) {
  const [modeIdx,   setModeIdx]   = useState(0);
  const [distance,  setDistance]  = useState("");
  const [distUnit,  setDistUnit]  = useState<"km"|"mi">("km");
  const [passengers,setPassengers]= useState("1");

  const distKm = distUnit === "km" ? parseFloat(distance) || 0 : (parseFloat(distance) || 0) * 1.60934;
  const n = Math.max(1, parseInt(passengers) || 1);
  const mode = MODES[modeIdx];

  const totalKg = distKm * mode.kgPerKm * n;
  const perPersonKg = distKm * mode.kgPerKm;
  const trees = totalKg / KG_PER_TREE_YEAR;

  const comparison = [
    { label: "🚂 Train instead", kg: distKm * MODES[4].kgPerKm * n, saved: totalKg - distKm * MODES[4].kgPerKm * n },
    { label: "🚌 Bus instead",   kg: distKm * MODES[3].kgPerKm * n, saved: totalKg - distKm * MODES[3].kgPerKm * n },
  ].filter(c => c.saved > 0);

  const fmtKg = (v: number) => v < 1 ? `${(v * 1000).toFixed(0)} g` : `${v.toFixed(1)} kg`;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Transport Mode</label>
        <div className="flex flex-wrap gap-2">
          {MODES.map((m, i) => (
            <button key={m.label} onClick={() => setModeIdx(i)}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                modeIdx === i ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-700 hover:border-gray-400"
              }`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Distance</label>
          <div className="flex gap-2">
            <input type="number" value={distance} onChange={e => setDistance(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {(["km","mi"] as const).map(u => (
                <button key={u} onClick={() => setDistUnit(u)}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${distUnit === u ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"}`}>
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Passengers / People</label>
          <input type="number" value={passengers} min="1" onChange={e => setPassengers(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
        </div>
      </div>

      {distKm > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-5 rounded-xl border border-green-200 bg-green-50 text-center">
              <p className="text-sm text-green-600 mb-1">Total CO₂</p>
              <p className="text-2xl font-bold text-green-900">{fmtKg(totalKg)}</p>
            </div>
            <div className="p-5 rounded-xl border border-gray-200 bg-gray-50 text-center">
              <p className="text-sm text-gray-500 mb-1">Per Person</p>
              <p className="text-2xl font-bold text-gray-900">{fmtKg(perPersonKg)}</p>
            </div>
            <div className="p-5 rounded-xl border border-gray-200 bg-gray-50 text-center">
              <p className="text-sm text-gray-500 mb-1">Trees to Offset</p>
              <p className="text-2xl font-bold text-gray-900">{trees.toFixed(1)}</p>
              <p className="text-xs text-gray-400 mt-1">for 1 year</p>
            </div>
          </div>
          {comparison.length > 0 && (
            <div className="p-4 rounded-xl border border-green-100 bg-green-50 space-y-1">
              <p className="text-sm font-medium text-green-800 mb-2">Lower-carbon alternatives:</p>
              {comparison.map(c => (
                <p key={c.label} className="text-sm text-green-700">
                  {c.label}: <strong>{fmtKg(c.kg)}</strong> total — saves <strong>{fmtKg(c.saved)}</strong>
                </p>
              ))}
            </div>
          )}
          <div className="flex justify-end">
            <CopyButton text={`${mode.label}: ${fmtKg(totalKg)} CO₂ total (${fmtKg(perPersonKg)}/person) for ${distance}${distUnit}`} />
          </div>
        </div>
      )}
    </div>
  );
}
