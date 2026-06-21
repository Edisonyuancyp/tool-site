"use client";
import DiffChecker from "@/components/tools/DiffChecker";
export interface ToolProps { variant?: string; }
export default function View({ variant }: ToolProps) {
  return <DiffChecker />;
}
