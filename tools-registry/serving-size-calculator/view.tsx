"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

type Ingredient = { name: string; amount: string; unit: string };

const UNITS = ["cup", "tbsp", "tsp", "oz", "lb", "g", "kg", "ml", "L", "piece"];

const DEFAULT: Ingredient[] = [
  { name: "Flour",  amount: "2",   unit: "cup"  },
  { name: "Sugar",  amount: "0.5", unit: "cup"  },
  { name: "Butter", amount: "4",   unit: "tbsp" },
  { name: "Eggs",   amount: "2",   unit: "piece"},
];

export default function ServingSizeCalculatorView({ variant }: ToolProps) {
  const [ingredients, setIngredients] = useState<Ingredient[]>(DEFAULT);
  const [origServ,    setOrigServ]    = useState("4");
  const [newServ,     setNewServ]     = useState("8");

  const ratio = (parseFloat(newServ) || 1) / (parseFloat(origServ) || 1);

  function update(i: number, field: keyof Ingredient, val: string) {
    setIngredients(prev => prev.map((ing, idx) => idx === i ? { ...ing, [field]: val } : ing));
  }
  function addRow() { setIngredients(p => [...p, { name: "", amount: "", unit: "cup" }]); }
  function removeRow(i: number) { setIngredients(p => p.filter((_, idx) => idx !== i)); }

  function fmtAmount(a: string): string {
    const v = parseFloat(a) * ratio;
    if (!v) return "—";
    if (v === Math.round(v)) return String(v);
    const fracs: [number, string][] = [[0.125,"⅛"],[0.25,"¼"],[0.333,"⅓"],[0.5,"½"],[0.667,"⅔"],[0.75,"¾"]];
    const whole = Math.floor(v);
    const dec = v - whole;
    const frac = fracs.reduce((best, [f, s]) => Math.abs(dec - f) < Math.abs(dec - best[0]) ? [f, s] : best, [dec, dec.toFixed(2)] as [number, string]);
    const fracStr = Math.abs(dec - frac[0]) < 0.05 ? frac[1] : v.toFixed(2);
    return whole > 0 && fracStr !== dec.toFixed(2) ? `${whole} ${fracStr}` : fracStr;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Original Servings</label>
          <input type="number" value={origServ} min="1" onChange={e => setOrigServ(e.target.value)}
            className="w-28 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400" />
        </div>
        <span className="text-gray-400 text-2xl mt-4">→</span>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Servings</label>
          <input type="number" value={newServ} min="1" onChange={e => setNewServ(e.target.value)}
            className="w-28 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400" />
        </div>
        <div className="mt-4 px-3 py-2 rounded-lg bg-gray-100 text-sm text-gray-600">
          Scale: <strong>×{ratio.toFixed(2)}</strong>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="pb-2 font-medium pr-3">Ingredient</th>
              <th className="pb-2 font-medium pr-3">Original</th>
              <th className="pb-2 font-medium pr-3">Unit</th>
              <th className="pb-2 font-medium text-blue-600">Scaled</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ingredients.map((ing, i) => (
              <tr key={i}>
                <td className="py-2 pr-3">
                  <input value={ing.name} onChange={e => update(i, "name", e.target.value)}
                    placeholder="Ingredient"
                    className="w-full border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-gray-400" />
                </td>
                <td className="py-2 pr-3">
                  <input type="number" value={ing.amount} onChange={e => update(i, "amount", e.target.value)}
                    className="w-20 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-gray-400" />
                </td>
                <td className="py-2 pr-3">
                  <select value={ing.unit} onChange={e => update(i, "unit", e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-gray-400">
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </td>
                <td className="py-2 pr-3 font-semibold text-blue-700">
                  {fmtAmount(ing.amount)} {ing.unit}
                </td>
                <td className="py-2">
                  <button onClick={() => removeRow(i)} className="text-gray-300 hover:text-red-400">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={addRow} className="text-sm text-gray-400 hover:text-gray-700 border border-dashed border-gray-300 rounded-lg px-4 py-2 w-full hover:border-gray-400 transition-colors">
        + Add ingredient
      </button>

      <div className="flex justify-end">
        <CopyButton text={ingredients.map(ing => `${ing.name}: ${fmtAmount(ing.amount)} ${ing.unit}`).join(", ")} />
      </div>
    </div>
  );
}
