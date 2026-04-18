#!/bin/bash
set -e

echo "🔧 Docker nginx configga hilal-bot qo'shilmoqda..."
echo "⚠️  allohgaqayt.uz configga tegmaydi!"

NGINX_CONF="/root/tavba_bot/nginx/nginx.conf"
HOST_IP="172.18.0.1"

# Agar hilal-bot allaqachon qo'shilgan bo'lsa, o'tkazib yuboramiz
if grep -q "hilal-bot.bekmuhammad.uz" "$NGINX_CONF"; then
  echo "✅ hilal-bot allaqachon nginx configda bor"
else
  # Oxirgi } (http blokni yopuvchi) dan oldin hilal-bot server blockni qo'shamiz
  # Fayl oxiridagi } ni hilal-bot block + } bilan almashtiramiz
  sed -i '$ d' "$NGINX_CONF"

  cat >> "$NGINX_CONF" << HILALEOF

    # ============================================
    # HILAL BOT - hilal-bot.bekmuhammad.uz
    # ============================================
    server {
        listen 80;
        server_name hilal-bot.bekmuhammad.uz;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location /api/ {
            proxy_pass http://${HOST_IP}:4001/api/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
        }

        location /uploads/ {
            proxy_pass http://${HOST_IP}:4001/uploads/;
            proxy_set_header Host \$host;
        }

        location / {
            proxy_pass http://${HOST_IP}:4000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
        }
    }

    server {
        listen 443 ssl;
        http2 on;
        server_name hilal-bot.bekmuhammad.uz;

        ssl_certificate     /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers off;

        add_header Content-Security-Policy "frame-ancestors 'self' https://web.telegram.org https://telegram.org t.me" always;
        add_header X-Content-Type-Options "nosniff" always;

        client_max_body_size 10M;

        location /api/ {
            proxy_pass http://${HOST_IP}:4001/api/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
        }

        location /uploads/ {
            proxy_pass http://${HOST_IP}:4001/uploads/;
            proxy_set_header Host \$host;
        }

        location / {
            proxy_pass http://${HOST_IP}:4000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
        }
    }
}
HILALEOF

  echo "✅ hilal-bot server block qo'shildi"
fi

# Nginx config tekshirish
echo "🔍 Nginx config tekshirish..."
docker exec tavba_nginx nginx -t
if [ $? -eq 0 ]; then
  docker exec tavba_nginx nginx -s reload
  echo "✅ Docker nginx reload qilindi!"
else
  echo "❌ Nginx config xato! Backup'dan qaytarish..."
  cp /root/tavba_bot/nginx/nginx.conf.backup /root/tavba_bot/nginx/nginx.conf
  docker exec tavba_nginx nginx -s reload
  echo "⚠️ Backup'ga qaytarildi"
  exit 1
fi

echo ""
echo "🔍 Nginx test..."
docker exec tavba_nginx nginx -t
echo ""
echo "✅ Docker nginx hilal-bot bilan ishlayapti!"
