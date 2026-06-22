# Telegram Bot Proxy — Cloudflare Worker

## Setup (one-time, ~5 min)

### 1. Create Telegram Bot
- Open Telegram → search **@BotFather** → send `/newbot`
- Choose a name and username → copy the **Bot Token** (`123456789:ABCxxx`)

### 2. Get your Chat ID
- Search **@userinfobot** on Telegram → send any message → copy your **Id** number

### 3. Deploy Cloudflare Worker
- Go to https://dash.cloudflare.com → **Workers & Pages** → **Create Worker**
- Paste contents of `notion-proxy.js` → **Deploy**
- Go to **Settings → Variables** → add:
  - `TG_BOT_TOKEN`   = Bot Token from BotFather
  - `TG_CHAT_ID`     = your numeric Chat ID
  - `ALLOWED_ORIGIN` = `https://getfastcalc.com`
- Copy the Worker URL (e.g. `https://tg-proxy.YOUR_NAME.workers.dev`)

### 4. Start the bot
- Open Telegram → search your bot by username → send `/start`
  (required so the bot can message you)

### 5. Connect to site
- Paste Worker URL into `.env.local`:
  `NEXT_PUBLIC_NOTION_PROXY_URL=https://tg-proxy.YOUR_NAME.workers.dev`
- Cloudflare Pages: add the env var in Pages → Settings → Environment variables
- Redeploy
