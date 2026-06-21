"use client";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { tools, getToolPath } from "@/lib/tools";
import type { ToolMeta } from "@/lib/tools";

const LOCALES = [
  { code: "en", label: "EN", flag: "🇺🇸" },
  { code: "es", label: "ES", flag: "🇪🇸" },
  { code: "fr", label: "FR", flag: "🇫🇷" },
];

function useLocaleLinks() {
  const pathname = usePathname();
  // pathname examples:
  //   /tools/loan-calculator          → en tool page
  //   /es/tools/loan-calculator       → es tool page
  //   /fr/tools/loan-calculator       → fr tool page
  //   /                               → home

  const localeMatch = pathname.match(/^\/(es|fr)(\/.*)?$/);
  const currentLocale = localeMatch ? localeMatch[1] : "en";
  const restPath = localeMatch ? (localeMatch[2] ?? "/") : pathname;

  function hrefFor(code: string) {
    if (code === "en") return restPath || "/";
    return `/${code}${restPath === "/" ? "" : restPath}`;
  }

  return { currentLocale, hrefFor };
}

export default function Header({ allTools }: { allTools?: ToolMeta[] }) {
  const pool = allTools ?? tools;
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const { currentLocale, hrefFor } = useLocaleLinks();
  const currentLang = LOCALES.find(l => l.code === currentLocale) ?? LOCALES[0];

  const q = searchQ.trim().toLowerCase();
  const menuTools = q
    ? pool.filter(t =>
        t.name.toLowerCase().includes(q) ||
        (t.tagline ?? "").toLowerCase().includes(q)
      ).slice(0, 8)
    : pool.slice(0, 12);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-bold text-lg text-gray-900 hover:text-black shrink-0"
        >
          <span className="w-7 h-7 bg-gray-900 text-white rounded-lg flex items-center justify-center text-sm font-black">T</span>
          GetFastCalc
        </Link>

        <div className="flex items-center gap-2">
          {/* Language switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setLangOpen(v => !v); setMenuOpen(false); }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
              aria-label="Change language"
            >
              <span>{currentLang.flag}</span>
              <span>{currentLang.label}</span>
              <svg className={`w-3 h-3 transition-transform ${langOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {langOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-36 bg-white rounded-xl border border-gray-200 shadow-lg z-50 py-1 overflow-hidden">
                  {LOCALES.map(l => (
                    <Link
                      key={l.code}
                      href={hrefFor(l.code)}
                      onClick={() => setLangOpen(false)}
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                        l.code === currentLocale
                          ? "bg-gray-50 font-semibold text-gray-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <span>{l.flag}</span>
                      <span>{l.code === "en" ? "English" : l.code === "es" ? "Español" : "Français"}</span>
                      {l.code === currentLocale && (
                        <svg className="w-3.5 h-3.5 ml-auto text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* All Tools dropdown button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setMenuOpen(v => !v); setLangOpen(false); }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              All Tools
              <svg className={`w-3.5 h-3.5 transition-transform ${menuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden flex flex-col max-h-[70vh]">
                  {/* Search inside dropdown */}
                  <div className="p-3 border-b border-gray-100">
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                      </svg>
                      <input
                        type="search"
                        value={searchQ}
                        onChange={e => setSearchQ(e.target.value)}
                        placeholder={`Search ${pool.length} tools…`}
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-none focus:border-gray-400 bg-gray-50"
                        autoFocus
                      />
                    </div>
                  </div>
                  {/* Tool list */}
                  <div className="overflow-y-auto py-1">
                    {menuTools.length === 0 ? (
                      <p className="px-4 py-6 text-xs text-gray-400 text-center">No tools found</p>
                    ) : (
                      menuTools.map((tool) => (
                        <Link
                          key={tool.slug}
                          href={getToolPath(tool)}
                          onClick={() => { setMenuOpen(false); setSearchQ(""); }}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                          <span className="text-lg w-6 text-center shrink-0">{tool.icon}</span>
                          <div className="min-w-0">
                            <div className="font-medium truncate">{tool.name}</div>
                            <div className="text-xs text-gray-400 truncate">{tool.tagline}</div>
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                  {/* Footer link */}
                  {!q && (
                    <div className="border-t border-gray-100 px-4 py-2.5">
                      <Link href="/" onClick={() => setMenuOpen(false)}
                        className="text-xs text-gray-500 hover:text-gray-900 transition-colors">
                        View all {pool.length} tools →
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
