"use client";
import { useState, useEffect, useRef } from "react";
import { useWorkbench } from "@/lib/WorkbenchContext";

interface Step {
  target: string;       // CSS selector of the element to highlight
  title: string;
  body: string;
  placement: "bottom" | "top" | "left" | "right";
  spotlightPadding?: number;
}

const STEPS: Step[] = [
  {
    target: "[data-tour='collections-section']",
    title: "📁 Collections — your tool groups",
    body: "Group related tools into collections. One collection per workflow — e.g. all your FBA tools in one place, accessible in a single click.",
    placement: "bottom",
    spotlightPadding: 8,
  },
  {
    target: "[data-tour='install-preset']",
    title: "⚡ Install a starter kit",
    body: "Click \"Install\" next to the FBA Seller Kit to instantly add 6 tools every Amazon seller needs daily — profit calculator, ACoS, fees, reorder, import duty, and packing.",
    placement: "bottom",
    spotlightPadding: 8,
  },
  {
    target: "[data-tour='new-collection-btn']",
    title: "➕ Or build your own",
    body: "Click \"+ New collection\" to create a custom group. Give it a name and emoji, then search for any tool to add.",
    placement: "bottom",
    spotlightPadding: 8,
  },
  {
    target: "[data-tour='board-link']",
    title: "🧩 Workbench Board — your dashboard",
    body: "The Board lets you build a live dashboard with multiple tools side-by-side. Drag to reorder, resize cards (S/M/L), and pick from preset boards like FBA Seller, Quant Trader, or Designer. Click the 🧩 Board button in the header to open it.",
    placement: "bottom",
    spotlightPadding: 8,
  },
  {
    target: "[data-tour='favorites-section']",
    title: "♥ Save individual tools",
    body: "On any calculator page, click the ♥ heart button to save it. Saved tools appear here so you never have to search for them again.",
    placement: "top",
    spotlightPadding: 8,
  },
  {
    target: "[data-tour='recents-section']",
    title: "🕐 Recently visited",
    body: "Every tool you open is automatically tracked here. Your last 10 tools are always one click away — no saving needed.",
    placement: "top",
    spotlightPadding: 8,
  },
];

function getRect(selector: string): DOMRect | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  return el.getBoundingClientRect();
}

export default function WorkbenchTour() {
  const { onboardingDone, markOnboardingDone } = useWorkbench();
  const [active,    setActive]    = useState(false);
  const [step,      setStep]      = useState(0);
  const [rect,      setRect]      = useState<DOMRect | null>(null);
  const [tooltipPos,setTooltipPos]= useState({ top: 0, left: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);

  // Start tour automatically once for new users
  useEffect(() => {
    if (!onboardingDone) {
      const t = setTimeout(() => setActive(true), 600);
      return () => clearTimeout(t);
    }
  }, [onboardingDone]);

  // Recalculate spotlight position whenever step changes
  useEffect(() => {
    if (!active) return;
    const update = () => {
      const r = getRect(STEPS[step].target);
      setRect(r);
      if (r) {
        const pad = STEPS[step].spotlightPadding ?? 8;
        const placement = STEPS[step].placement;
        const tooltipW = 320;
        const tooltipH = 160;
        let top = 0, left = 0;

        if (placement === "bottom") {
          top  = r.bottom + pad + 10;
          left = r.left + r.width / 2 - tooltipW / 2;
        } else if (placement === "top") {
          top  = r.top - tooltipH - pad - 10;
          left = r.left + r.width / 2 - tooltipW / 2;
        } else if (placement === "right") {
          top  = r.top + r.height / 2 - tooltipH / 2;
          left = r.right + pad + 10;
        } else {
          top  = r.top + r.height / 2 - tooltipH / 2;
          left = r.left - tooltipW - pad - 10;
        }

        left = Math.max(16, left);
        top  = Math.max(16, top);
        setTooltipPos({ top, left });

        // Scroll target into view
        const el = document.querySelector(STEPS[step].target);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [active, step]);

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      finish();
    }
  };

  const prev = () => { if (step > 0) setStep(s => s - 1); };

  const finish = () => {
    setActive(false);
    markOnboardingDone();
  };

  if (!active) {
    return (
      <button
        onClick={() => { setStep(0); setActive(true); }}
        className="fixed bottom-5 right-5 z-40 bg-gray-900 hover:bg-gray-700 text-white text-xs font-medium px-4 py-2.5 rounded-full shadow-lg transition-all flex items-center gap-2"
        title="Take the workbench tour"
      >
        <span>📖</span> Tour
      </button>
    );
  }

  const pad = STEPS[step].spotlightPadding ?? 8;

  return (
    <>
      {/* Dark overlay with spotlight cut-out */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-40 pointer-events-none"
        style={{ background: "rgba(0,0,0,0.55)" }}
      >
        {rect && (
          <svg
            className="absolute inset-0 w-full h-full"
            style={{ overflow: "visible" }}
          >
            <defs>
              <mask id="spotlight-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect
                  x={rect.left - pad}
                  y={rect.top - pad}
                  width={rect.width + pad * 2}
                  height={rect.height + pad * 2}
                  rx={10}
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(0,0,0,0.55)"
              mask="url(#spotlight-mask)"
            />
          </svg>
        )}
      </div>

      {/* Spotlight ring border */}
      {rect && (
        <div
          className="fixed z-50 pointer-events-none rounded-xl ring-2 ring-blue-400 ring-offset-0 transition-all duration-300"
          style={{
            top:    rect.top  - pad,
            left:   rect.left - pad,
            width:  rect.width  + pad * 2,
            height: rect.height + pad * 2,
          }}
        />
      )}

      {/* Tooltip card — click-intercept overlay so user can click through */}
      <div
        className="fixed z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
        style={{ top: tooltipPos.top, left: tooltipPos.left }}
      >
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-1 bg-blue-500 transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <div className="p-4">
          {/* Step indicator */}
          <div className="flex items-center gap-1.5 mb-2">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-200 ${
                i === step ? "w-5 bg-blue-500" : i < step ? "w-2 bg-blue-300" : "w-2 bg-gray-200"
              }`} />
            ))}
            <span className="ml-auto text-xs text-gray-400">{step + 1} / {STEPS.length}</span>
          </div>

          <h3 className="font-bold text-gray-900 text-sm mb-1.5">{STEPS[step].title}</h3>
          <p className="text-xs text-gray-500 leading-relaxed">{STEPS[step].body}</p>

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={finish}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Skip tour
            </button>
            <div className="flex items-center gap-2">
              {step > 0 && (
                <button
                  onClick={prev}
                  className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  ← Back
                </button>
              )}
              <button
                onClick={next}
                className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg transition-colors"
              >
                {step < STEPS.length - 1 ? "Next →" : "Done ✓"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Click-blocker so user can't accidentally interact behind overlay */}
      <div className="fixed inset-0 z-39" onClick={finish} />
    </>
  );
}
