import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Crypto Position Sizing with Kelly Criterion – Free Calculator",
  description: "Learn how to stop over-leveraging and size crypto positions correctly using the Kelly Criterion formula. Free online calculator — no signup required.",
  keywords: [
    "crypto position sizing",
    "kelly criterion crypto",
    "position size calculator crypto",
    "how to size trades",
    "kelly criterion calculator",
    "optimal position size trading",
    "risk management crypto",
    "how much to invest per trade",
    "position sizing formula",
  ],
  alternates: { canonical: "https://getfastcalc.com/blog/crypto-position-sizing-kelly-criterion" },
  openGraph: {
    title: "Crypto Position Sizing with Kelly Criterion – Free Calculator",
    description: "Stop over-leveraging. Calculate optimal position sizes using Kelly Criterion formula.",
    type: "article",
    publishedTime: "2026-06-27",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Crypto Position Sizing with Kelly Criterion",
  "description": "How to calculate optimal position sizes for crypto trading using Kelly Criterion.",
  "datePublished": "2026-06-27",
  "author": { "@type": "Organization", "name": "GetFastCalc" },
  "publisher": { "@type": "Organization", "name": "GetFastCalc", "url": "https://getfastcalc.com" },
  "mainEntityOfPage": "https://getfastcalc.com/blog/crypto-position-sizing-kelly-criterion",
};

