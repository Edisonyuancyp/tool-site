"use client";
import { useState, useEffect, useCallback } from "react";

export interface ToolProps { variant?: string; }

// ── 50 popular Google Fonts ───────────────────────────────────────────────────
const FONTS = [
  // Sans-serif
  "Inter", "Roboto", "Open Sans", "Lato", "Nunito", "Poppins", "Raleway",
  "Montserrat", "Source Sans 3", "Noto Sans", "Ubuntu", "Rubik", "DM Sans",
  "Outfit", "Plus Jakarta Sans", "Figtree", "Manrope", "Mulish", "Work Sans",
  // Serif
  "Merriweather", "Playfair Display", "Lora", "Crimson Text", "EB Garamond",
  "Libre Baskerville", "PT Serif", "Noto Serif", "Source Serif 4",
  "Cormorant Garamond", "Spectral",
  // Monospace
  "JetBrains Mono", "Fira Code", "Source Code Pro", "IBM Plex Mono",
  "Inconsolata", "Space Mono",
  // Display / Decorative
  "Oswald", "Bebas Neue", "Anton", "Righteous", "Lilita One",
  "Fredoka One", "Pacifico", "Lobster", "Dancing Script",
  // Slab
  "Rokkitt", "Zilla Slab", "Arvo",
];

const DEFAULT_TEXT =
  "The quick brown fox jumps over the lazy dog. 0123456789";

const WEIGHTS = ["300", "400", "500", "600", "700"];

