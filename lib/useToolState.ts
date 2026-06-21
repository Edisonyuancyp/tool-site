"use client";
import { useCallback, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

/**
 * useToolState — syncs a plain object of params to/from URL search params.
 *
 * Usage:
 *   const [state, setState] = useToolState({ balance: "10000", risk: "1" });
 *
 * - On mount: reads URL params, merges over defaults
 * - On setState: updates URL (replaceState, no history entry)
 * - Returned setState is stable (useCallback)
 */
export function useToolState<T extends Record<string, string>>(
  defaults: T
): [T, (patch: Partial<T>) => void] {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const stateRef = useRef<T>({ ...defaults });

  // Hydrate from URL on first render
  const hydrated = (() => {
    const merged = { ...defaults } as T;
    for (const key of Object.keys(defaults)) {
      const val = searchParams?.get(key);
      if (val !== null && val !== undefined) {
        (merged as Record<string, string>)[key] = val;
      }
    }
    return merged;
  })();

  stateRef.current = hydrated;

  const setState = useCallback(
    (patch: Partial<T>) => {
      const next = { ...stateRef.current, ...patch } as T;
      stateRef.current = next;

      // Build new URL
      const params = new URLSearchParams();
      for (const [k, v] of Object.entries(next)) {
        if (v !== undefined && v !== null && v !== "") {
          params.set(k, String(v));
        }
      }
      const newUrl = `${pathname}?${params.toString()}`;
      window.history.replaceState(null, "", newUrl);
    },
    [pathname]
  );

  return [hydrated, setState];
}

/**
 * buildShareUrl — returns the current page URL with given params baked in.
 */
export function buildShareUrl(params: Record<string, string>): string {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.href);
  for (const [k, v] of Object.entries(params)) {
    if (v) url.searchParams.set(k, v);
  }
  return url.toString();
}
