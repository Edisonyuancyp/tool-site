"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

const ACTIVITY = [
  { label: "Sedentary",        mult: 1.0  },
  { label: "Lightly Active",   mult: 1.12 },
  { label: "Moderately Active",mult: 1.25 },
  { label: "Very Active",      mult: 1.4  },
  { label: "Athlete / Heavy",  mult: 1.6  },
];

const CLIMATE = [
  { label: "Cool / Indoors",   add: 0    },
  { label: "Moderate",         add: 0.25 },
  { label: "Hot / Humid",      add: 0.5  },
];

export default function HydrationNeedsCalculatorView({ variant }: ToolProps) {
  const [weight,     setWeight]     = useState("70");
  const [unit,       setUnit]       = useState<"kg"|"lbs">("kg");
  const [actIdx,     setActIdx]     = useState(1);
  const [climateIdx, setClimateIdx] = useState(0);

  const weightKg = unit === "kg" ? parseFloat(weight) || 0 : (parseFloat(weight) || 0) * 0.453592;
  const base = weightKg * 0.033;
  const withActivity = base * ACTIVITY[actIdx].mult;
  const total = withActivity + CLIMATE[climateIdx].add;
  const cups = total / 0.237;
  const oz   = total * 33.814;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Body Weight</label>
          <div className="flex gap-2">
            <input type="number" value={weight} onChange={e => setWeight(e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {(["kg","lbs"] as const).map(u => (
                <button key={u} onClick={() => setUnit(u)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${unit === u ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"}`}>
                  {u}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Activity Level</label>
        <div className="flex flex-wrap gap-2">
          {ACTIVITY.map((a, i) => (
            <button key={a.label} onClick={() => setActIdx(i)}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                actIdx === i ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-700 hover:border-gray-400"
              }`}>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Climate / Environment</label>
        <div className="flex flex-wrap gap-2">
          {CLIMATE.map((c, i) => (
            <button key={c.label} onClick={() => setClimateIdx(i)}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                climateIdx === i ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-700 hover:border-gray-400"
              }`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {weightKg > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Liters / Day",   value: `${total.toFixed(1)} L`  },
              { label: "Fluid Ounces",   value: `${oz.toFixed(0)} fl oz` },
              { label: "Cups (8 fl oz)", value: `${cups.toFixed(1)} cups`},
            ].map(({ label, value }) => (
              <div key={label} className="p-5 rounded-xl border border-gray-200 bg-gray-50 text-center">
                <p className="text-sm text-gray-500 mb-1">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center">
            Based on 33 ml/kg baseline · {ACTIVITY[actIdx].label} · {CLIMATE[climateIdx].label}
          </p>
          <div className="flex justify-end">
            <CopyButton text={`Daily water: ${total.toFixed(1)}L / ${oz.toFixed(0)} fl oz / ${cups.toFixed(1)} cups`} />
          </div>
        </div>
      )}
    </div>
  );
}
