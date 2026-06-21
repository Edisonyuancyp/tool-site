"use client";
import { useState, useCallback } from "react";
import { needsWhiteText } from "./colorUtils";

// ── Types (shared with ColorPalette) ─────────────────────────────────────────

export interface ColorEntry {
  role: string;
  hex: string;
  tailwind_class: string;
}

export interface Recipe {
  id: string;
  name: string;
  colors: ColorEntry[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function copyText(text: string) {
  navigator.clipboard?.writeText(text).catch(() => {
    const el = document.createElement("textarea");
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  });
}

function roleToCssVar(role: string) {
  return "--color-" + role.toLowerCase().replace(/\s+/g, "-");
}

function roleToTwKey(role: string) {
  return role.toLowerCase().replace(/\s+/g, "_");
}

// Generate tailwind.config.js snippet for the whole palette
function buildTailwindConfig(recipe: Recipe): string {
  const colors = recipe.colors
    .map((c) => `      "${roleToTwKey(c.role)}": "${c.hex}",`)
    .join("\n");
  return `// tailwind.config.js — ${recipe.name}
module.exports = {
  theme: {
    extend: {
      colors: {
${colors}
      },
    },
  },
};`;
}

// Generate :root CSS vars block
function buildCssVars(recipe: Recipe): string {
  const vars = recipe.colors
    .map((c) => `  ${roleToCssVar(c.role)}: ${c.hex};`)
    .join("\n");
  return `:root {\n${vars}\n}`;
}

// Generate Tailwind HTML usage snippet for a single color
function buildHtmlSnippet(color: ColorEntry): string {
  const tw = color.tailwind_class;        // e.g. "bg-indigo-500"
  const textTw = needsWhiteText(color.hex) ? "text-white" : "text-gray-900";
  const borderTw = tw.replace(/^bg-/, "border-");
  return `<div class="${tw} ${textTw} p-4 rounded-lg">
  ${color.role}
</div>

<!-- Button variant -->
<button class="${tw} ${textTw} px-4 py-2 rounded-lg font-medium hover:opacity-90">
  Click me
</button>

<!-- Border variant -->
<div class="border-2 ${borderTw} p-4 rounded-lg">
  Outlined box
</div>`;
}

// ── CopyButton ────────────────────────────────────────────────────────────────

function CopyBtn({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const handle = useCallback(() => {
    copyText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);
  return (
    <button
      onClick={handle}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
        copied
          ? "bg-green-50 border-green-300 text-green-700"
          : "bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-800"
      }`}
    >
      {copied ? "✓ Copied" : label}
    </button>
  );
}

// ── CodeBlock ─────────────────────────────────────────────────────────────────

function CodeBlock({ code, lang, label }: { code: string; lang: string; label: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{label}</span>
        <CopyBtn text={code} />
      </div>
      <code className="block bg-gray-950 text-gray-100 rounded-xl p-4 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre">
        {code}
      </code>
    </div>
  );
}

// ── UIPreview — live mock component driven by selected palette ────────────────

function UIPreview({ recipe, activeColor }: { recipe: Recipe; activeColor: ColorEntry | null }) {
  // Find roles from the palette (fall back to first color if role not found)
  const get = (role: string) =>
    recipe.colors.find((c) => c.role.toLowerCase().includes(role.toLowerCase()))?.hex
    ?? recipe.colors[0]?.hex ?? "#6366f1";

  const primary   = activeColor?.hex ?? get("primary");
  const surface   = get("surface") || get("background") || get("paper") || "#f9fafb";
  const textColor = get("text") || get("muted text") || get("shadow") || "#111827";
  const accent    = get("accent") || get("neon") || get("leaf") || primary;

  const primaryText = needsWhiteText(primary) ? "#fff" : "#111827";
  const surfaceText = needsWhiteText(surface) ? "#fff" : textColor;

  return (
    <div
      className="rounded-xl border border-gray-200 overflow-hidden shadow-sm"
      style={{ backgroundColor: surface }}
    >
      {/* Mock header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: primary }}
      >
        <span className="font-bold text-sm" style={{ color: primaryText }}>
          {recipe.name}
        </span>
        <button
          className="text-xs px-3 py-1 rounded-full font-medium"
          style={{ backgroundColor: accent, color: needsWhiteText(accent) ? "#fff" : "#111827" }}
        >
          Get started
        </button>
      </div>

      {/* Mock body */}
      <div className="p-4 space-y-3">
        <p className="text-xs font-semibold" style={{ color: surfaceText }}>
          Live UI Preview
        </p>
        <p className="text-[11px] leading-relaxed" style={{ color: surfaceText, opacity: 0.65 }}>
          This preview updates as you click color swatches above.
        </p>

        {/* Mock card */}
        <div
          className="rounded-lg p-3 border"
          style={{
            backgroundColor: surface,
            borderColor: primary + "44",
          }}
        >
          <div
            className="text-xs font-semibold mb-1"
            style={{ color: primary }}
          >
            {activeColor?.role ?? "Primary Color"}
          </div>
          <div
            className="font-mono text-xs"
            style={{ color: surfaceText, opacity: 0.7 }}
          >
            {activeColor?.hex ?? recipe.colors[0]?.hex}
          </div>
        </div>

        {/* Mock button row */}
        <div className="flex gap-2 pt-1">
          <button
            className="flex-1 text-xs py-2 rounded-lg font-medium"
            style={{ backgroundColor: primary, color: primaryText }}
          >
            Primary
          </button>
          <button
            className="flex-1 text-xs py-2 rounded-lg font-medium border"
            style={{
              backgroundColor: "transparent",
              borderColor: primary,
              color: primary,
            }}
          >
            Outlined
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

interface Props {
  recipe: Recipe;
  activeColor: ColorEntry | null;
}

export default function CodePanel({ recipe, activeColor }: Props) {
  const [tab, setTab] = useState<"html" | "css" | "tailwind">("html");

  const tabs: { key: typeof tab; label: string }[] = [
    { key: "html", label: "Tailwind HTML" },
    { key: "css", label: "CSS Variables" },
    { key: "tailwind", label: "tailwind.config.js" },
  ];

  const displayColor = activeColor ?? recipe.colors[0];
  const htmlSnippet = displayColor ? buildHtmlSnippet(displayColor) : "";
  const cssVars = buildCssVars(recipe);
  const tailwindConfig = buildTailwindConfig(recipe);

  const code = tab === "html" ? htmlSnippet : tab === "css" ? cssVars : tailwindConfig;
  const lang = tab === "tailwind" ? "js" : tab;

  function downloadConfig() {
    const blob = new Blob([tailwindConfig], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tailwind.config.${recipe.id}.js`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="mt-6 border-t border-gray-100 pt-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-base">{"</>"}</span> Code Output
            {activeColor && (
              <span
                className="inline-block w-3.5 h-3.5 rounded-full border border-gray-200"
                style={{ backgroundColor: activeColor.hex }}
              />
            )}
            <span className="text-xs font-normal text-gray-400">
              {activeColor ? `— ${activeColor.role} selected` : "— click a swatch above"}
            </span>
          </h3>
        </div>
        <button
          onClick={downloadConfig}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-all"
        >
          ↓ Download tailwind.config.js
        </button>
      </div>

      {/* Two-column: code + preview */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4">
        {/* Left: tabs + code */}
        <div className="space-y-3">
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  tab === t.key
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <CodeBlock code={code} lang={lang} label={
            tab === "html"
              ? `${displayColor?.role ?? "Color"} · ${displayColor?.tailwind_class ?? ""}`
              : tab === "css"
              ? `:root variables for ${recipe.name}`
              : `tailwind.config.js for ${recipe.name}`
          } />
        </div>

        {/* Right: live UI preview */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
            Live Preview
          </p>
          <UIPreview recipe={recipe} activeColor={activeColor} />
        </div>
      </div>
    </div>
  );
}
