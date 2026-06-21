"use client";
import WaterIntakeCalculator from "@/components/tools/WaterIntakeCalculator";
export interface ToolProps { variant?: string; }
export default function View({ variant }: ToolProps) {
  return <WaterIntakeCalculator />;
}
