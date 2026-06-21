"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export interface ToolProps { variant?: string; }

type Person = { name: string; share: string };

export default function GroupTripCostSplitterView({ variant }: ToolProps) {
  const [total,   setTotal]   = useState("");
  const [mode,    setMode]    = useState<"equal"|"custom">("equal");
  const [people,  setPeople]  = useState<Person[]>([
    { name: "Person 1", share: "1" },
    { name: "Person 2", share: "1" },
    { name: "Person 3", share: "1" },
  ]);

  function updatePerson(i: number, field: keyof Person, val: string) {
    setPeople(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: val } : p));
  }
  function addPerson() { setPeople(p => [...p, { name: `Person ${p.length + 1}`, share: "1" }]); }
  function removePerson(i: number) { setPeople(p => p.filter((_, idx) => idx !== i)); }

  const T = parseFloat(total) || 0;
  const n = people.length;

  const totalShares = mode === "custom" ? people.reduce((s, p) => s + (parseFloat(p.share) || 0), 0) : n;
  const amounts = people.map(p => {
    if (mode === "equal") return T / n;
    const sh = parseFloat(p.share) || 0;
    return totalShares > 0 ? (sh / totalShares) * T : 0;
  });

  const fmt = (v: number) => v.toLocaleString("en-US", { style: "currency", currency: "USD" });

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Total Trip Cost ($)</label>
        <input type="number" value={total} onChange={e => setTotal(e.target.value)}
          placeholder="0.00"
          className="w-full border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-gray-400 text-lg" />
      </div>

      <div className="flex gap-2">
        {(["equal","custom"] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium capitalize transition-colors ${
              mode === m ? "bg-gray-900 text-white border-gray-900" : "border-gray-200 text-gray-700 hover:border-gray-400"
            }`}>
            {m === "equal" ? "Split Equally" : "Custom Shares"}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {people.map((p, i) => (
          <div key={i} className="flex gap-3 items-center">
            <input value={p.name} onChange={e => updatePerson(i, "name", e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400 text-sm" />
            {mode === "custom" && (
              <input type="number" value={p.share} min="0" onChange={e => updatePerson(i, "share", e.target.value)}
                placeholder="share"
                className="w-20 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-gray-400 text-sm" />
            )}
            {T > 0 && (
              <span className="text-sm font-semibold text-gray-900 w-20 text-right">{fmt(amounts[i])}</span>
            )}
            <button onClick={() => removePerson(i)} className="text-gray-300 hover:text-red-400 text-lg">×</button>
          </div>
        ))}
        <button onClick={addPerson} className="text-sm text-gray-400 hover:text-gray-700">+ Add person</button>
      </div>

      {T > 0 && (
        <div className="space-y-3">
          <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-600">
            Total <strong>{fmt(T)}</strong> split among <strong>{n} people</strong>
            {mode === "equal" ? ` equally = ` : ` by shares = `}
            <strong>{fmt(amounts[0])}</strong>{mode === "equal" ? " each" : " for " + people[0]?.name}
          </div>
          <div className="flex justify-end">
            <CopyButton text={people.map((p, i) => `${p.name}: ${fmt(amounts[i])}`).join(" | ")} />
          </div>
        </div>
      )}
    </div>
  );
}
