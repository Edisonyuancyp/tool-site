"use client";
import UnitConverter from "@/components/UnitConverter";

export interface ToolProps { variant?: string; }

export default function CmToInchView({ variant }: ToolProps) {
  const from = variant === "inch-to-cm" ? "inch" : "cm";
  const to   = variant === "inch-to-cm" ? "cm" : "inch";

  return (
    <div className="space-y-6">
      {variant && (
        <p className="text-sm text-blue-600 font-medium">Mode: {variant}</p>
      )}
      <UnitConverter category="length" defaultFrom={from} defaultTo={to} />
    </div>
  );
}
