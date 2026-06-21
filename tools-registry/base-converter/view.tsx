"use client";
import BaseConverter from "@/components/tools/BaseConverter";
export interface ToolProps { variant?: string; }
export default function View({ variant }: ToolProps) {
  return <BaseConverter />;
}
