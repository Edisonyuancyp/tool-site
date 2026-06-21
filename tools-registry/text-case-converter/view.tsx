"use client";
import TextCaseConverter from "@/components/tools/TextCaseConverter";
export interface ToolProps { variant?: string; }
export default function View({ variant }: ToolProps) {
  return <TextCaseConverter />;
}
