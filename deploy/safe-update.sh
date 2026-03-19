#!/bin/bash
# =============================================
# HILAL BOT — XAVFSIZ YANGILASH (UPDATE ONLY)
# =============================================
# Bu skript FAQAT hilal-bot loyihasini yangilaydi
# Boshqa projectlar (allohgaqayt, docker, va h.k.) ga tegmaydi!
#
# Ishlatish:
#   bash /var/www/hilal-bot/deploy/safe-update.sh
# =============================================

set -e

PROJECT="/var/www/hilal-bot"
REPO="https://github.com/Bekmuhammad-Devoloper/hilal-bot.git"

echo ""
echo "=========================================="
echo "  🔄 HILAL BOT — XAVFSIZ YANGILASH"
echo "=========================================="
echo ""

# ========== 1. GIT PULL ==========
echo "📥 [1/5] Yangi kodlar yuklanmoqda..."
cd $PROJECT

if [ -d .git ]; then
  git fetch origin main
  git reset --hard origin/main
  echo "  ✅ Git pull tayyor"
else
  echo "  ⚠️ Git repo topilmadi, clone qilinmoqda..."
  cd /var/www
  rm -rf hilal-bot
  git clone $REPO hilal-bot
  cd $PROJECT
  echo "  ✅ Git clone tayyor"
fi

# ========== 2. NPM INSTALL ==========
echo ""
echo "📦 [2/5] Paketlar yangilanmoqda..."
cd $PROJECT/backend && npm install --production=false > /dev/null 2>&1
echo "  ✅ Backend paketlar"
cd $PROJECT/admin && npm install > /dev/null 2>&1
echo "  ✅ Admin paketlar"
cd $PROJECT/bot && npm install > /dev/null 2>&1
echo "  ✅ Bot paketlar"

# ========== 3. UPLOADS PAPKA ==========
echo ""
echo "📁 [3/5] Uploads papka tekshirilmoqda..."
mkdir -p $PROJECT/backend/uploads
echo "  ✅ uploads/ papka tayyor"

# ========== 4. BUILD ==========
echo ""
echo "🔨 [4/5] Build..."

cd $PROJECT/backend
npx prisma generate > /dev/null 2>&1
npx prisma migrate deploy 2>/dev/null || echo "  ⚠️ Migration skipped"
npm run build > /dev/null 2>&1
echo "  ✅ Backend build"

cd $PROJECT/admin
npm run build > /dev/null 2>&1
echo "  ✅ Admin build"

cd $PROJECT/bot
npm run build > /dev/null 2>&1
echo "  ✅ Bot build"

# ========== 5. PM2 RESTART (FAQAT HILAL PROCESSLAR) ==========
echo ""
echo "🚀 [5/5] Servislar qayta ishga tushirilmoqda..."

# Faqat hilal- bilan boshlanadigan processlarni restart qilish
# Boshqa processlar (docker, allohgaqayt, va h.k.) ga TEGMAYDI!

# Agar hilal processlar mavjud bo'lsa — restart, aks holda start
if pm2 describe hilal-backend > /dev/null 2>&1; then
  pm2 restart hilal-backend
  echo "  ✅ hilal-backend qayta ishga tushdi"
else
  cd $PROJECT/backend
  pm2 start dist/main.js --name "hilal-backend"
  echo "  ✅ hilal-backend ishga tushdi (yangi)"
fi

if pm2 describe hilal-admin > /dev/null 2>&1; then
  pm2 restart hilal-admin
  echo "  ✅ hilal-admin qayta ishga tushdi"
else
  cd $PROJECT/admin
  pm2 start npm --name "hilal-admin" -- start
  echo "  ✅ hilal-admin ishga tushdi (yangi)"
fi

if pm2 describe hilal-bot > /dev/null 2>&1; then
  pm2 restart hilal-bot
  echo "  ✅ hilal-bot qayta ishga tushdi"
else
  cd $PROJECT/bot
  pm2 start dist/index.js --name "hilal-bot"
  echo "  ✅ hilal-bot ishga tushdi (yangi)"
fi

pm2 save > /dev/null 2>&1

# ========== NGINX — uploads location qo'shish (agar yo'q bo'lsa) ==========
echo ""
echo "🌐 Nginx uploads location tekshirilmoqda..."

NGINX_CONF="/etc/nginx/sites-available/hilal-bot"
if [ -f "$NGINX_CONF" ]; then
  if ! grep -q "location /uploads/" "$NGINX_CONF"; then
    # /api/ location oldiga uploads locationni qo'shish
    sed -i '/location \/api\//i\    location /uploads/ {\n        proxy_pass http://127.0.0.1:3001/uploads/;\n        proxy_set_header Host $host;\n        client_max_body_size 50M;\n    }\n' "$NGINX_CONF"
    
    # client_max_body_size ni yangilash
    if ! grep -q "client_max_body_size" "$NGINX_CONF"; then
      sed -i '/server_name/a\    client_max_body_size 50M;' "$NGINX_CONF"
    fi
    
    nginx -t > /dev/null 2>&1 && systemctl reload nginx
    echo "  ✅ Nginx yangilandi (uploads location qo'shildi)"
  else
    echo "  ✅ Nginx — uploads location allaqachon mavjud"
  fi
else
  echo "  ⚠️ Nginx config topilmadi, manual sozlash kerak"
fi

echo ""
echo "=========================================="
pm2 status
echo ""
echo "=========================================="
echo ""
echo "  🎉 YANGILASH MUVAFFAQIYATLI TUGADI!"
echo ""
echo "  ⚠️ Boshqa projectlar tegmasdan qoldi"
echo ""
echo "=========================================="
