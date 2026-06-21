"use client";
import ColorPalette from "@/components/ColorLab/ColorPalette";

export interface ToolProps { variant?: string; }

export default function PaletteRetroFilmView({ variant }: ToolProps) {
  return <ColorPalette recipeId="retro-film" />;
}
