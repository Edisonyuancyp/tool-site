"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWorkbench } from "@/lib/WorkbenchContext";
import { getPathForSlug } from "@/lib/tool-paths";

// ── Binance ticker (only fetched on quant pages) ──────────────────────────────

const TICKERS = [
  { symbol: "BTCUSDT", label: "BTC" },
  { symbol: "ETHUSDT", label: "ETH" },
  { symbol: "SOLUSDT", label: "SOL" },
];

interface TickerData {
  symbol: string;
  label: string;
  price: string;
  change: string; // e.g. "+2.34%"
  up: boolean;
}

function useBinanceTickers(enabled: boolean) {
  const [tickers, setTickers] = useState<TickerData[]>([]);

  const fetch24h = useCallback(async () => {
    if (!enabled) return;
    try {
      const symbols = JSON.stringify(TICKERS.map((t) => t.symbol));
      const res = await fetch(
        `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbols)}`,
        { signal: AbortSignal.timeout(5000) }
      );
      if (!res.ok) return;
      const data: { symbol: string; lastPrice: string; priceChangePercent: string }[] = await res.json();
      setTickers(
        data.map((d) => {
          const meta = TICKERS.find((t) => t.symbol === d.symbol)!;
          const pct = parseFloat(d.priceChangePercent);
          return {
            symbol: d.symbol,
            label: meta.label,
            price: parseFloat(d.lastPrice).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            change: (pct >= 0 ? "+" : "") + pct.toFixed(2) + "%",
            up: pct >= 0,
          };
        })
      );
    } catch {
      // Silently fail — no visible error
    }
  }, [enabled]);

  useEffect(() => {
    fetch24h();
    if (!enabled) return;
    const id = setInterval(fetch24h, 30_000);
    return () => clearInterval(id);
  }, [fetch24h, enabled]);

  return tickers;
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
  </svg>
);

