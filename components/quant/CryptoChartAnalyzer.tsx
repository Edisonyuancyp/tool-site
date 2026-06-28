"use client";
import { useState, useEffect, useRef } from "react";

interface Props { compact?: boolean; }

const COINS = [
  { tv: "BINANCE:BTCUSDT",   symbol: "BTC",  name: "Bitcoin"   },
  { tv: "BINANCE:ETHUSDT",   symbol: "ETH",  name: "Ethereum"  },
  { tv: "BINANCE:BNBUSDT",   symbol: "BNB",  name: "BNB"       },
  { tv: "BINANCE:SOLUSDT",   symbol: "SOL",  name: "Solana"    },
  { tv: "BINANCE:XRPUSDT",   symbol: "XRP",  name: "XRP"       },
  { tv: "BINANCE:ADAUSDT",   symbol: "ADA",  name: "Cardano"   },
  { tv: "BINANCE:DOGEUSDT",  symbol: "DOGE", name: "Dogecoin"  },
  { tv: "BINANCE:AVAXUSDT",  symbol: "AVAX", name: "Avalanche" },
  { tv: "BINANCE:LINKUSDT",  symbol: "LINK", name: "Chainlink" },
  { tv: "BINANCE:DOTUSDT",   symbol: "DOT",  name: "Polkadot"  },
  { tv: "BINANCE:TONUSDT",   symbol: "TON",  name: "Toncoin"   },
  { tv: "BINANCE:SHIBUSDT",  symbol: "SHIB", name: "Shiba Inu" },
  { tv: "BINANCE:SUIUSDT",   symbol: "SUI",  name: "Sui"       },
  { tv: "BINANCE:APTUSDT",   symbol: "APT",  name: "Aptos"     },
  { tv: "BINANCE:MATICUSDT", symbol: "MATIC",name: "Polygon"   },
];

const INTERVALS = [
  { label: "1m",  tv: "1"   },
  { label: "5m",  tv: "5"   },
  { label: "15m", tv: "15"  },
  { label: "1H",  tv: "60"  },
  { label: "4H",  tv: "240" },
  { label: "1D",  tv: "D"   },
  { label: "1W",  tv: "W"   },
];

declare global {
  interface Window { TradingView: { widget: new (cfg: object) => void }; }
}

// ── TradingView Widget sub-component ─────────────────────────────────────────
function TradingViewChart({
  symbol, interval, compact,
}: { symbol: string; interval: string; compact: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = "";

    const divId = `tv_${Math.random().toString(36).slice(2)}`;
    const div = document.createElement("div");
    div.id = divId;
    div.style.width = "100%";
    div.style.height = "100%";
    container.appendChild(div);

    function init() {
      if (!window.TradingView) return;
      new window.TradingView.widget({
        autosize: true,
        symbol,
        interval,
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        toolbar_bg: "#131722",
        enable_publishing: false,
        allow_symbol_change: false,
        container_id: divId,
        hide_top_toolbar: compact,
        hide_legend: compact,
        hide_side_toolbar: compact,
        save_image: !compact,
        studies: compact ? [] : ["RSI@tv-basicstudies", "MACD@tv-basicstudies"],
        withdateranges: !compact,
        show_popup_button: !compact,
      });
    }

    const scriptId = "tv-widget-script";
    if (document.getElementById(scriptId)) {
      init();
    } else {
      const s = document.createElement("script");
      s.id = scriptId;
      s.src = "https://s3.tradingview.com/tv.js";
      s.async = true;
      s.onload = init;
      document.head.appendChild(s);
    }

    return () => { container.innerHTML = ""; };
  }, [symbol, interval, compact]);

  return <div ref={containerRef} className="w-full h-full" />;
}

// ── Main component ───────────────────────────────────────────────────────────
export default function CryptoChartAnalyzer({ compact }: Props) {
  const [coin, setCoin]         = useState(COINS[0]);
  const [interval, setInterval] = useState(INTERVALS[5]); // 1D default

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={coin.tv}
            onChange={e => setCoin(COINS.find(c => c.tv === e.target.value)!)}
            className="text-xs border rounded px-2 py-1 bg-slate-900 text-white border-slate-700 focus:outline-none"
          >
            {COINS.map(c => <option key={c.tv} value={c.tv}>{c.symbol}</option>)}
          </select>
          <div className="flex gap-1">
            {INTERVALS.filter(i => ["1H","4H","1D","1W"].includes(i.label)).map(iv => (
              <button key={iv.tv} onClick={() => setInterval(iv)}
                className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                  interval.tv === iv.tv
                    ? "bg-blue-600 text-white border-blue-600"
                    : "text-slate-400 border-slate-700 hover:text-white"
                }`}>{iv.label}</button>
            ))}
          </div>
        </div>
        <div className="relative bg-[#131722] rounded-xl overflow-hidden border border-slate-800" style={{ height: 300 }}>
          <TradingViewChart symbol={coin.tv} interval={interval.tv} compact />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* ── Top bar ── */}
      <div className="flex flex-wrap items-center gap-3 bg-[#131722] border border-slate-800 rounded-xl px-4 py-2.5">
        <select
          value={coin.tv}
          onChange={e => setCoin(COINS.find(c => c.tv === e.target.value)!)}
          className="text-sm font-semibold border border-slate-700 rounded-lg px-3 py-1.5 bg-[#1e222d] text-white focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-[160px]"
        >
          {COINS.map(c => <option key={c.tv} value={c.tv}>{c.symbol} – {c.name}</option>)}
        </select>

        <div className="flex gap-0.5 bg-[#1e222d] rounded-lg p-0.5">
          {INTERVALS.map(iv => (
            <button key={iv.tv} onClick={() => setInterval(iv)}
              className={`text-xs px-2.5 py-1.5 rounded-md font-medium transition-all ${
                interval.tv === iv.tv
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}>{iv.label}</button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live · Binance · Powered by TradingView
        </div>
      </div>

      {/* ── Chart ── */}
      <div
        className="relative bg-[#131722] rounded-xl overflow-hidden border border-slate-800"
        style={{ height: 620 }}
      >
        <TradingViewChart symbol={coin.tv} interval={interval.tv} compact={false} />
      </div>

      <p className="text-[11px] text-slate-600 text-center">
        Drawing tools · 100+ indicators · Real-time data · Powered by{" "}
        <a
          href="https://www.tradingview.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          TradingView
        </a>
      </p>
    </div>
  );
}
