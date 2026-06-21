export interface ToolFaq {
  question: string;
  answer: string;
}

export interface ToolMeta {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  category: string;
  icon: string;
  faqs: ToolFaq[];
  relatedTools: string[];
}

export const tools: ToolMeta[] = [
  {
    slug: "bmi-calculator",
    name: "BMI Calculator",
    tagline: "Calculate your Body Mass Index instantly",
    description:
      "Use this free BMI calculator to find your Body Mass Index based on height and weight. Understand your weight category — underweight, normal, overweight, or obese — in seconds.",
    metaTitle: "BMI Calculator – Free Body Mass Index Calculator Online",
    metaDescription:
      "Calculate your BMI (Body Mass Index) instantly. Enter your height and weight to find out if you're underweight, normal, overweight, or obese. Free, fast, no signup.",
    keywords: [
      "bmi calculator",
      "body mass index calculator",
      "bmi formula",
      "calculate bmi online",
      "bmi chart",
    ],
    category: "Health",
    icon: "⚖️",
    faqs: [
      {
        question: "What is BMI?",
        answer:
          "BMI (Body Mass Index) is a measure of body fat based on height and weight. It is calculated as weight (kg) divided by height (m) squared.",
      },
      {
        question: "What is a normal BMI range?",
        answer:
          "A BMI between 18.5 and 24.9 is considered normal weight. Below 18.5 is underweight, 25–29.9 is overweight, and 30 or above is obese.",
      },
      {
        question: "Is BMI accurate for everyone?",
        answer:
          "BMI is a useful screening tool but doesn't measure body fat directly. It may not be accurate for athletes, elderly people, or those with high muscle mass.",
      },
      {
        question: "How is BMI calculated?",
        answer:
          "BMI = weight (kg) ÷ height (m)². For example, a person weighing 70kg at 1.75m has a BMI of 22.9.",
      },
    ],
    relatedTools: ["age-calculator", "random-number-generator"],
  },
  {
    slug: "age-calculator",
    name: "Age Calculator",
    tagline: "Find your exact age in years, months, and days",
    description:
      "Calculate your exact age from your date of birth to today — or to any specific date. Get results in years, months, days, hours, and minutes instantly.",
    metaTitle: "Age Calculator – Find Your Exact Age Online Free",
    metaDescription:
      "Calculate your exact age from your date of birth. Get your age in years, months, and days instantly. Free age calculator — no signup required.",
    keywords: [
      "age calculator",
      "calculate age from date of birth",
      "how old am i",
      "exact age calculator",
      "date of birth calculator",
    ],
    category: "Date & Time",
    icon: "📅",
    faqs: [
      {
        question: "How do I calculate my exact age?",
        answer:
          "Enter your date of birth into the age calculator above. It will compute the precise difference between your birth date and today in years, months, and days.",
      },
      {
        question: "Can I calculate age between two specific dates?",
        answer:
          "Yes. Set your start date as the birth date and your end date as any target date to find the exact age or duration between them.",
      },
      {
        question: "How many days old am I?",
        answer:
          "The calculator shows your total age in days along with years and months. Simply enter your birthdate to see the result.",
      },
      {
        question: "Does the age calculator account for leap years?",
        answer:
          "Yes. The calculator correctly handles leap years when computing days and total durations.",
      },
    ],
    relatedTools: ["bmi-calculator", "random-number-generator"],
  },
  {
    slug: "qr-code-generator",
    name: "QR Code Generator",
    tagline: "Generate a QR code for any text or URL instantly",
    description:
      "Generate a free QR code for any URL, text, phone number, or message. Download as PNG and use anywhere — no account needed.",
    metaTitle: "QR Code Generator – Free Online QR Code Maker",
    metaDescription:
      "Generate free QR codes for URLs, text, and more. Download as PNG instantly. No signup, no watermark. The fastest free online QR code generator.",
    keywords: [
      "qr code generator",
      "free qr code maker",
      "generate qr code online",
      "url to qr code",
      "qr code for website",
    ],
    category: "Generators",
    icon: "📱",
    faqs: [
      {
        question: "What can I encode in a QR code?",
        answer:
          "You can encode URLs, plain text, phone numbers, email addresses, SMS messages, Wi-Fi credentials, and more.",
      },
      {
        question: "Are the QR codes free to use?",
        answer:
          "Yes. All QR codes generated here are completely free with no watermark, no expiry, and no account required.",
      },
      {
        question: "Can I download the QR code?",
        answer:
          "Yes. Click the Download button to save the QR code as a PNG image file you can use anywhere.",
      },
      {
        question: "What is the maximum length of text for a QR code?",
        answer:
          "QR codes can hold up to about 4,000 characters. For best scan results, keep the content under 300 characters.",
      },
    ],
    relatedTools: ["password-generator", "text-case-converter"],
  },
  {
    slug: "password-generator",
    name: "Password Generator",
    tagline: "Generate strong, secure passwords instantly",
    description:
      "Create strong random passwords with custom length and character sets. Choose uppercase, lowercase, numbers, and symbols. Copy with one click.",
    metaTitle: "Password Generator – Free Strong Password Generator Online",
    metaDescription:
      "Generate strong random passwords instantly. Customize length, uppercase, lowercase, numbers, and symbols. Free secure password generator — no signup needed.",
    keywords: [
      "password generator",
      "strong password generator",
      "random password generator",
      "secure password maker",
      "free password generator online",
    ],
    category: "Security",
    icon: "🔐",
    faqs: [
      {
        question: "What makes a password strong?",
        answer:
          "A strong password is at least 12 characters long and uses a mix of uppercase letters, lowercase letters, numbers, and special symbols.",
      },
      {
        question: "Is this password generator safe to use?",
        answer:
          "Yes. Passwords are generated entirely in your browser using JavaScript's cryptographic random function. They are never sent to any server.",
      },
      {
        question: "How long should my password be?",
        answer:
          "We recommend at least 16 characters for important accounts. The longer the password, the harder it is to crack.",
      },
      {
        question: "Should I use a different password for every account?",
        answer:
          "Absolutely. Using unique passwords for each account prevents a single data breach from compromising all your accounts. Use a password manager to store them.",
      },
    ],
    relatedTools: ["qr-code-generator", "random-number-generator"],
  },
  {
    slug: "text-case-converter",
    name: "Text Case Converter",
    tagline: "Convert text to any case format instantly",
    description:
      "Convert text to UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, and more. Paste your text and transform it in one click.",
    metaTitle: "Text Case Converter – Convert Text to Any Case Online Free",
    metaDescription:
      "Convert text to uppercase, lowercase, title case, camelCase, snake_case and more. Free online text case converter — instant results, no signup needed.",
    keywords: [
      "text case converter",
      "uppercase converter",
      "lowercase converter",
      "title case converter",
      "camelcase converter",
      "snake case converter",
    ],
    category: "Text",
    icon: "✏️",
    faqs: [
      {
        question: "What is Title Case?",
        answer:
          "Title Case capitalizes the first letter of each major word. For example: 'the quick brown fox' becomes 'The Quick Brown Fox'.",
      },
      {
        question: "What is camelCase?",
        answer:
          "camelCase combines words by capitalizing each word after the first, with no spaces. Example: 'my variable name' becomes 'myVariableName'.",
      },
      {
        question: "What is snake_case?",
        answer:
          "snake_case replaces spaces with underscores and lowercases everything. Example: 'Hello World' becomes 'hello_world'. Common in Python and database fields.",
      },
      {
        question: "Can I convert large amounts of text?",
        answer:
          "Yes. The text case converter works on any amount of text you paste in — from a single word to full paragraphs.",
      },
    ],
    relatedTools: ["qr-code-generator", "password-generator"],
  },
  {
    slug: "random-number-generator",
    name: "Random Number Generator",
    tagline: "Generate random numbers within any range instantly",
    description:
      "Generate one or multiple random numbers within a custom min–max range. Perfect for lotteries, games, random selection, and statistical sampling.",
    metaTitle: "Random Number Generator – Free Online Random Number Picker",
    metaDescription:
      "Generate random numbers between any min and max range. Generate multiple numbers at once. Free random number generator — instant, no signup needed.",
    keywords: [
      "random number generator",
      "random number picker",
      "generate random number online",
      "random number between 1 and 100",
      "lottery number generator",
    ],
    category: "Math",
    icon: "🎲",
    faqs: [
      {
        question: "Are the generated numbers truly random?",
        answer:
          "The numbers are generated using JavaScript's crypto.getRandomValues API which produces cryptographically strong pseudo-random numbers suitable for most purposes.",
      },
      {
        question: "Can I generate multiple random numbers at once?",
        answer:
          "Yes. Set the quantity to any number and click Generate to get multiple random numbers at once.",
      },
      {
        question: "Can I generate random numbers without repetition?",
        answer:
          "Yes. Toggle the 'No Duplicates' option to ensure all generated numbers are unique.",
      },
      {
        question: "What is the maximum range I can use?",
        answer:
          "You can use any integer range. For example, 1 to 1,000,000 works fine. The tool handles large ranges without any issue.",
      },
    ],
    relatedTools: ["bmi-calculator", "age-calculator"],
  },
  {
    slug: "emoji-picker",
    name: "Emoji Picker",
    tagline: "Click any emoji to copy it instantly",
    description:
      "Browse and copy emojis by category — smileys, animals, food, travel, symbols, flags and more. Click any emoji to copy it to your clipboard instantly. No signup needed.",
    metaTitle: "Emoji Picker – Copy & Paste Emojis Online Free",
    metaDescription:
      "Browse 1000+ emojis by category and copy them with one click. Free emoji picker — smileys, animals, food, symbols, flags and more. No signup required.",
    keywords: [
      "emoji picker",
      "copy paste emoji",
      "emoji keyboard online",
      "emoji copy",
      "free emoji picker",
      "emoji symbols",
    ],
    category: "Text",
    icon: "😊",
    faqs: [
      {
        question: "How do I copy an emoji?",
        answer:
          "Simply click on any emoji in the grid. It will be copied to your clipboard instantly. You can then paste it anywhere with Ctrl+V (or Cmd+V on Mac).",
      },
      {
        question: "Can I search for a specific emoji?",
        answer:
          "Yes. Use the search box at the top to filter emojis. You can also browse by category using the tabs below the search bar.",
      },
      {
        question: "Do emojis look the same on all devices?",
        answer:
          "Emojis are rendered by your operating system or app, so the exact appearance may differ between iOS, Android, Windows, and macOS — but the meaning is always the same.",
      },
      {
        question: "How many emojis are available?",
        answer:
          "This picker includes 1000+ emojis across 9 categories: Smileys, People, Animals, Food, Travel, Activities, Objects, Symbols, and Flags.",
      },
    ],
    relatedTools: ["text-case-converter", "qr-code-generator"],
  },
  {
    slug: "holiday-calculator",
    name: "Holiday Calculator",
    tagline: "Days until next public holiday — worldwide",
    description:
      "Find out how many days until the next public holiday in your country. Supports 15+ countries worldwide. Choose your work schedule (5-day, 6-day, or 7-day week) to see which holidays actually give you a day off.",
    metaTitle: "Holiday Calculator – Days Until Next Public Holiday Worldwide",
    metaDescription:
      "Calculate how many days until the next public holiday in your country. Supports USA, China, Japan, UK, and 15+ countries. Choose 5-day, 6-day, or 7-day work week.",
    keywords: [
      "holiday calculator",
      "days until holiday",
      "public holiday countdown",
      "next public holiday",
      "days until next holiday",
      "holiday countdown worldwide",
    ],
    category: "Date & Time",
    icon: "🎉",
    faqs: [
      {
        question: "How does the work schedule option work?",
        answer:
          "If you work a 5-day week (Mon–Fri), holidays that fall on Saturday or Sunday are already your days off — so they don't give you an extra day off. If you work 6 days a week, only Sunday is your rest day, so Saturday holidays still count. 7-day workers get a day off for every public holiday.",
      },
      {
        question: "Which countries are supported?",
        answer:
          "Currently supports 15+ countries including China, USA, Japan, UK, Germany, France, South Korea, India, Singapore, Australia, Canada, Thailand, Vietnam, Malaysia, and the Philippines.",
      },
      {
        question: "Are the holiday dates accurate?",
        answer:
          "Fixed-date holidays (like Christmas) are always accurate. Variable holidays like Easter, Thanksgiving, and bank holidays are calculated algorithmically for the current and next year.",
      },
      {
        question: "What if a holiday falls on a weekend?",
        answer:
          "The tool will show a warning if a holiday falls on a weekend and you're on a 5-day work schedule, meaning you'd already have that day off. Some countries observe a substitute weekday holiday in this case.",
      },
    ],
    relatedTools: ["age-calculator", "emoji-picker"],
  },
  {
    slug: "compound-interest-calculator",
    name: "Compound Interest Calculator",
    tagline: "See how your money grows over time with compound interest",
    description:
      "Calculate compound interest with optional monthly contributions. Enter your principal, annual rate, investment period, and compounding frequency to see your final balance, total interest earned, and a year-by-year growth chart.",
    metaTitle: "Compound Interest Calculator – Free Investment Growth Calculator",
    metaDescription:
      "Calculate compound interest online. Enter principal, rate, years and monthly contributions to see your investment grow. Free compound interest calculator with chart.",
    keywords: [
      "compound interest calculator",
      "investment calculator",
      "compound interest formula",
      "savings calculator",
      "interest calculator online",
    ],
    category: "Finance",
    icon: "📈",
    faqs: [
      {
        question: "What is compound interest?",
        answer:
          "Compound interest means you earn interest on both your original principal AND the interest you've already earned. Over time this creates exponential growth — the longer you invest, the faster it grows.",
      },
      {
        question: "How does compounding frequency affect returns?",
        answer:
          "The more frequently interest compounds (daily > monthly > annually), the higher your final balance. Daily compounding yields slightly more than monthly, which yields more than annual.",
      },
      {
        question: "What does monthly contribution do?",
        answer:
          "Regular monthly contributions dramatically increase your final balance because each contribution also earns compound interest for the remaining investment period.",
      },
      {
        question: "What is a realistic interest rate to use?",
        answer:
          "Historically the S&P 500 has averaged ~7–10% annually. High-yield savings accounts offer 4–5%. Use a rate appropriate for your investment type.",
      },
    ],
    relatedTools: ["currency-converter", "percentage-calculator"],
  },
  {
    slug: "currency-converter",
    name: "Currency Converter",
    tagline: "Convert currencies with live exchange rates",
    description:
      "Convert between 25+ world currencies using live exchange rates from the European Central Bank (ECB). Includes a quick reference table and automatic fallback to offline rates when needed.",
    metaTitle: "Currency Converter – Free Live Exchange Rate Calculator",
    metaDescription:
      "Convert USD, EUR, GBP, JPY, CNY and 20+ currencies with live ECB exchange rates. Free online currency converter — no signup, instant results.",
    keywords: [
      "currency converter",
      "exchange rate calculator",
      "usd to eur",
      "currency exchange online",
      "live currency rates",
    ],
    category: "Finance",
    icon: "💱",
    faqs: [
      {
        question: "Where do the exchange rates come from?",
        answer:
          "Rates are fetched from the European Central Bank (ECB) via the Frankfurter API — a free, reliable source updated daily. When offline, the tool falls back to static reference rates.",
      },
      {
        question: "How often are rates updated?",
        answer:
          "ECB rates are updated once per business day. Click 'Refresh' to get the latest rates. Rates are not real-time tick data, but are accurate for most everyday conversions.",
      },
      {
        question: "Which currencies are supported?",
        answer:
          "25+ currencies including USD, EUR, GBP, JPY, CNY, KRW, AUD, CAD, CHF, HKD, SGD, INR, THB, VND, MYR, IDR, PHP, and more.",
      },
    ],
    relatedTools: ["compound-interest-calculator", "percentage-calculator"],
  },
  {
    slug: "percentage-calculator",
    name: "Percentage Calculator",
    tagline: "Calculate percentage change, portions, and more",
    description:
      "Five percentage calculators in one: percentage change (up/down), X% of Y, what percentage is X of Y, increase/decrease a number by %, and reverse percentage. Perfect for investors, students, and everyday math.",
    metaTitle: "Percentage Calculator – % Change, Portion & More | Free Online",
    metaDescription:
      "Free percentage calculator: find % change between two numbers, calculate X% of Y, what % is X of Y, increase/decrease by %, and reverse percentage. Instant results.",
    keywords: [
      "percentage calculator",
      "percentage change calculator",
      "percent change formula",
      "calculate percentage increase",
      "percentage decrease calculator",
    ],
    category: "Finance",
    icon: "💯",
    faqs: [
      {
        question: "How do you calculate percentage change?",
        answer:
          "Percentage change = ((New Value − Old Value) / |Old Value|) × 100. For example, from 100 to 150: ((150 − 100) / 100) × 100 = +50%.",
      },
      {
        question: "What is the difference between percentage change and percentage point change?",
        answer:
          "Percentage change is relative (e.g., rate went from 2% to 3% = +50% change). Percentage point change is absolute (2% to 3% = +1 percentage point).",
      },
      {
        question: "How do I calculate X% of a number?",
        answer:
          "Multiply the number by the percentage and divide by 100. For example, 20% of 500 = (20 / 100) × 500 = 100.",
      },
    ],
    relatedTools: ["compound-interest-calculator", "currency-converter"],
  },
  {
    slug: "tp-sl-calculator",
    name: "Take Profit / Stop Loss Calculator",
    tagline: "Calculate your exact PnL, R:R ratio and liquidation price before you trade",
    description:
      "Enter your entry price, leverage, and margin to instantly calculate PnL in USD and % for up to 3 take-profit levels and a stop loss. Shows Risk:Reward ratio and estimated liquidation price. Works for both long and short positions.",
    metaTitle: "Take Profit Stop Loss Calculator – Crypto Trading PnL & R:R Ratio",
    metaDescription:
      "Free TP/SL calculator for crypto traders. Enter entry price, leverage, and margin to calculate take profit and stop loss PnL, risk/reward ratio, and liquidation price.",
    keywords: [
      "take profit stop loss calculator",
      "tp sl calculator crypto",
      "risk reward ratio calculator",
      "crypto pnl calculator",
      "leverage trading calculator",
    ],
    category: "Crypto",
    icon: "🎯",
    faqs: [
      {
        question: "What is Risk:Reward (R:R) ratio?",
        answer:
          "R:R ratio compares your potential profit to your potential loss. A 1:2 ratio means for every $1 risked, you stand to gain $2. Professional traders typically only take trades with R:R of 1:2 or higher.",
      },
      {
        question: "How is the liquidation price calculated?",
        answer:
          "The estimate assumes you lose 100% of your margin when the price moves against you by (1/leverage). For example, at 10× leverage, a 10% adverse move liquidates your position. Actual liquidation includes maintenance margin and fees.",
      },
      {
        question: "Does this work for both spot and futures trading?",
        answer:
          "For spot trading, set leverage to 1×. For futures (long or short), enter the leverage your exchange provides. The PnL formula accounts for both directions.",
      },
    ],
    relatedTools: ["position-size-calculator", "compound-interest-calculator"],
  },
  {
    slug: "position-size-calculator",
    name: "Position Size Calculator",
    tagline: "Never risk more than you can afford — calculate the perfect position size",
    description:
      "Input your account size, risk percentage per trade, entry price, stop loss, and leverage to calculate the exact position size in USD and number of units. Includes fee adjustment and risk level warnings.",
    metaTitle: "Position Size Calculator – Crypto & Stock Trading Risk Management",
    metaDescription:
      "Free position size calculator for traders. Enter account size, risk %, entry and stop loss price to get exact position size, margin needed, and units. Includes fee adjustment.",
    keywords: [
      "position size calculator",
      "crypto position size",
      "trading risk management calculator",
      "how much to invest per trade",
      "risk per trade calculator",
    ],
    category: "Crypto",
    icon: "📐",
    faqs: [
      {
        question: "How much should I risk per trade?",
        answer:
          "Professional traders typically risk 1–2% of their account per trade. This means even 10 consecutive losses only reduce your account by 10–20%, keeping you in the game long enough to recover.",
      },
      {
        question: "How is position size calculated?",
        answer:
          "Position Size = (Account × Risk%) / Stop Loss Distance%. For example: $10,000 account, 1% risk, 5% SL distance → Position = $100 / 5% = $2,000. With 10× leverage, you only need $200 margin.",
      },
      {
        question: "Why is fee adjustment important?",
        answer:
          "Exchange fees (typically 0.05% taker) are charged on open and close, reducing your effective risk budget. The adjusted position size accounts for these fees so your net loss exactly matches your risk amount.",
      },
    ],
    relatedTools: ["tp-sl-calculator", "compound-interest-calculator"],
  },
  {
    slug: "crypto-market-cap-comparator",
    name: "Crypto Market Cap Comparator",
    tagline: "If coin X reached coin Y's market cap, what would its price be?",
    description:
      "The classic crypto 'what if' calculator. Select any two coins and instantly see the projected price if the first coin reached the second's market cap. Uses live CoinGecko data for 50+ top cryptocurrencies. Also supports custom market cap targets.",
    metaTitle: "Crypto Market Cap Comparator – If X Reached Y's Market Cap Price Calculator",
    metaDescription:
      "Free crypto market cap calculator. See what price Bitcoin, Ethereum, Solana or any altcoin would reach if it matched another coin's market cap. Live data from CoinGecko.",
    keywords: [
      "crypto market cap calculator",
      "if bitcoin reaches ethereum market cap",
      "altcoin price prediction calculator",
      "crypto what if calculator",
      "market cap comparison crypto",
    ],
    category: "Crypto",
    icon: "🪙",
    faqs: [
      {
        question: "How is the projected price calculated?",
        answer:
          "Projected Price = Target Market Cap / Circulating Supply of Coin A. For example, if SOL (480M supply) reached BTC's $2T market cap: $2T / 480M = $4,167 per SOL.",
      },
      {
        question: "Why does circulating supply matter more than total supply?",
        answer:
          "Market cap is always calculated using circulating supply (coins actually in the market), not total or max supply. Using total supply would give an unrealistically low price projection.",
      },
      {
        question: "Where does the data come from?",
        answer:
          "Live data is fetched from CoinGecko's free public API. If the API is unavailable, the tool falls back to approximate offline data. Click Refresh to get the latest prices.",
      },
    ],
    relatedTools: ["tp-sl-calculator", "position-size-calculator"],
  },
  {
    slug: "unix-timestamp-converter",
    name: "Unix Timestamp Converter",
    tagline: "Convert Unix timestamps to human-readable dates instantly",
    description:
      "Convert Unix epoch timestamps to formatted dates and vice versa. Supports seconds and milliseconds, 12+ timezones, ISO 8601 output, relative time, and a live real-time clock. Click any common timestamp from the quick reference table.",
    metaTitle: "Unix Timestamp Converter – Epoch to Date & Date to Timestamp Online",
    metaDescription:
      "Free Unix timestamp converter. Convert epoch to human date or date to Unix timestamp. Supports seconds, milliseconds, UTC, and 12+ timezones. Live clock included.",
    keywords: [
      "unix timestamp converter",
      "epoch to date",
      "timestamp to date",
      "unix time converter online",
      "epoch converter",
    ],
    category: "Developer",
    icon: "⏱️",
    faqs: [
      {
        question: "What is a Unix timestamp?",
        answer:
          "A Unix timestamp (epoch time) is the number of seconds elapsed since January 1, 1970 00:00:00 UTC. It's universally used in programming, databases, and APIs to represent moments in time as a single integer.",
      },
      {
        question: "Seconds vs milliseconds — how do I know which one I have?",
        answer:
          "A 10-digit number (e.g. 1700000000) is seconds. A 13-digit number (e.g. 1700000000000) is milliseconds. Use the unit toggle in the converter to switch between them.",
      },
      {
        question: "What is the 2038 problem?",
        answer:
          "32-bit signed integers can only store values up to 2,147,483,647 — which corresponds to January 19, 2038 03:14:07 UTC. Systems using 32-bit timestamps will overflow on that date. Modern systems use 64-bit timestamps to avoid this.",
      },
    ],
    relatedTools: ["diff-checker", "percentage-calculator"],
  },
  {
    slug: "diff-checker",
    name: "Online Diff Checker",
    tagline: "Compare two texts, files, or code snippets side by side",
    description:
      "Paste two pieces of text to instantly see additions, deletions, and unchanged lines highlighted. Supports split view and unified view, ignore whitespace, ignore case, and comes with code and JSON samples. Runs entirely in the browser — nothing is sent to a server.",
    metaTitle: "Online Diff Checker – Compare Text, Code & JSON Side by Side",
    metaDescription:
      "Free online diff checker. Compare two texts, code files, or JSON side by side with line-by-line highlighting. Split and unified view, ignore whitespace, no server needed.",
    keywords: [
      "online diff checker",
      "text diff tool",
      "code comparison tool",
      "diff viewer online",
      "compare two texts online",
    ],
    category: "Developer",
    icon: "🔍",
    faqs: [
      {
        question: "Is my data sent to a server?",
        answer:
          "No. The diff is computed entirely in your browser using JavaScript. Your text never leaves your device.",
      },
      {
        question: "What diff algorithm is used?",
        answer:
          "The tool uses the Myers diff algorithm — the same algorithm used by Git, GNU diff, and most modern version control systems. It finds the shortest edit script between two sequences.",
      },
      {
        question: "What does 'ignore whitespace' do?",
        answer:
          "When enabled, leading and trailing spaces are trimmed from each line before comparison. Lines that differ only in indentation will be treated as equal. The original text is still displayed.",
      },
    ],
    relatedTools: ["unix-timestamp-converter", "text-case-converter"],
  },
  {
    slug: "ideal-weight-calculator",
    name: "Ideal Weight Calculator",
    tagline: "Find your ideal weight using 4 medical formulas + healthy BMI range",
    description:
      "Calculate your ideal body weight using the Robinson, Miller, Devine, and Hamwi formulas, plus the healthy BMI range. Enter your height and gender to compare all four results and see how your current weight compares.",
    metaTitle: "Ideal Weight Calculator – Robinson, Miller, Devine & Hamwi Formulas",
    metaDescription:
      "Free ideal weight calculator using 4 medical formulas. Enter height and gender to find your ideal weight by Robinson, Miller, Devine, and Hamwi methods plus healthy BMI range.",
    keywords: [
      "ideal weight calculator",
      "what should I weigh",
      "ideal body weight formula",
      "healthy weight calculator",
      "Robinson Devine Miller Hamwi formula",
    ],
    category: "Health",
    icon: "⚖️",
    faqs: [
      {
        question: "Which ideal weight formula is most accurate?",
        answer:
          "The Robinson (1983) formula is the most widely cited in modern literature. However, all four formulas are estimates for average-framed adults — athletes or those with high muscle mass may exceed these ranges while being perfectly healthy.",
      },
      {
        question: "Why are the formulas different from BMI?",
        answer:
          "BMI gives a range based purely on height, while these formulas give a single target weight based on clinical observations. The healthy BMI range (18.5–24.9) is shown alongside the formula results so you can compare both approaches.",
      },
    ],
    relatedTools: ["bmi-calculator", "body-fat-calculator", "bmr-tdee-calculator"],
  },
  {
    slug: "body-fat-calculator",
    name: "Body Fat Percentage Calculator",
    tagline: "Calculate your body fat % using the US Navy measurement method",
    description:
      "Estimate body fat percentage using the US Navy method — just waist, neck, and hip (women) measurements. Shows fat mass, lean mass, category (athletic/fitness/average/obese), and a visual gauge. No calipers or DEXA needed.",
    metaTitle: "Body Fat Percentage Calculator – US Navy Method (Waist, Neck, Hip)",
    metaDescription:
      "Free body fat percentage calculator using the US Navy method. Enter waist, neck, and hip measurements to calculate body fat %, fat mass, lean mass, and fitness category.",
    keywords: [
      "body fat percentage calculator",
      "navy body fat calculator",
      "body fat calculator waist neck hip",
      "how to calculate body fat",
      "body fat percentage measurement",
    ],
    category: "Health",
    icon: "💪",
    faqs: [
      {
        question: "How accurate is the US Navy body fat method?",
        answer:
          "The US Navy method has an error of ±3–4% compared to DEXA (gold standard). It's significantly more useful than BMI for fitness tracking because it distinguishes fat mass from lean mass.",
      },
      {
        question: "What body fat percentage is considered healthy?",
        answer:
          "For men: Athletic 6–13%, Fitness 14–17%, Average 18–24%. For women: Athletic 14–20%, Fitness 21–24%, Average 25–31%. Essential fat (required for basic function) is ~3–5% for men and 10–13% for women.",
      },
    ],
    relatedTools: ["ideal-weight-calculator", "bmr-tdee-calculator", "bmi-calculator"],
  },
  {
    slug: "bmr-tdee-calculator",
    name: "BMR & TDEE Calculator",
    tagline: "Find your daily calorie burn and set the perfect target for your goal",
    description:
      "Calculate your Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE) using Mifflin-St Jeor, Harris-Benedict, and Katch-McArdle formulas. Choose your activity level and see calorie targets for cutting, maintaining, and bulking — with macro breakdown.",
    metaTitle: "BMR TDEE Calculator – Daily Calorie Needs for Weight Loss & Muscle Gain",
    metaDescription:
      "Free BMR and TDEE calculator. Find your daily calorie burn using Mifflin-St Jeor formula. Set goals for cutting, maintaining, or bulking with macro breakdown.",
    keywords: [
      "BMR calculator",
      "TDEE calculator",
      "daily calorie calculator",
      "how many calories do I burn",
      "basal metabolic rate calculator",
    ],
    category: "Health",
    icon: "🔥",
    faqs: [
      {
        question: "What is the difference between BMR and TDEE?",
        answer:
          "BMR (Basal Metabolic Rate) is the calories your body burns at complete rest just to stay alive. TDEE (Total Daily Energy Expenditure) multiplies BMR by your activity level to get your actual daily calorie burn. Eat below TDEE to lose weight.",
      },
      {
        question: "Which BMR formula is most accurate?",
        answer:
          "Mifflin-St Jeor (1990) is considered the most accurate for most people, with a margin of ~10%. Katch-McArdle is more accurate if you know your lean body mass, as it accounts for muscle tissue which burns more calories than fat.",
      },
    ],
    relatedTools: ["body-fat-calculator", "ideal-weight-calculator", "water-intake-calculator"],
  },
  {
    slug: "water-intake-calculator",
    name: "Daily Water Intake Calculator",
    tagline: "How much water should you drink per day? Find your personalized target",
    description:
      "Get a personalized daily water intake recommendation based on body weight, activity level, climate, and pregnancy/breastfeeding status. Based on the WHO 35 mL/kg baseline with evidence-based adjustments. Shows result in liters, cups, and 500 mL bottles.",
    metaTitle: "Water Intake Calculator – How Much Water Should You Drink Per Day?",
    metaDescription:
      "Free daily water intake calculator. Find how much water you should drink based on weight, activity level, and climate. Results in liters, cups, and bottles.",
    keywords: [
      "water intake calculator",
      "how much water should I drink",
      "daily water calculator",
      "hydration calculator",
      "water intake per day",
    ],
    category: "Health",
    icon: "💧",
    faqs: [
      {
        question: "Is the '8 glasses a day' rule accurate?",
        answer:
          "The 8×8 rule (eight 8-oz glasses) is a rough approximation. Actual needs vary significantly by body weight, activity, and climate. A 100 kg athlete training in hot weather may need 4+ liters, while a 50 kg sedentary person needs closer to 1.7 liters.",
      },
      {
        question: "Does coffee count toward daily water intake?",
        answer:
          "Yes — coffee and tea are about 98–99% water. Despite mild diuretic effects, research shows they contribute net positive hydration. However, alcohol does not count and increases water needs.",
      },
    ],
    relatedTools: ["bmr-tdee-calculator", "bmi-calculator", "body-fat-calculator"],
  },
  {
    slug: "running-pace-calculator",
    name: "Running Pace Calculator",
    tagline: "Calculate pace, finish time, or distance for any run or race",
    description:
      "Three modes: find your pace from distance+time, predict finish time from pace+distance, or find distance from pace+time. Shows speed in km/h and mph, pace per km and mile, and predicts race finish times for 5K, 10K, half marathon, and marathon.",
    metaTitle: "Running Pace Calculator – Find Pace, Time, or Distance for Any Race",
    metaDescription:
      "Free running pace calculator. Enter distance and time to find pace, or pace and time to find distance. Predicts 5K, 10K, half marathon, and marathon finish times.",
    keywords: [
      "running pace calculator",
      "race pace calculator",
      "marathon pace calculator",
      "running time calculator",
      "pace per km calculator",
    ],
    category: "Health",
    icon: "🏃",
    faqs: [
      {
        question: "What is a good running pace for beginners?",
        answer:
          "A comfortable conversational pace for most beginners is 6–8 minutes per km (9.5–13 min/mile). If you can hold a conversation while running, you're in the right zone. As fitness improves, target 5–6 min/km for a 10K.",
      },
      {
        question: "How do I calculate my race finish time?",
        answer:
          "Finish Time = Pace × Distance. For example, a 5:30 /km pace over 10 km = 55 minutes. Use the 'Find Time' mode and enter your target pace and race distance to get instant predictions.",
      },
    ],
    relatedTools: ["bmr-tdee-calculator", "water-intake-calculator", "bmi-calculator"],
  },
  {
    slug: "ovulation-calculator",
    name: "Ovulation & Cycle Tracker",
    tagline: "Predict fertile window, ovulation date, and next period — runs in browser only",
    description:
      "Calculate your fertile window, ovulation date, period dates, and cycle phases for up to 6 future cycles. Based on the standard 28-day model (customizable). All calculations run entirely in your browser — no data is sent to any server.",
    metaTitle: "Ovulation Calculator – Fertile Window & Period Tracker (Browser Only)",
    metaDescription:
      "Free ovulation and period calculator. Find your fertile window, ovulation date, and next period for up to 6 cycles. 100% private — runs in your browser, no data stored.",
    keywords: [
      "ovulation calculator",
      "fertile window calculator",
      "period tracker",
      "menstrual cycle calculator",
      "when am I most fertile",
    ],
    category: "Health",
    icon: "🌸",
    faqs: [
      {
        question: "How is the fertile window calculated?",
        answer:
          "Ovulation typically occurs 14 days before the next period (not 14 days after the last period). The fertile window is the 5 days before ovulation plus ovulation day itself, as sperm can survive up to 5 days in the reproductive tract.",
      },
      {
        question: "Is this data stored anywhere?",
        answer:
          "No. All calculations are done in JavaScript running in your browser. Nothing is sent to a server, stored in a database, or shared with any third party.",
      },
    ],
    relatedTools: ["sleep-calculator", "water-intake-calculator"],
  },
  {
    slug: "sleep-calculator",
    name: "Sleep Cycle Calculator",
    tagline: "Wake up refreshed — find the best bedtime or alarm based on 90-minute cycles",
    description:
      "Calculate the optimal bedtime or wake-up time based on 90-minute sleep cycles. Three modes: wake up at a specific time, go to bed at a specific time, or sleep right now. Highlights recommended 7.5-hour (5 cycles) and 9-hour (6 cycles) options.",
    metaTitle: "Sleep Cycle Calculator – Best Bedtime & Wake-Up Times for Full Cycles",
    metaDescription:
      "Free sleep calculator based on 90-minute cycles. Find the best bedtime to wake up refreshed. Enter your wake-up time or bedtime to see all optimal sleep options.",
    keywords: [
      "sleep calculator",
      "sleep cycle calculator",
      "best time to wake up",
      "bedtime calculator",
      "90 minute sleep cycle",
    ],
    category: "Health",
    icon: "😴",
    faqs: [
      {
        question: "Why 90 minutes per sleep cycle?",
        answer:
          "A complete sleep cycle — light sleep → deep sleep → REM — averages 90 minutes. Waking in the middle of a cycle (especially deep sleep) causes sleep inertia: the groggy, disoriented feeling that can last hours. Waking at the end of a cycle minimizes this.",
      },
      {
        question: "How many sleep cycles do I need?",
        answer:
          "Most adults need 5–6 complete cycles (7.5–9 hours). 5 cycles (7.5h) is the sweet spot for most people. Less than 4 cycles (6h) is consistently linked to impaired cognitive function, even if it doesn't feel that way.",
      },
    ],
    relatedTools: ["water-intake-calculator", "bmr-tdee-calculator"],
  },
  {
    slug: "json-csv-formatter",
    name: "JSON & CSV Formatter / Validator",
    tagline: "Format, validate, and convert JSON and CSV instantly in your browser",
    description:
      "Paste raw JSON to format with 2-space indentation or minify it, with real-time validation showing object type and key count. Paste CSV to normalize quoting/delimiters, or convert CSV to a JSON array. Supports comma, semicolon, tab, and pipe delimiters.",
    metaTitle: "JSON CSV Formatter & Validator – Online JSON Beautifier & CSV Converter",
    metaDescription:
      "Free online JSON formatter, validator, and CSV formatter. Paste JSON to beautify or minify. Paste CSV to format or convert to JSON. Supports all delimiters. Browser-only.",
    keywords: [
      "json formatter online",
      "json validator",
      "csv formatter online",
      "json beautifier",
      "csv to json converter",
    ],
    category: "Developer",
    icon: "📋",
    faqs: [
      {
        question: "What does JSON formatting do?",
        answer:
          "JSON formatting (beautifying) adds consistent indentation and line breaks to make compact JSON human-readable. Minifying does the opposite — removes all whitespace to reduce file size for transmission.",
      },
      {
        question: "Is my data sent to a server?",
        answer:
          "No. All formatting and validation runs entirely in your browser using JavaScript. Your data never leaves your device.",
      },
      {
        question: "What CSV delimiters are supported?",
        answer:
          "Comma (,), semicolon (;), tab (TSV), and pipe (|). The tool also handles RFC 4180 quoted fields, escaped quotes, and mixed spacing.",
      },
    ],
    relatedTools: ["base64-tool", "diff-checker", "word-counter"],
  },
  {
    slug: "base64-tool",
    name: "Base64 Encoder / Decoder",
    tagline: "Encode and decode Base64 and URL-encoded strings instantly",
    description:
      "Encode any text to Base64 or decode Base64 back to plain text. Also supports URL encoding/decoding (percent-encoding). Handles UTF-8 correctly via TextEncoder/TextDecoder. Includes a Swap button to reverse direction, real-time validation, and copy-to-clipboard.",
    metaTitle: "Base64 Encoder Decoder Online – URL Encode Decode Tool",
    metaDescription:
      "Free Base64 encoder and decoder. Encode text to Base64 or decode Base64 strings. Also URL encode/decode (percent-encoding). UTF-8 safe, browser-only, instant results.",
    keywords: [
      "base64 encoder decoder",
      "base64 decode online",
      "url encode decode",
      "base64 converter",
      "percent encoding tool",
    ],
    category: "Developer",
    icon: "🔐",
    faqs: [
      {
        question: "What is Base64 used for?",
        answer:
          "Base64 is used to encode binary data as ASCII text for safe transmission — in data URIs (images in HTML/CSS), HTTP Basic Auth headers, JWT tokens, email attachments (MIME), and JSON payloads that need to carry binary content.",
      },
      {
        question: "What is the difference between Base64 and URL encoding?",
        answer:
          "Base64 encodes any bytes into a 64-character alphabet (A-Z, a-z, 0-9, +, /). URL encoding (percent-encoding) replaces unsafe URL characters with %XX hex sequences. Use URL encoding for query parameters; use Base64 for binary data in text formats.",
      },
    ],
    relatedTools: ["json-csv-formatter", "diff-checker", "unix-timestamp-converter"],
  },
  {
    slug: "word-counter",
    name: "Word & Character Counter",
    tagline: "Count words, characters, sentences, reading time and more instantly",
    description:
      "Real-time word count, character count (with and without spaces), sentence count, paragraph count, line count, reading time, speaking time, unique word count, average word length, byte size, and most frequent words. Includes character limit bars for Tweet, SMS, Meta title, Meta description, LinkedIn, and Facebook.",
    metaTitle: "Word Counter – Count Words, Characters & Reading Time Online",
    metaDescription:
      "Free online word and character counter. Count words, characters, sentences, paragraphs, reading time, unique words, and more. Includes character limits for Twitter, SMS, and SEO.",
    keywords: [
      "word counter",
      "character counter online",
      "word count tool",
      "reading time calculator",
      "character count for twitter",
    ],
    category: "Developer",
    icon: "📝",
    faqs: [
      {
        question: "How is reading time calculated?",
        answer:
          "Reading time is estimated at 238 words per minute — the average silent reading speed for adults (based on research by Brysbaert et al., 2019). Speaking time uses 130 WPM, suitable for presentations and speeches.",
      },
      {
        question: "What counts as a word?",
        answer:
          "Any sequence of non-whitespace characters separated by spaces, tabs, or newlines. Hyphenated words (e.g. 'well-known') count as one word. Numbers and punctuation attached to letters are included in the word.",
      },
    ],
    relatedTools: ["diff-checker", "text-case-converter", "json-csv-formatter"],
  },
  {
    slug: "base-converter",
    name: "Number Base Converter",
    tagline: "Convert numbers between any bases — binary, octal, decimal, hex, and more",
    description:
      "Convert integers between bases 2 through 64, including binary (base 2), octal (base 8), decimal (base 10), hexadecimal (base 16), base 32, base 36, Base58 (Bitcoin), and Base64. Uses BigInt for unlimited precision. Shows formatted binary with nibble spacing, hex with byte spacing, bit pattern visualization, and bits/bytes count.",
    metaTitle: "Number Base Converter – Binary, Octal, Decimal, Hex & All Bases",
    metaDescription:
      "Free number base converter. Convert between binary, octal, decimal, hex, base 32, base 36, base 58, and all bases 2–64. BigInt precision, formatted output, instant conversion.",
    keywords: [
      "number base converter",
      "binary to decimal converter",
      "hex to decimal converter",
      "binary octal hex converter",
      "base conversion calculator",
    ],
    category: "Developer",
    icon: "🔢",
    faqs: [
      {
        question: "What bases are supported?",
        answer:
          "All integer bases from 2 to 64, including: Binary (2), Octal (8), Decimal (10), Hexadecimal (16), Base32 (32), Base36 (36), Base58 (Bitcoin alphabet, 58), and Base64 (64). You can also type any custom base between 2 and 64.",
      },
      {
        question: "What is hexadecimal used for?",
        answer:
          "Hexadecimal (base 16) is ubiquitous in computing: memory addresses, color codes (#FF5733), byte values, hash outputs (MD5, SHA256), and CPU instruction sets. Each hex digit represents exactly 4 bits (a nibble), making it compact and readable.",
      },
      {
        question: "What is the difference between Base58 and Base64?",
        answer:
          "Base58 (used in Bitcoin addresses and IPFS hashes) omits visually ambiguous characters (0, O, I, l) to prevent human transcription errors. Base64 uses the full 64-character alphabet including + and / and is designed for machine-to-machine data encoding.",
      },
    ],
    relatedTools: ["unix-timestamp-converter", "diff-checker", "json-csv-formatter"],
  },
];

