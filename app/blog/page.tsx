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
  {
    slug: "how-to-calculate-profit-for-amazon-fba-products",
    title: "How do I calculate my profit for Amazon FBA products?",
    excerpt: "Learn how to calculate your profit for Amazon FBA products using our free FBA Profit Calculator tool.",
    date: "2026-07-07",
    tag: "Auto",
    readTime: "3 min read",
  },
  {
    slug: "how-to-manage-ai-prompt-tokens",
    title: "How can I effectively manage my AI prompt tokens?",
    excerpt: "Curious about managing AI prompt tokens? Discover how our free tool can help you optimize your token usage.",
    date: "2026-07-07",
    tag: "Auto",
    readTime: "3 min read",
  },
  {
    slug: "effectively-manage-text-tokens-ai-applications",
    title: "How Can I Effectively Manage Text Tokens for AI Applications?",
    excerpt: "Discover how to effectively manage text tokens for AI applications using our free Token Splitter tool.",
    date: "2026-07-07",
    tag: "Auto",
    readTime: "3 min read",
  },
  {
    slug: "how-to-create-an-seo-friendly-title",
    title: "How to Create an SEO-Friendly Title for Your Blog Post",
    excerpt: "Learn how to create an SEO-friendly title for your blog post using our free tool.",
    date: "2026-07-07",
    tag: "Auto",
    readTime: "3 min read",
  },
  {
    slug: "how-to-create-schema-markup-easily",
    title: "How to Create Schema Markup for Your Website Easily?",
    excerpt: "Learn how to create schema markup easily with our free tool. Boost your SEO and enhance search results effortlessly.",
    date: "2026-07-07",
    tag: "Auto",
    readTime: "3 min read",
  },
  {
    slug: "calculate-optimal-bet-size-using-kelly-criterion",
    title: "How to Calculate Optimal Bet Size with the Kelly Criterion",
    excerpt: "Learn how to calculate your optimal bet size using the Kelly Criterion with our free tool. Maximize your long-term growth effectively.",
    date: "2026-07-14",
    tag: "Auto",
    readTime: "3 min read",
  },
  {
    slug: "manage-prompt-tokens-for-ai-models",
    title: "How can I effectively manage prompt tokens for AI models?",
    excerpt: "Learn how to manage prompt tokens for AI models effectively with our free Token Splitter tool.",
    date: "2026-07-14",
    tag: "Auto",
    readTime: "3 min read",
  },
  {
    slug: "how-to-split-text-into-token-sized-chunks",
    title: "How Can I Split My Text into Token-Sized Chunks?",
    excerpt: "Learn how to effectively split your text into token-sized chunks for AI applications using our free token splitter tool.",
    date: "2026-07-14",
    tag: "Auto",
    readTime: "3 min read",
  },
  {
    slug: "how-to-create-seo-friendly-title",
    title: "How to Create an SEO-Friendly Title for Your Blog Post",
    excerpt: "Wondering how to create an SEO-friendly title for your blog post? Use our free tool to generate optimized titles that boost visibility.",
    date: "2026-07-14",
    tag: "Auto",
    readTime: "3 min read",
  },
  {
    slug: "what-is-schema-markup-improve-seo",
    title: "What is Schema Markup and How Can It Improve SEO?",
    excerpt: "Discover what schema markup is and how it can enhance your website's SEO. Use our free schema markup generator to get started.",
    date: "2026-07-14",
    tag: "Auto",
    readTime: "3 min read",
  },
  {
    slug: "how-to-create-schema-markup-easily",
    title: "How can I create schema markup for my website easily?",
    excerpt: "Learn how to create schema markup for your website easily with our free tool. Enhance your SEO and search results today.",
    date: "2026-07-21",
    tag: "Auto",
    readTime: "3 min read",
  },
  {
    slug: "how-to-calculate-correct-position-size-for-trades",
    title: "How to Calculate the Correct Position Size for Your Trades",
    excerpt: "Learn how to calculate the correct position size for your trades with our free tool. Ensure effective trading risk management today!",
    date: "2026-07-21",
    tag: "Auto",
    readTime: "3 min read",
  },
  {
    slug: "efficient-token-management-for-ai-prompts",
    title: "How can I efficiently manage tokens for AI prompts?",
    excerpt: "Learn how to efficiently manage tokens for AI prompts with our free Token Splitter tool.",
    date: "2026-07-21",
    tag: "Auto",
    readTime: "3 min read",
  },
  {
    slug: "efficiently-split-text-into-token-sized-chunks",
    title: "How to Efficiently Split Text into Token-Sized Chunks for AI",
    excerpt: "Learn how to efficiently split text into token-sized chunks for AI applications using our free token splitter tool.",
    date: "2026-07-21",
    tag: "Auto",
    readTime: "3 min read",
  },
  {
    slug: "how-to-forecast-ai-token-costs-accurately",
    title: "How Can I Accurately Forecast My AI Token Costs?",
    excerpt: "Learn how to forecast AI token costs accurately with our free tool. Plan your budget effectively for your AI projects today.",
    date: "2026-07-21",
    tag: "Auto",
    readTime: "3 min read",
  },
  {
    slug: "how-to-optimize-ai-prompts-to-save-tokens",
    title: "How can I optimize my AI prompts to save tokens?",
    excerpt: "Learn how to optimize your AI prompts to save tokens with our free tool. Maximize output quality while minimizing token usage.",
    date: "2026-07-28",
    tag: "Auto",
    readTime: "3 min read",
  },
  {
    slug: "calculate-amazon-acos-for-better-ad-profitability",
    title: "How to Calculate Amazon ACoS for Better Ad Profitability",
    excerpt: "Learn how to calculate your Amazon ACoS for better ad profitability using our free Amazon ACoS calculator tool.",
    date: "2026-07-28",
    tag: "Auto",
    readTime: "3 min read",
  },
  {
    slug: "how-to-manage-token-usage-in-ai-prompts",
    title: "How can I effectively manage token usage in AI prompts?",
    excerpt: "Discover how to manage token usage in AI prompts effectively. Use our free token splitter tool for optimal prompt breakdown.",
    date: "2026-07-28",
    tag: "Auto",
    readTime: "3 min read",
  },
  {
    slug: "how-to-split-large-text-into-token-chunks",
    title: "How can I split large text into token chunks for AI applications?",
    excerpt: "Learn how to split large text into token chunks for AI applications with our free Token Splitter Tool.",
    date: "2026-07-28",
    tag: "Auto",
    readTime: "3 min read",
  },
  {
    slug: "predict-ai-costs-for-token-usage",
    title: "How can I predict AI costs for my app's token usage?",
    excerpt: "Learn how to predict AI costs for your app's token usage with our free tool.",
    date: "2026-07-28",
    tag: "Auto",
    readTime: "3 min read",
  },
  {
    slug: "how-to-optimize-ai-prompts-to-save-tokens",
    title: "How can I optimize my AI prompts to save tokens?",
    excerpt: "Learn how to optimize your AI prompts to save tokens and improve output quality with our free tool.",
    date: "2026-08-04",
    tag: "Auto",
    readTime: "3 min read",
  },
  {
    slug: "efficiently-manage-tokens-in-ai-prompts",
    title: "How can I efficiently manage tokens in my AI prompts?",
    excerpt: "Learn how to efficiently manage tokens in your AI prompts with our free Token Splitter tool.",
    date: "2026-08-04",
    tag: "Auto",
    readTime: "3 min read",
  },
  {
    slug: "efficiently-manage-text-tokens-ai-applications",
    title: "How can I efficiently manage text tokens for AI applications?",
    excerpt: "Discover how to efficiently manage text tokens for AI applications with our free Token Splitter Tool.",
    date: "2026-08-04",
    tag: "Auto",
    readTime: "3 min read",
  },
  {
    slug: "forecast-ai-token-costs",
    title: "How to Forecast Your AI Token Costs Effectively",
    excerpt: "Learn how to forecast your AI token costs for projects using our free tool for accurate predictions.",
    date: "2026-08-04",
    tag: "Auto",
    readTime: "3 min read",
  },
  {
    slug: "how-to-create-seo-friendly-titles",
    title: "How to Create SEO-Friendly Titles for Your Blog Posts",
    excerpt: "Learn how to create SEO-friendly titles for your blog posts. Use our free title optimizer tool for effective title suggestions.",
    date: "2026-08-04",
    tag: "Auto",
    readTime: "3 min read",
  },
  {
    slug: "how-to-manage-tokens-in-ai-prompts",
    title: "How can I effectively manage tokens in my AI prompts?",
    excerpt: "Learn how to manage tokens in AI prompts effectively with our free Token Splitter tool.",
    date: "2026-08-11",
    tag: "Auto",
    readTime: "3 min read",
  },
  {
    slug: "how-to-split-text-into-token-sized-chunks",
    title: "How to Split Text into Token-Sized Chunks for AI Applications",
    excerpt: "Learn how to split text into token-sized chunks for AI applications with our free Token Splitter Tool.",
    date: "2026-08-11",
    tag: "Auto",
    readTime: "3 min read",
  },
  {
    slug: "predict-ai-token-costs-for-future-projects",
    title: "How to Predict Your AI Token Costs for Future Projects",
    excerpt: "Wondering how to predict your AI token costs? Learn how our free tool can help you estimate future expenses effectively.",
    date: "2026-08-11",
    tag: "Auto",
    readTime: "3 min read",
  },
  {
    slug: "how-to-create-seo-friendly-titles",
    title: "How to Create SEO-Friendly Titles That Attract Clicks",
    excerpt: "Learn how to create SEO-friendly titles that attract clicks with our free title optimization tool.",
    date: "2026-08-11",
    tag: "Auto",
    readTime: "3 min read",
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
