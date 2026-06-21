"use client";
import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export default function RandomNumberGenerator() {
  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [quantity, setQuantity] = useState("1");
  const [noDuplicates, setNoDuplicates] = useState(false);
  const [results, setResults] = useState<number[]>([]);
  const [error, setError] = useState("");

  const generate = () => {
    setError("");
    const minN = parseInt(min);
    const maxN = parseInt(max);
    const qty = Math.min(Math.max(parseInt(quantity) || 1, 1), 500);

    if (isNaN(minN) || isNaN(maxN)) {
      setError("Please enter valid min and max values.");
      return;
    }
    if (minN >= maxN) {
      setError("Min must be less than max.");
      return;
    }
    if (noDuplicates && qty > maxN - minN + 1) {
      setError(`Can't generate ${qty} unique numbers in range ${minN}–${maxN}.`);
      return;
    }

    const pool: number[] = [];
    if (noDuplicates) {
      const range = Array.from({ length: maxN - minN + 1 }, (_, i) => i + minN);
      for (let i = range.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [range[i], range[j]] = [range[j], range[i]];
      }
      setResults(range.slice(0, qty));
    } else {
      const arr = new Uint32Array(qty);
      crypto.getRandomValues(arr);
      for (const n of arr) {
        pool.push(minN + (n % (maxN - minN + 1)));
      }
      setResults(pool);
    }
  };

  const resultText = results.join(", ");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Min</label>
          <input
            type="number"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-gray-400 text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Max</label>
          <input
            type="number"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-gray-400 text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantity</label>
          <input
            type="number"
            value={quantity}
            min={1}
            max={500}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-gray-400 text-base"
          />
        </div>
      </div>

      <label className="flex items-center gap-2.5 cursor-pointer w-fit">
        <div
          onClick={() => setNoDuplicates(!noDuplicates)}
          className={`relative w-10 h-5 rounded-full transition-colors ${noDuplicates ? "bg-gray-900" : "bg-gray-200"}`}
        >
          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${noDuplicates ? "translate-x-5" : "translate-x-0.5"}`} />
        </div>
        <span className="text-sm text-gray-700">No duplicates</span>
      </label>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        onClick={generate}
        className="w-full sm:w-auto px-8 py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-colors text-base"
      >
        Generate
      </button>

      {results.length > 0 && (
        <div className="space-y-3">
          {results.length === 1 ? (
            <div className="text-center py-8">
              <p className="text-6xl font-bold text-gray-900">{results[0]}</p>
              <p className="text-sm text-gray-400 mt-2">Random number</p>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
              <div className="flex flex-wrap gap-2">
                {results.map((n, i) => (
                  <span key={i} className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-mono text-gray-900">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          )}
          <CopyButton text={resultText} />
        </div>
      )}
    </div>
  );
}
