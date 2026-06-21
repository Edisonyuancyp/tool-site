"use client";
import CurrencyConverter from "@/components/tools/CurrencyConverter";
export interface ToolProps { variant?: string; }
export default function View({ variant }: ToolProps) {
  return <CurrencyConverter />;
}
