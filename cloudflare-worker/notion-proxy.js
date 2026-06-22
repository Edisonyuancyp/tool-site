/**
 * Cloudflare Worker — Telegram Bot Proxy for Tool Requests
 *
 * Environment variables to set in Cloudflare dashboard:
 *   TG_BOT_TOKEN   = 123456789:ABCDefGhIJKlmNoPQRsTUVwxyZ  (from @BotFather)
 *   TG_CHAT_ID     = your personal chat ID (get from @userinfobot)
 *   ALLOWED_ORIGIN = https://getfastcalc.com
 */

export default {
  async fetch(request, env) {
    const allowed = env.ALLOWED_ORIGIN || "https://getfastcalc.com";
    const corsHeaders = {
      "Access-Control-Allow-Origin": allowed,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

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

    const time = new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });
    const text = [
      `🔧 *New Tool Request*`,
      ``,
      `📌 *Tool:* ${tool.trim()}`,
      detail?.trim() ? `📝 *Detail:* ${detail.trim()}` : null,
      `🕐 *Time:* ${time}`,
    ].filter(Boolean).join("\n");

    const tgRes = await fetch(
      `https://api.telegram.org/bot${env.TG_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: env.TG_CHAT_ID,
          text,
          parse_mode: "Markdown",
        }),
      }
    );

    if (!tgRes.ok) {
      const err = await tgRes.text();
      console.error("Telegram API error:", err);
      return new Response("Telegram error", { status: 502, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  },
};
