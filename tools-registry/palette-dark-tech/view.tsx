"use client";
import ColorPalette from "@/components/ColorLab/ColorPalette";

export interface ToolProps { variant?: string; }

export default function PaletteDarkTechView({ variant }: ToolProps) {
  return <ColorPalette recipeId="dark-tech" />;
}
