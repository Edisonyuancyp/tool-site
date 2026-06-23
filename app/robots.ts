import { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default: allow all
      { userAgent: "*", allow: "/" },
      // Google (including Gemini / AI Overviews)
      { userAgent: "Googlebot",       allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      // OpenAI / ChatGPT
      { userAgent: "GPTBot",          allow: "/" },
      { userAgent: "ChatGPT-User",    allow: "/" },
      { userAgent: "OAI-SearchBot",   allow: "/" },
      // Anthropic / Claude
      { userAgent: "ClaudeBot",       allow: "/" },
      { userAgent: "Claude-Web",      allow: "/" },
      { userAgent: "anthropic-ai",    allow: "/" },
      // Perplexity
      { userAgent: "PerplexityBot",   allow: "/" },
      // Meta / Llama
      { userAgent: "Meta-ExternalAgent", allow: "/" },
      { userAgent: "Meta-ExternalFetcher", allow: "/" },
      // Microsoft / Copilot
      { userAgent: "Bingbot",         allow: "/" },
      { userAgent: "msnbot",          allow: "/" },
      // Apple
      { userAgent: "Applebot",        allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },
      // You.com
      { userAgent: "YouBot",          allow: "/" },
      // Common research / archive crawlers
      { userAgent: "ia_archiver",     allow: "/" },
      { userAgent: "CCBot",           allow: "/" },
    ],
    sitemap: "https://getfastcalc.com/sitemap.xml",
  };
}
