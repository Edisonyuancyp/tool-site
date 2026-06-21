"use client";
import { useState } from "react";

export interface Tip {
  trigger: string;   // button label, e.g. "How to avoid liquidation?"
  title: string;     // panel heading
  body: string;      // markdown-lite content (supports **bold**, `code`, numbered lists)
}

// ── Mini Markdown renderer (no external dep) ──────────────────────────────────

function renderMd(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/`(.+?)`/g, "<code class=\"bg-gray-100 px-1 py-0.5 rounded text-xs font-mono\">$1</code>")
    .replace(/^(\d+)\. /gm, "<span class=\"text-gray-400 font-mono text-xs mr-1\">$1.</span> ")
    .replace(/^- /gm, "• ");
}

// ── Panel ─────────────────────────────────────────────────────────────────────

function TipPanel({ tip, onClose }: { tip: Tip; onClose: () => void }) {
  const paragraphs = tip.body.split("\n\n").filter(Boolean);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        role="complementary"
        aria-label={tip.title}
        className="fixed bottom-0 left-0 right-0 sm:bottom-auto sm:right-4 sm:top-1/2 sm:-translate-y-1/2 sm:left-auto sm:w-96 z-50 bg-white rounded-t-2xl sm:rounded-2xl border border-gray-100 shadow-2xl flex flex-col max-h-[80vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">💡</span>
            <h3 className="font-bold text-gray-900 text-sm leading-tight">{tip.title}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close tip"
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors shrink-0 text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {paragraphs.map((p, i) => {
            const isNumberedList = /^\d+\. /.test(p);
            const isBulletList = /^- /.test(p);

            if (isNumberedList || isBulletList) {
              const items = p.split("\n").filter(Boolean);
              return (
                <ol key={i} className={`space-y-2 ${isNumberedList ? "list-decimal list-inside" : ""}`}>
                  {items.map((item, j) => (
                    <li
                      key={j}
                      className="text-sm text-gray-600 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: renderMd(item.replace(/^\d+\. |^- /, "")) }}
                    />
                  ))}
                </ol>
              );
            }

            // Highlight callout blocks starting with ⚠️ or ✅
            const isCallout = p.startsWith("⚠️") || p.startsWith("✅") || p.startsWith("💡");
            if (isCallout) {
              const bg = p.startsWith("✅") ? "bg-green-50 border-green-200 text-green-800"
                : p.startsWith("⚠️") ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-blue-50 border-blue-200 text-blue-800";
              return (
                <div key={i} className={`flex gap-2 p-3 rounded-xl border text-sm ${bg}`}>
                  <span className="shrink-0">{p[0]}</span>
                  <span dangerouslySetInnerHTML={{ __html: renderMd(p.slice(2).trim()) }} />
                </div>
              );
            }

            return (
              <p
                key={i}
                className="text-sm text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderMd(p) }}
              />
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-50 shrink-0">
          <p className="text-[10px] text-gray-300 text-center">GetFastCalc · Free tools, zero signup</p>
        </div>
      </aside>
    </>
  );
}

// ── Trigger button ─────────────────────────────────────────────────────────────

interface Props {
  tip: Tip;
  variant?: "inline" | "badge";
}

export default function ContextualTip({ tip, variant = "inline" }: Props) {
  const [open, setOpen] = useState(false);

  if (variant === "badge") {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          aria-label={`Open tip: ${tip.title}`}
          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-100 rounded-full text-[10px] font-semibold text-blue-600 hover:bg-blue-100 transition-colors"
        >
          💡 {tip.trigger}
        </button>
        {open && <TipPanel tip={tip} onClose={() => setOpen(false)} />}
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={`Open tip: ${tip.title}`}
        className="flex items-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl text-sm text-blue-700 hover:from-blue-100 hover:to-indigo-100 transition-all group text-left"
      >
        <span className="text-base shrink-0">💡</span>
        <span className="font-medium">{tip.trigger}</span>
        <svg className="w-4 h-4 ml-auto text-blue-400 group-hover:translate-x-0.5 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      {open && <TipPanel tip={tip} onClose={() => setOpen(false)} />}
    </>
  );
}
