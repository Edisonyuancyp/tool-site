"use client";

import { useState, useEffect, useRef } from "react";

const SEARCH_HINTS = [
  "BMI calculator",
  "compound interest",
  "tip calculator",
  "password generator",
  "base64 encoder",
  "FBA packing",
  "currency converter",
  "age calculator",
  "scientific calculator",
  "sleep calculator",
  "calorie calculator",
  "mortgage calculator",
  "unit converter",
  "QR code generator",
  "loan calculator",
  "body fat calculator",
  "discount calculator",
  "unix timestamp",
];

export default function HeroSearch() {
  const [query, setQuery]     = useState("");
  const [hintIdx, setHintIdx] = useState(0);
  const [fading, setFading]   = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHintIdx(Math.floor(Math.random() * SEARCH_HINTS.length));
    timerRef.current = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setHintIdx(i => (i + 1) % SEARCH_HINTS.length);
        setFading(false);
      }, 250);
    }, 3000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    // Scroll down to ToolGrid and let it filter
    const grid = document.getElementById("tool-grid");
    if (grid) grid.scrollIntoView({ behavior: "smooth", block: "start" });
    // Dispatch a custom event so ToolGrid can pick up the query
    window.dispatchEvent(new CustomEvent("hero-search", { detail: query.trim() }));
  };

  return (
    <form onSubmit={handleSubmit} className="relative mt-8 max-w-2xl mx-auto">
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
      </svg>
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={query === "" ? `Try "${SEARCH_HINTS[hintIdx]}"…` : ""}
        className={`w-full pl-12 pr-24 py-4 rounded-2xl border border-gray-200 bg-white text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 shadow-md transition-all ${
          fading ? "placeholder-opacity-0" : "placeholder-opacity-100"
        }`}
      />
      {query && (
        <button
          type="button"
          onClick={() => { setQuery(""); inputRef.current?.focus(); }}
          className="absolute right-20 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
          aria-label="Clear"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-gray-900 text-white text-sm font-medium hover:bg-gray-700 transition-colors"
      >
        Search
      </button>
    </form>
  );
}
