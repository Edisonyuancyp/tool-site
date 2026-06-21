"use client";
import { useState, useMemo } from "react";
import { emojiCategories } from "@/lib/emojis";

function copyToClipboard(text: string) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.left = "-9999px";
    el.style.top = "-9999px";
    document.body.appendChild(el);
    el.focus();
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  } catch {
    /* ignore */
  }
}

const ALL_CAT = "All";
const RECENT_CAT = "__recent__";

export default function EmojiPicker() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(ALL_CAT);
  const [copied, setCopied] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>([]);

  const handleCopy = (emoji: string) => {
    copyToClipboard(emoji);
    setCopied(emoji);
    setTimeout(() => setCopied(null), 1500);
    setRecent((prev) => [emoji, ...prev.filter((e) => e !== emoji)].slice(0, 40));
  };

  // Sections to render
  const sections = useMemo(() => {
    const q = search.trim().toLowerCase();

    if (q) {
      // Search: filter each category's emojis by category name match
      const matched = emojiCategories
        .filter((c) => c.name.toLowerCase().includes(q))
        .map((c) => ({ name: c.name, icon: c.icon, emojis: c.emojis }));
      // If no category name match, show all emojis in one "Results" section
      if (matched.length === 0) {
        const all = emojiCategories.flatMap((c) => c.emojis);
        return [{ name: "Results", icon: "🔍", emojis: all }];
      }
      return matched;
    }

    if (activeCategory === RECENT_CAT) {
      return [{ name: "Recently Used", icon: "🕐", emojis: recent }];
    }

    if (activeCategory === ALL_CAT) {
      return emojiCategories.map((c) => ({ name: c.name, icon: c.icon, emojis: c.emojis }));
    }

    const cat = emojiCategories.find((c) => c.name === activeCategory);
    return cat ? [{ name: cat.name, icon: cat.icon, emojis: cat.emojis }] : [];
  }, [search, activeCategory, recent]);

  const tabs = [
    ...(recent.length > 0 ? [{ id: RECENT_CAT, icon: "🕐", label: "Recent" }] : []),
    { id: ALL_CAT, icon: "✨", label: "All" },
    ...emojiCategories.map((c) => ({ id: c.name, icon: c.icon, label: c.name })),
  ];

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search category (e.g. food, animals, flags…)"
          className="w-full border border-gray-200 rounded-lg pl-10 pr-10 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 text-sm"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Category tabs */}
      {!search && (
        <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap shrink-0 border transition-all ${
                activeCategory === tab.id
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900"
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Copied toast */}
      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity duration-200 ${
        copied
          ? "bg-green-50 border border-green-200 text-green-700 opacity-100"
          : "opacity-0 pointer-events-none bg-green-50 border border-green-200 text-green-700"
      }`}>
        <span className="text-base">{copied ?? "✅"}</span>
        Copied!
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.name}>
            {/* Section header */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-base">{section.icon}</span>
              <h3 className="text-sm font-semibold text-gray-700">{section.name}</h3>
              <span className="text-xs text-gray-400">({section.emojis.length})</span>
              <div className="flex-1 h-px bg-gray-100 ml-1" />
            </div>
            {/* Emoji grid — fixed columns, clean rows */}
            <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-14 gap-0.5">
              {section.emojis.map((emoji, i) => (
                <button
                  key={`${section.name}-${i}`}
                  type="button"
                  onClick={() => handleCopy(emoji)}
                  title={`Copy ${emoji}`}
                  className={`aspect-square flex items-center justify-center text-xl sm:text-2xl rounded-lg transition-all duration-100 hover:scale-125 active:scale-95 ${
                    copied === emoji
                      ? "bg-green-100 scale-125"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center pt-2">
        Click any emoji to copy · {sections.reduce((acc, s) => acc + s.emojis.length, 0)} emojis
      </p>
    </div>
  );
}
