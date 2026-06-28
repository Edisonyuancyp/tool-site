"use client";
import { useState, useEffect, useRef, useCallback } from "react";

interface OHLC {
  t: number; // timestamp ms
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

interface Props { compact?: boolean; }

const COINS = [
  { id: "bitcoin",  symbol: "BTC", name: "Bitcoin"  },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "binancecoin", symbol: "BNB", name: "BNB"   },
  { id: "solana",   symbol: "SOL", name: "Solana"   },
  { id: "ripple",   symbol: "XRP", name: "XRP"      },
  { id: "cardano",  symbol: "ADA", name: "Cardano"  },
  { id: "dogecoin", symbol: "DOGE", name: "Dogecoin"},
];

const TIMEFRAMES = [
  { label: "1W",  days: 7   },
  { label: "1M",  days: 30  },
  { label: "3M",  days: 90  },
  { label: "6M",  days: 180 },
  { label: "1Y",  days: 365 },
];

type Indicator = "EMA" | "SMA" | "BB" | "RSI";

// ── Indicator math ──────────────────────────────────────────────────────────
function calcSMA(closes: number[], period: number): (number | null)[] {
  return closes.map((_, i) => {
    if (i < period - 1) return null;
    const slice = closes.slice(i - period + 1, i + 1);
    return slice.reduce((a, b) => a + b, 0) / period;
  });
}

function calcEMA(closes: number[], period: number): (number | null)[] {
  const k = 2 / (period + 1);
  const out: (number | null)[] = Array(closes.length).fill(null);
  let ema = closes.slice(0, period).reduce((a, b) => a + b, 0) / period;
  out[period - 1] = ema;
  for (let i = period; i < closes.length; i++) {
    ema = closes[i] * k + ema * (1 - k);
    out[i] = ema;
  }
  return out;
}

function calcBB(closes: number[], period = 20, mult = 2): {
  mid: (number | null)[]; upper: (number | null)[]; lower: (number | null)[];
} {
  const mid = calcSMA(closes, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];
  closes.forEach((_, i) => {
    if (i < period - 1) { upper.push(null); lower.push(null); return; }
    const slice = closes.slice(i - period + 1, i + 1);
    const m = mid[i] as number;
    const variance = slice.reduce((acc, v) => acc + (v - m) ** 2, 0) / period;
    const sd = Math.sqrt(variance);
    upper.push(m + mult * sd);
    lower.push(m - mult * sd);
  });
  return { mid, upper, lower };
}

function calcRSI(closes: number[], period = 14): (number | null)[] {
  const out: (number | null)[] = Array(closes.length).fill(null);
  if (closes.length < period + 1) return out;
  let avgGain = 0, avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const d = closes[i] - closes[i - 1];
    if (d > 0) avgGain += d; else avgLoss += -d;
  }
  avgGain /= period; avgLoss /= period;
  out[period] = 100 - 100 / (1 + (avgLoss === 0 ? Infinity : avgGain / avgLoss));
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    const gain = d > 0 ? d : 0;
    const loss = d < 0 ? -d : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    out[i] = 100 - 100 / (1 + (avgLoss === 0 ? Infinity : avgGain / avgLoss));
  }
  return out;
}

