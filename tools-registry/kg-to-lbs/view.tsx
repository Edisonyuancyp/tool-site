"use client";
import UnitConverter from "@/components/UnitConverter";

export interface ToolProps { variant?: string; }

export default function KgToLbsView({ variant }: ToolProps) {
  const isReverse = variant === "lbs-to-kg";
  const from = isReverse ? "lb" : "kg";
  const to   = isReverse ? "kg" : "lb";

  return (
    <div className="space-y-6">
      {variant && (
        <p className="text-sm text-blue-600 font-medium">Mode: {variant}</p>
      )}
      <UnitConverter category="weight" defaultFrom={from} defaultTo={to} />
    </div>
  );
}
