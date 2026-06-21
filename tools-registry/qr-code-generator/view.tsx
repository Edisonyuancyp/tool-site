"use client";
import QrCodeGenerator from "@/components/tools/QrCodeGenerator";
export interface ToolProps { variant?: string; }
export default function View({ variant }: ToolProps) {
  return <QrCodeGenerator />;
}
