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
  { id: "bitcoin",        symbol: "BTC",  name: "Bitcoin"   },
  { id: "ethereum",       symbol: "ETH",  name: "Ethereum"  },
  { id: "binancecoin",    symbol: "BNB",  name: "BNB"       },
  { id: "solana",         symbol: "SOL",  name: "Solana"    },
  { id: "ripple",         symbol: "XRP",  name: "XRP"       },
  { id: "cardano",        symbol: "ADA",  name: "Cardano"   },
  { id: "dogecoin",       symbol: "DOGE", name: "Dogecoin"  },
  { id: "avalanche-2",    symbol: "AVAX", name: "Avalanche" },
  { id: "chainlink",      symbol: "LINK", name: "Chainlink" },
  { id: "polkadot",       symbol: "DOT",  name: "Polkadot"  },
  { id: "toncoin",        symbol: "TON",  name: "Toncoin"   },
  { id: "shiba-inu",      symbol: "SHIB", name: "Shiba Inu" },
];

const TIMEFRAMES = [
  { label: "1W",  days: 7,   interval: "hourly"  },
  { label: "1M",  days: 30,  interval: "daily"   },
  { label: "3M",  days: 90,  interval: "daily"   },
  { label: "6M",  days: 180, interval: "daily"   },
  { label: "1Y",  days: 365, interval: "daily"   },
  { label: "2Y",  days: 730, interval: "daily"   },
];

type Indicator = "EMA" | "SMA" | "BB" | "RSI" | "MACD" | "VOL";

// ── Price formatting ─────────────────────────────────────────────────────────
function fmtPrice(p: number): string {
  if (p >= 1000)  return p.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (p >= 1)     return p.toFixed(2);
  if (p >= 0.01)  return p.toFixed(4);
  return p.toFixed(8);
}

function fmtVol(v: number): string {
  if (v >= 1e9) return (v / 1e9).toFixed(2) + "B";
  if (v >= 1e6) return (v / 1e6).toFixed(2) + "M";
  if (v >= 1e3) return (v / 1e3).toFixed(1) + "K";
  return v.toFixed(0);
}

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
  if (closes.length < period) return out;
  let ema = closes.slice(0, period).reduce((a, b) => a + b, 0) / period;
  out[period - 1] = ema;
  for (let i = period; i < closes.length; i++) {
    ema = closes[i] * k + ema * (1 - k);
    out[i] = ema;
  }
  return out;
}