const HeartIcon = ({ filled }: { filled: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill={filled ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const GridIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const WorkbenchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);

// ── Sidebar panel ─────────────────────────────────────────────────────────────

function SidebarPanel({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const isQuantPage = pathname?.includes("/quant/") ?? false;
  const { favorites, recents, isFav, toggleFav } = useWorkbench();
  const tickers = useBinanceTickers(isQuantPage);

  const recentList = recents.slice(0, 6);
  const favList = favorites.slice(0, 6);

  return (
    <aside
      role="complementary"
      aria-label="Quick access sidebar"
      className="fixed top-0 right-0 h-full w-72 bg-white border-l border-gray-100 shadow-xl z-40 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
        <span className="text-sm font-bold text-gray-900">Quick Access</span>
        <button onClick={onClose} aria-label="Close sidebar"
          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors text-lg leading-none">
          ×
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto overscroll-contain">

        {/* Binance tickers — only on quant pages */}
        {isQuantPage && tickers.length > 0 && (
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Live Prices</p>
            <div className="space-y-1.5">
              {tickers.map((t) => (
                <div key={t.symbol} className="flex items-center justify-between py-1">
                  <span className="text-xs font-semibold text-gray-700">{t.label}</span>
                  <div className="text-right">
                    <span className="text-xs font-mono text-gray-900">${t.price}</span>
                    <span className={`ml-2 text-[10px] font-semibold ${t.up ? "text-emerald-500" : "text-red-500"}`}>{t.change}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-gray-300 mt-1.5">Binance · refreshes every 30s</p>
          </div>
        )}

        {/* Recent tools */}
        {recentList.length > 0 && (
          <div className="px-4 py-3 border-b border-gray-50">
            <div className="flex items-center gap-1.5 mb-2">
              <ClockIcon />
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Recently Visited</p>
            </div>
            <nav aria-label="Recently visited tools">
              <ul className="space-y-0.5">
                {recentList.map((r) => (
                  <li key={r.slug}>
                    <Link href={getPathForSlug(r.slug)} onClick={onClose}
                      rel="noopener"
                      aria-label={`Open ${r.slug}`}
                      className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors ${pathname?.includes(r.slug) ? "bg-gray-50 font-medium text-gray-900" : ""}`}>
                      <span className="truncate">{r.slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</span>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFav(r.slug); }}
                        aria-label={isFav(r.slug) ? "Remove from favorites" : "Save to favorites"}
                        className={`shrink-0 ml-2 transition-colors ${isFav(r.slug) ? "text-red-400" : "text-gray-200 hover:text-red-300"}`}>
                        <HeartIcon filled={isFav(r.slug)} />
                      </button>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}

        {/* Favorites */}
        {favList.length > 0 && (
          <div className="px-4 py-3 border-b border-gray-50">
            <div className="flex items-center gap-1.5 mb-2">
              <HeartIcon filled />
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Saved Tools</p>
            </div>
            <nav aria-label="Saved tools">
              <ul className="space-y-0.5">
                {favList.map((slug) => (
                  <li key={slug}>
                    <Link href={getPathForSlug(slug)} onClick={onClose}
                      rel="noopener"
                      aria-label={`Open ${slug}`}
                      className="flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                      <span className="truncate">{slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</span>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFav(slug); }}
                        aria-label="Remove from favorites"
                        className="shrink-0 ml-2 text-red-400 hover:text-red-600 transition-colors">
                        <HeartIcon filled />
                      </button>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}

        {/* Empty state */}
        {recentList.length === 0 && favList.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-3xl mb-2">🧭</p>
            <p className="text-sm text-gray-500 font-medium">No history yet</p>
            <p className="text-xs text-gray-400 mt-1">Tools you visit will appear here</p>
            <Link href="/tools/calc" onClick={onClose}
              className="inline-block mt-4 px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-black transition-colors">
              Browse all tools →
            </Link>
          </div>
        )}

        {/* Category quick-links */}
        <div className="px-4 py-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Categories</p>
          <nav aria-label="Tool categories">
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { href: "/tools/dev",       label: "⌨️ Dev" },
                { href: "/tools/calc",      label: "💹 Calculators" },
                { href: "/tools/ai",        label: "🤖 AI" },
                { href: "/tools/design",    label: "🎨 Design" },
                { href: "/tools/time",      label: "🕐 Date & Time" },
                { href: "/tools/converter", label: "� Converters" },
              ].map((cat) => (
                <Link key={cat.href} href={cat.href} onClick={onClose}
                  rel="noopener"
                  className="px-2.5 py-2 border border-gray-100 rounded-lg text-xs text-gray-600 hover:border-gray-300 hover:text-gray-900 hover:bg-gray-50 transition-all text-center">
                  {cat.label}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100">
        <Link href="/workbench" onClick={onClose}
          className="flex items-center justify-center gap-2 w-full py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all">
          <WorkbenchIcon />
          View full Workbench
        </Link>
      </div>
    </aside>
  );
}

// ── Floating toggle button (desktop) ─────────────────────────────────────────

function FloatingToggle({ open, onClick, hasActivity }: { open: boolean; onClick: () => void; hasActivity: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label={open ? "Close sidebar" : "Open quick access sidebar"}
      aria-expanded={open}
      className={`fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden lg:flex items-center justify-center w-9 h-9 rounded-full border shadow-md transition-all
        ${open
          ? "bg-gray-900 border-gray-700 text-white"
          : "bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900 hover:shadow-lg"
        }`}
    >
      {/* Notification dot */}
      {hasActivity && !open && (
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
      )}
      {open ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      )}
    </button>
  );
}

// ── Mobile bottom bar ─────────────────────────────────────────────────────────

function MobileBottomBar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const pathname = usePathname();
  const { favorites, recents } = useWorkbench();
  const hasActivity = favorites.length > 0 || recents.length > 0;

  return (
    <nav
      aria-label="Mobile quick navigation"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-gray-100 shadow-lg safe-area-inset-bottom"
    >
      <div className="flex items-center justify-around h-14 px-2">
        <Link href="/" aria-label="Home"
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${pathname === "/" ? "text-gray-900" : "text-gray-400 hover:text-gray-700"}`}>
          <HomeIcon />
          <span className="text-[9px] font-medium">Home</span>
        </Link>

        <Link href="/tools/calc" aria-label="All tools"
          className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-gray-400 hover:text-gray-700 transition-colors">
          <GridIcon />
          <span className="text-[9px] font-medium">Tools</span>
        </Link>

        <button onClick={onOpenSidebar} aria-label="Quick access"
          className="relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-gray-400 hover:text-gray-700 transition-colors">
          {hasActivity && (
            <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full" />
          )}
          <WorkbenchIcon />
          <span className="text-[9px] font-medium">Recents</span>
        </button>

        <Link href="/workbench" aria-label="Workbench"
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${pathname === "/workbench" ? "text-gray-900" : "text-gray-400 hover:text-gray-700"}`}>
          <HeartIcon filled={false} />
          <span className="text-[9px] font-medium">Saved</span>
        </Link>
      </div>
    </nav>
  );
}

// ── Overlay (closes sidebar on click outside) ─────────────────────────────────

function Overlay({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      aria-hidden="true"
      className="fixed inset-0 bg-black/20 z-30 lg:bg-transparent"
    />
  );
}

// ── Root export ───────────────────────────────────────────────────────────────

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const { favorites, recents } = useWorkbench();
  const hasActivity = favorites.length > 0 || recents.length > 0;

  // Close on route change
  const pathname = usePathname();
  useEffect(() => { setOpen(false); }, [pathname]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {/* Desktop floating toggle */}
      <FloatingToggle open={open} onClick={() => setOpen(v => !v)} hasActivity={hasActivity} />

      {/* Backdrop */}
      {open && <Overlay onClick={() => setOpen(false)} />}

      {/* Sidebar panel */}
      {open && <SidebarPanel onClose={() => setOpen(false)} />}

      {/* Mobile bottom bar */}
      <MobileBottomBar onOpenSidebar={() => setOpen(true)} />
    </>
  );
}
