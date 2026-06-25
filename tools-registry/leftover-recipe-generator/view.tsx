"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

type Recipe = { name: string; tags: string[]; time: string; steps: string };

const RECIPES: Recipe[] = [
  { name: "Fried Rice", tags: ["rice","egg","soy sauce","garlic","onion","vegetable","pea","carrot","scallion","sesame oil"], time: "15 min",
    steps: "Heat oil in a wok or large pan. Scramble the eggs and set aside. Sauté garlic, onion, and any vegetables. Add cold cooked rice, stir-fry 3–4 min, then season with soy sauce and sesame oil. Fold the eggs back in and serve hot." },
  { name: "Veggie Frittata", tags: ["egg","cheese","milk","onion","pepper","tomato","spinach","mushroom","zucchini"], time: "20 min",
    steps: "Whisk eggs with a splash of milk, salt, and pepper. Sauté chopped vegetables in an oven-safe pan. Pour the egg mixture over and cook 2–3 min. Transfer to a 375°F / 190°C oven for 10–12 min until set." },
  { name: "Pasta Toss", tags: ["pasta","garlic","olive oil","tomato","cheese","onion","pepper","mushroom","zucchini","basil"], time: "15 min",
    steps: "Cook pasta if it isn't already. Sauté garlic and chopped vegetables in olive oil. Add tomatoes and cook until soft. Toss in the cooked pasta, season with salt and pepper, and finish with grated cheese or fresh basil." },
  { name: "Chicken Stir-fry", tags: ["chicken","soy sauce","garlic","ginger","onion","pepper","carrot","broccoli","snap pea","cornstarch"], time: "20 min",
    steps: "Slice cooked or raw chicken thinly. Stir-fry in hot oil until golden. Add garlic, ginger, and vegetables. For a simple sauce, mix soy sauce with a little water and cornstarch. Pour over the chicken and toss until glossy." },
  { name: "Bean & Cheese Tacos", tags: ["beans","tortilla","cheese","tomato","onion","avocado","lime","cilantro","salsa","cumin"], time: "10 min",
    steps: "Warm beans with a pinch of cumin and chili powder. Warm tortillas. Assemble with beans, cheese, diced tomato, onion, avocado, and a squeeze of lime. Top with cilantro or salsa if you have it." },
  { name: "Omelette", tags: ["egg","cheese","butter","onion","pepper","spinach","mushroom","tomato","ham","herb"], time: "10 min",
    steps: "Beat 2–3 eggs with a pinch of salt. Melt butter in a non-stick pan. Pour in the eggs and swirl to cover the pan. Once the edges set, add fillings on one half. Fold and cook until the cheese melts." },
  { name: "Soup or Broth Bowl", tags: ["broth","potato","carrot","onion","garlic","celery","noodle","chicken","pea","pasta","spinach"], time: "25 min",
    steps: "Sauté chopped onion, garlic, celery, and carrot in a pot. Add broth and potatoes or other sturdy vegetables. Simmer 15 min. Add noodles or cooked chicken in the last 5 min. Season to taste." },
  { name: "Smoothie Bowl", tags: ["banana","yogurt","milk","berry","honey","oat","spinach","mango","peanut butter","chia"], time: "5 min",
    steps: "Blend frozen banana, berries, yogurt, and a splash of milk until thick and smooth. Pour into a bowl and top with oats, fresh fruit, honey, or seeds." },
  { name: "Grilled Cheese", tags: ["bread","cheese","butter","tomato","onion","mustard","ham","pickle"], time: "8 min",
    steps: "Butter the outside of two bread slices. Layer cheese and any extras (tomato, ham, mustard). Cook in a pan over medium heat, 2–3 min per side, until the bread is golden and the cheese is melted." },
  { name: "Tuna Salad Wrap", tags: ["tuna","mayonnaise","onion","celery","lemon","tortilla","lettuce","tomato","cucumber","mustard"], time: "5 min",
    steps: "Drain tuna and mix with mayonnaise, a squeeze of lemon, diced celery, and onion. Season with salt and pepper. Spread on a tortilla with lettuce, tomato, and cucumber, then roll tightly." },
  { name: "Rice Bowl", tags: ["rice","chicken","beef","tofu","egg","soy sauce","sesame oil","avocado","cucumber","carrot","kimchi"], time: "15 min",
    steps: "Reheat cooked rice. Top with protein, vegetables, and a fried egg if available. Drizzle with soy sauce and sesame oil. Mix everything together before eating." },
  { name: "Shakshuka", tags: ["egg","tomato","onion","garlic","pepper","cumin","paprika","bread","feta","parsley"], time: "25 min",
    steps: "Sauté onion, garlic, and peppers in a skillet. Add canned or fresh tomatoes and simmer with cumin and paprika until thick. Make wells in the sauce and crack eggs into them. Cover and cook until the whites are set." },
  { name: "Pizza Toast", tags: ["bread","tomato sauce","cheese","pepperoni","ham","mushroom","olive","oregano"], time: "10 min",
    steps: "Toast bread slices. Spread with tomato sauce, top with cheese and toppings. Broil or bake until the cheese is bubbly and starting to brown." },
  { name: "Banana Pancakes", tags: ["banana","egg","flour","milk","sugar","butter","vanilla","baking powder"], time: "15 min",
    steps: "Mash banana and mix with egg, flour, milk, and a pinch of baking powder. Cook spoonfuls in a buttered pan over medium heat, flipping when bubbles form." },
  { name: "Coconut Curry", tags: ["coconut milk","curry paste","chicken","tofu","vegetable","rice","onion","garlic","ginger"], time: "25 min",
    steps: "Sauté onion, garlic, and ginger. Add curry paste and cook 1 min. Pour in coconut milk and simmer with protein and vegetables. Serve over rice." },
  { name: "Casserole Bake", tags: ["pasta","rice","potato","chicken","cheese","cream","mushroom","broccoli","onion","bread crumb"], time: "35 min",
    steps: "Mix cooked starch, protein, and vegetables in a baking dish. Pour over a simple sauce of cream or broth with cheese. Top with breadcrumbs or more cheese and bake at 375°F / 190°C until bubbling." },
];

