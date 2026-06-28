"use client";
import CryptoChartAnalyzer from "@/components/quant/CryptoChartAnalyzer";
export interface ToolProps { variant?: string; compact?: boolean; }
export default function View({ compact }: ToolProps) {
  return <CryptoChartAnalyzer compact={compact} />;
}
