#!/bin/bash
set -e

DOMAIN="hilal-bot.bekmuhammad.uz"
PROJECT="/var/www/hilal-bot"
BACKEND_PORT=4001
ADMIN_PORT=4000
BOT_TOKEN="8678765504:AAEMaeGLXerTqpOm2bdd6jgcB8PZKCwCAjk"
CHANNEL_USERNAME="@gulomjonhoca"
ADMIN_IDS="6340537709,8155313883"
JWT_SECRET="hilal-bot-jwt-secret-2026-prod-x7k9"

echo ""
echo "=========================================="
echo "  🚀 HILAL BOT — SAFE DEPLOY"
echo "  Domain: $DOMAIN"
echo "  Backend port: $BACKEND_PORT"
echo "  Admin port: $ADMIN_PORT"
echo "  ⚠️  Boshqa loyihalarga tegmaydi!"
echo "=========================================="
echo ""

# ========== 1. Fix next.config.js — port 4001 ==========
echo "⚙️ [1/7] next.config.js portni to'g'rilash..."
cd $PROJECT/admin
python3 << 'PYEOF'
with open('next.config.js', 'r') as f:
    content = f.read()
content = content.replace(
    "process.env.BACKEND_PORT || '3001'",
    "'4001'"
)
content = content.replace(
    'http://localhost:7777/api',
    'http://localhost:4001/api'
)
with open('next.config.js', 'w') as f:
    f.write(content)
print("  next.config.js updated to port 4001")
PYEOF

# Fix package.json - admin start on port 4000
python3 << 'PYEOF'
with open('package.json', 'r') as f:
    content = f.read()
content = content.replace('--port 8888', '--port 4000')
with open('package.json', 'w') as f:
    f.write(content)
print("  package.json admin port -> 4000")
PYEOF

echo "✅ Konfiguratsiya tayyor"

# ========== 2. NPM INSTALL ==========
echo ""
echo "📦 [2/7] Paketlar o'rnatilmoqda..."
cd $PROJECT/backend && npm install 2>&1 | tail -1
echo "  ✅ Backend paketlar"
cd $PROJECT/admin && npm install 2>&1 | tail -1
echo "  ✅ Admin paketlar"
cd $PROJECT/bot && npm install 2>&1 | tail -1
echo "  ✅ Bot paketlar"

# ========== 3. BUILD ==========
echo ""
echo "🔨 [3/7] Build..."

cd $PROJECT/backend
npx prisma generate 2>&1 | tail -1
npx prisma migrate dev --name init 2>/dev/null || npx prisma migrate deploy 2>/dev/null || echo "  Migration skipped"
npm run build 2>&1 | tail -3
npx ts-node prisma/seed.ts 2>/dev/null || echo "  Seed skipped"
echo "  ✅ Backend build"

cd $PROJECT/admin
BACKEND_PORT=4001 npm run build 2>&1 | tail -3
echo "  ✅ Admin build"

cd $PROJECT/bot
npm run build 2>&1 | tail -3
echo "  ✅ Bot build"

# ========== 4. NGINX (faqat hilal-bot, boshqalarga tegmaydi) ==========
echo ""
echo "🌐 [4/7] Nginx sozlanmoqda (faqat hilal-bot)..."

cat > /etc/nginx/sites-available/hilal-bot << 'NGINXCONF'
server {
    listen 80;
    server_name hilal-bot.bekmuhammad.uz;

    client_max_body_size 10M;

    # Frontend (Next.js admin + WebApp)
    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:4001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploads
    location /uploads/ {
        proxy_pass http://127.0.0.1:4001/uploads/;
        proxy_set_header Host $host;
    }
}
NGINXCONF

# Faqat hilal-bot linkini yaratish, boshqalarni O'ZGARTIRMAYDI
ln -sf /etc/nginx/sites-available/hilal-bot /etc/nginx/sites-enabled/hilal-bot

# Nginx config tekshirish
nginx -t
systemctl reload nginx
echo "✅ Nginx tayyor (boshqa saytlarga tegmadi)"

# ========== 5. SSL ==========
echo ""
echo "🔒 [5/7] SSL sertifikat..."
certbot --nginx -d hilal-bot.bekmuhammad.uz --non-interactive --agree-tos --email admin@bekmuhammad.uz 2>&1 | tail -5
echo "✅ SSL tayyor"

# ========== 6. PM2 (faqat hilal processlar) ==========
echo ""
echo "🚀 [6/7] PM2 bilan ishga tushirish..."

# Faqat hilal processlarni to'xtatish (agar mavjud bo'lsa), BOSHQALARGA TEGMAYDI
pm2 delete hilal-backend 2>/dev/null || true
pm2 delete hilal-admin 2>/dev/null || true
pm2 delete hilal-bot 2>/dev/null || true

cd $PROJECT/backend
pm2 start dist/src/main.js --name "hilal-backend" --cwd $PROJECT/backend

cd $PROJECT/admin
pm2 start npm --name "hilal-admin" --cwd $PROJECT/admin -- start

cd $PROJECT/bot
pm2 start dist/index.js --name "hilal-bot" --cwd $PROJECT/bot

pm2 save
echo "✅ PM2 processlar ishga tushdi"

# ========== 7. BOT MENU BUTTON ==========
echo ""
echo "🔘 [7/7] Bot menu button..."
curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setChatMenuButton" \
  -H "Content-Type: application/json" \
  -d "{\"menu_button\":{\"type\":\"web_app\",\"text\":\"Hilal Edu\",\"web_app\":{\"url\":\"https://${DOMAIN}/app\"}}}" | head -1

echo ""
echo ""
pm2 status
echo ""
echo "============================================"
echo ""
echo "  🎉 DEPLOY MUVAFFAQIYATLI TUGADI!"
echo ""
echo "  🌐 Admin:  https://${DOMAIN}"
echo "  📱 WebApp: https://${DOMAIN}/app"
echo "  🤖 Bot:    @oson_turktili_bot"
echo "  📊 API:    https://${DOMAIN}/api"
echo ""
echo "  ⚠️  Boshqa loyihalar saqlanib qoldi:"
echo "    - chinesewave (port 3002)"
echo "    - foodapp-backend (port 3001)"
echo "    - guardy (docker 80/443)"
echo ""
echo "============================================"
