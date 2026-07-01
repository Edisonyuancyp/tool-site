import Link from "next/link";
import { BOARD_PRESETS } from "@/lib/board-presets";

export default function BoardPromo() {
  return (
    <section className="mb-10" aria-label="Ready-made tool boards">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
          Start with a ready-made board
        </h2>
        <Link
          href="/boards"
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          View all boards →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {BOARD_PRESETS.map((preset) => (
          <Link
            key={preset.id}
            href={`/boards/${preset.id}`}
            className="group flex items-start gap-3 p-4 rounded-xl border border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm transition-all"
          >
            <span className="text-2xl shrink-0">{preset.emoji}</span>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm group-hover:text-black transition-colors">
                {preset.name}
              </p>
              <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                {preset.shortDesc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
