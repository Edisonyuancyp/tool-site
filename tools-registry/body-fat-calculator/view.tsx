"use client";
import BodyFatCalculator from "@/components/tools/BodyFatCalculator";
export interface ToolProps { variant?: string; }
export default function View({ variant }: ToolProps) {
  return <BodyFatCalculator />;
}
