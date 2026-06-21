"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

type Sub = { amount: string; sub: string; notes: string };
type Entry = { tags: string[]; subs: Sub[] };

const DB: Record<string, Entry> = {
  "buttermilk": {
    tags: ["dairy","baking"],
    subs: [
      { amount: "1 cup", sub: "1 cup milk + 1 tbsp lemon juice or vinegar", notes: "Let sit 5 min to curdle." },
      { amount: "1 cup", sub: "1 cup plain yogurt", notes: "Thin with a splash of milk if needed." },
      { amount: "1 cup", sub: "¾ cup sour cream + ¼ cup milk", notes: "Good for thick batters." },
    ],
  },
  "butter": {
    tags: ["dairy","fat","baking"],
    subs: [
      { amount: "1 cup", sub: "¾ cup olive oil or vegetable oil", notes: "Reduces saturated fat." },
      { amount: "1 cup", sub: "1 cup coconut oil", notes: "Solid at room temp like butter." },
      { amount: "1 cup", sub: "¾ cup unsweetened applesauce", notes: "Reduces fat in quick breads/muffins." },
    ],
  },
  "egg": {
    tags: ["protein","baking","binding"],
    subs: [
      { amount: "1 egg", sub: "3 tbsp aquafaba (chickpea liquid)", notes: "Best for meringues and binding." },
      { amount: "1 egg", sub: "1 tbsp ground flaxseed + 3 tbsp water", notes: "Let sit 5 min. Good for dense baked goods." },
      { amount: "1 egg", sub: "¼ cup unsweetened applesauce", notes: "Adds moisture and slight sweetness." },
      { amount: "1 egg", sub: "¼ cup mashed banana", notes: "Adds banana flavor." },
    ],
  },
  "flour (all-purpose)": {
    tags: ["baking","gluten"],
    subs: [
      { amount: "1 cup", sub: "1 cup + 2 tbsp cake flour", notes: "Lower protein, more tender results." },
      { amount: "1 cup", sub: "½ cup whole wheat + ½ cup AP flour", notes: "More fiber, denser texture." },
      { amount: "1 cup", sub: "1 cup oat flour", notes: "Gluten-free if certified GF oats." },
    ],
  },
  "sugar (white)": {
    tags: ["sweetener","baking"],
    subs: [
      { amount: "1 cup", sub: "¾ cup honey or maple syrup", notes: "Reduce other liquids by 3 tbsp and lower oven temp 25°F." },
      { amount: "1 cup", sub: "1 cup coconut sugar", notes: "1:1 swap, slightly caramel flavor." },
      { amount: "1 cup", sub: "¾ cup agave nectar", notes: "Sweeter than sugar; reduce liquid slightly." },
    ],
  },
  "heavy cream": {
    tags: ["dairy","fat"],
    subs: [
      { amount: "1 cup", sub: "¾ cup milk + ¼ cup melted butter", notes: "Best for cooking and sauces." },
      { amount: "1 cup", sub: "1 cup coconut cream", notes: "Dairy-free. Works in most recipes." },
      { amount: "1 cup", sub: "1 cup evaporated milk", notes: "Lower fat, good for sauces and soups." },
    ],
  },
  "baking powder": {
    tags: ["leavening","baking"],
    subs: [
      { amount: "1 tsp", sub: "¼ tsp baking soda + ½ tsp cream of tartar", notes: "Use immediately once mixed." },
      { amount: "1 tsp", sub: "¼ tsp baking soda + ½ cup yogurt or buttermilk", notes: "Reduce other liquid by ½ cup." },
    ],
  },
  "sour cream": {
    tags: ["dairy"],
    subs: [
      { amount: "1 cup", sub: "1 cup plain Greek yogurt", notes: "Very close substitute, tangier." },
      { amount: "1 cup", sub: "¾ cup cream cheese + ¼ cup milk", notes: "Richer flavor." },
    ],
  },
  "olive oil": {
    tags: ["fat","cooking"],
    subs: [
      { amount: "1 cup", sub: "1 cup avocado oil", notes: "High smoke point, neutral flavor." },
      { amount: "1 cup", sub: "1 cup melted coconut oil", notes: "May add slight coconut flavor." },
      { amount: "1 cup", sub: "1 cup vegetable or canola oil", notes: "Neutral flavor, widely available." },
    ],
  },
  "milk": {
    tags: ["dairy"],
    subs: [
      { amount: "1 cup", sub: "1 cup oat milk", notes: "Closest in texture and flavor." },
      { amount: "1 cup", sub: "1 cup almond milk", notes: "Thinner; slightly nutty." },
      { amount: "1 cup", sub: "1 cup soy milk", notes: "Closest in protein content." },
    ],
  },
};

const ALL_KEYS = Object.keys(DB).sort();

export default function IngredientSubstitutionCalculatorView({ variant }: ToolProps) {
  const [query, setQuery]   = useState("");
  const [amount, setAmount] = useState("1");
  const [unit,   setUnit]   = useState("cup");

  const q = query.toLowerCase().trim();
  const exact = DB[q];
  const suggestions = q.length > 1 ? ALL_KEYS.filter(k => k.includes(q) && k !== q) : [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Ingredient to substitute</label>
          <input value={query} onChange={e => setQuery(e.target.value)}
            placeholder="e.g. buttermilk, egg, flour…"
            list="ing-list"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400" />
          <datalist id="ing-list">
            {ALL_KEYS.map(k => <option key={k} value={k} />)}
          </datalist>
        </div>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} step="0.25"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-gray-400" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Unit</label>
            <select value={unit} onChange={e => setUnit(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-gray-400">
              {["cup","tbsp","tsp","oz","g","ml","piece"].map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
        </div>
      </div>

      {suggestions.length > 0 && !exact && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-400 mr-1 self-center">Did you mean:</span>
          {suggestions.slice(0, 5).map(s => (
            <button key={s} onClick={() => setQuery(s)}
              className="text-sm px-3 py-1 rounded-full border border-gray-200 hover:border-gray-400 capitalize">
              {s}
            </button>
          ))}
        </div>
      )}

      {q && !exact && suggestions.length === 0 && (
        <p className="text-sm text-gray-400">No substitutes found for "{q}". Try a different spelling.</p>
      )}

      {exact && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700 capitalize">
            Substitutes for <strong>{amount} {unit}</strong> of <strong>{q}</strong>:
          </p>
          {exact.subs.map((s, i) => (
            <div key={i} className="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-1">
              <p className="font-semibold text-gray-900 text-sm">{s.sub}</p>
              {s.notes && <p className="text-xs text-gray-500">{s.notes}</p>}
              <CopyButton text={`Instead of ${amount} ${unit} ${q}: use ${s.sub}. ${s.notes}`} />
            </div>
          ))}
          <div className="flex flex-wrap gap-1 pt-1">
            {exact.tags.map(t => (
              <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize">{t}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
