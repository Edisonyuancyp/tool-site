"use client";

import { useState, useMemo, useEffect } from "react";

type UnitCategory = "length" | "weight" | "temperature";

interface UnitDef {
  id: string;
  label: string;
  factor?: number; // to base unit for length/weight; undefined for temperature
  toBase?: (v: number) => number;
  fromBase?: (v: number) => number;
}

interface UnitConverterProps {
  category: UnitCategory;
  defaultFrom: string;
  defaultTo: string;
  title?: string;
}

const BASE: Record<UnitCategory, { base: string; units: UnitDef[] }> = {
  length: {
    base: "m",
    units: [
      { id: "mm", label: "Millimeters (mm)", factor: 0.001 },
      { id: "cm", label: "Centimeters (cm)", factor: 0.01 },
      { id: "m", label: "Meters (m)", factor: 1 },
      { id: "km", label: "Kilometers (km)", factor: 1000 },
      { id: "inch", label: "Inches (in)", factor: 0.0254 },
      { id: "ft", label: "Feet (ft)", factor: 0.3048 },
      { id: "yd", label: "Yards (yd)", factor: 0.9144 },
      { id: "mi", label: "Miles (mi)", factor: 1609.344 },
    ],
  },
  weight: {
    base: "kg",
    units: [
      { id: "mg", label: "Milligrams (mg)", factor: 0.000001 },
      { id: "g", label: "Grams (g)", factor: 0.001 },
      { id: "kg", label: "Kilograms (kg)", factor: 1 },
      { id: "oz", label: "Ounces (oz)", factor: 0.0283495 },
      { id: "lb", label: "Pounds (lb)", factor: 0.453592 },
      { id: "st", label: "Stones (st)", factor: 6.35029 },
    ],
  },
  temperature: {
    base: "c",
    units: [
      { id: "c", label: "Celsius (°C)", toBase: (v) => v, fromBase: (v) => v },
      { id: "f", label: "Fahrenheit (°F)", toBase: (v) => (v - 32) * 5 / 9, fromBase: (v) => v * 9 / 5 + 32 },
      { id: "k", label: "Kelvin (K)", toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
    ],
  },
};

function fmt(n: number) {
  if (!isFinite(n) || isNaN(n)) return "";
  if (n === 0) return "0";
  return parseFloat(n.toFixed(4)).toString();
}

export default function UnitConverter({ category, defaultFrom, defaultTo, title }: UnitConverterProps) {
  const config = BASE[category];
  const [val, setVal] = useState("");
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);

  useEffect(() => {
    setFrom(defaultFrom);
    setTo(defaultTo);
  }, [defaultFrom, defaultTo]);

  const result = useMemo(() => {
    const num = parseFloat(val);
    if (val === "" || isNaN(num)) return null;

    const fromUnit = config.units.find((u) => u.id === from);
    const toUnit = config.units.find((u) => u.id === to);
    if (!fromUnit || !toUnit) return null;

    let base: number;
    if (category === "temperature") {
      base = fromUnit.toBase!(num);
    } else {
      base = num * (fromUnit.factor ?? 1);
    }

    let converted: number;
    if (category === "temperature") {
      converted = toUnit.fromBase!(base);
    } else {
      converted = base / (toUnit.factor ?? 1);
    }

    return converted;
  }, [val, from, to, category, config.units]);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div className="space-y-6">
      {title && <p className="text-sm text-gray-500">{title}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-end">
        {/* From */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">From</label>
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden focus-within:border-gray-400 bg-white transition-colors">
            <input
              type="number"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder="0"
              step="any"
              className="flex-1 px-4 py-3 text-xl font-mono focus:outline-none"
            />
          </div>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 bg-white"
          >
            {config.units.map((u) => (
              <option key={u.id} value={u.id}>{u.label}</option>
            ))}
          </select>
        </div>

        {/* Swap */}
        <div className="flex justify-center sm:pb-8">
          <button
            onClick={swap}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
            aria-label="Swap units"
          >
            ⇄
          </button>
        </div>

        {/* To */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-widest">To</label>
          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
            <input
              readOnly
              value={result !== null ? fmt(result) : ""}
              placeholder="—"
              className="flex-1 px-4 py-3 text-xl font-mono focus:outline-none bg-transparent"
            />
          </div>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 bg-white"
          >
            {config.units.map((u) => (
              <option key={u.id} value={u.id}>{u.label}</option>
            ))}
          </select>
        </div>
      </div>

      {result !== null && (
        <div className="p-5 rounded-xl border border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-500">
            {val} {config.units.find((u) => u.id === from)?.label.split(" (")[0]} ={" "}
            <span className="font-bold text-gray-900 text-lg">{fmt(result)}</span>{" "}
            {config.units.find((u) => u.id === to)?.label.split(" (")[0]}
          </p>
        </div>
      )}
    </div>
  );
}
