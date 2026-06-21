import { mergeWithRegistry } from "@/lib/tools";
import { registryToToolMetas } from "@/lib/registry";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HomeSchema from "@/components/HomeSchema";
import ToolGrid from "@/components/ToolGrid";
import ToolRequestBanner from "@/components/ToolRequestBanner";
import WorkbenchDashboard from "@/components/WorkbenchDashboard";

export default function Home() {
  const allTools = mergeWithRegistry(registryToToolMetas());

  return (
    <>
      <HomeSchema tools={allTools} />
      <Header allTools={allTools} />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-10">
          {/* Hero */}
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-4 leading-tight">
              Free Online Tools &amp;<br className="hidden sm:block" /> Calculators
            </h1>
            <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
              Fast, free tools that work instantly in your browser.
              No signup. No ads. Just results.
            </p>
          </div>

          {/* Two-column layout */}
          <div className="flex gap-8 items-start">
            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Workbench — client-side, only shows when user has history */}
              <WorkbenchDashboard allTools={allTools} />
              <ToolGrid tools={allTools} />
              {/* Trust line */}
              <div className="mt-12 text-center">
                <p className="text-sm text-gray-400">
                  All tools run 100% in your browser · No data stored · No account required
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:flex flex-col gap-4 w-64 shrink-0 sticky top-20">
              <ToolRequestBanner sidebar />

              {/* Category quick links */}
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
