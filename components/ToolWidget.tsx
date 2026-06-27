"use client";
import { ComponentType, memo } from "react";
import dynamic from "next/dynamic";
import type { ToolMeta } from "@/lib/tools";

interface ToolWidgetProps {
  tool: ToolMeta;
  compact?: boolean;
}

const moduleCache: Record<string, ComponentType<{ compact?: boolean }>> = {};

function loadToolComponent(slug: string) {
  if (!moduleCache[slug]) {
    moduleCache[slug] = dynamic(
      () => import(`@/tools-registry/${slug}/view`).then(m => m.default),
      {
        ssr: false,
        loading: () => (
          <div className="h-40 flex items-center justify-center text-xs text-gray-400">
            Loading {slug}…
          </div>
        ),
      }
    ) as ComponentType<{ compact?: boolean }>;
  }
  return moduleCache[slug];
}

function ToolWidget({ tool, compact }: ToolWidgetProps) {
  const Component = loadToolComponent(tool.slug);
  return <Component compact={compact} />;
}

export default memo(ToolWidget);