export default function Post() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold text-green-600 bg-green-100 px-2.5 py-0.5 rounded-full">Quant Trading</span>
            <span className="text-xs text-gray-400">June 27, 2026 · 6 min read</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
            How to Size Your Crypto Positions: Kelly Criterion Explained
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed">
            Stop over-leveraging. Learn how to calculate optimal position size using Kelly Criterion and free online tools.
          </p>
        </div>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Why Most Traders Size Positions Wrong</h2>
          <p>
            The number one cause of blown trading accounts isn't bad entries — it's <strong>bad position sizing</strong>.
            Traders either bet too small (leaving returns on the table) or too large (one losing streak wipes them out).
            Most traders pick a round number — "I'll risk 2%" — without any mathematical basis.
          </p>
          <p>
            The <strong>Kelly Criterion</strong> gives you a mathematically optimal answer: exactly what percentage of your
            capital to risk on each trade based on your historical win rate and average win/loss ratio.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">The Kelly Criterion Formula</h2>
          <div className="bg-gray-900 text-green-400 font-mono text-sm rounded-xl p-5 my-6">
            <p>f* = W - (1 - W) / R</p>
            <p className="text-gray-400 mt-2 text-xs">
              f* = Kelly fraction (% of capital to risk)<br/>
              W = Win rate (e.g. 0.55 for 55%)<br/>
              R = Win/Loss ratio (average win ÷ average loss)
            </p>
          </div>
          <p>
            For example: if your win rate is <strong>55%</strong> and your average win is <strong>1.5×</strong> your average loss:
          </p>
          <div className="bg-gray-50 rounded-xl p-5 font-mono text-sm">
            f* = 0.55 - (1 - 0.55) / 1.5 = 0.55 - 0.30 = <strong>0.25 (25%)</strong>
          </div>
          <p>
            The full Kelly says risk 25% per trade — which is extremely aggressive. Most professional traders use
            <strong> half-Kelly (12.5%)</strong> or <strong>quarter-Kelly (6.25%)</strong> for practical risk management.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 my-8">
            <p className="font-semibold text-green-900 mb-2">🧮 Try the Kelly Criterion Calculator</p>
            <p className="text-green-700 text-sm mb-4">Enter your win rate and risk/reward ratio to get your optimal position size instantly.</p>
            <Link
              href="/tools/calc/kelly-criterion-calculator"
              className="inline-block bg-green-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-green-700 transition-colors text-sm"
            >
              Open Kelly Criterion Calculator →
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Step-by-Step: Sizing a Real Crypto Trade</h2>
          <p>Let's walk through a real example using BTC with a $10,000 account.</p>

          <h3 className="text-xl font-bold text-gray-800 mt-8">Step 1: Know your edge</h3>
          <p>
            Before you can size a position, you need to know your strategy's historical performance:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Win rate: 52% (52 out of 100 trades were profitable)</li>
            <li>Average win: +$200</li>
            <li>Average loss: -$100</li>
            <li>Win/Loss ratio (R): 200 / 100 = 2.0</li>
          </ul>

          <h3 className="text-xl font-bold text-gray-800 mt-8">Step 2: Calculate Kelly fraction</h3>
          <div className="bg-gray-50 rounded-xl p-5 font-mono text-sm">
            f* = 0.52 - (1 - 0.52) / 2.0 = 0.52 - 0.24 = <strong>0.28 (28%)</strong><br/>
            Half-Kelly = <strong>14%</strong>
          </div>

          <h3 className="text-xl font-bold text-gray-800 mt-8">Step 3: Calculate dollar risk</h3>
          <p>With a $10,000 account and half-Kelly of 14%:</p>
          <div className="bg-gray-50 rounded-xl p-5 font-mono text-sm">
            Risk per trade = $10,000 × 14% = <strong>$1,400</strong>
          </div>

          <h3 className="text-xl font-bold text-gray-800 mt-8">Step 4: Size the position with stop loss</h3>
          <p>
            If BTC is at $60,000 and your stop loss is at $58,000 (a $2,000 stop per BTC):
          </p>
          <div className="bg-gray-50 rounded-xl p-5 font-mono text-sm">
            Position size = Risk / Stop distance = $1,400 / $2,000 = <strong>0.7 BTC</strong>
          </div>

          <p>
            Use the{" "}
            <Link href="/tools/calc/position-size-calculator" className="text-blue-600 hover:underline font-medium">
              Position Size Calculator
            </Link>{" "}
            to do this calculation instantly without manual math.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Kelly Criterion Limitations for Crypto</h2>
          <p>Kelly assumes stationary win rates — crypto markets are highly volatile, so Kelly outputs should be treated as upper bounds, not exact targets. Best practices:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Use half-Kelly or quarter-Kelly</strong> — reduces ruin risk while preserving most of the growth advantage</li>
            <li><strong>Cap at 5-10% max per trade</strong> — regardless of what Kelly says, high-volatility assets warrant extra caution</li>
            <li><strong>Recalculate regularly</strong> — as your win rate changes with market conditions, so does the optimal Kelly fraction</li>
            <li><strong>Never use full Kelly in live trading</strong> — it maximizes long-term growth but also maximizes drawdowns</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-900 mt-10">Complete Quant Trading Toolkit</h2>
          <p>Use all these tools together for a complete pre-trade workflow:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
            {[
              { href: "/tools/calc/kelly-criterion-calculator", icon: "🎯", title: "Kelly Criterion", desc: "Optimal position sizing from win rate + R/R" },
              { href: "/tools/calc/position-size-calculator", icon: "📐", title: "Position Size", desc: "Calculate trade size from risk % + stop distance" },
              { href: "/tools/calc/tp-sl-calculator", icon: "🎚️", title: "TP/SL Calculator", desc: "Set take profit and stop loss levels" },
              { href: "/tools/calc/sharpe-ratio-calculator", icon: "📊", title: "Sharpe Ratio", desc: "Measure risk-adjusted strategy performance" },
              { href: "/tools/calc/crypto-chart-analyzer", icon: "📈", title: "Chart Analyzer", desc: "TradingView-powered charts with indicators" },
            ].map(({ href, icon, title, desc }) => (
              <Link key={href} href={href} className="flex items-start gap-3 border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:bg-blue-50/30 transition-all">
                <span className="text-xl mt-0.5">{icon}</span>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 my-8">
            <p className="font-semibold text-gray-900 mb-2">💡 Build a Quant Trading Dashboard</p>
            <p className="text-gray-600 text-sm mb-4">
              Pin all these tools on one screen with Workbench Board. No tab switching — everything available at a glance.
            </p>
            <Link href="/workbench/board" className="inline-block bg-gray-900 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-800 transition-colors text-sm">
              Build Trading Dashboard →
            </Link>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="text-sm text-gray-400 mb-4">← <Link href="/blog" className="hover:text-gray-600">Back to Blog</Link></p>
          <div className="flex flex-wrap gap-3">
            <Link href="/tools/calc/kelly-criterion-calculator" className="bg-green-600 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-green-700 transition-colors text-sm">
              Open Kelly Calculator →
            </Link>
            <Link href="/tools/calc/position-size-calculator" className="border border-gray-200 text-gray-700 font-semibold px-5 py-2.5 rounded-xl hover:border-blue-300 hover:text-blue-700 transition-colors text-sm">
              Position Size Calculator →
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
