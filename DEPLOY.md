# 部署与自启动指南

## Telegram 机器人自启动

机器人入口：`scripts/seo/telegram_bot.py`

### 方案 A：macOS launchd（推荐，无额外依赖）

```bash
# 1. 运行安装脚本
bash scripts/seo/setup-auto-start.sh

# 2. 检查状态
launchctl list | grep com.getfastcalc

# 3. 查看日志
tail -f logs/telegram-bot/stderr.log

# 手动停止/卸载
launchctl stop com.getfastcalc.telegram-bot
launchctl unload ~/Library/LaunchAgents/com.getfastcalc.telegram-bot.plist
```

### 方案 B：PM2（跨平台，适合 Linux 服务器）

```bash
# 1. 安装 PM2（如未安装）
npm install -g pm2

# 2. 启动
pm2 start ecosystem.config.js

# 3. 保存进程列表
pm2 save

# 4. 设置开机自启
pm2 startup
# 按提示执行最后输出的命令
pm2 save

# 常用命令
pm2 logs getfastcalc-telegram-bot
pm2 restart getfastcalc-telegram-bot
pm2 stop getfastcalc-telegram-bot
```

## 环境要求

确保 `scripts/seo/.env` 已配置：

```
TG_BOT_TOKEN=your_telegram_bot_token
TG_CHAT_ID=your_chat_id
GSC_CREDENTIALS_PATH=...
GSC_SITE_URL=...
```

## 当前状态

```bash
# 是否已在运行
launchctl list | grep com.getfastcalc
pm2 status | grep getfastcalc
```
