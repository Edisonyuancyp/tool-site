"use client";
import { useState, useCallback } from "react";
import { useWorkbench } from "@/lib/WorkbenchContext";
import { hexToCmyk, hexToRgb, needsWhiteText, cmykToString, rgbToString } from "./colorUtils";
import recipes from "./palette-recipes.json";
import CodePanel from "./CodePanel";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ColorEntry {
  role: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
  cmyk: { c: number; m: number; y: number; k: number };
  pantone_approx: string;
  tailwind_class: string;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  colors: ColorEntry[];
}

type CopiedField = "hex" | "rgb" | "cmyk" | "tailwind" | "pantone";

// ── Utilities ─────────────────────────────────────────────────────────────────

function copyText(text: string) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}
function fallbackCopy(text: string) {
  const el = document.createElement("textarea");
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function CopyIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

// ── CopyRow — single labeled param row with copy button ───────────────────────

function CopyRow({
  label, value, field, copiedField, onCopy, mono = true, muted = false,
}: {
  label: string; value: string; field: CopiedField;
  copiedField: CopiedField | null; onCopy: (f: CopiedField, v: string) => void;
  mono?: boolean; muted?: boolean;
}) {
  const copied = copiedField === field;
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-gray-100 last:border-0">
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-medium leading-none mb-0.5">{label}</p>
        <p className={`text-sm font-semibold truncate ${muted ? "text-gray-400" : "text-gray-900"} ${mono ? "font-mono" : ""}`}>
          {value}
        </p>
      </div>
      <button
        onClick={() => onCopy(field, value)}
        className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg border font-medium transition-all ${
          copied
            ? "bg-green-50 border-green-300 text-green-700"
            : "bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-800 hover:bg-gray-50"
        }`}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
        {copied ? "Copied" : "Copy"}
      </button>
    </div>
  );
}

// ── ColorDetailPanel — right-side Photoshop-style inspector ───────────────────

function ColorDetailPanel({
  color, onClose,
}: {
  color: ColorEntry; onClose: () => void;
}) {
  const [copiedField, setCopiedField] = useState<CopiedField | null>(null);
  const white = needsWhiteText(color.hex);
  const cmyk = hexToCmyk(color.hex);
  const rgb = hexToRgb(color.hex);

  const handleCopy = useCallback((field: CopiedField, value: string) => {
    copyText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const hexVal = color.hex.toUpperCase();
  const rgbVal = rgbToString(rgb);
  const cmykVal = `C${cmyk.c}  M${cmyk.m}  Y${cmyk.y}  K${cmyk.k}`;
  const pantoneVal = `~${color.pantone_approx}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden flex flex-col">
      {/* Large color preview */}
      <div
        className="relative flex items-end p-5"
        style={{ backgroundColor: color.hex, minHeight: 140 }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center transition-colors"
          title="Close"
        >
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div>
          <p className={`text-[10px] uppercase tracking-widest font-semibold mb-1 ${white ? "text-white/60" : "text-black/40"}`}>
            {color.role}
          </p>
          <p className={`font-mono text-2xl font-bold tracking-tight ${white ? "text-white" : "text-gray-900"}`}>
            {hexVal}
          </p>
        </div>
      </div>

      {/* Params */}
      <div className="p-4 space-y-0 flex-1">
        <CopyRow label="HEX" value={hexVal} field="hex" copiedField={copiedField} onCopy={handleCopy} />
        <CopyRow label="RGB" value={rgbVal} field="rgb" copiedField={copiedField} onCopy={handleCopy} />
        <CopyRow label="CMYK" value={cmykVal} field="cmyk" copiedField={copiedField} onCopy={handleCopy} />
        <CopyRow label="Tailwind CSS" value={color.tailwind_class} field="tailwind" copiedField={copiedField} onCopy={handleCopy} mono />
        <CopyRow
          label="Pantone (est.)"
          value={pantoneVal}
          field="pantone"
          copiedField={copiedField}
          onCopy={handleCopy}
          muted
        />
      </div>

      {/* Pantone disclaimer */}
      <div className="px-4 pb-4">
        <p className="text-[10px] text-gray-400 leading-relaxed">
          ⚠️ Pantone ref is a visual estimate — not from official data. Verify with physical swatches.
        </p>
      </div>
    </div>
  );
}

// ── GradientStrip — clickable horizontal gradient band ────────────────────────

function GradientStrip({
  recipe, selectedHex, onSelect,
}: {
  recipe: Recipe; selectedHex: string | null; onSelect: (c: ColorEntry) => void;
}) {
  const colors = recipe.colors;
  // Build CSS gradient stops
  const stops = colors.map((c, i) => {
    const pct = Math.round((i / (colors.length - 1)) * 100);
    return `${c.hex} ${pct}%`;
  }).join(", ");
  const gradient = `linear-gradient(to right, ${stops})`;

  return (
    <div className="relative mb-3">
      {/* Gradient bar */}
      <div
        className="w-full rounded-xl overflow-hidden"
        style={{ height: 64, background: gradient, cursor: "crosshair" }}
      >
        {/* Invisible click zones per color segment */}
        <div className="flex h-full">
          {colors.map((color) => (
            <button
              key={color.hex}
              onClick={() => onSelect(color)}
              title={`${color.role} — ${color.hex}`}
              className="flex-1 h-full focus:outline-none"
              style={{ cursor: "crosshair" }}
            />
          ))}
        </div>
      </div>

      {/* Swatch dots with selection ring */}
      <div className="flex gap-2 mt-3">
        {colors.map((color) => {
          const isSelected = selectedHex === color.hex;
          return (
            <button
              key={color.hex}
              onClick={() => onSelect(color)}
              title={`${color.role} · ${color.hex}`}
              className="group flex flex-col items-center gap-1.5 focus:outline-none"
              style={{ flex: 1 }}
            >
              <div
                className="w-full rounded-lg transition-all duration-150"
                style={{
                  height: 44,
                  backgroundColor: color.hex,
                  boxShadow: isSelected
                    ? `0 0 0 3px #fff, 0 0 0 5px ${color.hex}, 0 4px 12px ${color.hex}88`
                    : "0 1px 3px rgba(0,0,0,0.15)",
                  transform: isSelected ? "translateY(-3px) scale(1.04)" : "none",
                }}
              />
              <span className="font-mono text-[9px] text-gray-400 group-hover:text-gray-700 transition-colors truncate w-full text-center">
                {color.hex.toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── PaletteSection ────────────────────────────────────────────────────────────

function PaletteSection({
  recipe, selectedColor, onSelect,
}: {
  recipe: Recipe;
  selectedColor: ColorEntry | null;
  onSelect: (c: ColorEntry | null, recipeId: string) => void;
}) {
  const isAnySelected = selectedColor !== null;
  const { savePalette } = useWorkbench();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    savePalette({
      name: recipe.name,
      colors: recipe.colors.map(c => ({ role: c.role, hex: c.hex })),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <section className="mb-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{recipe.name}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{recipe.description}</p>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <button
            onClick={handleSave}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all ${
              saved
                ? "bg-green-50 border-green-300 text-green-700"
                : "bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-800"
            }`}
          >
            {saved ? "✓ Saved" : "♡ Save palette"}
          </button>
          <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded-full font-medium">
            {recipe.colors.length} colors
          </span>
        </div>
      </div>

      <div className={`grid gap-4 ${isAnySelected ? "grid-cols-1 lg:grid-cols-[1fr_280px]" : "grid-cols-1"}`}>
        {/* Left: gradient strip + swatches */}
        <GradientStrip
          recipe={recipe}
          selectedHex={selectedColor?.hex ?? null}
          onSelect={(c) => onSelect(c, recipe.id)}
        />

        {/* Right: detail panel (only when a color is selected) */}
        {selectedColor && (
          <ColorDetailPanel
            color={selectedColor}
            onClose={() => onSelect(null, recipe.id)}
          />
        )}
      </div>

      {/* Code Panel — live code output for this palette */}
      <CodePanel recipe={recipe} activeColor={selectedColor} />
    </section>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

interface Props {
  /** When set, only render this single palette (for per-recipe static pages) */
  recipeId?: string;
}

export default function ColorPalette({ recipeId }: Props) {
  const [selections, setSelections] = useState<Record<string, ColorEntry | null>>({});
  const { savedPalettes, deletePalette } = useWorkbench();

  const displayRecipes = recipeId
    ? (recipes as Recipe[]).filter((r) => r.id === recipeId)
    : (recipes as Recipe[]);

  const handleSelect = useCallback((color: ColorEntry | null, rid: string) => {
    setSelections((prev) => ({ ...prev, [rid]: color }));
  }, []);

  return (
    <div className="space-y-2">
      {/* Saved palettes strip */}
      {savedPalettes.length > 0 && (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 mb-2">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Your Saved Palettes</p>
          <div className="flex flex-wrap gap-2">
            {savedPalettes.map((p) => (
              <div key={p.id} className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Mini color strip */}
                <div className="flex h-6">
                  {p.colors.slice(0, 5).map((c, i) => (
                    <div key={i} className="w-4 h-6" style={{ backgroundColor: c.hex }} />
                  ))}
                </div>
                <span className="px-2 text-xs text-gray-700 font-medium">{p.name}</span>
                <button
                  onClick={() => deletePalette(p.id)}
                  className="px-1.5 text-gray-300 hover:text-red-500 transition-colors text-sm border-l border-gray-100 h-full"
                  aria-label="Remove saved palette"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instruction hint */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
        </svg>
        Click any color swatch or gradient strip to inspect HEX, RGB, CMYK, Tailwind and Pantone values
      </div>

      {displayRecipes.map((recipe) => (
        <PaletteSection
          key={recipe.id}
          recipe={recipe}
          selectedColor={selections[recipe.id] ?? null}
          onSelect={handleSelect}
        />
      ))}

      {/* Print disclaimer at bottom */}
      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 mt-6">
        <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <p>
          <strong>Pantone references are visual estimates only</strong> — not derived from Pantone's proprietary database.
          CMYK values use the standard device-independent formula. Always verify against a physical{" "}
          <em>Pantone Formula Guide</em> before production use.
        </p>
      </div>
    </div>
  );
}
