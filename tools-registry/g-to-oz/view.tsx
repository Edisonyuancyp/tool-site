"use client";
import UnitConverter from "@/components/UnitConverter";

export interface ToolProps { variant?: string; }

export default function GToOzView({ variant }: ToolProps) {
  const isReverse = variant === "oz-to-g" || variant === "oz-to-grams";
  const from = isReverse ? "oz" : "g";
  const to   = isReverse ? "g" : "oz";

  return (
    <div className="space-y-6">
      {variant && (
        <p className="text-sm text-blue-600 font-medium">Mode: {variant}</p>
      )}
      <UnitConverter category="weight" defaultFrom={from} defaultTo={to} />
    </div>
  );
}
