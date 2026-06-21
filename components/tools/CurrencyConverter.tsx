"use client";
import { useState, useEffect, useCallback } from "react";

const POPULAR_CURRENCIES = [
  { code: "USD", name: "US Dollar", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", flag: "🇬🇧" },
  { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
  { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳" },
  { code: "KRW", name: "South Korean Won", flag: "🇰🇷" },
  { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
  { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
  { code: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
  { code: "HKD", name: "Hong Kong Dollar", flag: "🇭🇰" },
  { code: "SGD", name: "Singapore Dollar", flag: "🇸🇬" },
  { code: "INR", name: "Indian Rupee", flag: "🇮🇳" },
  { code: "MXN", name: "Mexican Peso", flag: "🇲🇽" },
  { code: "BRL", name: "Brazilian Real", flag: "🇧🇷" },
  { code: "THB", name: "Thai Baht", flag: "🇹🇭" },
  { code: "VND", name: "Vietnamese Dong", flag: "🇻🇳" },
  { code: "MYR", name: "Malaysian Ringgit", flag: "🇲🇾" },
  { code: "IDR", name: "Indonesian Rupiah", flag: "🇮🇩" },
  { code: "PHP", name: "Philippine Peso", flag: "🇵🇭" },
  { code: "NZD", name: "New Zealand Dollar", flag: "🇳🇿" },
  { code: "AED", name: "UAE Dirham", flag: "🇦🇪" },
  { code: "SAR", name: "Saudi Riyal", flag: "🇸🇦" },
  { code: "ZAR", name: "South African Rand", flag: "🇿🇦" },
  { code: "RUB", name: "Russian Ruble", flag: "🇷🇺" },
  { code: "TRY", name: "Turkish Lira", flag: "🇹🇷" },
];

// Fallback static rates relative to USD (approx. Jun 2025 — used only when all APIs fail)
const FALLBACK_RATES: Record<string, number> = {
  USD: 1, EUR: 0.921, GBP: 0.793, JPY: 143.2, CNY: 7.19, KRW: 1382,
  AUD: 1.558, CAD: 1.384, CHF: 0.901, HKD: 7.796, SGD: 1.354, INR: 84.6,
  MXN: 18.72, BRL: 5.68, THB: 34.2, VND: 25720, MYR: 4.44, IDR: 16380,
  PHP: 57.8, NZD: 1.695, AED: 3.673, SAR: 3.752, ZAR: 18.14, RUB: 88.5, TRY: 38.6,
};

function formatAmount(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "JPY" || currency === "KRW" || currency === "VND" || currency === "IDR" ? 0 : 4,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(4)}`;
  }
}

export default function CurrencyConverter() {
  const [amount, setAmount] = useState("1");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("EUR");
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("offline (static rates)");
  const [error, setError] = useState(false);

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError(false);

    // Source 1: exchangerate.fun — hourly updated, no key, 170+ currencies
    try {
      const res = await fetch("https://api.exchangerate.fun/latest?base=USD", {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("s1 fail");
      const data = await res.json();
      if (!data.rates || typeof data.rates !== "object") throw new Error("bad data");
      setRates({ USD: 1, ...data.rates });
      const ts = data.timestamp
        ? new Date(data.timestamp * 1000).toLocaleString("en-US", {
            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
          })
        : "live";
      setLastUpdated(`Live · Updated ${ts}`);
      setLoading(false);
      return;
    } catch { /* fall through */ }

    // Source 2: Frankfurter (ECB, daily)
    try {
      const codes = POPULAR_CURRENCIES.map((c) => c.code).filter((c) => c !== "USD").join(",");
      const res = await fetch(`https://api.frankfurter.app/latest?from=USD&to=${codes}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("s2 fail");
      const data = await res.json();
      setRates({ USD: 1, ...data.rates });
      setLastUpdated(`ECB · ${new Date(data.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`);
      setLoading(false);
      return;
    } catch { /* fall through */ }

    // Source 3: fawazahmed0 CDN (jsDelivr, daily)
    try {
      const res = await fetch(
        "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json",
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("s3 fail");
      const data = await res.json();
      const r: Record<string, number> = { USD: 1 };
      for (const [k, v] of Object.entries(data.usd as Record<string, number>)) {
        r[k.toUpperCase()] = v;
      }
      setRates(r);
      setLastUpdated(`CDN · ${data.date}`);
      setLoading(false);
      return;
    } catch { /* fall through */ }

    // All sources failed — use static fallback
    setError(true);
    setRates(FALLBACK_RATES);
    setLastUpdated("Offline · Static rates");
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRates();
    // Auto-refresh every 30 minutes
    const timer = setInterval(fetchRates, 30 * 60 * 1000);
    return () => clearInterval(timer);
  }, [fetchRates]);

  const numAmount = parseFloat(amount) || 0;
  const fromRate = rates[from] ?? 1;
  const toRate = rates[to] ?? 1;
  const converted = (numAmount / fromRate) * toRate;

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const fromInfo = POPULAR_CURRENCIES.find((c) => c.code === from);
  const toInfo = POPULAR_CURRENCIES.find((c) => c.code === to);

  // Quick convert table: 1,5,10,50,100,500,1000
  const quickAmounts = [1, 5, 10, 50, 100, 500, 1000];

  return (
    <div className="space-y-6">
      {/* Status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className={`w-2 h-2 rounded-full ${error ? "bg-amber-400" : "bg-green-400"}`} />
          {loading ? "Fetching live rates…" : `Rates: ${lastUpdated}`}
        </div>
        <button
          type="button"
          onClick={fetchRates}
          disabled={loading}
          className="text-xs text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg px-2.5 py-1 hover:border-gray-400 transition-all disabled:opacity-50"
        >
          {loading ? "…" : "↻ Refresh"}
        </button>
      </div>

      {/* Main converter */}
      <div className="border border-gray-200 rounded-2xl p-5 space-y-4">
        {/* Amount input */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Amount</label>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-2xl font-bold text-gray-900 focus:outline-none focus:border-gray-400"
          />
        </div>

        {/* From / Swap / To */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-900 bg-white focus:outline-none focus:border-gray-400 cursor-pointer"
            >
              {POPULAR_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} – {c.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={swap}
            className="mt-5 w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-gray-400 transition-all shrink-0"
            title="Swap currencies"
          >
            ⇄
          </button>

          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-900 bg-white focus:outline-none focus:border-gray-400 cursor-pointer"
            >
              {POPULAR_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} – {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Result */}
        <div className="bg-gray-900 rounded-xl p-5">
          <div className="text-xs text-gray-400 mb-1">
            {numAmount} {from} =
          </div>
          <div className="text-3xl font-black text-white">
            {formatAmount(converted, to)}
          </div>
          <div className="text-xs text-gray-400 mt-2">
            1 {from} = {formatAmount(toRate / fromRate, to)} &nbsp;·&nbsp; 1 {to} = {formatAmount(fromRate / toRate, from)}
          </div>
        </div>
      </div>

      {/* Quick reference table */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          {fromInfo?.flag} {from} → {toInfo?.flag} {to} Quick Reference
        </h3>
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">{from}</th>
                <th className="text-right px-4 py-2.5 text-xs font-semibold text-gray-500">{to}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {quickAmounts.map((qa) => {
                const cv = (qa / fromRate) * toRate;
                return (
                  <tr key={qa} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-gray-600">{formatAmount(qa, from)}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-gray-900">{formatAmount(cv, to)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
