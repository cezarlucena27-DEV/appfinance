#!/usr/bin/env bash
# FinanceApp - Atualizacao da aplicacao no servidor a partir do Git
# Uso: bash scripts/deploy.sh [branch]   (padrao: main)
set -euo pipefail

BRANCH="${1:-main}"
APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_NAME="financeapp"

cd "$APP_DIR"

echo "==> [1/6] Baixando codigo ($BRANCH)..."
git fetch origin "$BRANCH"
git reset --hard "origin/$BRANCH"

echo "==> [2/6] Instalando dependencias do backend..."
cd backend
npm ci --no-audit --no-fund

echo "==> [3/6] Compilando backend e aplicando schema do banco..."
npm run build
npx prisma generate
npx prisma db push --skip-generate --accept-data-loss=false

echo "==> [4/6] Instalando dependencias do frontend..."
cd ../frontend
npm ci --no-audit --no-fund

echo "==> [5/6] Compilando frontend..."
npm run build

echo "==> [6/6] Reiniciando servico (PM2)..."
cd "$APP_DIR/backend"
if pm2 describe "$APP_NAME" > /dev/null 2>&1; then
  pm2 reload "$APP_NAME" --update-env
else
  pm2 start dist/main.js --name "$APP_NAME" --time --max-memory-restart 700M
fi
pm2 save

echo ""
echo "✅ Deploy concluido! Servico: $(pm2 describe "$APP_NAME" | grep -E 'status' | head -1)"
pm2 status "$APP_NAME"
