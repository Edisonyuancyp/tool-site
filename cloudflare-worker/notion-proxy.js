/**
 * Cloudflare Worker — Notion Tool Request Proxy
 * 
 * Environment variables to set in Cloudflare dashboard:
 *   NOTION_TOKEN    = secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 *   NOTION_DB_ID    = xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  (32-char database ID)
 *   ALLOWED_ORIGIN  = https://getfastcalc.com
 */

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = env.ALLOWED_ORIGIN || "https://getfastcalc.com";

    const corsHeaders = {
      "Access-Control-Allow-Origin": allowed,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response("Invalid JSON", { status: 400, headers: corsHeaders });
    }

    const { tool, detail } = body;
    if (!tool?.trim()) {
      return new Response("Missing tool field", { status: 400, headers: corsHeaders });
    }

    const notionRes = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.NOTION_TOKEN}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
      body: JSON.stringify({
        parent: { database_id: env.NOTION_DB_ID },
        properties: {
          Tool: {
            title: [{ text: { content: tool.trim() } }],
          },
          Detail: {
            rich_text: [{ text: { content: (detail || "").trim() } }],
          },
          Time: {
            date: { start: new Date().toISOString() },
          },
          Status: {
            select: { name: "New" },
          },
        },
      }),
    });

    if (!notionRes.ok) {
      const err = await notionRes.text();
      console.error("Notion API error:", err);
      return new Response("Notion API error", { status: 502, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  },
};
