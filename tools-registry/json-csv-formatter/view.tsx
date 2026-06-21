"use client";
import JsonCsvFormatter from "@/components/tools/JsonCsvFormatter";
export interface ToolProps { variant?: string; }
export default function View({ variant }: ToolProps) {
  return <JsonCsvFormatter />;
}
