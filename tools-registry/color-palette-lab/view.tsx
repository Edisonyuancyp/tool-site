"use client";
import ColorPalette from "@/components/ColorLab/ColorPalette";

export interface ToolProps {
  variant?: string;
}

export default function ColorPaletteLabView({ variant }: ToolProps) {
  return <ColorPalette recipeId={variant} />;
}
