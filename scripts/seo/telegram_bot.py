#!/usr/bin/env python3
"""
telegram_bot.py
Run a local Telegram bot that lets you trigger the SEO pipeline from Telegram.

Commands:
  /start     - Show the control panel with a button
  /seo       - Run the SEO pipeline immediately

The bot runs on your local machine. Keep it running to receive messages and
respond to button clicks.
"""

import os
import subprocess
import sys
import threading
from pathlib import Path

import telebot
from dotenv import load_dotenv
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton


def load_env() -> None:
    script_dir = Path(__file__).resolve().parent
    env_file = script_dir / ".env"
    if env_file.exists():
        load_dotenv(env_file, override=True)
    else:
        load_dotenv(script_dir / ".env.example")


def get_required_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise ValueError(
            f"Missing required environment variable: {name}. "
            "Copy .env.example to .env and fill in the values."
        )
    return value


def run_pipeline(bot: telebot.TeleBot, chat_id: int) -> None:
    """Run the SEO pipeline in a background thread and report progress."""
    script_dir = Path(__file__).resolve().parent
    pipeline_script = script_dir / "run_seo_pipeline.py"

    bot.send_message(chat_id, "🚀 开始运行 SEO 优化流程…")

    try:
        result = subprocess.run(
            [sys.executable, str(pipeline_script)],
            cwd=str(script_dir),
            capture_output=True,
            text=True,
            check=False,
        )

        if result.returncode != 0:
            error_text = result.stderr[-3800:] if result.stderr else "未知错误"
            bot.send_message(chat_id, f"❌ 运行失败：\n```\n{error_text}\n```", parse_mode="Markdown")
            return

        bot.send_message(chat_id, "✅ SEO 分析完成！")

        # Send a short summary of the latest candidates
        candidates_path = script_dir / "gsc_optimization_candidates.json"
        review_path = script_dir / "optimization_suggestions_review.md"

        if candidates_path.exists():
            import json
            candidates = json.loads(candidates_path.read_text(encoding="utf-8"))
            bot.send_message(
                chat_id,
                f"📊 本次发现 {len(candidates)} 个优化候选页面。",
            )

        if review_path.exists():
            review = review_path.read_text(encoding="utf-8")
            # Telegram message limit is 4096 chars; split if needed
            chunks = [review[i : i + 3800] for i in range(0, len(review), 3800)]
            for idx, chunk in enumerate(chunks, 1):
                header = f"📋 优化建议（{idx}/{len(chunks)}）\n\n" if len(chunks) > 1 else "📋 优化建议\n\n"
                bot.send_message(chat_id, f"{header}{chunk}")

    except Exception as e:
        bot.send_message(chat_id, f"❌ 运行异常：{e}")


def main() -> int:
    load_env()
    bot_token = get_required_env("TG_BOT_TOKEN")
    allowed_chat_id = get_required_env("TG_CHAT_ID")

    bot = telebot.TeleBot(bot_token)

    def _markup() -> InlineKeyboardMarkup:
        markup = InlineKeyboardMarkup()
        markup.add(InlineKeyboardButton("🚀 运行 SEO 分析", callback_data="run_seo"))
        return markup

    @bot.message_handler(commands=["start"])
    def handle_start(message):
        if str(message.chat.id) != allowed_chat_id:
            bot.reply_to(message, "⛔ 未经授权的访问。")
            return
        bot.send_message(
            message.chat.id,
            "👋 GetFastCalc SEO 机器人\n\n"
            "发送 /seo 或点击下方按钮，即可运行 SEO 优化流程。",
            reply_markup=_markup(),
        )

    @bot.message_handler(commands=["seo"])
    def handle_seo(message):
        if str(message.chat.id) != allowed_chat_id:
            bot.reply_to(message, "⛔ 未经授权的访问。")
            return
        thread = threading.Thread(target=run_pipeline, args=(bot, message.chat.id), daemon=True)
        thread.start()

    @bot.callback_query_handler(func=lambda call: call.data == "run_seo")
    def handle_run_seo_callback(call):
        if str(call.message.chat.id) != allowed_chat_id:
            bot.answer_callback_query(call.id, "⛔ 未经授权的访问。")
            return
        bot.answer_callback_query(call.id, "已开始运行，请稍候…")
        thread = threading.Thread(target=run_pipeline, args=(bot, call.message.chat.id), daemon=True)
        thread.start()

    print("[telegram_bot] Bot is running. Press Ctrl+C to stop.")
    bot.infinity_polling()
    return 0


if __name__ == "__main__":
    sys.exit(main())
