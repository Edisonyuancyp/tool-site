"use client";
import Link from "next/link";
import type { ToolMeta } from "@/lib/tools";
import { getToolPath } from "@/lib/tools";
import type { BoardWidgetSize } from "@/lib/WorkbenchContext";
import ToolWidget from "@/components/ToolWidget";

const DEFAULT_HEIGHT: Record<BoardWidgetSize, number> = {
  small: 296,
  medium: 400,
  large: 516,
};

function sizeClasses(size: BoardWidgetSize): string {
  switch (size) {
    case "small":
      return "col-span-1";
    case "medium":
      return "col-span-1 md:col-span-2";
    case "large":
      return "col-span-1 md:col-span-2 lg:col-span-3";
    default:
      return "col-span-1 md:col-span-2";
  }
}

interface PresetBoardProps {
  slugs: string[];
  sizes: BoardWidgetSize[];
  allTools: ToolMeta[];
}

export default function PresetBoard({ slugs, sizes, allTools }: PresetBoardProps) {
  const toolBySlug = (slug: string) => allTools.find((t) => t.slug === slug);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {slugs.map((slug, index) => {
        const tool = toolBySlug(slug);
        if (!tool) return null;
        const size = sizes[index] ?? "medium";
        return (
          <div
            key={slug}
            className={`${sizeClasses(size)} bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col hover:border-blue-300 transition-all`}
            style={{ height: DEFAULT_HEIGHT[size] }}
          >
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm">{tool.icon}</span>
                <Link
                  href={getToolPath(tool)}
                  className="text-xs font-semibold text-gray-700 hover:text-blue-700 truncate"
                >
                  {tool.name}
                </Link>
              </div>
            </div>
            <div className="flex-1 p-3 overflow-auto min-h-0">
              <ToolWidget tool={tool} compact />
            </div>
          </div>
        );
      })}
    </div>
  );
}
