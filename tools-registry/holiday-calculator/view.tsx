"use client";
import HolidayCalculator from "@/components/tools/HolidayCalculator";
export interface ToolProps { variant?: string; }
export default function View({ variant }: ToolProps) {
  return <HolidayCalculator />;
}
