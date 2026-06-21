"use client";
import Base64Tool from "@/components/tools/Base64Tool";
export interface ToolProps { variant?: string; }
export default function View({ variant }: ToolProps) {
  return <Base64Tool />;
}
