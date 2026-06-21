"use client";
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RecentEntry {
  slug: string;
  visitedAt: number; // unix ms
}

export interface SavedPalette {
  id: string;           // nanoid-style
  name: string;
  colors: { role: string; hex: string }[];
  savedAt: number;
}

export interface SavedQuantConfig {
  id: string;
  label: string;        // user-facing name e.g. "BTC 1% rule"
  params: Record<string, string>;
  savedAt: number;
}

interface WorkbenchState {
  favorites: string[];
  recents: RecentEntry[];
  savedPalettes: SavedPalette[];
  savedQuantConfigs: SavedQuantConfig[];
  isFav: (slug: string) => boolean;
  toggleFav: (slug: string) => void;
  recordVisit: (slug: string) => void;
  clearRecents: () => void;
  savePalette: (p: Omit<SavedPalette, "id" | "savedAt">) => void;
  deletePalette: (id: string) => void;
  saveQuantConfig: (c: Omit<SavedQuantConfig, "id" | "savedAt">) => void;
  deleteQuantConfig: (id: string) => void;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

const KEYS = { favs: "wb_favs", recents: "wb_recents", palettes: "wb_palettes", quant: "wb_quant" } as const;

function uid() {
  return Math.random().toString(36).slice(2, 10);
}
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
  const [favorites,        setFavorites]        = useState<string[]>([]);
  const [recents,          setRecents]          = useState<RecentEntry[]>([]);
  const [savedPalettes,    setSavedPalettes]    = useState<SavedPalette[]>([]);
  const [savedQuantConfigs,setSavedQuantConfigs]= useState<SavedQuantConfig[]>([]);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    setFavorites(load<string[]>(KEYS.favs, []));
    setRecents(load<RecentEntry[]>(KEYS.recents, []));
    setSavedPalettes(load<SavedPalette[]>(KEYS.palettes, []));
    setSavedQuantConfigs(load<SavedQuantConfig[]>(KEYS.quant, []));

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

  const savePalette = useCallback((p: Omit<SavedPalette, "id" | "savedAt">) => {
    setSavedPalettes((prev) => {
      const next = [{ ...p, id: uid(), savedAt: Date.now() }, ...prev].slice(0, 20);
      save(KEYS.palettes, next);
      return next;
    });
  }, []);

  const deletePalette = useCallback((id: string) => {
    setSavedPalettes((prev) => {
      const next = prev.filter((p) => p.id !== id);
      save(KEYS.palettes, next);
      return next;
    });
  }, []);

  const saveQuantConfig = useCallback((c: Omit<SavedQuantConfig, "id" | "savedAt">) => {
    setSavedQuantConfigs((prev) => {
      const next = [{ ...c, id: uid(), savedAt: Date.now() }, ...prev].slice(0, 20);
      save(KEYS.quant, next);
      return next;
    });
  }, []);

  const deleteQuantConfig = useCallback((id: string) => {
    setSavedQuantConfigs((prev) => {
      const next = prev.filter((c) => c.id !== id);
      save(KEYS.quant, next);
      return next;
    });
  }, []);

  return (
    <WorkbenchContext.Provider value={{
      favorites, recents, savedPalettes, savedQuantConfigs,
      isFav, toggleFav, recordVisit, clearRecents,
      savePalette, deletePalette, saveQuantConfig, deleteQuantConfig,
    }}>
      {children}
    </WorkbenchContext.Provider>
  );
}

export function useWorkbench(): WorkbenchState {
  const ctx = useContext(WorkbenchContext);
  if (!ctx) throw new Error("useWorkbench must be used inside <WorkbenchProvider>");
  return ctx;
}
