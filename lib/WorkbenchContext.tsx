"use client";
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RecentEntry {
  slug: string;
  visitedAt: number; // unix ms
}

interface WorkbenchState {
  favorites: string[];          // slugs
  recents: RecentEntry[];       // last 10, newest first
  isFav: (slug: string) => boolean;
  toggleFav: (slug: string) => void;
  recordVisit: (slug: string) => void;
  clearRecents: () => void;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

const KEYS = { favs: "wb_favs", recents: "wb_recents" } as const;
const MAX_RECENTS = 10;

function load<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback; }
  catch { return fallback; }
}
function save(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

// ─── Context ──────────────────────────────────────────────────────────────────

const WorkbenchContext = createContext<WorkbenchState | null>(null);

export function WorkbenchProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recents,   setRecents]   = useState<RecentEntry[]>([]);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    setFavorites(load<string[]>(KEYS.favs, []));
    setRecents(load<RecentEntry[]>(KEYS.recents, []));

    // Migrate legacy "fav_tools" key if present
    try {
      const legacy = localStorage.getItem("fav_tools");
      if (legacy) {
        const legacySlugs: string[] = JSON.parse(legacy);
        if (legacySlugs.length) {
          const current = load<string[]>(KEYS.favs, []);
          const merged = [...new Set([...current, ...legacySlugs])];
          save(KEYS.favs, merged);
          setFavorites(merged);
          localStorage.removeItem("fav_tools");
        }
      }
    } catch {}
  }, []);

  const isFav = useCallback((slug: string) => favorites.includes(slug), [favorites]);

  const toggleFav = useCallback((slug: string) => {
    setFavorites((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug];
      save(KEYS.favs, next);
      return next;
    });
  }, []);

  const recordVisit = useCallback((slug: string) => {
    setRecents((prev) => {
      const filtered = prev.filter((r) => r.slug !== slug);
      const next = [{ slug, visitedAt: Date.now() }, ...filtered].slice(0, MAX_RECENTS);
      save(KEYS.recents, next);
      return next;
    });
  }, []);

  const clearRecents = useCallback(() => {
    save(KEYS.recents, []);
    setRecents([]);
  }, []);

  return (
    <WorkbenchContext.Provider value={{ favorites, recents, isFav, toggleFav, recordVisit, clearRecents }}>
      {children}
    </WorkbenchContext.Provider>
  );
}

export function useWorkbench(): WorkbenchState {
  const ctx = useContext(WorkbenchContext);
  if (!ctx) throw new Error("useWorkbench must be used inside <WorkbenchProvider>");
  return ctx;
}
