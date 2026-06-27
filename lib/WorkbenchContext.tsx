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

export interface ToolCollection {
  id: string;
  name: string;
  emoji: string;
  slugs: string[];      // ordered list of tool slugs
  createdAt: number;
}

export type BoardWidgetSize = "small" | "medium" | "large";

export interface BoardWidget {
  id: string;
  slug: string;
  size: BoardWidgetSize;
  createdAt: number;
}

interface WorkbenchState {
  favorites: string[];
  recents: RecentEntry[];
  savedPalettes: SavedPalette[];
  savedQuantConfigs: SavedQuantConfig[];
  collections: ToolCollection[];
  boardWidgets: BoardWidget[];
  onboardingDone: boolean;
  isFav: (slug: string) => boolean;
  toggleFav: (slug: string) => void;
  recordVisit: (slug: string) => void;
  clearRecents: () => void;
  savePalette: (p: Omit<SavedPalette, "id" | "savedAt">) => void;
  deletePalette: (id: string) => void;
  saveQuantConfig: (c: Omit<SavedQuantConfig, "id" | "savedAt">) => void;
  deleteQuantConfig: (id: string) => void;
  createCollection: (name: string, emoji: string, slugs?: string[]) => string;
  deleteCollection: (id: string) => void;
  renameCollection: (id: string, name: string, emoji: string) => void;
  addToCollection: (collectionId: string, slug: string) => void;
  removeFromCollection: (collectionId: string, slug: string) => void;
  reorderCollection: (collectionId: string, slugs: string[]) => void;
  addBoardWidget: (slug: string, size?: BoardWidgetSize) => void;
  removeBoardWidget: (id: string) => void;
  reorderBoardWidgets: (fromIndex: number, toIndex: number) => void;
  resizeBoardWidget: (id: string, size: BoardWidgetSize) => void;
  resetBoard: (slugs?: string[]) => void;
  markOnboardingDone: () => void;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

const KEYS = {
  favs: "wb_favs", recents: "wb_recents", palettes: "wb_palettes",
  quant: "wb_quant", collections: "wb_collections", onboarding: "wb_onboarding",
  board: "wb_board",
} as const;

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
  const [collections,      setCollections]      = useState<ToolCollection[]>([]);
  const [boardWidgets,     setBoardWidgets]     = useState<BoardWidget[]>([]);
  const [onboardingDone,   setOnboardingDone]   = useState(false);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    setFavorites(load<string[]>(KEYS.favs, []));
    setRecents(load<RecentEntry[]>(KEYS.recents, []));
    setSavedPalettes(load<SavedPalette[]>(KEYS.palettes, []));
    setSavedQuantConfigs(load<SavedQuantConfig[]>(KEYS.quant, []));
    setCollections(load<ToolCollection[]>(KEYS.collections, []));
    setBoardWidgets(load<BoardWidget[]>(KEYS.board, []));
    setOnboardingDone(load<boolean>(KEYS.onboarding, false));

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

  const createCollection = useCallback((name: string, emoji: string, slugs: string[] = []): string => {
    const id = uid();
    setCollections((prev) => {
      const next = [{ id, name, emoji, slugs, createdAt: Date.now() }, ...prev];
      save(KEYS.collections, next);
      return next;
    });
    return id;
  }, []);

  const deleteCollection = useCallback((id: string) => {
    setCollections((prev) => {
      const next = prev.filter((c) => c.id !== id);
      save(KEYS.collections, next);
      return next;
    });
  }, []);

  const renameCollection = useCallback((id: string, name: string, emoji: string) => {
    setCollections((prev) => {
      const next = prev.map((c) => c.id === id ? { ...c, name, emoji } : c);
      save(KEYS.collections, next);
      return next;
    });
  }, []);

  const addToCollection = useCallback((collectionId: string, slug: string) => {
    setCollections((prev) => {
      const next = prev.map((c) =>
        c.id === collectionId && !c.slugs.includes(slug)
          ? { ...c, slugs: [...c.slugs, slug] }
          : c
      );
      save(KEYS.collections, next);
      return next;
    });
  }, []);

  const removeFromCollection = useCallback((collectionId: string, slug: string) => {
    setCollections((prev) => {
      const next = prev.map((c) =>
        c.id === collectionId ? { ...c, slugs: c.slugs.filter((s) => s !== slug) } : c
      );
      save(KEYS.collections, next);
      return next;
    });
  }, []);

  const reorderCollection = useCallback((collectionId: string, slugs: string[]) => {
    setCollections((prev) => {
      const next = prev.map((c) => c.id === collectionId ? { ...c, slugs } : c);
      save(KEYS.collections, next);
      return next;
    });
  }, []);

  const addBoardWidget = useCallback((slug: string, size: BoardWidgetSize = "medium") => {
    setBoardWidgets((prev) => {
      const next = [...prev, { id: uid(), slug, size, createdAt: Date.now() }];
      save(KEYS.board, next);
      return next;
    });
  }, []);

  const removeBoardWidget = useCallback((id: string) => {
    setBoardWidgets((prev) => {
      const next = prev.filter((w) => w.id !== id);
      save(KEYS.board, next);
      return next;
    });
  }, []);

  const reorderBoardWidgets = useCallback((fromIndex: number, toIndex: number) => {
    setBoardWidgets((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      save(KEYS.board, next);
      return next;
    });
  }, []);

  const resizeBoardWidget = useCallback((id: string, size: BoardWidgetSize) => {
    setBoardWidgets((prev) => {
      const next = prev.map((w) => w.id === id ? { ...w, size } : w);
      save(KEYS.board, next);
      return next;
    });
  }, []);

  const resetBoard = useCallback((slugs?: string[]) => {
    const next: BoardWidget[] = (slugs ?? []).map((slug) => ({
      id: uid(), slug, size: "medium", createdAt: Date.now(),
    }));
    save(KEYS.board, next);
    setBoardWidgets(next);
  }, []);

  const markOnboardingDone = useCallback(() => {
    save(KEYS.onboarding, true);
    setOnboardingDone(true);
  }, []);

  return (
    <WorkbenchContext.Provider value={{
      favorites, recents, savedPalettes, savedQuantConfigs, collections, boardWidgets, onboardingDone,
      isFav, toggleFav, recordVisit, clearRecents,
      savePalette, deletePalette, saveQuantConfig, deleteQuantConfig,
      createCollection, deleteCollection, renameCollection,
      addToCollection, removeFromCollection, reorderCollection,
      addBoardWidget, removeBoardWidget, reorderBoardWidgets, resizeBoardWidget, resetBoard,
      markOnboardingDone,
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
