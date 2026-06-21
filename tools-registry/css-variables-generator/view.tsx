"use client";
import { useState, useCallback, useId } from "react";

export interface ToolProps { variant?: string; }

// ── Types ─────────────────────────────────────────────────────────────────────

interface ColorToken {
  id: string;
  name: string;   // e.g. "primary"
  hex: string;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const INITIAL_TOKENS: Omit<ColorToken, "id">[] = [
  { name: "primary",    hex: "#6366f1" },
  { name: "secondary",  hex: "#10b981" },
  { name: "surface",    hex: "#f9fafb" },
  { name: "text",       hex: "#111827" },
  { name: "accent",     hex: "#f59e0b" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function needsWhite(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

function sanitizeName(raw: string) {
  return raw.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "") || "color";
}

function buildCssVars(tokens: ColorToken[]): string {
  const lines = tokens.map(t => `  --color-${sanitizeName(t.name)}: ${t.hex};`).join("\n");
  return `:root {\n${lines}\n}`;
}

function buildUsageExample(tokens: ColorToken[]): string {
  const first = tokens[0];
  const second = tokens[1];
  return `.button {\n  background-color: var(--color-${sanitizeName(first?.name ?? "primary")});\n  color: var(--color-${sanitizeName(second?.name ?? "secondary")});\n  border: 2px solid var(--color-${sanitizeName(first?.name ?? "primary")});\n}`;
}

function buildTailwindConfig(tokens: ColorToken[]): string {
  const colors = tokens.map(t => `      "${sanitizeName(t.name)}": "${t.hex}",`).join("\n");
  return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n${colors}\n      },\n    },\n  },\n};`;
}

function buildScssVars(tokens: ColorToken[]): string {
  return tokens.map(t => `$color-${sanitizeName(t.name)}: ${t.hex};`).join("\n");
}

// ── CopyButton ────────────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handle}
      className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-all ${
        copied ? "bg-green-50 border-green-300 text-green-700" : "bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-800"
      }`}>
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

// ── CodeBlock ─────────────────────────────────────────────────────────────────

function CodeBlock({ label, code }: { label: string; code: string }) {
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

// ── Live UI Preview ───────────────────────────────────────────────────────────

function LivePreview({ tokens }: { tokens: ColorToken[] }) {
  const get = (name: string) =>
    tokens.find(t => sanitizeName(t.name) === name)?.hex
    ?? tokens[0]?.hex ?? "#6366f1";

  const primary  = get("primary");
  const surface  = get("surface");
  const text     = get("text");
  const accent   = get("accent");
  const primaryTxt = needsWhite(primary) ? "#fff" : "#111827";
  const surfaceTxt = needsWhite(surface) ? "#fff" : text;

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden" style={{ backgroundColor: surface }}>
      {/* Navbar mock */}
      <div className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: primary }}>
        <span className="font-bold text-sm" style={{ color: primaryTxt }}>MyApp</span>
        <button className="text-xs px-3 py-1 rounded-full font-medium"
          style={{ backgroundColor: accent, color: needsWhite(accent) ? "#fff" : "#111" }}>
          Sign up
        </button>
      </div>
      {/* Body mock */}
      <div className="p-4 space-y-3">
        <p className="text-xs font-semibold" style={{ color: surfaceTxt }}>Live Preview</p>
        <p className="text-[11px]" style={{ color: surfaceTxt, opacity: 0.6 }}>
          Updates as you edit colors above.
        </p>
        <div className="flex gap-2 pt-1">
          <button className="flex-1 text-xs py-2 rounded-lg font-medium"
            style={{ backgroundColor: primary, color: primaryTxt }}>
            Primary
          </button>
          <button className="flex-1 text-xs py-2 rounded-lg font-medium border"
            style={{ borderColor: primary, color: primary, backgroundColor: "transparent" }}>
            Outline
          </button>
        </div>
        <div className="rounded-lg p-3 border text-xs" style={{ borderColor: primary + "44", color: surfaceTxt }}>
          <span className="font-semibold" style={{ color: primary }}>Card component</span>
          <br /><span style={{ opacity: 0.6 }}>Using your palette colors</span>
        </div>
      </div>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

let idCounter = 0;
function uid() { return `tok-${++idCounter}`; }