function parseIngredients(raw: string): string[] {
  return raw
    .toLowerCase()
    .split(/[,\n]+/)
    .map(s => s.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function scoreRecipe(recipe: Recipe, ingredients: string[]) {
  const ingSet = new Set(ingredients);
  let hits = 0;
  for (const tag of recipe.tags) {
    const found = ingredients.some(ing => ing.includes(tag) || tag.includes(ing));
    if (found) hits++;
  }
  const needRatio = hits / recipe.tags.length;
  const haveRatio = recipe.tags.filter(t => ingredients.some(ing => ing.includes(t) || t.includes(ing))).length / ingredients.length;
  return { hits, needRatio, haveRatio, score: needRatio * 2 + haveRatio };
}

export default function LeftoverRecipeGeneratorView({ variant }: ToolProps) {
  const [input, setInput] = useState("");
  const [matches, setMatches] = useState<{ recipe: Recipe; hits: number; missing: string[] }[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  const generate = () => {
    const ingredients = parseIngredients(input);
    if (ingredients.length === 0) return;

    const scored = RECIPES.map(r => {
      const { hits, needRatio } = scoreRecipe(r, ingredients);
      const matched = new Set<string>();
      const missing: string[] = [];
      for (const tag of r.tags) {
        const found = ingredients.some(ing => ing.includes(tag) || tag.includes(ing));
        if (found) matched.add(tag);
        else missing.push(tag);
      }
      return { recipe: r, hits, needRatio, missing, matchedCount: matched.size };
    })
    .filter(m => m.hits > 0)
    .sort((a, b) => b.needRatio - a.needRatio || b.hits - a.hits);

    setMatches(scored.slice(0, 6));
    setHasGenerated(true);
  };

  const vegetarianMode = variant === "vegetarian-leftover-variant";
  const quickMode = variant === "quick-meal-leftover-variant";

  return (
    <div className="space-y-6">
      {variant && (
        <p className="text-sm text-blue-600 font-medium">Mode: {variant}</p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What ingredients or leftovers do you have?
        </label>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (e.metaKey || e.ctrlKey) && generate()}
          placeholder="e.g. cooked rice, chicken, onion, soy sauce, egg"
          rows={4}
          className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-400 text-sm resize-none"
        />
        <p className="text-xs text-gray-400 mt-1">Separate ingredients with commas or new lines. Press Ctrl/Cmd + Enter to generate.</p>
      </div>

      <button
        onClick={generate}
        className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition-colors"
      >
        Generate recipe ideas
      </button>

      {hasGenerated && matches.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          No strong matches found. Try adding more ingredients like rice, pasta, egg, chicken, tomato, or cheese.
        </p>
      )}

      {matches.length > 0 && (
        <div className="space-y-4">
          {matches.map(({ recipe, hits, missing }) => {
            const skip = (vegetarianMode && recipe.tags.includes("chicken")) ||
                         (vegetarianMode && recipe.tags.includes("beef")) ||
                         (vegetarianMode && recipe.tags.includes("tuna")) ||
                         (quickMode && !recipe.time.includes("5") && !recipe.time.includes("10") && !recipe.time.includes("8"));
            if (skip) return null;

            return (
              <div key={recipe.name} className="p-5 rounded-xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">{recipe.name}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">⏱ {recipe.time}</span>
                    <span className="text-xs font-medium text-green-600">{hits}/{recipe.tags.length} matched</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {recipe.tags.map(tag => {
                    const matched = !missing.includes(tag);
                    return (
                      <span key={tag} className={`text-xs px-2 py-0.5 rounded-full ${matched ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"}`}>
                        {tag}
                      </span>
                    );
                  })}
                </div>
                <p className="text-sm text-gray-600">{recipe.steps}</p>
                <CopyButton text={`${recipe.name} (${recipe.time}): ${recipe.steps}`} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
