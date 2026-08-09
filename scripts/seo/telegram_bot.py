#!/usr/bin/env python3
"""
telegram_bot.py
Run a local Telegram bot that lets you trigger the SEO pipeline from Telegram.

Commands:
  /start     - Show the control panel with buttons
  /seo       - Run the SEO pipeline (fetch + analyze)
  /apply     - Apply the latest AI suggestions to meta.json files

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


def _send_chunks(bot: telebot.TeleBot, chat_id: int, text: str, header: str = "") -> None:
    """Send long text in chunks respecting Telegram limits."""
    chunks = [text[i : i + 3800] for i in range(0, len(text), 3800)]
    for idx, chunk in enumerate(chunks, 1):
        prefix = header if len(chunks) == 1 else f"{header}（{idx}/{len(chunks)}）\n\n"
        bot.send_message(chat_id, f"{prefix}{chunk}")


def run_pipeline(bot: telebot.TeleBot, chat_id: int, auto_apply: bool = False) -> None:
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
            _send_chunks(bot, chat_id, review, "📋 优化建议")

        # Offer one-click apply if not already auto-applied
        if not auto_apply:
            apply_markup = InlineKeyboardMarkup()
            apply_markup.add(InlineKeyboardButton("✅ 一键应用建议", callback_data="apply_seo"))
            apply_markup.add(InlineKeyboardButton("🚀 重新分析", callback_data="run_seo"))
            bot.send_message(
                chat_id,
                "分析已生成。点击「一键应用建议」即可把第一个优化建议写入 meta.json，或直接重新分析。",
                reply_markup=apply_markup,
            )
        else:
            run_apply(bot, chat_id)

    except Exception as e:
        bot.send_message(chat_id, f"❌ 运行异常：{e}")


def run_apply(bot: telebot.TeleBot, chat_id: int) -> None:
    """Apply the latest AI suggestions to registry meta.json files."""
    script_dir = Path(__file__).resolve().parent
    apply_script = script_dir / "apply_seo_suggestions.py"

    bot.send_message(chat_id, "📝 正在应用最新的 SEO 建议…")

    try:
        result = subprocess.run(
            [sys.executable, str(apply_script), "--choice", "1"],
            cwd=str(script_dir),
            capture_output=True,
            text=True,
            check=False,
        )

        output_text = result.stdout[-3800:] if result.stdout else ""
        if result.returncode != 0:
            error_text = result.stderr[-3800:] if result.stderr else "未知错误"
            bot.send_message(
                chat_id,
                f"❌ 应用失败：\n```\n{error_text}\n```",
                parse_mode="Markdown",
            )
            return

        bot.send_message(chat_id, "✅ SEO 建议已应用！")
        _send_chunks(bot, chat_id, output_text, "📁 应用结果")

        bot.send_message(
            chat_id,
            "🚀 请重新部署网站后，新的标题和描述才会生效。",
        )

    except Exception as e:
        bot.send_message(chat_id, f"❌ 应用异常：{e}")


def run_agent(bot: telebot.TeleBot, chat_id: int, text: str) -> None:
    """Run a natural-language command through scripts/agent.py and reply."""
    project_root = Path(__file__).resolve().parent.parent.parent
    agent_script = project_root / "scripts" / "agent.py"
    if not agent_script.exists():
        bot.send_message(chat_id, "❌ agent.py 脚本不存在。")
        return

    bot.send_message(chat_id, f"🤖 正在执行：{text[:80]}…")
    try:
        result = subprocess.run(
            [sys.executable, str(agent_script), text],
            cwd=str(project_root),
            capture_output=True,
            text=True,
            check=False,
            timeout=300,
        )

        if result.returncode != 0:
            error_text = result.stderr[-3800:] if result.stderr else "未知错误"
            _send_chunks(bot, chat_id, error_text, "❌ 执行失败")
            return

        output_text = result.stdout[-3800:] if result.stdout else "✅ 执行完成，无输出"
        _send_chunks(bot, chat_id, output_text, "🤖 Agent 结果")
    except subprocess.TimeoutExpired:
        bot.send_message(chat_id, "⌛ 执行超时（5 分钟），请稍后重试。")
    except Exception as e:
        bot.send_message(chat_id, f"❌ 执行异常：{e}")


def run_approve_link(bot: telebot.TeleBot, chat_id: int, req_id: str, message_id: int) -> None:
    """Approve a link exchange request via the link-exchange API."""
    import requests as req_lib
    api_url = "http://127.0.0.1:5312"
    try:
        resp = req_lib.post(f"{api_url}/api/link-exchange/approve/{req_id}", timeout=30)
        if resp.status_code == 200:
            data = resp.json()
            bot.edit_message_text(
                f"✅ 友情链接已批准并添加！\nURL: {data.get('message', '')}",
                chat_id=chat_id,
                message_id=message_id,
            )
            bot.send_message(chat_id, "🚀 已自动 git commit & push，友情链接将在下次部署后生效。")
        else:
            bot.send_message(chat_id, f"❌ 批准失败: {resp.text[:500]}")
    except Exception as e:
        bot.send_message(chat_id, f"❌ 批准异常: {e}")


def run_reject_link(bot: telebot.TeleBot, chat_id: int, req_id: str, message_id: int) -> None:
    """Reject a link exchange request via the link-exchange API."""
    import requests as req_lib
    api_url = "http://127.0.0.1:5312"
    try:
        resp = req_lib.post(f"{api_url}/api/link-exchange/reject/{req_id}", timeout=15)
        if resp.status_code == 200:
            bot.edit_message_text(
                "❌ 友情链接申请已拒绝。",
                chat_id=chat_id,
                message_id=message_id,
            )
        else:
            bot.send_message(chat_id, f"❌ 拒绝失败: {resp.text[:500]}")
    except Exception as e:
        bot.send_message(chat_id, f"❌ 拒绝异常: {e}")


def main() -> int:
    load_env()
    bot_token = get_required_env("TG_BOT_TOKEN")
    allowed_chat_id = get_required_env("TG_CHAT_ID")

    bot = telebot.TeleBot(bot_token)

    def _markup() -> InlineKeyboardMarkup:
        markup = InlineKeyboardMarkup()
        markup.add(InlineKeyboardButton("🚀 运行 SEO 分析", callback_data="run_seo"))
        markup.add(InlineKeyboardButton("✅ 运行并应用", callback_data="run_and_apply_seo"))
        markup.add(InlineKeyboardButton("📝 应用最新建议", callback_data="apply_seo"))
        return markup

    @bot.message_handler(commands=["start"])
    def handle_start(message):
        if str(message.chat.id) != allowed_chat_id:
            bot.reply_to(message, "⛔ 未经授权的访问。")
            return
        bot.send_message(
            message.chat.id,
            "👋 GetFastCalc AI 机器人\n\n"
            "- 🚀 运行 SEO 分析\n"
            "- ✅ 运行并应用：分析 + 自动应用第一个建议\n"
            "- 📝 应用最新建议：把已生成的建议写入 meta.json\n"
            "- 🤖 自然语言控制：直接发送命令，例如「list tools」「build the site」「create a crypto tax calculator」",
            reply_markup=_markup(),
        )

    @bot.message_handler(commands=["agent"])
    def handle_agent(message):
        if str(message.chat.id) != allowed_chat_id:
            bot.reply_to(message, "⛔ 未经授权的访问。")
            return
        bot.send_message(
            message.chat.id,
            "🤖 你可以直接给我发送自然语言命令，我会调用 agent.py 执行。\n\n"
            "示例：\n"
            "• list tools\n"
            "• run maintenance and push to git\n"
            "• create a keto macro calculator\n"
            "• generate variants for bmi-calculator\n"
            "• fetch gsc data and analyze seo\n"
            "• build the site\n\n"
            "危险操作（如 git push、build）会先执行，请注意确认。",
        )

    @bot.message_handler(func=lambda m: m.text and not m.text.startswith("/"))
    def handle_plain_text(message):
        if str(message.chat.id) != allowed_chat_id:
            bot.reply_to(message, "⛔ 未经授权的访问。")
            return
        text = message.text.strip()
        if not text:
            return
        thread = threading.Thread(target=run_agent, args=(bot, message.chat.id, text), daemon=True)
        thread.start()

    @bot.message_handler(commands=["seo"])
    def handle_seo(message):
        if str(message.chat.id) != allowed_chat_id:
            bot.reply_to(message, "⛔ 未经授权的访问。")
            return
        thread = threading.Thread(target=run_pipeline, args=(bot, message.chat.id), daemon=True)
        thread.start()

    @bot.message_handler(commands=["apply"])
    def handle_apply(message):
        if str(message.chat.id) != allowed_chat_id:
            bot.reply_to(message, "⛔ 未经授权的访问。")
            return
        thread = threading.Thread(target=run_apply, args=(bot, message.chat.id), daemon=True)
        thread.start()

    @bot.callback_query_handler(func=lambda call: call.data == "run_seo")
    def handle_run_seo_callback(call):
        if str(call.message.chat.id) != allowed_chat_id:
            bot.answer_callback_query(call.id, "⛔ 未经授权的访问。")
            return
        bot.answer_callback_query(call.id, "已开始运行，请稍候…")
        thread = threading.Thread(target=run_pipeline, args=(bot, call.message.chat.id), daemon=True)
        thread.start()

    @bot.callback_query_handler(func=lambda call: call.data == "run_and_apply_seo")
    def handle_run_and_apply_callback(call):
        if str(call.message.chat.id) != allowed_chat_id:
            bot.answer_callback_query(call.id, "⛔ 未经授权的访问。")
            return
        bot.answer_callback_query(call.id, "已开始运行并应用，请稍候…")
        thread = threading.Thread(target=run_pipeline, args=(bot, call.message.chat.id, True), daemon=True)
        thread.start()

    @bot.callback_query_handler(func=lambda call: call.data == "apply_seo")
    def handle_apply_callback(call):
        if str(call.message.chat.id) != allowed_chat_id:
            bot.answer_callback_query(call.id, "⛔ 未经授权的访问。")
            return
        bot.answer_callback_query(call.id, "正在应用建议…")
        thread = threading.Thread(target=run_apply, args=(bot, call.message.chat.id), daemon=True)
        thread.start()

    # ── Link exchange approval handlers ───────────────────────────────────────
    @bot.callback_query_handler(func=lambda call: call.data.startswith("approve_link_"))
    def handle_approve_link(call):
        if str(call.message.chat.id) != allowed_chat_id:
            bot.answer_callback_query(call.id, "⛔ 未经授权的访问。")
            return
        req_id = call.data.replace("approve_link_", "")
        bot.answer_callback_query(call.id, "✅ 正在添加友情链接…")
        thread = threading.Thread(
            target=run_approve_link,
            args=(bot, call.message.chat.id, req_id, call.message.message_id),
            daemon=True,
        )
        thread.start()

    @bot.callback_query_handler(func=lambda call: call.data.startswith("reject_link_"))
    def handle_reject_link(call):
        if str(call.message.chat.id) != allowed_chat_id:
            bot.answer_callback_query(call.id, "⛔ 未经授权的访问。")
            return
        req_id = call.data.replace("reject_link_", "")
        bot.answer_callback_query(call.id, "❌ 已拒绝")
        thread = threading.Thread(
            target=run_reject_link,
            args=(bot, call.message.chat.id, req_id, call.message.message_id),
            daemon=True,
        )
        thread.start()

    print("[telegram_bot] Bot is running. Press Ctrl+C to stop.")
    bot.infinity_polling()
    return 0


if __name__ == "__main__":
    sys.exit(main())
