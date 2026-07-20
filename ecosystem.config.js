module.exports = {
  apps: [
    {
      name: "getfastcalc-telegram-bot",
      script: "scripts/seo/telegram_bot.py",
      interpreter: "scripts/seo/.venv/bin/python3",
      cwd: "/Users/aicommander/CascadeProjects/toolcalc",
      env: {
        NODE_ENV: "production",
        PYTHONUNBUFFERED: "1",
      },
      // Restart policy
      autorestart: true,
      max_restarts: 10,
      min_uptime: "10s",
      // Logs
      log_file: "./logs/pm2/combined.log",
      out_file: "./logs/pm2/out.log",
      error_file: "./logs/pm2/error.log",
      time: true,
      // Do not restart when changing source files during dev
      watch: false,
      // Resource limits
      max_memory_restart: "512M",
    },
  ],
};
