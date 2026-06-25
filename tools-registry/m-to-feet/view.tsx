"use client";
import UnitConverter from "@/components/UnitConverter";

export interface ToolProps { variant?: string; }

export default function MToFeetView({ variant }: ToolProps) {
  const isReverse = variant === "ft-to-m" || variant === "feet-to-meters";
  const from = isReverse ? "ft" : "m";
  const to   = isReverse ? "m" : "ft";

  return (
    <div className="space-y-6">
      {variant && (
        <p className="text-sm text-blue-600 font-medium">Mode: {variant}</p>
      )}
      <UnitConverter category="length" defaultFrom={from} defaultTo={to} />
    </div>
  );
}
