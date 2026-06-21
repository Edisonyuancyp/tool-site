"use client";
import UnixTimestampConverter from "@/components/tools/UnixTimestampConverter";
export interface ToolProps { variant?: string; }
export default function View({ variant }: ToolProps) {
  return <UnixTimestampConverter />;
}
