"use client";
import { useState } from "react";

type State = "idle" | "asking" | "submitted";

export default function AccuracyFeedback({ toolSlug }: { toolSlug: string }) {
  const [state, setState] = useState<State>("idle");
  const [vote, setVote]   = useState<"yes" | "no" | null>(null);
  const [comment, setComment] = useState("");

  function handleVote(v: "yes" | "no") {
    setVote(v);
    setState("asking");
  }

  function handleSubmit() {
    // Fire-and-forget — store in localStorage for now; replace with API later
    try {
      const key = `fb_${toolSlug}`;
      const prev = JSON.parse(localStorage.getItem(key) ?? "[]");
      prev.push({ vote, comment, ts: Date.now() });
      localStorage.setItem(key, JSON.stringify(prev));
    } catch {}
    setState("submitted");
  }

  if (state === "submitted") {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <span className="text-green-500">✓</span>
        Thanks for your feedback!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {state === "idle" && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-gray-500">Was this result accurate?</span>
          <button
            onClick={() => handleVote("yes")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:border-green-400 hover:text-green-700 hover:bg-green-50 transition-colors"
          >
            👍 Yes
          </button>
          <button
            onClick={() => handleVote("no")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:border-red-400 hover:text-red-700 hover:bg-red-50 transition-colors"
          >
            👎 No
          </button>
        </div>
      )}

      {state === "asking" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className={vote === "yes" ? "text-green-600" : "text-red-600"}>
              {vote === "yes" ? "👍 Marked as accurate" : "👎 Marked as inaccurate"}
            </span>
            <button
              onClick={() => setState("idle")}
              className="text-gray-300 hover:text-gray-500 text-xs underline"
            >
              change
            </button>
          </div>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder={
              vote === "yes"
                ? "Anything we can improve? (optional)"
                : "What was wrong? (optional — helps us fix it)"
            }
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 resize-none"
          />
          <button
            onClick={handleSubmit}
            className="px-4 py-1.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-colors"
          >
            Submit feedback
          </button>
        </div>
      )}
    </div>
  );
}
