# Notion Proxy — Cloudflare Worker

## Deploy steps

1. Go to https://dash.cloudflare.com → Workers & Pages → Create Worker
2. Paste the contents of `notion-proxy.js` into the editor
3. Click **Deploy**
4. Go to **Settings → Variables** → add:
   - `NOTION_TOKEN`  = your `secret_xxx...` integration token
   - `NOTION_DB_ID`  = 32-char database ID from the Notion page URL
   - `ALLOWED_ORIGIN` = `https://getfastcalc.com`
5. Copy the Worker URL (e.g. `https://notion-proxy.YOUR_NAME.workers.dev`)
6. Paste it into `.env.local` as `NEXT_PUBLIC_NOTION_PROXY_URL=https://...`
7. Rebuild and redeploy the site
