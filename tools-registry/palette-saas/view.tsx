"use client";
import ColorPalette from "@/components/ColorLab/ColorPalette";

export interface ToolProps { variant?: string; }

export default function PaletteSaasView({ variant }: ToolProps) {
  return <ColorPalette recipeId="saas" />;
}
