"use client";
import RandomNumberGenerator from "@/components/tools/RandomNumberGenerator";
export interface ToolProps { variant?: string; }
export default function View({ variant }: ToolProps) {
  return <RandomNumberGenerator />;
}
