import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog – Crypto Charts, Quant Tools & Calculator Guides",
  description: "Learn how to use free crypto chart analyzers, build a personal calculator dashboard, size positions with Kelly Criterion, and more — no signup required.",
  alternates: { canonical: "https://getfastcalc.com/blog" },
};

const POSTS = [
  {
    slug: "free-tradingview-alternative-crypto-chart-analyzer",
    title: "Free TradingView Alternative: Full-Featured Crypto Chart Analyzer",
    excerpt: "Get real-time candlestick charts, RSI, MACD, drawing tools and 100+ indicators — completely free, no account needed.",
    date: "2026-06-28",
    tag: "Crypto Tools",
    readTime: "5 min read",
  },
  {
    slug: "workbench-board-personal-calculator-dashboard",
    title: "Build Your Personal Calculator Dashboard with Workbench Board",
    excerpt: "Drag, resize and combine any calculator tools on one screen. Save your layout and access everything in seconds.",
    date: "2026-06-28",
    tag: "Productivity",
    readTime: "4 min read",
  },
  {
    slug: "crypto-position-sizing-kelly-criterion",
    title: "How to Size Your Crypto Positions: Kelly Criterion Explained",
    excerpt: "Stop over-leveraging. Learn how to calculate optimal position size using Kelly Criterion and free online tools.",
    date: "2026-06-27",
    tag: "Quant Trading",
    readTime: "6 min read",
  },
  {
    slug: "sharpe-ratio-calculator-guide",
    title: "Sharpe Ratio Explained: Measure Risk-Adjusted Returns for Free",
    excerpt: "Understand whether your trading strategy is actually good or just lucky. Calculate Sharpe Ratio instantly online.",
    date: "2026-06-27",
    tag: "Quant Trading",
    readTime: "5 min read",
  },
];

export default function BlogPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">GetFastCalc Blog</h1>
        <p className="text-lg text-gray-500">Guides on crypto trading tools, quant analysis, and calculator tips.</p>
      </div>

      <div className="grid gap-6">
        {POSTS.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block border border-gray-200 rounded-2xl p-6 hover:border-blue-300 hover:bg-blue-50/30 transition-all"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2.5 py-0.5 rounded-full">{post.tag}</span>
              <span className="text-xs text-gray-400">{post.date}</span>
              <span className="text-xs text-gray-400">· {post.readTime}</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-700 mb-2 transition-colors">{post.title}</h2>
            <p className="text-gray-500 text-sm leading-relaxed">{post.excerpt}</p>
            <div className="mt-4 text-sm font-medium text-blue-600 group-hover:underline">Read article →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
