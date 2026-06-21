"use client";
import { useState } from "react";

type State = "idle" | "submitted";

export default function ToolRequestBanner() {
  const [state,   setState]   = useState<State>("idle");
  const [tool,    setTool]    = useState("");
  const [detail,  setDetail]  = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tool.trim()) return;
    setLoading(true);

    try {
      const entry = { tool: tool.trim(), detail: detail.trim(), ts: Date.now() };
      const prev = JSON.parse(localStorage.getItem("tool_requests") ?? "[]");
      prev.push(entry);
      localStorage.setItem("tool_requests", JSON.stringify(prev));

      // Optional: also POST to /api/tool-request if you add a route later
      // await fetch("/api/tool-request", { method: "POST", body: JSON.stringify(entry) });
    } catch {}

    setLoading(false);
    setState("submitted");
  }

  if (state === "submitted") {
    return (
      <div className="flex items-center gap-3 px-6 py-4 rounded-2xl border border-green-200 bg-green-50 text-green-800 text-sm">
        <span className="text-2xl">🎉</span>
        <div>
          <p className="font-semibold">Request received — thank you!</p>
          <p className="text-green-600 text-xs mt-0.5">We review submissions regularly and prioritize the most-requested tools.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white px-6 py-6 shadow-sm">
      {/* Decorative blob */}
      <div className="pointer-events-none absolute -top-8 -right-8 w-40 h-40 rounded-full bg-gray-100 opacity-60" />

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
        {/* Left copy */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
            Missing a tool?
          </p>
          <p className="text-lg font-bold text-gray-900 leading-snug">
            Tell us what calculator you need
          </p>
          <p className="text-sm text-gray-500 mt-1">
            We build the most-requested tools — your suggestion goes straight to our queue.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 min-w-0 space-y-2">
          <input
            type="text"
            value={tool}
            onChange={e => setTool(e.target.value)}
            placeholder="e.g. Mortgage calculator, BMR calculator…"
            maxLength={120}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-gray-400 bg-white"
          />
          <textarea
            value={detail}
            onChange={e => setDetail(e.target.value)}
            placeholder="Any extra details? (optional)"
            rows={2}
            maxLength={400}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-gray-400 bg-white resize-none"
          />
          <button
            type="submit"
            disabled={loading || !tool.trim()}
            className="w-full sm:w-auto px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Sending…" : "Submit request →"}
          </button>
        </form>
      </div>
    </div>
  );
}
