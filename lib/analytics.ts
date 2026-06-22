"use client";

/**
 * GA4 event helpers for user profiling
 * All events appear in GA4 → Reports → Events
 * Custom dimensions visible in GA4 → Configure → Custom definitions
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag(...args);
  }
}

/** Fire when user opens a tool page */
export function trackToolView(params: {
  tool_slug: string;
  tool_name: string;
  tool_category: string;
}) {
  gtag("event", "tool_view", {
    tool_slug:     params.tool_slug,
    tool_name:     params.tool_name,
    tool_category: params.tool_category,
  });
}

/** Fire when user interacts with a tool (first input change) */
export function trackToolUse(params: {
  tool_slug: string;
  tool_name: string;
  tool_category: string;
}) {
  gtag("event", "tool_use", {
    tool_slug:     params.tool_slug,
    tool_name:     params.tool_name,
    tool_category: params.tool_category,
  });
}

/** Fire when user copies a result */
export function trackResultCopy(params: {
  tool_slug: string;
  tool_name: string;
}) {
  gtag("event", "result_copy", {
    tool_slug: params.tool_slug,
    tool_name: params.tool_name,
  });
}

/** Fire when user adds/removes a favorite */
export function trackFavorite(params: {
  tool_slug: string;
  action: "add" | "remove";
}) {
  gtag("event", "favorite_toggle", {
    tool_slug: params.tool_slug,
    action:    params.action,
  });
}

/** Fire when user submits a tool request */
export function trackToolRequest(params: { tool_name: string }) {
  gtag("event", "tool_request", {
    requested_tool: params.tool_name,
  });
}

/** Fire when user shares a tool */
export function trackShare(params: {
  tool_slug: string;
  method: string;
}) {
  gtag("event", "share", {
    content_type: "tool",
    item_id:      params.tool_slug,
    method:       params.method,
  });
}

/** Track time-on-tool in seconds (call on unmount or visibility change) */
export function trackEngagementTime(params: {
  tool_slug: string;
  seconds: number;
}) {
  if (params.seconds < 3) return; // ignore bounces
  gtag("event", "tool_engagement", {
    tool_slug:       params.tool_slug,
    engagement_time: Math.round(params.seconds),
  });
}
