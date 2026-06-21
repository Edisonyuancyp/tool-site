"use client";
import AgeCalculator from "@/components/tools/AgeCalculator";
export interface ToolProps { variant?: string; }
export default function View({ variant }: ToolProps) {
  return <AgeCalculator />;
}
