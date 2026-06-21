"use client";
import PositionSizeCalculator from "@/components/tools/PositionSizeCalculator";
export interface ToolProps { variant?: string; }
export default function View({ variant }: ToolProps) {
  return <PositionSizeCalculator />;
}
