#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# Pulls latest code, installs deps, builds Next.js, restarts pm2 services.
# Triggered by webhook.js on every push to main, OR run manually:
#   sudo -u deploy bash /var/www/neogram/deploy/deploy.sh
# ──────────────────────────────────────────────────────────────────────────────
set -euo pipefail

APP_DIR="/var/www/neogram"
LOG_DIR="/var/log/neogram"
LOCK="/tmp/neogram-deploy.lock"

# Single-flight: never run two deploys at once.
exec 9>"$LOCK"
if ! flock -n 9; then
  echo "deploy already in progress, exiting"
  exit 0
fi

mkdir -p "$LOG_DIR"

cd "$APP_DIR"

echo "▶ git fetch + reset"
git fetch --prune origin
git reset --hard origin/main

echo "▶ npm ci (web)"
# `--omit=dev` keeps the prod image lean; if you need devDeps for build, switch to npm ci then npm prune --production after build.
npm ci --no-audit --no-fund

echo "▶ next build"
NODE_ENV=production npm run build

echo "▶ npm ci (bot)"
( cd bot && npm ci --no-audit --no-fund --omit=dev )

echo "▶ pm2 reload"
# startOrReload on first run starts processes, on subsequent runs does zero-downtime reload.
pm2 startOrReload "$APP_DIR/deploy/ecosystem.config.js" --update-env

echo "✅ deploy finished at $(date -Iseconds)"
