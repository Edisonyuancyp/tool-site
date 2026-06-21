# ToolCalc — Free Online Tools & Calculators

A static web tool site with 30+ free browser-based calculators and utilities. Built with Next.js (static export), React, and Tailwind CSS. All tools run 100% client-side — no backend, no database, no user data collected.

## Tools Included

**Health** — BMI Calculator, Ideal Weight, Body Fat %, BMR & TDEE, Water Intake, Running Pace, Ovulation Calculator, Sleep Calculator

**Finance** — Compound Interest, Currency Converter, Percentage Calculator, TP/SL Calculator, Position Size Calculator, Crypto Market Cap Comparator

**Developer** — Unix Timestamp Converter, Diff Checker, JSON/CSV Formatter, Base64 Encoder/Decoder, Word Counter, Number Base Converter

**Date & Time** — Age Calculator, Holiday Calculator

**Utilities** — QR Code Generator, Password Generator, Text Case Converter, Random Number Generator, Emoji Picker

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
```

Generates a fully static site in the `out/` directory.

## Deploy on Cloudflare Pages

Connect this GitHub repository to [Cloudflare Pages](https://pages.cloudflare.com/) with these settings:

| Setting | Value |
|---|---|
| **Framework preset** | None |
| **Build command** | `npm run build` |
| **Build output directory** | `out` |
| **Node.js version** | `20` |

No environment variables required — all tools are client-side only.

## Tech Stack

- [Next.js 15](https://nextjs.org/) — static export (`output: "export"`)
- [React 19](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Recharts](https://recharts.org/) — charts for compound interest
- [qrcode](https://www.npmjs.com/package/qrcode) — QR code generation

## SEO

- Per-page `<title>` and `<meta description>` via Next.js `generateMetadata`
- Schema.org structured data: `SoftwareApplication`, `FAQPage`, `BreadcrumbList` on every tool page
- `WebSite`, `ItemList`, `Organization` schema on homepage
- `sitemap.xml` and `robots.txt` auto-generated
- Canonical URLs on all pages
