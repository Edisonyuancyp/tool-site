"use client";
import ColorPalette from "@/components/ColorLab/ColorPalette";

export interface ToolProps { variant?: string; }

export default function PaletteMedicalView({ variant }: ToolProps) {
  return <ColorPalette recipeId="medical" />;
}
