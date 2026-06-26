import Link from "next/link";
import { mergeWithRegistry, getToolPath } from "@/lib/tools";
import { registryToToolMetas } from "@/lib/registry";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomeSchema from "@/components/HomeSchema";
import ToolGrid from "@/components/ToolGrid";
import ToolRequestBanner from "@/components/ToolRequestBanner";
import WorkbenchDashboard from "@/components/WorkbenchDashboard";

const POPULAR_SLUGS = [
  "percentage-calculator",
  "bmi-calculator",
  "scientific-calculator",
  "compound-interest-calculator",
  "tax-calculator",
  "age-calculator",
  "tip-calculator",
  "password-generator",
];

const CATEGORIES = [
  { href: "/tools/calc",      icon: "🧮", label: "Math & Finance Calculators", desc: "Percentage, BMI, tax, compound interest, salary, tip and more" },
  { href: "/tools/calc",      icon: "🏃", label: "Health & Fitness",            desc: "BMI, body fat, BMR/TDEE, water intake, running pace, sleep" },
  { href: "/tools/dev",       icon: "💻", label: "Developer Tools",             desc: "Base converter, Base64, JSON formatter, diff checker, Unix timestamp" },
  { href: "/tools/design",    icon: "🎨", label: "Design & Generators",         desc: "QR code, password generator, emoji picker, color tools" },
  { href: "/tools/time",      icon: "🕐", label: "Date & Time",                 desc: "Age calculator, holiday finder, timestamp converter" },
  { href: "/tools/converter", icon: "🔄", label: "Converters",                  desc: "Number base, currency, unit converters" },
];

export default function Home() {
  const allTools = mergeWithRegistry(registryToToolMetas());
  const popularTools = POPULAR_SLUGS
    .map(slug => allTools.find(t => t.slug === slug))
    .filter(Boolean) as typeof allTools;

  return (
    <>
      <HomeSchema tools={allTools} />
      <Header allTools={allTools} />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-10">

          {/* Hero */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 text-xs font-medium text-gray-500 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              No signup · No ads · Instant answers
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-4 leading-tight">
              Free Online Calculators
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
              GetFastCalc gives you 100+ free calculators and tools for math, finance, health, science,
              and more. Everything runs in your browser — no signup, no data stored, instant results.
            </p>
          </div>

          {/* Two-column layout */}
          <div className="flex gap-8 items-start">
            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Search + all tools grid — search bar is at the very top of ToolGrid */}
              <ToolGrid tools={allTools} />

              {/* Popular Calculators */}
              {popularTools.length > 0 && (
                <section className="mb-10" aria-label="Popular Calculators">
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">Popular Calculators</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {popularTools.map(tool => (
                      <Link
                        key={tool.slug}
                        href={getToolPath(tool)}
                        className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm transition-all text-sm font-medium text-gray-700"
                      >
                        <span className="text-xl">{tool.icon}</span>
                        <span className="truncate">{tool.name}</span>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              <WorkbenchDashboard allTools={allTools} />

              {/* About / SEO text block */}
              <section className="mt-16 border-t border-gray-100 pt-12" aria-label="About GetFastCalc">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About GetFastCalc</h2>
                <div className="prose prose-gray max-w-none text-gray-500 leading-relaxed space-y-4 text-sm">
                  <p>
                    <strong className="text-gray-700">GetFastCalc</strong> is a free online calculator hub with 100+ tools across
                    math, finance, health, science, developer utilities, and more. Every tool runs entirely in your browser —
                    there is no server-side processing, no account required, and no data is ever stored.
                  </p>
                  <p>
                    Whether you need a <Link href="/tools/calc/percentage-calculator" className="text-gray-700 underline hover:text-black">percentage calculator</Link>,
                    a <Link href="/tools/calc/bmi-calculator" className="text-gray-700 underline hover:text-black">BMI calculator</Link>,
                    a <Link href="/tools/calc/scientific-calculator" className="text-gray-700 underline hover:text-black">scientific calculator</Link>,
                    or developer tools like a <Link href="/tools/dev/base-converter" className="text-gray-700 underline hover:text-black">base converter</Link> or{" "}
                    <Link href="/tools/dev/base64-tool" className="text-gray-700 underline hover:text-black">Base64 encoder</Link>,
                    GetFastCalc has you covered. Results are instant — just type a value and the answer appears immediately.
                  </p>
                  <p>
                    All calculators follow well-established formulas and are updated regularly.
                    GetFastCalc is trusted by students, professionals, developers, and everyday users who need fast, accurate answers without any friction.
                  </p>
                </div>

                {/* Category grid */}
                <h2 className="text-xl font-bold text-gray-900 mt-10 mb-5">Browse Calculators by Category</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {CATEGORIES.map(cat => (
                    <Link
                      key={cat.label}
                      href={cat.href}
                      className="flex gap-3 p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                      <span className="text-2xl shrink-0">{cat.icon}</span>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{cat.label}</p>
                        <p className="text-xs text-gray-400 mt-0.5 leading-snug">{cat.desc}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              <div className="mt-12 text-center">
                <p className="text-sm text-gray-400">
                  All tools run 100% in your browser · No data stored · No account required
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:flex flex-col gap-4 w-64 shrink-0 sticky top-20">
              <ToolRequestBanner sidebar />
              <div className="rounded-2xl border border-gray-100 bg-white px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Browse by category</p>
                <div className="space-y-1">
                  {[
                    { href: "/tools/calc",      icon: "🧮", label: "Calculators" },
                    { href: "/tools/dev",       icon: "💻", label: "Developer Tools" },
                    { href: "/tools/design",    icon: "🎨", label: "Design & Generators" },
                    { href: "/tools/time",      icon: "🕐", label: "Date & Time" },
                    { href: "/tools/converter", icon: "🔄", label: "Converters" },
                  ].map(({ href, icon, label }) => (
                    <a key={href} href={href}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                      <span className="text-base">{icon}</span>
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
