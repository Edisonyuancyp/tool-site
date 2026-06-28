"use client";
import SharpeRatioCalculator from "@/components/quant/SharpeRatioCalculator";
export interface ToolProps { variant?: string; compact?: boolean; }
export default function View({ compact }: ToolProps) {
  return <SharpeRatioCalculator compact={compact} />;
}