// Load a Google Font dynamically (idempotent)
function loadGoogleFont(family: string) {
  const id = `gf-${family.replace(/\s+/g, "-")}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

// Read ?a=Inter&b=Merriweather from URL
function getUrlFonts(): [string, string] {
  if (typeof window === "undefined") return ["Inter", "Merriweather"];
  const p = new URLSearchParams(window.location.search);
  const a = FONTS.includes(p.get("a") ?? "") ? (p.get("a") as string) : "Inter";
  const b = FONTS.includes(p.get("b") ?? "") ? (p.get("b") as string) : "Merriweather";
  return [a, b];
}

// ── FontPanel ─────────────────────────────────────────────────────────────────
function FontPanel({
  label,
  font,
  onFont,
  text,
  size,
  weight,
  lineHeight,
  letterSpacing,
  color,
  bg,
}: {
  label: string;
  font: string;
  onFont: (f: string) => void;
  text: string;
  size: number;
  weight: string;
  lineHeight: number;
  letterSpacing: number;
  color: string;
  bg: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      {/* Font selector */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
          {label}
        </label>
        <select
          value={font}
          onChange={(e) => onFont(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-gray-400 bg-white"
        >
          {FONTS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      {/* Preview card */}
      <div
        className="rounded-xl border border-gray-200 p-6 min-h-[220px] flex flex-col justify-center overflow-hidden"
        style={{ backgroundColor: bg }}
      >
        <p
          style={{
            fontFamily: `"${font}", sans-serif`,
            fontSize: `${size}px`,
            fontWeight: weight,
            lineHeight: lineHeight,
            letterSpacing: `${letterSpacing}em`,
            color,
            wordBreak: "break-word",
          }}
        >
          {text}
        </p>
      </div>

      {/* Font name badge */}
      <p className="text-center text-xs text-gray-400 font-medium">{font}</p>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────
export default function TypographyCompareLabView() {
  const [mounted, setMounted] = useState(false);
  const [fontA, setFontA] = useState("Inter");
  const [fontB, setFontB] = useState("Merriweather");
  const [text, setText] = useState(DEFAULT_TEXT);
  const [size, setSize] = useState(32);
  const [weight, setWeight] = useState("400");
  const [lineHeight, setLineHeight] = useState(1.4);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [color, setColor] = useState("#111827");
  const [bg, setBg] = useState("#ffffff");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const [a, b] = getUrlFonts();
    setFontA(a);
    setFontB(b);
    setMounted(true);
  }, []);

  // Load fonts on change
  useEffect(() => { if (mounted) loadGoogleFont(fontA); }, [fontA, mounted]);
  useEffect(() => { if (mounted) loadGoogleFont(fontB); }, [fontB, mounted]);

  // Sync URL params
  useEffect(() => {
    if (!mounted) return;
    const url = new URL(window.location.href);
    url.searchParams.set("a", fontA);
    url.searchParams.set("b", fontB);
    window.history.replaceState({}, "", url.toString());
  }, [fontA, fontB, mounted]);

  const handleSetFontA = useCallback((f: string) => { loadGoogleFont(f); setFontA(f); }, []);
  const handleSetFontB = useCallback((f: string) => { loadGoogleFont(f); setFontB(f); }, []);

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const swapFonts = () => {
    setFontA(fontB);
    setFontB(fontA);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* ── Preview text + controls ── */}
      <div className="space-y-4">
        {/* Sample text */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
            Preview Text
          </label>
          <textarea
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your headline or body copy here…"
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-400 resize-none"
          />
        </div>

        {/* Controls row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Size */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Size: <span className="font-semibold text-gray-700">{size}px</span>
            </label>
            <input type="range" min={10} max={96} value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="w-full accent-gray-900" />
          </div>

          {/* Weight */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Weight</label>
            <select value={weight} onChange={(e) => setWeight(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-gray-400">
              {WEIGHTS.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>

          {/* Line height */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Line Height: <span className="font-semibold text-gray-700">{lineHeight}</span>
            </label>
            <input type="range" min={1} max={2.5} step={0.05} value={lineHeight}
              onChange={(e) => setLineHeight(Number(e.target.value))}
              className="w-full accent-gray-900" />
          </div>

          {/* Letter spacing */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Spacing: <span className="font-semibold text-gray-700">{letterSpacing}em</span>
            </label>
            <input type="range" min={-0.05} max={0.3} step={0.005} value={letterSpacing}
              onChange={(e) => setLetterSpacing(Number(e.target.value))}
              className="w-full accent-gray-900" />
          </div>
        </div>

        {/* Color row */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Text color</label>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
            <span className="text-xs font-mono text-gray-400">{color}</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Background</label>
            <input type="color" value={bg} onChange={(e) => setBg(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border border-gray-200" />
            <span className="text-xs font-mono text-gray-400">{bg}</span>
          </div>
          {/* Quick bg presets */}
          {["#ffffff", "#111827", "#f9fafb", "#fdf6e3"].map((c) => (
            <button key={c} onClick={() => setBg(c)} title={c}
              className="w-6 h-6 rounded border border-gray-200 shrink-0"
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      {/* ── Side-by-side panels ── */}
      <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FontPanel label="Font A" font={fontA} onFont={handleSetFontA}
          text={text} size={size} weight={weight} lineHeight={lineHeight}
          letterSpacing={letterSpacing} color={color} bg={bg} />

        {/* Swap button */}
        <div className="absolute left-1/2 top-8 -translate-x-1/2 z-10 hidden sm:block">
          <button onClick={swapFonts} title="Swap fonts"
            className="w-9 h-9 flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-sm hover:border-gray-400 hover:shadow transition-all text-gray-500 hover:text-gray-900">
            ⇄
          </button>
        </div>

        <FontPanel label="Font B" font={fontB} onFont={handleSetFontB}
          text={text} size={size} weight={weight} lineHeight={lineHeight}
          letterSpacing={letterSpacing} color={color} bg={bg} />
      </div>

      {/* Mobile swap */}
      <button onClick={swapFonts}
        className="sm:hidden w-full py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-gray-400 transition-colors">
        ⇄ Swap A ↔ B
      </button>

      {/* ── CSS output + share ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
        {/* CSS snippet */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">CSS Snippet (Font A)</p>
          <pre className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-xs text-gray-600 overflow-x-auto leading-relaxed">
{`@import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontA)}:wght@${weight}&display=swap');

font-family: '${fontA}', sans-serif;
font-size: ${size}px;
font-weight: ${weight};
line-height: ${lineHeight};
letter-spacing: ${letterSpacing}em;`}
          </pre>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">CSS Snippet (Font B)</p>
          <pre className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-xs text-gray-600 overflow-x-auto leading-relaxed">
{`@import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontB)}:wght@${weight}&display=swap');

font-family: '${fontB}', sans-serif;
font-size: ${size}px;
font-weight: ${weight};
line-height: ${lineHeight};
letter-spacing: ${letterSpacing}em;`}
          </pre>
        </div>
      </div>

      {/* Share */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          URL auto-updates as you select fonts — paste it to share this comparison.
        </p>
        <button onClick={copyUrl}
          className="shrink-0 px-4 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-black transition-colors">
          {copied ? "✓ Copied!" : "Copy Link"}
        </button>
      </div>
    </div>
  );
}
