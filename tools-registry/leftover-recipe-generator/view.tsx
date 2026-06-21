"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

type Recipe = { name: string; match: string[]; time: string; steps: string };

const RECIPES: Recipe[] = [
  { name: "Fried Rice", match: ["rice","egg","soy sauce","garlic","onion","vegetables","peas","carrot"], time: "15 min",
    steps: "Heat oil in a wok. Scramble eggs, set aside. Fry garlic & onion. Add cold rice and veggies. Stir-fry 3–4 min. Add soy sauce and eggs back in." },
  { name: "Veggie Frittata", match: ["egg","cheese","milk","onion","pepper","tomato","spinach","mushroom"], time: "20 min",
    steps: "Whisk eggs with milk, salt, pepper. Sauté veggies in oven-safe pan. Pour egg mixture over. Cook 3 min then bake at 375°F for 10–12 min." },
  { name: "Pasta Stir-fry", match: ["pasta","garlic","olive oil","tomato","cheese","onion","pepper","mushroom"], time: "15 min",
    steps: "Cook pasta if needed. Sauté garlic in olive oil. Add veggies and tomatoes. Toss cooked pasta in, season, top with cheese." },
  { name: "Chicken Stir-fry", match: ["chicken","soy sauce","garlic","ginger","onion","pepper","carrot","broccoli"], time: "20 min",
    steps: "Slice chicken thinly. Stir-fry in hot oil 5 min. Add garlic, ginger, veggies. Sauce: soy sauce + splash of water. Serve over rice." },
  { name: "Bean Tacos", match: ["beans","tortilla","cheese","tomato","onion","avocado","lime","cilantro"], time: "10 min",
    steps: "Warm beans with cumin and chili powder. Warm tortillas. Assemble with beans, cheese, diced tomato, onion, avocado, and lime juice." },
  { name: "Omelette", match: ["egg","cheese","butter","onion","pepper","spinach","mushroom","tomato"], time: "10 min",
    steps: "Beat 2–3 eggs with salt. Melt butter in pan, pour eggs. When edges set, add fillings on one side. Fold and serve." },
  { name: "Soup / Broth Bowl", match: ["broth","potato","carrot","onion","garlic","celery","noodle","chicken","pea"], time: "25 min",
    steps: "Sauté aromatics in a pot. Add broth and chopped vegetables. Simmer 15 min. Add noodles last 5 min. Season to taste." },
  { name: "Smoothie Bowl", match: ["banana","yogurt","milk","berries","honey","oats","spinach","mango"], time: "5 min",
    steps: "Blend frozen banana, berries, yogurt and splash of milk until thick. Pour into bowl. Top with oats, fresh fruit, and honey." },
  { name: "Grilled Cheese Sandwich", match: ["bread","cheese","butter","tomato","onion","mustard"], time: "8 min",
    steps: "Butter outside of bread slices. Layer cheese (and optionally tomato/onion). Cook in pan over medium heat 2–3 min per side until golden." },
  { name: "Tuna Salad Wrap", match: ["tuna","mayo","onion","celery","lemon","tortilla","lettuce","tomato"], time: "5 min",
    steps: "Mix tuna with mayo, lemon juice, diced celery and onion. Season. Spread on tortilla with lettuce and tomato. Roll and serve." },
];

const COMMON_INGREDIENTS = ["egg","rice","chicken","pasta","potato","bread","tomato","cheese","onion","garlic","carrot","spinach","beans","tuna","banana","yogurt"];

export default function LeftoverRecipeGeneratorView({ variant }: ToolProps) {
  const [selected, setSelected]   = useState<Set<string>>(new Set());
  const [customInput, setCustom]  = useState("");

  function toggle(ing: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(ing) ? next.delete(ing) : next.add(ing);
      return next;
    });
  }
  function addCustom() {
    const v = customInput.trim().toLowerCase();
    if (v) { toggle(v); setCustom(""); }
  }

  const selectedArr = [...selected];
  const matches = RECIPES.map(r => {
    const hits = r.match.filter(m => selectedArr.some(s => s.includes(m) || m.includes(s)));
    return { ...r, hits, pct: hits.length / r.match.length };
  }).filter(r => r.hits.length > 0).sort((a, b) => b.hits.length - a.hits.length);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">What ingredients do you have?</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {COMMON_INGREDIENTS.map(ing => (
            <button key={ing} onClick={() => toggle(ing)}
              className={`px-3 py-1.5 rounded-full border text-sm capitalize transition-colors ${
                selected.has(ing) ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-700 hover:border-gray-400"
              }`}>
              {ing}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={customInput} onChange={e => setCustom(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addCustom()}
            placeholder="Add another ingredient…"
            className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400 text-sm" />
          <button onClick={addCustom} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-black">Add</button>
        </div>
        {selectedArr.filter(s => !COMMON_INGREDIENTS.includes(s)).length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedArr.filter(s => !COMMON_INGREDIENTS.includes(s)).map(s => (
              <span key={s} onClick={() => toggle(s)} className="px-3 py-1 rounded-full bg-gray-900 text-white text-sm cursor-pointer">
                {s} ×
              </span>
            ))}
          </div>
        )}
      </div>

      {selectedArr.length > 0 && matches.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">No matching recipes found. Try adding more ingredients.</p>
      )}

      {matches.length > 0 && (
        <div className="space-y-4">
          {matches.map(r => (
            <div key={r.name} className="p-5 rounded-xl border border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900">{r.name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">⏱ {r.time}</span>
                  <span className="text-xs font-medium text-gray-500">{r.hits.length}/{r.match.length} ingredients</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {r.match.map(m => (
                  <span key={m} className={`text-xs px-2 py-0.5 rounded-full ${r.hits.includes(m) ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                    {m}
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-600">{r.steps}</p>
              <CopyButton text={`${r.name} (${r.time}): ${r.steps}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
