"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

type FoodItem = {
  name: string;
  methods: { label: string; minPerLb: number; temp: string }[];
  internalTemp: string;
};

const FOODS: FoodItem[] = [
  {
    name: "Whole Chicken",
    internalTemp: "165°F (74°C)",
    methods: [
      { label: "Oven Roast", minPerLb: 20, temp: "375°F (190°C)" },
      { label: "Grill",      minPerLb: 15, temp: "Medium-High"   },
    ],
  },
  {
    name: "Beef Roast",
    internalTemp: "145°F (63°C) medium",
    methods: [
      { label: "Oven (rare)",     minPerLb: 15, temp: "325°F (165°C)" },
      { label: "Oven (medium)",   minPerLb: 20, temp: "325°F (165°C)" },
      { label: "Oven (well done)",minPerLb: 25, temp: "325°F (165°C)" },
    ],
  },
  {
    name: "Pork Loin",
    internalTemp: "145°F (63°C)",
    methods: [
      { label: "Oven Roast", minPerLb: 20, temp: "350°F (175°C)" },
      { label: "Grill",      minPerLb: 18, temp: "Medium"        },
    ],
  },
  {
    name: "Turkey",
    internalTemp: "165°F (74°C)",
    methods: [
      { label: "Oven (unstuffed)", minPerLb: 13, temp: "325°F (165°C)" },
      { label: "Oven (stuffed)",   minPerLb: 15, temp: "325°F (165°C)" },
    ],
  },
  {
    name: "Salmon Fillet",
    internalTemp: "145°F (63°C)",
    methods: [
      { label: "Oven Bake", minPerLb: 10, temp: "400°F (200°C)" },
      { label: "Pan Sear",  minPerLb: 6,  temp: "Medium-High"   },
    ],
  },
];

export default function CookingTimeCalculatorView({ variant }: ToolProps) {
  const [foodIdx,   setFoodIdx]   = useState(0);
  const [methodIdx, setMethodIdx] = useState(0);
  const [weight,    setWeight]    = useState("");
  const [unit,      setUnit]      = useState<"lbs"|"kg">("lbs");

  const food   = FOODS[foodIdx];
  const method = food.methods[Math.min(methodIdx, food.methods.length - 1)];

  const weightLbs = unit === "lbs" ? parseFloat(weight) || 0 : (parseFloat(weight) || 0) * 2.20462;
  const totalMins = Math.round(weightLbs * method.minPerLb);
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;

  const restMins = food.name.includes("Chicken") || food.name.includes("Turkey") ? 10 :
                   food.name.includes("Beef") || food.name.includes("Pork") ? 15 : 3;

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Food Type</label>
        <div className="flex flex-wrap gap-2">
          {FOODS.map((f, i) => (
            <button key={f.name} onClick={() => { setFoodIdx(i); setMethodIdx(0); }}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                foodIdx === i ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-700 hover:border-gray-400"
              }`}>
              {f.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Cooking Method</label>
        <div className="flex flex-wrap gap-2">
          {food.methods.map((m, i) => (
            <button key={m.label} onClick={() => setMethodIdx(i)}
              className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                methodIdx === i ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-700 hover:border-gray-400"
              }`}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Weight</label>
        <div className="flex gap-2">
          <input type="number" value={weight} onChange={e => setWeight(e.target.value)}
            placeholder="0.0"
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {(["lbs","kg"] as const).map(u => (
              <button key={u} onClick={() => setUnit(u)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${unit === u ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"}`}>
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>

      {weightLbs > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl border border-gray-900 bg-gray-900 text-center">
              <p className="text-sm text-gray-400 mb-1">Cook Time</p>
              <p className="text-3xl font-bold text-white">{hrs > 0 ? `${hrs}h ` : ""}{mins}m</p>
            </div>
            <div className="p-5 rounded-xl border border-gray-200 bg-gray-50 text-center">
              <p className="text-sm text-gray-500 mb-1">Oven / Heat</p>
              <p className="text-lg font-bold text-gray-900">{method.temp}</p>
            </div>
            <div className="p-5 rounded-xl border border-gray-200 bg-gray-50 text-center">
              <p className="text-sm text-gray-500 mb-1">Rest After Cooking</p>
              <p className="text-lg font-bold text-gray-900">{restMins} min</p>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 text-sm text-amber-800">
            <strong>Target internal temp:</strong> {food.internalTemp} — always verify with a meat thermometer.
          </div>
          <div className="flex justify-end">
            <CopyButton text={`${food.name} (${weight}${unit}) — ${method.label}: ${hrs > 0 ? `${hrs}h ` : ""}${mins}m at ${method.temp}. Rest ${restMins}min.`} />
          </div>
        </div>
      )}
    </div>
  );
}
