"use client";
import IdealWeightCalculator from "@/components/tools/IdealWeightCalculator";
export interface ToolProps { variant?: string; }
export default function View({ variant }: ToolProps) {
  return <IdealWeightCalculator />;
}
