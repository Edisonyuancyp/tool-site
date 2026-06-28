"use client";
import KellyCriterionCalculator from "@/components/quant/KellyCriterionCalculator";
export interface ToolProps { variant?: string; compact?: boolean; }
export default function View({ compact }: ToolProps) {
  return <KellyCriterionCalculator compact={compact} />;
}
