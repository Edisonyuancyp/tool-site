"use client";
import { useState, useEffect } from "react";

const STORAGE_KEY = "fav_tools";

function getFavs(): string[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); }
  catch { return []; }
}
function setFavs(favs: string[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(favs)); }
  catch {}
}

export function useFavorites() {
  const [favs, setFavsState] = useState<string[]>([]);

  useEffect(() => {
    setFavsState(getFavs());
    const handler = () => setFavsState(getFavs());
    window.addEventListener("favs-updated", handler);
    return () => window.removeEventListener("favs-updated", handler);
  }, []);

  function toggle(slug: string) {
    const next = favs.includes(slug)
      ? favs.filter((s) => s !== slug)
      : [...favs, slug];
    setFavs(next);
    setFavsState(next);
    window.dispatchEvent(new Event("favs-updated"));
  }

  return { favs, toggle };
}

export default function FavoriteButton({ slug }: { slug: string }) {
  const { favs, toggle } = useFavorites();
  const isFav = favs.includes(slug);

  return (
    <button
      onClick={() => toggle(slug)}
      aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
      title={isFav ? "Remove from favorites" : "Save this tool"}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-sm transition-all ${
        isFav
          ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
          : "border-gray-200 bg-white text-gray-400 hover:border-red-300 hover:text-red-400 hover:bg-red-50"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={isFav ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        className="w-4 h-4"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
      <span className="hidden sm:inline">{isFav ? "Saved" : "Save"}</span>
    </button>
  );
}
