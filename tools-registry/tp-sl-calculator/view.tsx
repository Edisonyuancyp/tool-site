"use client";
import TpSlCalculator from "@/components/tools/TpSlCalculator";
export interface ToolProps { variant?: string; }
export default function View({ variant }: ToolProps) {
  return <TpSlCalculator />;
}
