#!/bin/bash
# Start the resident Telegram bot that connects natural language commands to agent.py
set -e

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VENV="$PROJECT_ROOT/scripts/seo/.venv/bin/activate"

if [ ! -f "$VENV" ]; then
    echo "❌ Virtual env not found at scripts/seo/.venv"
    echo "   Run: python3 -m venv scripts/seo/.venv && source scripts/seo/.venv/bin/activate && pip install -r scripts/seo/requirements.txt"
    exit 1
fi

source "$VENV"

if [ -z "${TG_BOT_TOKEN}" ] || [ -z "${TG_CHAT_ID}" ]; then
    if [ -f "$PROJECT_ROOT/scripts/seo/.env" ]; then
        export $(grep -v '^#' "$PROJECT_ROOT/scripts/seo/.env" | xargs)
    fi
fi

if [ -z "${TG_BOT_TOKEN}" ] || [ -z "${TG_CHAT_ID}" ]; then
    echo "❌ TG_BOT_TOKEN or TG_CHAT_ID not set. Check scripts/seo/.env"
    exit 1
fi

cd "$PROJECT_ROOT"
exec python3 scripts/seo/telegram_bot.py
