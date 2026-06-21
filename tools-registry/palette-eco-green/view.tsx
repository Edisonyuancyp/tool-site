"use client";
import ColorPalette from "@/components/ColorLab/ColorPalette";

export interface ToolProps { variant?: string; }

export default function PaletteEcoGreenView({ variant }: ToolProps) {
  return <ColorPalette recipeId="eco-green" />;
}
