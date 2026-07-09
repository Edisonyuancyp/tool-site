#!/usr/bin/env python3
"""
send_seo_todo.py
One-shot script: sends the manual SEO action checklist to Telegram.
Run it once; no bot needs to be running.

Usage:
    python scripts/seo/send_seo_todo.py
"""

import os
import sys
from pathlib import Path

import requests
from dotenv import load_dotenv


def load_env() -> None:
    env_file = Path(__file__).resolve().parent / ".env"
    if env_file.exists():
        load_dotenv(env_file, override=True)


def send(token: str, chat_id: str, text: str) -> None:
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    resp = requests.post(url, json={"chat_id": chat_id, "text": text, "parse_mode": "HTML"}, timeout=15)
    resp.raise_for_status()


def main() -> int:
    load_env()
    token = os.getenv("TG_BOT_TOKEN")
    chat_id = os.getenv("TG_CHAT_ID")
    if not token or not chat_id:
        print("❌ TG_BOT_TOKEN or TG_CHAT_ID not set in scripts/seo/.env")
        return 1

    messages = [
        (
            "📋 <b>GetFastCalc — 需要你手动操作的 SEO 任务</b>\n\n"
            "以下任务需要登录 Google 账号，无法自动化。\n"
            "建议本周内完成 P0 任务。"
        ),
        (
            "🔴 <b>P0 — 本周内完成</b>\n\n"
            "1️⃣ <b>Google Search Console → Performance</b>\n"
            "   比较「最近28天」vs「上一个28天」\n"
            "   查哪些 Query / Page 的 Impressions 或 Position 掉了\n"
            "   🔗 https://search.google.com/search-console/performance/search-analytics\n\n"
            "2️⃣ <b>GSC → Pages → Indexing</b>\n"
            "   重点看：\n"
            "   • Crawled - currently not indexed\n"
            "   • Duplicate, Google chose different canonical\n"
            "   • Soft 404\n"
            "   🔗 https://search.google.com/search-console/index\n\n"
            "3️⃣ <b>GSC → URL Inspection — 抽查以下 6 个页面</b>\n"
            "   • https://getfastcalc.com/\n"
            "   • https://getfastcalc.com/tools/calc/macro-tracker-calculator/\n"
            "   • https://getfastcalc.com/tools/calc/macro-tracker-calculator-for-beginners/\n"
            "   • https://getfastcalc.com/es/tools/macro-tracker-calculator/\n"
            "   • https://getfastcalc.com/fr/tools/macro-tracker-calculator/\n"
            "   • https://getfastcalc.com/tools/dev/\n"
            "   检查：是否 indexed / canonical 是谁 / 上次抓取时间\n\n"
            "4️⃣ <b>GSC → Sitemaps — 重新提交</b>\n"
            "   提交：https://getfastcalc.com/sitemap.xml\n"
            "   🔗 https://search.google.com/search-console/sitemaps"
        ),
        (
            "🤖 <b>已自动处理（你不需要动手）</b>\n\n"
            "✅ 每天 02:00 UTC GitHub Actions 自动运行：\n"
            "   • 周一 — 生成 AI Tools\n"
            "   • 周二 — 刷新内容页\n"
            "   • 周三 — 生成 SEO Tools\n"
            "   • 周四 — 刷新 llms.txt / 关键词\n"
            "   • 周五 — 生成 Developer Tools\n"
            "   • 周六 — 关键词 + 变体页\n"
            "   • 周日 — 维护 + 深度诊断\n\n"
            "🔧 即将自动化（等你确认后执行）：\n"
            "   • 扫描重复工具页并生成 301 列表\n"
            "   • 批量给半成品多语言页加 noindex\n"
            "   • 核心工具页补 FAQ Schema JSON-LD"
        ),
    ]

    for msg in messages:
        send(token, chat_id, msg)
        print(f"✅ Sent: {msg[:60]}…")

    print("\n✅ All messages sent to Telegram.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
