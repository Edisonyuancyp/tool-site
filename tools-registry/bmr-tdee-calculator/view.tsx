"use client";
import BmrTdeeCalculator from "@/components/tools/BmrTdeeCalculator";
export interface ToolProps { variant?: string; }
export default function View({ variant }: ToolProps) {
  return <BmrTdeeCalculator />;
}
