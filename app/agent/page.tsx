import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Agent",
  description: "Control getfastcalc with natural language commands.",
};

const EXAMPLES = [
  { command: "create a keto macro calculator", actions: "generate_tool" },
  { command: "generate variants for bmi-calculator", actions: "generate_variants" },
  { command: "run maintenance and push to git", actions: "run_maintenance, git_commit_push" },
  { command: "show me low CTR pages from GSC", actions: "fetch_gsc_data, analyze_seo" },
  { command: "build the site", actions: "run_build" },
  { command: "list all health tools", actions: "list_tools" },
  { command: "add HowTo schema to age-calculator", actions: "generate_howto" },
  { command: "fix meta title of compound-interest-calculator to ...", actions: "modify_tool_meta" },
];

export default function AgentPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">🤖 getfastcalc AI Agent</h1>
      <p className="text-gray-600 mb-8">
        Control the entire getfastcalc system with everyday language.
        The agent translates your intent into structured function calls and runs the right scripts automatically.
      </p>

      <section className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h2 className="font-semibold mb-2">Run locally</h2>
        <code className="block bg-gray-900 text-green-400 p-3 rounded text-sm overflow-auto">
          python3 scripts/agent.py
        </code>
        <p className="text-sm text-gray-600 mt-2">
          Then type a command in English or Chinese. Type <code>quit</code> to exit.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Example commands</h2>
        <ul className="space-y-3">
          {EXAMPLES.map((ex, i) => (
            <li key={i} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 p-3 bg-white border rounded-lg">
              <code className="text-sm text-gray-800 font-medium">&quot;{ex.command}&quot;</code>
              <span className="text-xs text-gray-500">→ {ex.actions}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">What the agent can do</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            "Generate new tools",
            "Generate SEO variants",
            "Add HowTo Schema JSON-LD",
            "Modify tool metadata",
            "Run maintenance audits",
            "Fetch & analyze GSC data",
            "Build the static site",
            "Commit and push changes",
            "List and search tools",
          ].map((item, i) => (
            <div key={i} className="p-3 bg-gray-50 rounded text-sm">{item}</div>
          ))}
        </div>
      </section>

      <div className="flex gap-4">
        <Link href="/" className="text-blue-600 hover:underline">← Back to home</Link>
        <Link href="/workbench" className="text-blue-600 hover:underline">Workbench →</Link>
      </div>
    </main>
  );
}
