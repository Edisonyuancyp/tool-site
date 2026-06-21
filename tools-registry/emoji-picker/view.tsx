"use client";
import EmojiPicker from "@/components/tools/EmojiPicker";
export interface ToolProps { variant?: string; }
export default function View({ variant }: ToolProps) {
  return <EmojiPicker />;
}