export default function CssVariablesGeneratorView() {
  const [tokens, setTokens] = useState<ColorToken[]>(
    () => INITIAL_TOKENS.map(t => ({ ...t, id: uid() }))
  );
  const [tab, setTab] = useState<"css" | "tailwind" | "scss" | "usage">("css");

  const update = useCallback((id: string, field: keyof ColorToken, value: string) => {
    setTokens(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  }, []);

  const addToken = () => setTokens(prev => [...prev, { id: uid(), name: "new-color", hex: "#a855f7" }]);
  const removeToken = (id: string) => setTokens(prev => prev.filter(t => t.id !== id));

  const cssVars      = buildCssVars(tokens);
  const tailwindConf = buildTailwindConfig(tokens);
  const scssVars     = buildScssVars(tokens);
  const usageEx      = buildUsageExample(tokens);

  const codeMap = { css: cssVars, tailwind: tailwindConf, scss: scssVars, usage: usageEx };
  const labelMap = {
    css: ":root CSS Variables",
    tailwind: "tailwind.config.js",
    scss: "SCSS Variables",
    usage: "Usage Example",
  };

  function downloadConfig() {
    const content = tab === "tailwind" ? tailwindConf : cssVars;
    const ext = tab === "tailwind" ? "js" : "css";
    const filename = tab === "tailwind" ? "tailwind.config.js" : "variables.css";
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  const tabs: { key: typeof tab; label: string }[] = [
    { key: "css",      label: ":root CSS" },
    { key: "tailwind", label: "Tailwind" },
    { key: "scss",     label: "SCSS" },
    { key: "usage",    label: "Usage" },
  ];

  return (
    <div className="space-y-6">
      {/* ── Color token editor ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">Color Tokens</h2>
          <button onClick={addToken}
            className="text-xs px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-gray-500 hover:border-gray-500 hover:text-gray-800 transition-all">
            + Add color
          </button>
        </div>

        <div className="space-y-2">
          {tokens.map((token) => (
            <div key={token.id}
              className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl bg-white hover:border-gray-200 transition-all">
              {/* Color swatch + picker */}
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer overflow-hidden"
                  style={{ backgroundColor: token.hex }}>
                  <input type="color" value={token.hex}
                    onChange={(e) => update(token.id, "hex", e.target.value)}
                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                </div>
              </div>

              {/* Variable name */}
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span className="text-xs text-gray-400 font-mono shrink-0">--color-</span>
                <input
                  type="text"
                  value={token.name}
                  onChange={(e) => update(token.id, "name", e.target.value)}
                  className="flex-1 min-w-0 border border-gray-200 rounded-lg px-2 py-1.5 text-sm font-mono text-gray-900 focus:outline-none focus:border-gray-400"
                />
              </div>

              {/* HEX value */}
              <input
                type="text"
                value={token.hex}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9a-fA-F]{0,6}$/.test(v)) update(token.id, "hex", v);
                }}
                className="w-24 border border-gray-200 rounded-lg px-2 py-1.5 text-xs font-mono text-gray-700 focus:outline-none focus:border-gray-400 uppercase"
              />

              {/* Preview badge */}
              <div className="shrink-0 px-2 py-1 rounded-full text-[10px] font-medium"
                style={{ backgroundColor: token.hex, color: needsWhite(token.hex) ? "#fff" : "#111" }}>
                {token.name}
              </div>

              {/* Remove */}
              {tokens.length > 1 && (
                <button onClick={() => removeToken(token.id)}
                  className="shrink-0 text-gray-300 hover:text-red-400 transition-colors text-lg leading-none">
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Output ── */}
      <div className="border-t border-gray-100 pt-5">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-5">
          {/* Left: code output */}
          <div className="space-y-3">
            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
              {tabs.map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    tab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>

            <CodeBlock label={labelMap[tab]} code={codeMap[tab]} />

            <button onClick={downloadConfig}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-black transition-colors">
              ↓ Download {tab === "tailwind" ? "tailwind.config.js" : "variables.css"}
            </button>
          </div>

          {/* Right: live preview */}
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
              Live Preview
            </p>
            <LivePreview tokens={tokens} />
          </div>
        </div>
      </div>
    </div>
  );
}
