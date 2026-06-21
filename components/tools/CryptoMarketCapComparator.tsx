"use client";
import { useState, useEffect, useCallback } from "react";

interface CoinData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  total_supply: number | null;
  circulating_supply: number;
  image: string;
}

// Top coins fallback (approximate, Jun 2025)
const FALLBACK_COINS: CoinData[] = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", current_price: 105000, market_cap: 2_080_000_000_000, total_supply: 21_000_000, circulating_supply: 19_700_000, image: "₿" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", current_price: 2500, market_cap: 301_000_000_000, total_supply: null, circulating_supply: 120_400_000, image: "Ξ" },
  { id: "tether", symbol: "USDT", name: "Tether", current_price: 1, market_cap: 153_000_000_000, total_supply: 153_000_000_000, circulating_supply: 153_000_000_000, image: "₮" },
  { id: "binancecoin", symbol: "BNB", name: "BNB", current_price: 650, market_cap: 94_000_000_000, total_supply: 200_000_000, circulating_supply: 144_000_000, image: "B" },
  { id: "solana", symbol: "SOL", name: "Solana", current_price: 175, market_cap: 84_000_000_000, total_supply: null, circulating_supply: 480_000_000, image: "◎" },
  { id: "ripple", symbol: "XRP", name: "XRP", current_price: 2.3, market_cap: 134_000_000_000, total_supply: 100_000_000_000, circulating_supply: 58_000_000_000, image: "✕" },
  { id: "usd-coin", symbol: "USDC", name: "USD Coin", current_price: 1, market_cap: 61_000_000_000, total_supply: 61_000_000_000, circulating_supply: 61_000_000_000, image: "$" },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin", current_price: 0.22, market_cap: 32_000_000_000, total_supply: null, circulating_supply: 146_000_000_000, image: "Ð" },
  { id: "cardano", symbol: "ADA", name: "Cardano", current_price: 0.75, market_cap: 26_000_000_000, total_supply: 45_000_000_000, circulating_supply: 35_400_000_000, image: "₳" },
  { id: "tron", symbol: "TRX", name: "TRON", current_price: 0.27, market_cap: 23_000_000_000, total_supply: null, circulating_supply: 87_000_000_000, image: "T" },
  { id: "avalanche-2", symbol: "AVAX", name: "Avalanche", current_price: 25, market_cap: 10_500_000_000, total_supply: 720_000_000, circulating_supply: 420_000_000, image: "A" },
  { id: "chainlink", symbol: "LINK", name: "Chainlink", current_price: 18, market_cap: 11_000_000_000, total_supply: 1_000_000_000, circulating_supply: 612_000_000, image: "⬡" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot", current_price: 5.5, market_cap: 8_300_000_000, total_supply: null, circulating_supply: 1_490_000_000, image: "●" },
  { id: "shiba-inu", symbol: "SHIB", name: "Shiba Inu", current_price: 0.000015, market_cap: 8_800_000_000, total_supply: 999_990_000_000_000, circulating_supply: 589_000_000_000_000, image: "🐕" },
  { id: "sui", symbol: "SUI", name: "Sui", current_price: 3.8, market_cap: 12_000_000_000, total_supply: 10_000_000_000, circulating_supply: 3_100_000_000, image: "S" },
];

function fmtMarketCap(n: number): string {
  if (n >= 1e12) return `$${(n / 1e12).toFixed(3)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

function fmtPrice(n: number): string {
  if (n >= 1000) return `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  if (n >= 1) return `$${n.toFixed(4)}`;
  if (n >= 0.0001) return `$${n.toFixed(6)}`;
  return `$${n.toFixed(10)}`;
}

