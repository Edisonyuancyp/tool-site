"use client";
import OvulationCalculator from "@/components/tools/OvulationCalculator";
export interface ToolProps { variant?: string; }
export default function View({ variant }: ToolProps) {
  return <OvulationCalculator />;
}
