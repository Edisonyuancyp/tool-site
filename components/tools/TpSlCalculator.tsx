"use client";
import { useState, useMemo } from "react";

type Direction = "long" | "short";

function fmt(n: number, dp = 4): string {
  if (Math.abs(n) >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return n.toFixed(dp);
}

function fmtUSD(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "+";
  return `${sign}$${abs.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtPct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

interface Level {
  label: string;
  price: number;
  pnlUSD: number;
  pnlPct: number;
  rrRatio: number | null; // reward/risk vs SL — null for SL itself
  isTP: boolean;
}

export default function TpSlCalculator() {
  const [direction, setDirection] = useState<Direction>("long");
  const [entryPrice, setEntryPrice] = useState("100");
  const [leverage, setLeverage] = useState("10");
  const [marginUSD, setMarginUSD] = useState("1000");

  // TP levels (3)
  const [tp1, setTp1] = useState("105");
  const [tp2, setTp2] = useState("110");
  const [tp3, setTp3] = useState("120");

  // SL
  const [sl, setSl] = useState("95");

  const entry = parseFloat(entryPrice) || 0;
  const lev = Math.max(1, parseFloat(leverage) || 1);
  const margin = Math.max(0, parseFloat(marginUSD) || 0);
  const positionSize = margin * lev; // total position value in USD

  function calcPnL(targetPrice: number): { pnlUSD: number; pnlPct: number } {
    if (entry === 0) return { pnlUSD: 0, pnlPct: 0 };
    const priceDiff =
      direction === "long"
        ? targetPrice - entry
        : entry - targetPrice;
    const pnlPct = (priceDiff / entry) * lev * 100;
    const pnlUSD = (priceDiff / entry) * positionSize;
    return { pnlUSD, pnlPct };
  }

  const slData = useMemo(() => {
    const slPrice = parseFloat(sl) || 0;
    const { pnlUSD, pnlPct } = calcPnL(slPrice);
    return { price: slPrice, pnlUSD, pnlPct };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sl, entry, lev, positionSize, direction]);

  const tpLevels: Level[] = useMemo(() => {
    const inputs = [
      { label: "TP 1", val: tp1 },
      { label: "TP 2", val: tp2 },
      { label: "TP 3", val: tp3 },
    ];
    return inputs
      .map(({ label, val }) => {
        const price = parseFloat(val) || 0;
        const { pnlUSD, pnlPct } = calcPnL(price);
        const risk = Math.abs(slData.pnlUSD);
        const rrRatio = risk > 0 ? pnlUSD / risk : null;
        return { label, price, pnlUSD, pnlPct, rrRatio, isTP: true };
      })
      .filter((t) => t.price > 0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tp1, tp2, tp3, slData, entry, lev, positionSize, direction]);

  // Liquidation price estimate (simplified: loss = margin)
  const liqPrice = useMemo(() => {
    if (entry === 0 || lev === 0) return 0;
    const liqPct = 1 / lev; // 100% margin loss
    return direction === "long"
      ? entry * (1 - liqPct)
      : entry * (1 + liqPct);
  }, [entry, lev, direction]);

  const riskPct = Math.abs(slData.pnlPct);
  const riskUSD = Math.abs(slData.pnlUSD);

  return (
    <div className="space-y-6">
      {/* Direction toggle */}
      <div className="flex gap-2">
        {(["long", "short"] as Direction[]).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDirection(d)}
            className={
              "flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all " +
              (direction === d
                ? d === "long"
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-red-600 text-white border-red-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400")
            }
          >
            {d === "long" ? "▲ LONG" : "▼ SHORT"}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Entry Price</label>
          <input type="number" min="0" step="any" value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 font-semibold focus:outline-none focus:border-gray-400" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Leverage (×)</label>
          <input type="number" min="1" max="125" step="1" value={leverage} onChange={(e) => setLeverage(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 font-semibold focus:outline-none focus:border-gray-400" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Margin (USD)</label>
          <input type="number" min="0" step="any" value={marginUSD} onChange={(e) => setMarginUSD(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 font-semibold focus:outline-none focus:border-gray-400" />
        </div>
      </div>

      {/* Position summary */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <div className="text-xs text-gray-400 mb-0.5">Position Size</div>
          <div className="font-bold text-gray-900">${positionSize.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
        </div>
        <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
          <div className="text-xs text-amber-600 mb-0.5">Est. Liquidation</div>
          <div className="font-bold text-amber-700">{fmt(liqPrice)}</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
          <div className="text-xs text-gray-400 mb-0.5">Leverage</div>
          <div className="font-bold text-gray-900">{lev}×</div>
        </div>
      </div>

      {/* TP / SL inputs + results */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Take Profit & Stop Loss Levels</h3>

        {/* SL */}
        <div className="flex items-center gap-3 p-4 rounded-xl border border-red-100 bg-red-50">
          <div className="shrink-0 w-14 text-xs font-bold text-red-500 uppercase">Stop Loss</div>
          <input type="number" min="0" step="any" value={sl} onChange={(e) => setSl(e.target.value)}
            className="w-32 border border-red-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 bg-white focus:outline-none focus:border-red-400" />
          <div className="flex-1 grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-xs text-gray-400">PnL (USD)</span>
              <div className="font-bold text-red-600">{fmtUSD(slData.pnlUSD)}</div>
            </div>
            <div>
              <span className="text-xs text-gray-400">PnL (%)</span>
              <div className="font-bold text-red-600">{fmtPct(slData.pnlPct)}</div>
            </div>
          </div>
        </div>

        {/* TP levels */}
        {[
          { label: "TP 1", val: tp1, set: setTp1 },
          { label: "TP 2", val: tp2, set: setTp2 },
          { label: "TP 3", val: tp3, set: setTp3 },
        ].map(({ label, val, set }, i) => {
          const price = parseFloat(val) || 0;
          const { pnlUSD, pnlPct } = calcPnL(price);
          const risk = Math.abs(slData.pnlUSD);
          const rr = risk > 0 && price > 0 ? (pnlUSD / risk).toFixed(2) : "—";
          return (
            <div key={label} className="flex items-center gap-3 p-4 rounded-xl border border-green-100 bg-green-50">
              <div className="shrink-0 w-14 text-xs font-bold text-green-600 uppercase">{label}</div>
              <input type="number" min="0" step="any" value={val} onChange={(e) => set(e.target.value)}
                className="w-32 border border-green-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-900 bg-white focus:outline-none focus:border-green-400" />
              <div className="flex-1 grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-xs text-gray-400">PnL (USD)</span>
                  <div className="font-bold text-green-700">{price > 0 ? fmtUSD(pnlUSD) : "—"}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-400">PnL (%)</span>
                  <div className="font-bold text-green-700">{price > 0 ? fmtPct(pnlPct) : "—"}</div>
                </div>
                <div>
                  <span className="text-xs text-gray-400">R:R Ratio</span>
                  <div className={`font-bold ${parseFloat(rr) >= 2 ? "text-green-700" : parseFloat(rr) >= 1 ? "text-amber-600" : "text-red-500"}`}>
                    {price > 0 ? `1 : ${rr}` : "—"}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Risk summary */}
      <div className="bg-gray-900 rounded-2xl p-5 text-white">
        <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-3">Risk Summary</div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <div className="text-xs text-gray-400">Max Risk (USD)</div>
            <div className="text-xl font-black text-red-400">${riskUSD.toFixed(2)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Max Risk (%)</div>
            <div className="text-xl font-black text-red-400">{riskPct.toFixed(2)}%</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Best R:R (TP3)</div>
            <div className="text-xl font-black text-green-400">
              {(() => {
                const p = parseFloat(tp3) || 0;
                const { pnlUSD } = calcPnL(p);
                const rr = riskUSD > 0 && p > 0 ? (pnlUSD / riskUSD).toFixed(2) : "—";
                return `1 : ${rr}`;
              })()}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Direction</div>
            <div className={`text-xl font-black ${direction === "long" ? "text-green-400" : "text-red-400"}`}>
              {direction === "long" ? "▲ LONG" : "▼ SHORT"}
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400">
        * Liquidation price is an estimate assuming 100% margin loss. Actual liquidation depends on exchange maintenance margin and fees.
      </p>
    </div>
  );
}