function fmtSupply(n: number): string {
  if (n >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  return n.toLocaleString();
}

export default function CryptoMarketCapComparator() {
  const [coins, setCoins] = useState<CoinData[]>(FALLBACK_COINS);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState("offline");

  const [targetCoin, setTargetCoin] = useState("solana"); // "If X reaches Y's market cap"
  const [referenceCoin, setReferenceCoin] = useState("bitcoin");
  const [customMarketCap, setCustomMarketCap] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  const fetchCoins = useCallback(async () => {
    setLoading(true);
    try {
      // CoinGecko free public API — no key needed
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&locale=en",
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("cg fail");
      const data: Array<{
        id: string; symbol: string; name: string; current_price: number;
        market_cap: number; total_supply: number | null; circulating_supply: number; image: string;
      }> = await res.json();
      setCoins(data.map((c) => ({ ...c, symbol: c.symbol.toUpperCase() })));
      setDataSource("CoinGecko Live");
    } catch {
      setDataSource("offline");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoins();
  }, [fetchCoins]);

  const target = coins.find((c) => c.id === targetCoin);
  const reference = coins.find((c) => c.id === referenceCoin);

  const refMarketCap = useCustom
    ? parseFloat(customMarketCap) * 1e9 || 0
    : reference?.market_cap ?? 0;

  // If target reaches reference's market cap, what is target's price?
  const projectedPrice =
    target && target.circulating_supply > 0 && refMarketCap > 0
      ? refMarketCap / target.circulating_supply
      : null;

  const multiplier =
    projectedPrice && target && target.current_price > 0
      ? projectedPrice / target.current_price
      : null;

  const pctChange =
    multiplier !== null ? (multiplier - 1) * 100 : null;

  return (
    <div className="space-y-6">
      {/* Header status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className={`w-2 h-2 rounded-full ${dataSource === "offline" ? "bg-amber-400" : "bg-green-400"}`} />
          {loading ? "Fetching live data…" : dataSource}
        </div>
        <button type="button" onClick={fetchCoins} disabled={loading}
          className="text-xs text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg px-2.5 py-1 hover:border-gray-400 transition-all disabled:opacity-50">
          {loading ? "…" : "↻ Refresh"}
        </button>
      </div>

      {/* Scenario builder */}
      <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700">
          🔮 "If [Coin A] reaches the market cap of [Coin B], what will its price be?"
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Target coin */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Coin A (the one you hold)
            </label>
            <select value={targetCoin} onChange={(e) => setTargetCoin(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-900 bg-white focus:outline-none focus:border-gray-400 cursor-pointer">
              {coins.map((c) => (
                <option key={c.id} value={c.id}>{c.symbol} – {c.name}</option>
              ))}
            </select>
          </div>

          {/* Reference coin or custom */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Coin B (target market cap)
            </label>
            <div className="flex gap-2 mb-2">
              <button type="button" onClick={() => setUseCustom(false)}
                className={"flex-1 py-1.5 text-xs rounded-lg border font-medium transition-all " +
                  (!useCustom ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400")}>
                Pick a Coin
              </button>
              <button type="button" onClick={() => setUseCustom(true)}
                className={"flex-1 py-1.5 text-xs rounded-lg border font-medium transition-all " +
                  (useCustom ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200 hover:border-gray-400")}>
                Custom Cap ($B)
              </button>
            </div>
            {!useCustom ? (
              <select value={referenceCoin} onChange={(e) => setReferenceCoin(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-900 bg-white focus:outline-none focus:border-gray-400 cursor-pointer">
                {coins.map((c) => (
                  <option key={c.id} value={c.id}>{c.symbol} – {c.name} ({fmtMarketCap(c.market_cap)})</option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-2">
                <input type="number" min="0" placeholder="e.g. 500" value={customMarketCap}
                  onChange={(e) => setCustomMarketCap(e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-gray-400" />
                <span className="text-sm text-gray-400 shrink-0">Billion USD</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Result hero */}
      {target && projectedPrice !== null && multiplier !== null && pctChange !== null ? (
        <div className="bg-gray-900 rounded-2xl p-6 text-white">
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Projection Result</div>
          <div className="text-sm text-gray-300 mb-4">
            If <span className="text-white font-bold">{target.name} ({target.symbol})</span> reached a market cap of{" "}
            <span className="text-blue-300 font-bold">{fmtMarketCap(refMarketCap)}</span>:
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            <div>
              <div className="text-xs text-gray-400 mb-1">Projected Price</div>
              <div className="text-3xl font-black text-green-400">{fmtPrice(projectedPrice)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Multiplier</div>
              <div className="text-3xl font-black text-yellow-400">{multiplier.toFixed(2)}×</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Gain</div>
              <div className={`text-3xl font-black ${pctChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                {pctChange >= 0 ? "+" : ""}{pctChange >= 1000
                  ? `${(pctChange / 100).toFixed(0)}x`
                  : `${pctChange.toFixed(1)}%`}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-400">
            <div>Current Price<br /><span className="text-white font-semibold">{fmtPrice(target.current_price)}</span></div>
            <div>Current MCap<br /><span className="text-white font-semibold">{fmtMarketCap(target.market_cap)}</span></div>
            <div>Circ. Supply<br /><span className="text-white font-semibold">{fmtSupply(target.circulating_supply)}</span></div>
            <div>Target MCap<br /><span className="text-blue-300 font-semibold">{fmtMarketCap(refMarketCap)}</span></div>
          </div>
        </div>
      ) : (
        <div className="text-center text-sm text-gray-400 py-8 border border-dashed border-gray-200 rounded-xl">
          Select two different coins to see the projection
        </div>
      )}

      {/* Comparison table */}
      {target && reference && !useCustom && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Side-by-Side Comparison</h3>
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Metric</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-blue-600">{target.symbol}</th>
                  <th className="text-right px-4 py-2.5 text-xs font-semibold text-purple-600">{reference.symbol}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { label: "Price", a: fmtPrice(target.current_price), b: fmtPrice(reference.current_price) },
                  { label: "Market Cap", a: fmtMarketCap(target.market_cap), b: fmtMarketCap(reference.market_cap) },
                  { label: "Circulating Supply", a: fmtSupply(target.circulating_supply), b: fmtSupply(reference.circulating_supply) },
                  { label: "Total Supply", a: target.total_supply ? fmtSupply(target.total_supply) : "∞", b: reference.total_supply ? fmtSupply(reference.total_supply) : "∞" },
                  { label: "MCap Ratio (B/A)", a: "—", b: `${(reference.market_cap / target.market_cap).toFixed(2)}×` },
                ].map((row) => (
                  <tr key={row.label} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-gray-500">{row.label}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-blue-700">{row.a}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-purple-700">{row.b}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400">
        ⚠️ Projections assume circulating supply stays constant. Real supply may change. This is not financial advice.
      </p>
    </div>
  );
}
