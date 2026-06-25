"use client";
import UnitConverter from "@/components/UnitConverter";

export interface ToolProps { variant?: string; }

export default function CelsiusToFahrenheitView({ variant }: ToolProps) {
  const isReverse = variant === "f-to-c" || variant === "fahrenheit-to-celsius";
  const from = isReverse ? "f" : "c";
  const to   = isReverse ? "c" : "f";

  return (
    <div className="space-y-6">
      {variant && (
        <p className="text-sm text-blue-600 font-medium">Mode: {variant}</p>
      )}
      <UnitConverter category="temperature" defaultFrom={from} defaultTo={to} />
    </div>
  );
}
