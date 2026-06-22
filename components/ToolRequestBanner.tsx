"use client";
import { useState } from "react";
import { trackToolRequest } from "@/lib/analytics";

type State = "idle" | "submitted";

export default function ToolRequestBanner({ sidebar = false }: { sidebar?: boolean }) {
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
      // Save locally as backup
      const prev = JSON.parse(localStorage.getItem("tool_requests") ?? "[]");
      prev.push(entry);
      localStorage.setItem("tool_requests", JSON.stringify(prev));
      // Send to Notion via Cloudflare Worker proxy
      const proxyUrl = process.env.NEXT_PUBLIC_NOTION_PROXY_URL;
      if (proxyUrl) {
        await fetch(proxyUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(entry),
        });
      }
    } catch {}
    trackToolRequest({ tool_name: tool.trim() });
    setLoading(false);
    setState("submitted");
  }

  if (state === "submitted") {
    return (
      <div className={`flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 text-green-800 text-sm ${sidebar ? "px-4 py-4" : "px-6 py-4"}`}>
        <span className="text-2xl">🎉</span>
        <div>
          <p className="font-semibold">Request received!</p>
          <p className="text-green-600 text-xs mt-0.5">We review submissions regularly.</p>
        </div>
      </div>
    );
  }

  /* ── Sidebar (compact) variant ── */
  if (sidebar) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">💡</span>
          <p className="text-sm font-bold text-gray-900">Missing a tool?</p>
        </div>
        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
          Tell us what you need — we build the most-requested tools.
        </p>
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            type="text"
            value={tool}
            onChange={e => setTool(e.target.value)}
            placeholder="e.g. Mortgage calculator…"
            maxLength={120}
            required
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-gray-400 bg-white"
          />
          <textarea
            value={detail}
            onChange={e => setDetail(e.target.value)}
            placeholder="Any details? (optional)"
            rows={2}
            maxLength={400}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-gray-400 bg-white resize-none"
          />
          <button
            type="submit"
            disabled={loading || !tool.trim()}
            className="w-full py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Sending…" : "Submit →"}
          </button>
        </form>
      </div>
    );
  }

  /* ── Default (full banner) variant ── */
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white px-6 py-6 shadow-sm">
      <div className="pointer-events-none absolute -top-8 -right-8 w-40 h-40 rounded-full bg-gray-100 opacity-60" />
      <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Missing a tool?</p>
          <p className="text-lg font-bold text-gray-900 leading-snug">Tell us what calculator you need</p>
          <p className="text-sm text-gray-500 mt-1">We build the most-requested tools — your suggestion goes straight to our queue.</p>
        </div>
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
