import type { BoardWidgetSize } from "@/lib/WorkbenchContext";

export interface BoardPreset {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  shortDesc: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  slugs: string[];
  sizes: BoardWidgetSize[];
  tutorial: {
    title: string;
    steps: string[];
    tip?: string;
  };
}

export const BOARD_PRESETS: BoardPreset[] = [
  {
    id: "ai-prompt-workspace",
    slug: "ai-prompt-workspace",
    name: "AI Prompt Workspace",
    emoji: "🤖",
    shortDesc: "Cost, token, and prompt tools for ChatGPT, Claude, and Gemini.",
    description:
      "A pre-built dashboard for AI power users: estimate token costs, compare AI models, optimize prompts, split long text into chunks, manage context windows, and diff prompt versions — all on one screen.",
    metaTitle: "AI Prompt Workspace – Free Token Cost & Prompt Tools | GetFastCalc",
    metaDescription:
      "Free AI dashboard: prompt cost calculator, token optimizer, model comparator, context window manager, and prompt version diff. Works for ChatGPT, Claude, Gemini — no signup.",
    keywords: [
      "AI prompt cost calculator",
      "ChatGPT token cost calculator",
      "Claude cost calculator",
      "prompt token optimizer",
      "AI model comparator",
      "context window manager",
      "prompt version compare",
      "token splitter tool",
    ],
    slugs: [
      "prompt-cost-calculator",
      "ai-model-comparator",
      "prompt-token-optimizer",
      "ai-context-window-manager",
      "prompt-version-comparator",
      "token-splitter",
    ],
    sizes: ["medium", "medium", "medium", "large", "medium", "small"],
    tutorial: {
      title: "How to use the AI Prompt Workspace",
      steps: [
        "Paste your prompt into the Prompt Cost Calculator to see estimated tokens and cost across GPT-4o, Claude, and Gemini.",
        "Use the AI Model Comparator to pick the cheapest model with enough context window for your task.",
        "Drop a long prompt into the Prompt Token Optimizer to remove filler words and cut token usage.",
        "Plan multi-turn conversations with the AI Context Window Manager so you never exceed the model limit.",
        "Compare two versions of the same prompt with the Prompt Version Comparator and track token changes.",
        "If a document is too long, use the Token Splitter to break it into model-safe chunks.",
      ],
      tip: "All token counts are estimates based on average English text (~4 characters per token).",
    },
  },
  {
    id: "fba-seller-dashboard",
    slug: "fba-seller-dashboard",
    name: "FBA Seller Dashboard",
    emoji: "📦",
    shortDesc: "Profit, fees, ACOS, and reorder tools for Amazon sellers.",
    description:
      "A one-screen dashboard for Amazon FBA sellers: calculate profit, estimate FBA fees, analyze ACOS, plan reorders, and estimate import duties. All tools run in your browser, no signup required.",
    metaTitle: "Amazon FBA Seller Dashboard – Free Profit & Fee Tools | GetFastCalc",
    metaDescription:
      "Free Amazon FBA dashboard: profit calculator, FBA fee estimator, ACOS analyzer, reorder calculator, and import duty tool. No signup, instant results.",
    keywords: [
      "Amazon FBA calculator",
      "FBA profit calculator",
      "Amazon seller dashboard",
      "FBA fee calculator",
      "ACOS calculator",
      "reorder point calculator",
      "import duty calculator",
    ],
    slugs: [
      "fba-profit-calculator",
      "fba-fee-calculator",
      "amazon-acos-calculator",
      "fba-reorder-calculator",
      "import-duty-calculator",
    ],
    sizes: ["large", "medium", "medium", "medium", "medium"],
    tutorial: {
      title: "How to use the FBA Seller Dashboard",
      steps: [
        "Enter product price, cost, and shipping into the FBA Profit Calculator to see net profit and margin.",
        "Use the FBA Fee Calculator to estimate Amazon referral, fulfillment, and storage fees.",
        "Check your advertising efficiency with the Amazon ACOS Calculator.",
        "Plan restocks with the FBA Reorder Calculator to avoid running out of inventory.",
        "Estimate landed cost with the Import Duty Calculator before sourcing internationally.",
      ],
      tip: "Bookmark this board and run it every time you research a new product.",
    },
  },
  {
    id: "quant-trader-desk",
    slug: "quant-trader-desk",
    name: "Quant Trader Desk",
    emoji: "📈",
    shortDesc: "Risk, position sizing, and performance metrics for traders.",
    description:
      "A trading dashboard for retail and quant traders: analyze crypto charts, size positions with Kelly Criterion, calculate Sharpe ratio, and set take-profit / stop-loss levels. Free, no signup.",
    metaTitle: "Quant Trader Desk – Free Trading & Risk Tools | GetFastCalc",
    metaDescription:
      "Free quant trading dashboard: crypto chart analyzer, position size calculator, Kelly Criterion, Sharpe ratio, and TP/SL calculator. No signup.",
    keywords: [
      "quant trading tools",
      "position size calculator",
      "Kelly criterion calculator",
      "Sharpe ratio calculator",
      "crypto chart analyzer",
      "take profit stop loss calculator",
      "trading dashboard free",
    ],
    slugs: [
      "crypto-chart-analyzer",
      "position-size-calculator",
      "kelly-criterion-calculator",
      "sharpe-ratio-calculator",
      "tp-sl-calculator",
    ],
    sizes: ["large", "medium", "medium", "medium", "small"],
    tutorial: {
      title: "How to use the Quant Trader Desk",
      steps: [
        "Paste a CoinGecko-compatible crypto symbol into the Crypto Chart Analyzer to view EMA, SMA, RSI, and Bollinger Bands.",
        "Enter account size and risk per trade into the Position Size Calculator.",
        "Use the Kelly Criterion Calculator to find the optimal bet size based on win rate and payoff.",
        "Evaluate risk-adjusted returns with the Sharpe Ratio Calculator.",
        "Set realistic exit levels with the TP/SL Calculator before entering a trade.",
      ],
      tip: "Use these tools together before every trade to keep risk consistent.",
    },
  },
  {
    id: "developer-toolkit",
    slug: "developer-toolkit",
    name: "Developer Toolkit",
    emoji: "💻",
    shortDesc: "Encoding, formatting, and timestamp tools for developers.",
    description:
      "A fast dashboard for developers: Base64 encode/decode, JSON/CSV format, URL encode, Unix timestamps, and JWT decode. All tools run in your browser, no server calls.",
    metaTitle: "Developer Toolkit – Free Encoding & Formatting Tools | GetFastCalc",
    metaDescription:
      "Free developer dashboard: Base64, JSON/CSV formatter, URL encoder, Unix timestamp converter, and JWT decoder. No signup, instant results.",
    keywords: [
      "developer tools online",
      "Base64 encoder decoder",
      "JSON CSV formatter",
      "URL encoder decoder",
      "Unix timestamp converter",
      "JWT decoder",
    ],
    slugs: [
      "base64-tool",
      "json-csv-formatter",
      "url-encoder",
      "unix-timestamp-converter",
      "jwt-decoder",
    ],
    sizes: ["medium", "medium", "small", "small", "small"],
    tutorial: {
      title: "How to use the Developer Toolkit",
      steps: [
        "Encode or decode strings with the Base64 Tool.",
        "Format, convert, or minify JSON and CSV with the JSON/CSV Formatter.",
        "Escape URLs for query strings with the URL Encoder.",
        "Convert human-readable dates to Unix timestamps and back.",
        "Inspect JWT payload and header without sending data anywhere.",
      ],
      tip: "No data leaves your browser — safe for tokens and private strings.",
    },
  },
  {
    id: "finance-hub",
    slug: "finance-hub",
    name: "Finance Hub",
    emoji: "💰",
    shortDesc: "Compound interest, loans, savings, and budget calculators.",
    description:
      "A personal finance dashboard for everyday planning: compound interest, loan payments, savings goals, investment returns, and monthly budgeting. No signup, no data stored.",
    metaTitle: "Finance Hub – Free Loan & Investment Calculators | GetFastCalc",
    metaDescription:
      "Free personal finance dashboard: compound interest, loan calculator, savings goal, investment return, and budget calculator. No signup.",
    keywords: [
      "personal finance calculator",
      "compound interest calculator",
      "loan calculator",
      "savings goal calculator",
      "investment return calculator",
      "budget calculator",
    ],
    slugs: [
      "compound-interest-calculator",
      "loan-calculator",
      "savings-goal-calculator",
      "investment-return-calculator",
      "budget-calculator",
    ],
    sizes: ["large", "medium", "medium", "small", "small"],
    tutorial: {
      title: "How to use the Finance Hub",
      steps: [
        "See how money grows over time with the Compound Interest Calculator.",
        "Estimate monthly payments and total interest with the Loan Calculator.",
        "Set a target date and monthly contribution with the Savings Goal Calculator.",
        "Compare total returns across different rates with the Investment Return Calculator.",
        "Balance income and expenses with the Budget Calculator.",
      ],
      tip: "Try different interest rates side by side to see the long-term impact.",
    },
  },
  {
    id: "health-tracker",
    slug: "health-tracker",
    name: "Health Tracker",
    emoji: "💪",
    shortDesc: "BMI, body fat, water intake, and BMR/TDEE calculators.",
    description:
      "A health dashboard for tracking fitness metrics: BMI, body fat percentage, daily water intake, BMR/TDEE, running pace, and sleep. Free and private.",
    metaTitle: "Health Tracker – Free BMI & Fitness Calculators | GetFastCalc",
    metaDescription:
      "Free health dashboard: BMI, body fat, water intake, BMR/TDEE, running pace, and sleep calculators. No signup, private.",
    keywords: [
      "BMI calculator",
      "body fat calculator",
      "water intake calculator",
      "BMR TDEE calculator",
      "running pace calculator",
      "sleep calculator",
    ],
    slugs: [
      "bmi-calculator",
      "body-fat-calculator",
      "water-intake-calculator",
      "bmr-tdee-calculator",
      "running-pace-calculator",
      "sleep-calculator",
    ],
    sizes: ["medium", "medium", "small", "small", "small", "small"],
    tutorial: {
      title: "How to use the Health Tracker",
      steps: [
        "Calculate BMI in seconds with height and weight.",
        "Estimate body fat percentage using the Navy or YMCA method.",
        "Find daily water intake recommendations based on activity and climate.",
        "Calculate basal metabolic rate and total daily energy expenditure.",
        "Plan running splits with the Running Pace Calculator.",
        "Estimate optimal sleep windows with the Sleep Calculator.",
      ],
      tip: "Health metrics are estimates; consult a professional for medical decisions.",
    },
  },
  {
    id: "designer-toolkit",
    slug: "designer-toolkit",
    name: "Designer Toolkit",
    emoji: "🎨",
    shortDesc: "Color, contrast, typography, and responsive image tools.",
    description:
      "A visual design dashboard: generate color palettes, check contrast ratios, convert CSS units, build typography scales, and calculate responsive image sizes. Free, no signup.",
    metaTitle: "Designer Toolkit – Free Color & Contrast Tools | GetFastCalc",
    metaDescription:
      "Free design dashboard: color palette generator, contrast checker, CSS unit converter, typography scale generator, and responsive image calculator. No signup.",
    keywords: [
      "design tools online",
      "color palette generator",
      "contrast checker",
      "CSS unit converter",
      "typography scale generator",
      "responsive image calculator",
    ],
    slugs: [
      "color-palette-lab",
      "contrast-checker-tool",
      "css-unit-converter",
      "typography-scale-generator",
      "responsive-image-calculator",
    ],
    sizes: ["large", "medium", "medium", "medium", "small"],
    tutorial: {
      title: "How to use the Designer Toolkit",
      steps: [
        "Generate accessible color palettes with the Color Palette Lab.",
        "Check foreground/background contrast against WCAG standards.",
        "Convert px, rem, em, and viewport units with the CSS Unit Converter.",
        "Build a type scale for headings and body text.",
        "Calculate responsive image dimensions for different screen sizes.",
      ],
      tip: "Run the contrast checker before finalizing any text color choice.",
    },
  },
];

export const BOARD_PRESET_BY_ID = new Map(BOARD_PRESETS.map((p) => [p.id, p]));

export function getPresetById(id: string): BoardPreset | undefined {
  return BOARD_PRESET_BY_ID.get(id);
}

export function getAllPresetIds(): string[] {
  return BOARD_PRESETS.map((p) => p.id);
}
