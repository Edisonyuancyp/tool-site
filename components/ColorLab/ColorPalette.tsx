"use client";
import { useState } from "react";
import { hexToCmyk, hexToRgb, needsWhiteText, cmykToString, rgbToString } from "./colorUtils";
import recipes from "./palette-recipes.json";

type Mode = "web" | "print";

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

interface CopiedState {
  paletteId: string;
  colorHex: string;
  field: "hex" | "tailwind" | "cmyk" | "rgb";
}

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

interface ColorSwatchProps {
  color: ColorEntry;
  mode: Mode;
  paletteId: string;
  copied: CopiedState | null;
  onCopy: (state: CopiedState) => void;
}

function ColorSwatch({ color, mode, paletteId, copied, onCopy }: ColorSwatchProps) {
  const white = needsWhiteText(color.hex);
  const textClass = white ? "text-white" : "text-gray-900";
  const mutedClass = white ? "text-white/70" : "text-gray-600";
  const borderClass = white ? "border-white/20" : "border-black/10";

  const isCopied = (field: CopiedState["field"]) =>
    copied?.paletteId === paletteId && copied.colorHex === color.hex && copied.field === field;

  function handleCopy(field: CopiedState["field"], value: string) {
    copyText(value);
    onCopy({ paletteId, colorHex: color.hex, field });
  }

  const cmyk = hexToCmyk(color.hex);
  const rgb = hexToRgb(color.hex);

  return (
    <div
      className="rounded-xl overflow-hidden border border-gray-100 shadow-sm flex flex-col"
      style={{ backgroundColor: color.hex }}
    >
      {/* Swatch body */}
      <div className="h-24 sm:h-28 flex items-end p-3">
        <span className={`text-xs font-semibold uppercase tracking-widest ${mutedClass}`}>
          {color.role}
        </span>
      </div>

      {/* Info panel */}
      <div className={`bg-white/90 backdrop-blur-sm p-3 space-y-2 border-t ${borderClass}`}>
        {mode === "web" ? (
          <>
            {/* HEX row */}
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm font-semibold text-gray-900">{color.hex.toUpperCase()}</span>
              <button
                onClick={() => handleCopy("hex", color.hex.toUpperCase())}
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border transition-all ${
                  isCopied("hex")
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-800"
                }`}
              >
                {isCopied("hex") ? <CheckIcon /> : <CopyIcon />}
                {isCopied("hex") ? "Copied" : "HEX"}
              </button>
            </div>
            {/* Tailwind row */}
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-gray-500">{color.tailwind_class}</span>
              <button
                onClick={() => handleCopy("tailwind", color.tailwind_class)}
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border transition-all ${
                  isCopied("tailwind")
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-800"
                }`}
              >
                {isCopied("tailwind") ? <CheckIcon /> : <CopyIcon />}
                {isCopied("tailwind") ? "Copied" : "TW"}
              </button>
            </div>
            {/* RGB row */}
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-gray-400">{rgbToString(rgb)}</span>
              <button
                onClick={() => handleCopy("rgb", rgbToString(rgb))}
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border transition-all ${
                  isCopied("rgb")
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-800"
                }`}
              >
                {isCopied("rgb") ? <CheckIcon /> : <CopyIcon />}
                {isCopied("rgb") ? "Copied" : "RGB"}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* CMYK row */}
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-semibold text-gray-900">{cmykToString(cmyk)}</span>
              <button
                onClick={() => handleCopy("cmyk", cmykToString(cmyk))}
                className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border transition-all ${
                  isCopied("cmyk")
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-800"
                }`}
              >
                {isCopied("cmyk") ? <CheckIcon /> : <CopyIcon />}
                {isCopied("cmyk") ? "Copied" : "CMYK"}
              </button>
            </div>
            {/* Pantone row */}
            <div className="flex items-center justify-between gap-2">
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium"
                style={{ backgroundColor: color.hex, color: white ? "#fff" : "#111" }}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border border-white/30 flex-shrink-0"
                  style={{ backgroundColor: color.hex }}
                />
                {color.pantone_approx}
              </span>
              <span className="text-xs text-gray-400 italic">approx.</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface PaletteCardProps {
  recipe: Recipe;
  mode: Mode;
  copied: CopiedState | null;
  onCopy: (state: CopiedState) => void;
}

function PaletteCard({ recipe, mode, copied, onCopy }: PaletteCardProps) {
  return (
    <section className="mb-12">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">{recipe.name}</h2>
        <p className="text-sm text-gray-500 mt-1">{recipe.description}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {recipe.colors.map((color) => (
          <ColorSwatch
            key={color.hex}
            color={color}
            mode={mode}
            paletteId={recipe.id}
            copied={copied}
            onCopy={onCopy}
          />
        ))}
      </div>
    </section>
  );
}

interface Props {
  /** When set, only render this single palette (for per-recipe static pages) */
  recipeId?: string;
}

export default function ColorPalette({ recipeId }: Props) {
  const [mode, setMode] = useState<Mode>("web");
  const [copied, setCopied] = useState<CopiedState | null>(null);

  const displayRecipes = recipeId
    ? (recipes as Recipe[]).filter((r) => r.id === recipeId)
    : (recipes as Recipe[]);

  function handleCopy(state: CopiedState) {
    setCopied(state);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg w-fit">
        <button
          onClick={() => setMode("web")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            mode === "web"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          🌐 Web Design
          <span className="ml-1.5 text-xs text-gray-400">HEX / Tailwind</span>
        </button>
        <button
          onClick={() => setMode("print")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            mode === "print"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-800"
          }`}
        >
          🖨️ Print
          <span className="ml-1.5 text-xs text-gray-400">CMYK / Pantone</span>
        </button>
      </div>

      {/* Print mode disclaimer */}
      {mode === "print" && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <p>
            <strong>Pantone colors are approximations for preview; refer to physical swatches for exact matching.</strong>{" "}
            CMYK values are device-independent conversions and may vary by printer profile and paper stock.
          </p>
        </div>
      )}

      {/* Palette list */}
      {displayRecipes.map((recipe) => (
        <PaletteCard
          key={recipe.id}
          recipe={recipe}
          mode={mode}
          copied={copied}
          onCopy={handleCopy}
        />
      ))}
    </div>
  );
}