export function getToolBySlug(slug: string): ToolMeta | undefined {
  return tools.find((t) => t.slug === slug);
}

/** Maps category name → URL path segment */
export const CATEGORY_URL_PREFIX: Record<string, string> = {
  Finance:       "calc",
  Math:          "calc",
  Health:        "calc",
  Crypto:        "calc",
  Design:        "design",
  Generators:    "design",
  Developer:     "dev",
  Text:          "dev",
  Security:      "dev",
  "Date & Time": "time",
  Converter:     "converter",
};

/** Returns the canonical URL path for a tool, e.g. /tools/dev/base-converter */
export function getToolPath(tool: Pick<ToolMeta, "slug" | "category">): string {
  const prefix = CATEGORY_URL_PREFIX[tool.category];
  return prefix ? `/tools/${prefix}/${tool.slug}` : `/tools/${tool.slug}`;
}

/** Returns the category listing path, e.g. /tools/dev */
export function getCategoryListPath(category: string): string {
  const prefix = CATEGORY_URL_PREFIX[category];
  return prefix ? `/tools/${prefix}` : "/tools";
}

export function getRelatedTools(slugs: string[]): ToolMeta[] {
  return slugs
    .map((s) => getToolBySlug(s))
    .filter((t): t is ToolMeta => t !== undefined);
}

/**
 * Merge legacy tools with registry tools.
 * Registry tools override legacy ones with the same slug.
 * Call this only in server contexts (page.tsx, sitemap.ts, etc.)
 * by importing registryToToolMetas from ./registry separately.
 */
export function mergeWithRegistry(registryTools: ToolMeta[]): ToolMeta[] {
  const registrySlugs = new Set(registryTools.map((t) => t.slug));
  return [
    ...tools.filter((t) => !registrySlugs.has(t.slug)),
    ...registryTools,
  ];
}

/** Alias kept for server-only callers that import registry themselves */
export function getAllTools(): ToolMeta[] {
  return tools;
}