function calcBB(closes: number[], period = 20, mult = 2) {
  const mid = calcSMA(closes, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];
  closes.forEach((_, i) => {
    if (i < period - 1) { upper.push(null); lower.push(null); return; }
    const slice = closes.slice(i - period + 1, i + 1);
    const m = mid[i] as number;
    const sd = Math.sqrt(slice.reduce((acc, v) => acc + (v - m) ** 2, 0) / period);
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
  out[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    avgGain = (avgGain * (period - 1) + Math.max(0, d)) / period;
    avgLoss = (avgLoss * (period - 1) + Math.max(0, -d)) / period;
    out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }
  return out;
}

function calcMACD(closes: number[]) {
  const ema12 = calcEMA(closes, 12);
  const ema26 = calcEMA(closes, 26);
  const macdLine: (number | null)[] = closes.map((_, i) => {
    const a = ema12[i], b = ema26[i];
    return a !== null && b !== null ? a - b : null;
  });
  const validMacd = macdLine.filter(v => v !== null) as number[];
  const startIdx = macdLine.findIndex(v => v !== null);
  const signalRaw = calcEMA(validMacd, 9);
  const signal: (number | null)[] = Array(closes.length).fill(null);
  signalRaw.forEach((v, i) => { signal[startIdx + i] = v; });
  const histogram: (number | null)[] = macdLine.map((m, i) => {
    const s = signal[i];
    return m !== null && s !== null ? m - s : null;
  });
  return { macdLine, signal, histogram };
}

// ── Canvas renderer ──────────────────────────────────────────────────────────
interface RenderOptions {
  data: OHLC[];
  indicators: Set<Indicator>;
  emaLen: number;
  smaLen: number;
  hoverIdx: number | null;
  tfDays: number;
}

function renderChart(canvas: HTMLCanvasElement, opts: RenderOptions) {
  const { data, indicators, emaLen, smaLen, hoverIdx, tfDays } = opts;
  if (data.length === 0) return;

  const dpr = window.devicePixelRatio || 1;
  const W = canvas.clientWidth;
  const H = canvas.clientHeight;
  canvas.width  = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(dpr, dpr);

  // ── Layout panels ──────────────────────────────────────────────────────────
  const PAD_L = 72, PAD_R = 4, PAD_T = 8, PAD_B = 28;
  const showVol  = indicators.has("VOL");
  const showRSI  = indicators.has("RSI");
  const showMACD = indicators.has("MACD");
  const volH   = showVol  ? 60  : 0;
  const rsiH   = showRSI  ? 70  : 0;
  const macdH  = showMACD ? 70  : 0;
  const sepH   = 6;
  const subH   = (showVol ? volH + sepH : 0) + (showRSI ? rsiH + sepH : 0) + (showMACD ? macdH + sepH : 0);
  const mainH  = H - PAD_T - PAD_B - subH;
  const chartW = W - PAD_L - PAD_R;

  const closes = data.map(d => d.c);
  const highs  = data.map(d => d.h);
  const lows   = data.map(d => d.l);
  const vols   = data.map(d => d.v);

  const priceMin = Math.min(...lows)  * 0.997;
  const priceMax = Math.max(...highs) * 1.003;

  const n = data.length;
  const candleW = Math.max(1.5, Math.min(14, (chartW / n) * 0.72));
  const toX = (i: number) => PAD_L + ((i + 0.5) / n) * chartW;
  const toY = (p: number, top = PAD_T, h = mainH) =>
    top + h - ((p - priceMin) / (priceMax - priceMin)) * h;

  // ── Background ─────────────────────────────────────────────────────────────
  ctx.fillStyle = "#0b0e17";
  ctx.fillRect(0, 0, W, H);

  // ── Grid lines + price axis ────────────────────────────────────────────────
  const gridCount = 6;
  ctx.font = "10px 'SF Mono', 'Consolas', monospace";
  ctx.textAlign = "right";
  for (let i = 0; i <= gridCount; i++) {
    const y = PAD_T + (i / gridCount) * mainH;
    ctx.strokeStyle = "#1a2035";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PAD_L, y); ctx.lineTo(W - PAD_R, y); ctx.stroke();
    const price = priceMax - (i / gridCount) * (priceMax - priceMin);
    ctx.fillStyle = "#4b5563";
    ctx.fillText(fmtPrice(price), PAD_L - 4, y + 3.5);
  }

  // ── X-axis time labels ─────────────────────────────────────────────────────
  const xLabelCount = Math.min(8, Math.floor(chartW / 70));
  ctx.fillStyle = "#4b5563";
  ctx.textAlign = "center";
  ctx.font = "10px sans-serif";
  for (let i = 0; i <= xLabelCount; i++) {
    const dataIdx = Math.round((i / xLabelCount) * (n - 1));
    const x = toX(dataIdx);
    const d = new Date(data[dataIdx].t);
    const label = tfDays <= 7
      ? d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
      : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: n > 200 ? "2-digit" : undefined });
    ctx.fillText(label, x, H - PAD_B + 16);
  }

  // ── Candlesticks ───────────────────────────────────────────────────────────
  data.forEach((d, i) => {
    const x  = toX(i);
    const bull = d.c >= d.o;
    const bullColor = "#26a69a", bearColor = "#ef5350";
    const color = bull ? bullColor : bearColor;

    // Wick
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, toY(d.h));
    ctx.lineTo(x, toY(d.l));
    ctx.stroke();

    // Body
    const bodyTop = Math.min(toY(d.o), toY(d.c));
    const bodyH   = Math.max(1.5, Math.abs(toY(d.o) - toY(d.c)));
    if (bull) {
      ctx.strokeStyle = bullColor;
      ctx.lineWidth = Math.min(candleW, 1.5);
      ctx.fillStyle = candleW > 4 ? bullColor : "transparent";
    } else {
      ctx.fillStyle = bearColor;
    }
    ctx.fillRect(x - candleW / 2, bodyTop, candleW, bodyH);
    if (bull && candleW > 4) {
      ctx.strokeRect(x - candleW / 2, bodyTop, candleW, bodyH);
    }
  });

  // ── Indicator line helper ──────────────────────────────────────────────────
  function drawLine(vals: (number | null)[], color: string, lw = 1.5,
    top = PAD_T, h = mainH, minV = priceMin, maxV = priceMax) {
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.beginPath();
    let started = false;
    vals.forEach((v, i) => {
      if (v === null) { started = false; return; }
      const x = toX(i);
      const y = top + h - ((v - minV) / (maxV - minV)) * h;
      if (!started) { ctx.moveTo(x, y); started = true; }
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  // ── EMA / SMA / BB overlays ────────────────────────────────────────────────
  if (indicators.has("EMA")) drawLine(calcEMA(closes, emaLen), "#f59e0b", 1.5);
  if (indicators.has("SMA")) drawLine(calcSMA(closes, smaLen), "#818cf8", 1.5);
  if (indicators.has("BB")) {
    const bb = calcBB(closes);
    // Shaded band
    ctx.beginPath();
    let s = false;
    bb.upper.forEach((v, i) => {
      if (v === null) { s = false; return; }
      const x = toX(i), y = toY(v);
      if (!s) { ctx.moveTo(x, y); s = true; } else ctx.lineTo(x, y);
    });
    for (let i = bb.lower.length - 1; i >= 0; i--) {
      const v = bb.lower[i];
      if (v !== null) ctx.lineTo(toX(i), toY(v));
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(56,189,248,0.05)";
    ctx.fill();
    drawLine(bb.upper, "rgba(56,189,248,0.7)", 1);
    drawLine(bb.mid,   "rgba(148,163,184,0.5)", 1);
    drawLine(bb.lower, "rgba(56,189,248,0.7)", 1);
  }

  // ── Sub-panels ─────────────────────────────────────────────────────────────
  let subTop = PAD_T + mainH;

  function drawPanelBg(top: number, h: number, label: string) {
    ctx.fillStyle = "#0b0e17";
    ctx.fillRect(0, top, W, h);
    ctx.strokeStyle = "#1a2035";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PAD_L, top); ctx.lineTo(W - PAD_R, top); ctx.stroke();
    ctx.fillStyle = "#6b7280";
    ctx.font = "9px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(label, PAD_L + 4, top + 11);
  }

  // Volume bars
  if (showVol) {
    subTop += sepH;
    drawPanelBg(subTop, volH, "VOL");
    const maxVol = Math.max(...vols.filter(v => v > 0));
    if (maxVol > 0) {
      data.forEach((d, i) => {
        if (d.v === 0) return;
        const x = toX(i);
        const barH = (d.v / maxVol) * (volH - 14);
        ctx.fillStyle = d.c >= d.o ? "rgba(38,166,154,0.6)" : "rgba(239,83,80,0.6)";
        ctx.fillRect(x - candleW / 2, subTop + volH - barH, candleW, barH);
      });
      // Vol axis label
      ctx.fillStyle = "#4b5563";
      ctx.font = "9px monospace";
      ctx.textAlign = "right";
      ctx.fillText(fmtVol(maxVol), PAD_L - 4, subTop + 14);
    }
    subTop += volH;
  }

  // RSI panel
  if (showRSI) {
    subTop += sepH;
    drawPanelBg(subTop, rsiH, "RSI(14)");
    const rsiVals = calcRSI(closes);
    [70, 50, 30].forEach(lvl => {
      const y = subTop + rsiH - (lvl / 100) * rsiH;
      ctx.strokeStyle = lvl === 50 ? "#1e2d40" : "rgba(239,83,80,0.3)";
      ctx.lineWidth = 0.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(PAD_L, y); ctx.lineTo(W - PAD_R, y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#4b5563";
      ctx.font = "9px monospace";
      ctx.textAlign = "right";
      ctx.fillText(String(lvl), PAD_L - 4, y + 3);
    });
    drawLine(rsiVals, "#a78bfa", 1.5, subTop, rsiH, 0, 100);

    // RSI overbought/oversold fill
    const rsiFiltered = rsiVals.map((v, i) => ({ v, i })).filter(x => x.v !== null);
    if (rsiFiltered.length > 1) {
      ctx.beginPath();
      rsiFiltered.forEach(({ v, i }, j) => {
        const x = toX(i), y = subTop + rsiH - ((v as number) / 100) * rsiH;
        j === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      const last = rsiFiltered[rsiFiltered.length - 1];
      ctx.lineTo(toX(last.i), subTop + rsiH);
      ctx.lineTo(toX(rsiFiltered[0].i), subTop + rsiH);
      ctx.closePath();
      ctx.fillStyle = "rgba(167,139,250,0.07)";
      ctx.fill();
    }
    subTop += rsiH;
  }

  // MACD panel
  if (showMACD) {
    subTop += sepH;
    drawPanelBg(subTop, macdH, "MACD(12,26,9)");
    const { macdLine, signal, histogram } = calcMACD(closes);
    const validH = histogram.filter(v => v !== null) as number[];
    if (validH.length > 0) {
      const maxAbs = Math.max(...validH.map(Math.abs)) * 1.1 || 1;
      const mTop = subTop, mH = macdH;
      const toMY = (v: number) => mTop + mH / 2 - (v / maxAbs) * (mH / 2);

      // Zero line
      ctx.strokeStyle = "#1e2d40";
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(PAD_L, mTop + mH / 2); ctx.lineTo(W - PAD_R, mTop + mH / 2); ctx.stroke();

      // Histogram bars
      histogram.forEach((v, i) => {
        if (v === null) return;
        const x = toX(i);
        const y0 = mTop + mH / 2;
        const y1 = toMY(v);
        ctx.fillStyle = v >= 0 ? "rgba(38,166,154,0.7)" : "rgba(239,83,80,0.7)";
        ctx.fillRect(x - candleW / 2, Math.min(y0, y1), candleW, Math.abs(y1 - y0) || 1);
      });

      // MACD & signal lines
      drawLine(macdLine, "#2196f3", 1.5, mTop, mH, -maxAbs, maxAbs);
      drawLine(signal,   "#ff9800", 1.2, mTop, mH, -maxAbs, maxAbs);

      // Axis labels
      ctx.fillStyle = "#4b5563";
      ctx.font = "9px monospace";
      ctx.textAlign = "right";
      ctx.fillText(maxAbs.toFixed(maxAbs > 100 ? 0 : 2), PAD_L - 4, mTop + 10);
    }
  }

  // ── Current price line ─────────────────────────────────────────────────────
  const lastPrice = closes[closes.length - 1];
  const lastY = toY(lastPrice);
  ctx.strokeStyle = "rgba(99,179,237,0.6)";
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(PAD_L, lastY); ctx.lineTo(W - PAD_R, lastY); ctx.stroke();
  ctx.setLineDash([]);
  // Price tag
  ctx.fillStyle = "#3b82f6";
  ctx.beginPath();
  ctx.roundRect(W - PAD_R - 1, lastY - 8, 1, 16, 2);
  ctx.fill();
  ctx.fillStyle = "#1e3a5f";
  ctx.fillRect(PAD_L - 72, lastY - 9, 68, 18);
  ctx.fillStyle = "#93c5fd";
  ctx.font = "bold 10px monospace";
  ctx.textAlign = "right";
  ctx.fillText(fmtPrice(lastPrice), PAD_L - 4, lastY + 4);

  // ── Hover crosshair ────────────────────────────────────────────────────────
  if (hoverIdx !== null && hoverIdx >= 0 && hoverIdx < n) {
    const d = data[hoverIdx];
    const x = toX(hoverIdx);

    ctx.strokeStyle = "rgba(148,163,184,0.25)";
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(x, PAD_T); ctx.lineTo(x, H - PAD_B); ctx.stroke();

    const bull = d.c >= d.o;
    const chg = ((d.c - d.o) / d.o) * 100;
    const date = tfDays <= 7
      ? new Date(d.t).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
      : new Date(d.t).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    const lines: [string, string][] = [
      ["Date", date],
      ["Open", fmtPrice(d.o)],
      ["High", fmtPrice(d.h)],
      ["Low",  fmtPrice(d.l)],
      ["Close",fmtPrice(d.c)],
      ["Chg",  `${chg >= 0 ? "+" : ""}${chg.toFixed(2)}%`],
      ...(d.v > 0 ? [["Vol", fmtVol(d.v)] as [string, string]] : []),
    ];

    const tw = 160, th = lines.length * 17 + 14;
    let tx = x + 12, ty = PAD_T + 8;
    if (tx + tw > W - 8) tx = x - tw - 12;
    if (ty + th > PAD_T + mainH) ty = PAD_T + mainH - th - 4;

    ctx.fillStyle = "rgba(11,14,23,0.95)";
    ctx.strokeStyle = "#2d3748";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(tx, ty, tw, th, 6);
    ctx.fill(); ctx.stroke();

    // Color strip
    ctx.fillStyle = bull ? "#26a69a" : "#ef5350";
    ctx.beginPath();
    ctx.roundRect(tx, ty, 3, th, [6, 0, 0, 6]);
    ctx.fill();

    ctx.font = "10px 'SF Mono', monospace";
    lines.forEach(([label, val], i) => {
      const ly = ty + 14 + i * 17;
      ctx.fillStyle = "#6b7280";
      ctx.textAlign = "left";
      ctx.fillText(label, tx + 10, ly);
      ctx.fillStyle = label === "Chg"
        ? (chg >= 0 ? "#26a69a" : "#ef5350")
        : label === "High" ? "#26a69a"
        : label === "Low"  ? "#ef5350"
        : "#e2e8f0";
      ctx.textAlign = "right";
      ctx.fillText(val, tx + tw - 8, ly);
    });
  }
}

// ── Main component ───────────────────────────────────────────────────────────
export default function CryptoChartAnalyzer({ compact }: Props) {
  const [coin, setCoin]     = useState(COINS[0]);
  const [tf, setTf]         = useState(TIMEFRAMES[1]);
  const [data, setData]     = useState<OHLC[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [indicators, setIndicators] = useState<Set<Indicator>>(
    new Set(["EMA", "BB", "VOL"] as Indicator[])
  );
  const [emaLen, setEmaLen] = useState(20);
  const [smaLen, setSmaLen] = useState(50);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      // CoinGecko free OHLC endpoint
      const url = `https://api.coingecko.com/api/v3/coins/${coin.id}/ohlc?vs_currency=usd&days=${tf.days}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const raw: [number, number, number, number, number][] = await res.json();

      // Also fetch market_chart for volume data
      const vcUrl = `https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=usd&days=${tf.days}&interval=${tf.days <= 7 ? "hourly" : "daily"}`;
      let volMap: Record<number, number> = {};
      try {
        const vr = await fetch(vcUrl);
        if (vr.ok) {
          const vdata = await vr.json();
          (vdata.total_volumes as [number, number][]).forEach(([t, v]) => {
            // Round to nearest candle timestamp (4h for OHLC)
            const rounded = Math.round(t / (4 * 3600 * 1000)) * (4 * 3600 * 1000);
            volMap[rounded] = v;
          });
        }
      } catch { /* volume optional */ }

      const ohlc: OHLC[] = raw.map(([t, o, h, l, c]) => ({
        t, o, h, l, c,
        v: volMap[t] ?? volMap[Math.round(t / (4 * 3600 * 1000)) * (4 * 3600 * 1000)] ?? 0,
      }));
      setData(ohlc);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, [coin, tf]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const renderOpts = useCallback(() => ({
    data, indicators, emaLen, smaLen, hoverIdx, tfDays: tf.days,
  }), [data, indicators, emaLen, smaLen, hoverIdx, tf.days]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    renderChart(canvas, renderOpts());
  }, [data, indicators, emaLen, smaLen, hoverIdx, renderOpts]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const obs = new ResizeObserver(() => {
      if (data.length > 0) renderChart(canvas, renderOpts());
    });
    obs.observe(canvas);
    return () => obs.disconnect();
  }, [data, renderOpts]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    const rect = canvas.getBoundingClientRect();
    const PAD_L = 72, PAD_R = 4;
    const chartW = rect.width - PAD_L - PAD_R;
    const mx = e.clientX - rect.left - PAD_L;
    const idx = Math.floor((mx / chartW) * data.length);
    setHoverIdx(Math.max(0, Math.min(data.length - 1, idx)));
  }, [data]);

  const toggleInd = (ind: Indicator) =>
    setIndicators(prev => { const s = new Set(prev); s.has(ind) ? s.delete(ind) : s.add(ind); return s; });

  const latest    = data.at(-1);
  const first     = data[0];
  const pct       = latest && first ? ((latest.c - first.o) / first.o) * 100 : null;
  const bull      = pct !== null && pct >= 0;

  const IND_CONFIG: { id: Indicator; label: string; color: string }[] = [
    { id: "EMA",  label: `EMA`,   color: "amber"  },
    { id: "SMA",  label: `SMA`,   color: "indigo" },
    { id: "BB",   label: "BB",    color: "sky"    },
    { id: "VOL",  label: "Vol",   color: "teal"   },
    { id: "RSI",  label: "RSI",   color: "violet" },
    { id: "MACD", label: "MACD",  color: "blue"   },
  ];

  const colorMap: Record<string, string> = {
    amber:  "bg-amber-500/20 text-amber-400 border-amber-500/40",
    indigo: "bg-indigo-500/20 text-indigo-400 border-indigo-500/40",
    sky:    "bg-sky-500/20 text-sky-400 border-sky-500/40",
    teal:   "bg-teal-500/20 text-teal-400 border-teal-500/40",
    violet: "bg-violet-500/20 text-violet-400 border-violet-500/40",
    blue:   "bg-blue-500/20 text-blue-400 border-blue-500/40",
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <select value={coin.id} onChange={e => setCoin(COINS.find(c => c.id === e.target.value)!)}
            className="text-xs border rounded px-2 py-1 bg-slate-900 text-white border-slate-700 focus:outline-none">
            {COINS.map(c => <option key={c.id} value={c.id}>{c.symbol}</option>)}
          </select>
          <div className="flex gap-1">
            {TIMEFRAMES.map(t => (
              <button key={t.days} onClick={() => setTf(t)}
                className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                  tf.days === t.days ? "bg-blue-600 text-white border-blue-600" : "text-slate-400 border-slate-700 hover:text-white"
                }`}>{t.label}</button>
            ))}
          </div>
          {latest && (
            <span className={`text-xs font-bold ml-auto ${bull ? "text-teal-400" : "text-red-400"}`}>
              ${fmtPrice(latest.c)} {pct !== null && `(${bull ? "+" : ""}${pct.toFixed(2)}%)`}
            </span>
          )}
        </div>
        <div className="relative bg-[#0b0e17] rounded-xl overflow-hidden" style={{ height: 200 }}>
          {loading && <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">Loading…</div>}
          {error   && <div className="absolute inset-0 flex items-center justify-center text-xs text-red-400">{error}</div>}
          <canvas ref={canvasRef} className="w-full h-full block"
            onMouseMove={handleMouseMove} onMouseLeave={() => setHoverIdx(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 font-sans">
      {/* ── Top bar ── */}
      <div className="flex flex-wrap items-center gap-3 bg-[#131722] border border-slate-800 rounded-xl px-4 py-2.5">
        <select value={coin.id} onChange={e => setCoin(COINS.find(c => c.id === e.target.value)!)}
          className="text-sm font-semibold border border-slate-700 rounded-lg px-3 py-1.5 bg-[#1e222d] text-white focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[140px]">
          {COINS.map(c => <option key={c.id} value={c.id}>{c.symbol} – {c.name}</option>)}
        </select>

        <div className="flex gap-0.5 bg-[#1e222d] rounded-lg p-0.5">
          {TIMEFRAMES.map(t => (
            <button key={t.days} onClick={() => setTf(t)}
              className={`text-xs px-2.5 py-1.5 rounded-md font-medium transition-all ${
                tf.days === t.days
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}>{t.label}</button>
          ))}
        </div>

        {latest && (
          <div className="flex items-baseline gap-2 ml-1">
            <span className="text-white text-lg font-bold tracking-tight">${fmtPrice(latest.c)}</span>
            {pct !== null && (
              <span className={`text-sm font-semibold ${bull ? "text-teal-400" : "text-red-400"}`}>
                {bull ? "▲" : "▼"} {Math.abs(pct).toFixed(2)}%
              </span>
            )}
            <span className="text-slate-500 text-xs">{tf.label} change</span>
          </div>
        )}

        <button onClick={fetchData} disabled={loading}
          className="ml-auto text-slate-400 hover:text-white border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm transition-colors disabled:opacity-40">
          {loading ? <span className="inline-block animate-spin">⟳</span> : "⟳"}
        </button>
      </div>

      {/* ── Indicator toolbar ── */}
      <div className="flex flex-wrap items-center gap-2">
        {IND_CONFIG.map(({ id, label, color }) => (
          <button key={id} onClick={() => toggleInd(id)}
            className={`text-xs px-3 py-1 rounded-full border font-medium transition-all ${
              indicators.has(id) ? colorMap[color] : "text-slate-600 border-slate-800 hover:text-slate-300"
            }`}>{label}</button>
        ))}
        {indicators.has("EMA") && (
          <label className="flex items-center gap-1 text-xs text-amber-400 ml-1">
            EMA <input type="number" min={2} max={200} value={emaLen} onChange={e => setEmaLen(+e.target.value)}
              className="w-12 bg-[#1e222d] border border-slate-700 rounded px-1.5 py-0.5 text-center text-white focus:outline-none" />
          </label>
        )}
        {indicators.has("SMA") && (
          <label className="flex items-center gap-1 text-xs text-indigo-400">
            SMA <input type="number" min={2} max={200} value={smaLen} onChange={e => setSmaLen(+e.target.value)}
              className="w-12 bg-[#1e222d] border border-slate-700 rounded px-1.5 py-0.5 text-center text-white focus:outline-none" />
          </label>
        )}
        <span className="ml-auto text-[10px] text-slate-700">CoinGecko · no login required</span>
      </div>

      {/* ── Chart ── */}
      <div className="relative bg-[#0b0e17] rounded-xl overflow-hidden border border-slate-800/60"
        style={{ height: 520 + (indicators.has("VOL") ? 66 : 0) + (indicators.has("RSI") ? 76 : 0) + (indicators.has("MACD") ? 76 : 0) }}>
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
            <div className="w-6 h-6 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-xs">Loading {coin.symbol}…</span>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={fetchData} className="text-xs text-blue-400 underline">Retry</button>
          </div>
        )}
        <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair"
          onMouseMove={handleMouseMove} onMouseLeave={() => setHoverIdx(null)} />
      </div>

      {/* ── Legend ── */}
      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-[11px] text-slate-500 px-1">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-teal-500/80" />Bullish</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-500/80" />Bearish</span>
        {indicators.has("EMA")  && <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-amber-400 inline-block" />EMA {emaLen}</span>}
        {indicators.has("SMA")  && <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-indigo-400 inline-block" />SMA {smaLen}</span>}
        {indicators.has("BB")   && <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-sky-400 inline-block" />Bollinger (20,2)</span>}
        {indicators.has("RSI")  && <span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-violet-400 inline-block" />RSI(14)</span>}
        {indicators.has("MACD") && <><span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-blue-400 inline-block" />MACD</span><span className="flex items-center gap-1.5"><span className="w-5 h-0.5 bg-orange-400 inline-block" />Signal</span></>}
        <span className="ml-auto">Hover for OHLC · Data: CoinGecko</span>
      </div>
    </div>
  );
}