// ── Canvas renderer ──────────────────────────────────────────────────────────
function renderChart(
  canvas: HTMLCanvasElement,
  data: OHLC[],
  indicators: Set<Indicator>,
  emaLen: number,
  smaLen: number,
  hoverIdx: number | null,
) {
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth;
  const H = canvas.clientHeight;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);

  const PAD_L = 60, PAD_R = 12, PAD_T = 16, PAD_B = indicators.has("RSI") ? 110 : 40;
  const chartH = H - PAD_T - PAD_B;
  const rsiH   = indicators.has("RSI") ? 80 : 0;
  const mainH  = chartH - rsiH - (rsiH > 0 ? 8 : 0);
  const chartW = W - PAD_L - PAD_R;

  if (data.length === 0) return;

  const closes = data.map(d => d.c);
  const highs  = data.map(d => d.h);
  const lows   = data.map(d => d.l);

  const priceMin = Math.min(...lows)  * 0.998;
  const priceMax = Math.max(...highs) * 1.002;

  const toX = (i: number) => PAD_L + (i / (data.length - 1)) * chartW;
  const toY = (p: number) => PAD_T + mainH - ((p - priceMin) / (priceMax - priceMin)) * mainH;

  // Background
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, W, H);

  // Grid
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = PAD_T + (i / 4) * mainH;
    ctx.beginPath(); ctx.moveTo(PAD_L, y); ctx.lineTo(W - PAD_R, y); ctx.stroke();
    const price = priceMax - (i / 4) * (priceMax - priceMin);
    ctx.fillStyle = "#64748b";
    ctx.font = "10px monospace";
    ctx.textAlign = "right";
    ctx.fillText(price >= 1000 ? price.toFixed(0) : price.toFixed(2), PAD_L - 4, y + 3);
  }

  // Candlesticks
  const candleW = Math.max(1, Math.min(12, (chartW / data.length) * 0.7));
  data.forEach((d, i) => {
    const x  = toX(i);
    const yO = toY(d.o), yC = toY(d.c), yH = toY(d.h), yL = toY(d.l);
    const bull = d.c >= d.o;
    const color = bull ? "#22c55e" : "#ef4444";

    // Wick
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, yH); ctx.lineTo(x, yL);
    ctx.stroke();

    // Body
    ctx.fillStyle = color;
    const bodyTop = Math.min(yO, yC);
    const bodyH   = Math.max(1, Math.abs(yO - yC));
    ctx.fillRect(x - candleW / 2, bodyTop, candleW, bodyH);
  });

  // Indicators
  function drawLine(vals: (number | null)[], color: string, lw = 1.5) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.beginPath();
    let started = false;
    vals.forEach((v, i) => {
      if (v === null) { started = false; return; }
      const x = toX(i), y = toY(v);
      if (!started) { ctx.moveTo(x, y); started = true; }
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  if (indicators.has("EMA")) drawLine(calcEMA(closes, emaLen), "#f59e0b");
  if (indicators.has("SMA")) drawLine(calcSMA(closes, smaLen), "#818cf8");
  if (indicators.has("BB")) {
    const bb = calcBB(closes);
    drawLine(bb.mid,   "#94a3b8", 1);
    drawLine(bb.upper, "#38bdf8", 1);
    drawLine(bb.lower, "#38bdf8", 1);
    // Fill band
    ctx.beginPath();
    let started = false;
    bb.upper.forEach((v, i) => {
      if (v === null) { started = false; return; }
      const x = toX(i), y = toY(v);
      if (!started) { ctx.moveTo(x, y); started = true; }
      else ctx.lineTo(x, y);
    });
    for (let i = bb.lower.length - 1; i >= 0; i--) {
      const v = bb.lower[i];
      if (v === null) continue;
      ctx.lineTo(toX(i), toY(v));
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(56,189,248,0.04)";
    ctx.fill();
  }

  // RSI panel
  if (indicators.has("RSI")) {
    const rsiVals = calcRSI(closes);
    const rsiTop = PAD_T + mainH + 8;

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, rsiTop, W, rsiH);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PAD_L, rsiTop); ctx.lineTo(W - PAD_R, rsiTop); ctx.stroke();

    // 70 / 30 lines
    [70, 50, 30].forEach(lvl => {
      const y = rsiTop + rsiH - (lvl / 100) * rsiH;
      ctx.strokeStyle = lvl === 50 ? "#334155" : "#dc2626" + (lvl === 70 ? "80" : "80");
      ctx.lineWidth = 0.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(PAD_L, y); ctx.lineTo(W - PAD_R, y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#64748b";
      ctx.font = "9px monospace";
      ctx.textAlign = "right";
      ctx.fillText(String(lvl), PAD_L - 4, y + 3);
    });

    // RSI line
    ctx.strokeStyle = "#a78bfa";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    let started = false;
    rsiVals.forEach((v, i) => {
      if (v === null) { started = false; return; }
      const x = toX(i);
      const y = rsiTop + rsiH - (v / 100) * rsiH;
      if (!started) { ctx.moveTo(x, y); started = true; }
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.fillStyle = "#94a3b8";
    ctx.font = "9px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("RSI(14)", PAD_L + 4, rsiTop + 10);
  }

  // Hover crosshair + tooltip
  if (hoverIdx !== null && hoverIdx >= 0 && hoverIdx < data.length) {
    const d = data[hoverIdx];
    const x = toX(hoverIdx);

    ctx.strokeStyle = "rgba(148,163,184,0.4)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(x, PAD_T); ctx.lineTo(x, H - PAD_B); ctx.stroke();
    ctx.setLineDash([]);

    const date = new Date(d.t).toLocaleDateString();
    const lines = [
      date,
      `O: ${d.o.toFixed(2)}`,
      `H: ${d.h.toFixed(2)}`,
      `L: ${d.l.toFixed(2)}`,
      `C: ${d.c.toFixed(2)}`,
    ];
    const tw = 110, th = lines.length * 16 + 12;
    let tx = x + 10, ty = PAD_T + 8;
    if (tx + tw > W - PAD_R) tx = x - tw - 10;

    ctx.fillStyle = "rgba(15,23,42,0.92)";
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.roundRect(tx, ty, tw, th, 6);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = "#e2e8f0";
    ctx.font = "10px monospace";
    ctx.textAlign = "left";
    lines.forEach((l, i) => ctx.fillText(l, tx + 8, ty + 14 + i * 16));
  }
}

// ── Main component ───────────────────────────────────────────────────────────
export default function CryptoChartAnalyzer({ compact }: Props) {
  const [coin, setCoin]         = useState(COINS[0]);
  const [tfDays, setTfDays]     = useState(30);
  const [data, setData]         = useState<OHLC[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [indicators, setIndicators] = useState<Set<Indicator>>(new Set(["EMA", "BB"]));
  const [emaLen, setEmaLen]     = useState(20);
  const [smaLen, setSmaLen]     = useState(50);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch OHLC from CoinGecko public API (free, no key)
  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const url = `https://api.coingecko.com/api/v3/coins/${coin.id}/ohlc?vs_currency=usd&days=${tfDays}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const raw: [number, number, number, number, number][] = await res.json();
      const ohlc: OHLC[] = raw.map(([t, o, h, l, c]) => ({ t, o, h, l, c, v: 0 }));
      setData(ohlc);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [coin, tfDays]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Render on data/indicator change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    renderChart(canvas, data, indicators, emaLen, smaLen, hoverIdx);
  }, [data, indicators, emaLen, smaLen, hoverIdx]);

  // Re-render on resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const obs = new ResizeObserver(() => {
      if (data.length > 0) renderChart(canvas, data, indicators, emaLen, smaLen, hoverIdx);
    });
    obs.observe(canvas);
    return () => obs.disconnect();
  }, [data, indicators, emaLen, smaLen, hoverIdx]);

  // Mouse move → hover index
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const PAD_L = 60, PAD_R = 12;
    const chartW = rect.width - PAD_L - PAD_R;
    const mx = e.clientX - rect.left - PAD_L;
    const idx = Math.round((mx / chartW) * (data.length - 1));
    setHoverIdx(Math.max(0, Math.min(data.length - 1, idx)));
  }, [data]);

  const toggleIndicator = (ind: Indicator) => {
    setIndicators(prev => {
      const next = new Set(prev);
      next.has(ind) ? next.delete(ind) : next.add(ind);
      return next;
    });
  };

  const latestPrice = data.length > 0 ? data[data.length - 1].c : null;
  const firstPrice  = data.length > 0 ? data[0].o : null;
  const pctChange   = latestPrice && firstPrice ? ((latestPrice - firstPrice) / firstPrice) * 100 : null;

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <select value={coin.id} onChange={e => setCoin(COINS.find(c => c.id === e.target.value)!)}
            className="text-xs border rounded px-2 py-1 bg-slate-900 text-white border-slate-700 focus:outline-none">
            {COINS.map(c => <option key={c.id} value={c.id}>{c.symbol}</option>)}
          </select>
          <div className="flex gap-1">
            {TIMEFRAMES.map(tf => (
              <button key={tf.days} onClick={() => setTfDays(tf.days)}
                className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                  tfDays === tf.days ? "bg-blue-600 text-white border-blue-600" : "text-slate-400 border-slate-700 hover:text-white"
                }`}>{tf.label}</button>
            ))}
          </div>
          {latestPrice && (
            <span className={`text-xs font-bold ml-auto ${pctChange && pctChange >= 0 ? "text-green-400" : "text-red-400"}`}>
              ${latestPrice.toLocaleString()} {pctChange !== null && `(${pctChange >= 0 ? "+" : ""}${pctChange.toFixed(2)}%)`}
            </span>
          )}
        </div>
        <div className="relative bg-slate-900 rounded-xl overflow-hidden" style={{ height: 200 }}>
          {loading && <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">Loading…</div>}
          {error  && <div className="absolute inset-0 flex items-center justify-center text-xs text-red-400">{error}</div>}
          <canvas ref={canvasRef} className="w-full h-full block"
            onMouseMove={handleMouseMove} onMouseLeave={() => setHoverIdx(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls bar */}
      <div className="flex flex-wrap items-center gap-3 bg-slate-900 rounded-2xl px-4 py-3">
        {/* Coin selector */}
        <select value={coin.id} onChange={e => setCoin(COINS.find(c => c.id === e.target.value)!)}
          className="text-sm border border-slate-700 rounded-lg px-3 py-1.5 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          {COINS.map(c => <option key={c.id} value={c.id}>{c.symbol} – {c.name}</option>)}
        </select>

        {/* Timeframe */}
        <div className="flex gap-1">
          {TIMEFRAMES.map(tf => (
            <button key={tf.days} onClick={() => setTfDays(tf.days)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors font-medium ${
                tfDays === tf.days
                  ? "bg-blue-600 text-white border-blue-600"
                  : "text-slate-400 border-slate-700 hover:text-white hover:border-slate-500"
              }`}>{tf.label}</button>
          ))}
        </div>

        {/* Price */}
        {latestPrice && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-white font-bold">${latestPrice.toLocaleString()}</span>
            {pctChange !== null && (
              <span className={`text-sm font-semibold px-2 py-0.5 rounded-lg ${
                pctChange >= 0 ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"
              }`}>
                {pctChange >= 0 ? "▲" : "▼"} {Math.abs(pctChange).toFixed(2)}%
              </span>
            )}
          </div>
        )}

        <button onClick={fetchData} disabled={loading}
          className="text-xs text-slate-400 hover:text-white border border-slate-700 rounded-lg px-2.5 py-1.5 transition-colors disabled:opacity-50">
          {loading ? "…" : "⟳"}
        </button>
      </div>

      {/* Indicator toggles + settings */}
      <div className="flex flex-wrap items-center gap-2">
        {(["EMA", "SMA", "BB", "RSI"] as Indicator[]).map(ind => (
          <button key={ind} onClick={() => toggleIndicator(ind)}
            className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${
              indicators.has(ind)
                ? ind === "EMA" ? "bg-amber-500/20 text-amber-400 border-amber-500/50"
                : ind === "SMA" ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/50"
                : ind === "BB"  ? "bg-sky-500/20 text-sky-400 border-sky-500/50"
                :                 "bg-violet-500/20 text-violet-400 border-violet-500/50"
                : "text-slate-500 border-slate-700 hover:text-slate-300"
            }`}>{ind}</button>
        ))}

        {indicators.has("EMA") && (
          <label className="flex items-center gap-1.5 text-xs text-amber-400">
            EMA
            <input type="number" min={2} max={200} value={emaLen}
              onChange={e => setEmaLen(+e.target.value)}
              className="w-14 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-center text-white focus:outline-none" />
          </label>
        )}
        {indicators.has("SMA") && (
          <label className="flex items-center gap-1.5 text-xs text-indigo-400">
            SMA
            <input type="number" min={2} max={200} value={smaLen}
              onChange={e => setSmaLen(+e.target.value)}
              className="w-14 bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-center text-white focus:outline-none" />
          </label>
        )}

        <span className="ml-auto text-[10px] text-slate-600">
          Data: CoinGecko API · Browser-only · No server
        </span>
      </div>

      {/* Chart canvas */}
      <div className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800" style={{ height: 480 }}>
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
            <div className="w-6 h-6 border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-xs">Fetching {coin.symbol} data…</span>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={fetchData} className="text-xs text-blue-400 hover:underline">Retry</button>
          </div>
        )}
        {!loading && !error && data.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">No data</div>
        )}
        <canvas
          ref={canvasRef}
          className="w-full h-full block cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIdx(null)}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-[11px]">
        <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded bg-green-500 inline-block" />Bullish candle</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded bg-red-500 inline-block" />Bearish candle</span>
        {indicators.has("EMA") && <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-amber-400 inline-block" />EMA {emaLen}</span>}
        {indicators.has("SMA") && <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-indigo-400 inline-block" />SMA {smaLen}</span>}
        {indicators.has("BB")  && <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-sky-400 inline-block" />Bollinger Bands (20,2)</span>}
        {indicators.has("RSI") && <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-violet-400 inline-block" />RSI (14)</span>}
        <span className="ml-auto text-slate-500">Hover over chart for OHLC tooltip</span>
      </div>
    </div>
  );
}
