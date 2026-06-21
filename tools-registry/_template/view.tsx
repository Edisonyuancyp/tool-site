"use client";
import { useState } from "react";
// import CopyButton from "@/components/CopyButton";

// Props passed from the page when a variant is active
export interface ToolProps {
  variant?: string; // e.g. "metric", "imperial", undefined = default
}

export default function YourToolView({ variant }: ToolProps) {
  const [value, setValue] = useState("");

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-400">
        Replace this with your tool UI. Variant: {variant ?? "default"}
      </p>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter value..."
        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-gray-900 focus:outline-none focus:border-gray-400"
      />
    </div>
  );
}
