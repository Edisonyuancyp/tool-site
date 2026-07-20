#!/usr/bin/env bash
# setup-auto-start.sh
# Configure the Telegram bot to start automatically on macOS boot/login.
#
# Uses launchd by default (works on macOS without extra dependencies).
# Also supports PM2 if already installed.

set -e

PROJECT_ROOT="/Users/aicommander/CascadeProjects/toolcalc"
LAUNCHD_DIR="$PROJECT_ROOT/scripts/seo/launchd"
PLIST_NAME="com.getfastcalc.telegram-bot.plist"
PLIST_PATH="$LAUNCHD_DIR/$PLIST_NAME"
LAUNCH_AGENTS_DIR="$HOME/Library/LaunchAgents"
LOGS_DIR="$PROJECT_ROOT/logs/telegram-bot"

echo "[setup-auto-start] Creating log directories..."
mkdir -p "$LOGS_DIR"
mkdir -p "$PROJECT_ROOT/logs/pm2"

echo "[setup-auto-start] Copying launchd plist..."
mkdir -p "$LAUNCH_AGENTS_DIR"
cp "$PLIST_PATH" "$LAUNCH_AGENTS_DIR/$PLIST_NAME"

echo "[setup-auto-start] Loading launchd service..."
launchctl unload "$LAUNCH_AGENTS_DIR/$PLIST_NAME" 2>/dev/null || true
launchctl load -w "$LAUNCH_AGENTS_DIR/$PLIST_NAME"

echo "[setup-auto-start] Starting service..."
launchctl start "$PLIST_NAME"

echo "[setup-auto-start] Done."
echo ""
echo "Check status: launchctl list | grep com.getfastcalc"
echo "View logs: tail -f $LOGS_DIR/stderr.log"
echo "Stop: launchctl stop $PLIST_NAME"
echo "Unload: launchctl unload $LAUNCH_AGENTS_DIR/$PLIST_NAME"
