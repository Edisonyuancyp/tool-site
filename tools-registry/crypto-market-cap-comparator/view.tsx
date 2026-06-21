"use client";
import CryptoMarketCapComparator from "@/components/tools/CryptoMarketCapComparator";
export interface ToolProps { variant?: string; }
export default function View({ variant }: ToolProps) {
  return <CryptoMarketCapComparator />;
}
