#!/bin/bash
set -e

NGINX_CONF="/root/tavba_bot/nginx/nginx.conf"

echo "🔒 hilal-bot SSL sertifikatni nginx configga sozlash..."

# HTTPS server blockdagi ssl_certificate va ssl_certificate_key ni yangilash
# Faqat hilal-bot.bekmuhammad.uz server blockni topib, uning ssl sozlamalarini almashtirish

python3 << 'PYEOF'
with open('/root/tavba_bot/nginx/nginx.conf', 'r') as f:
    content = f.read()

# hilal-bot HTTPS server blockdagi ssl cert.pem ni hilal-bot sertifikati bilan almashtirish
# HTTPS blockni topish va cert path ni o'zgartirish
old_https_block = """    server {
        listen 443 ssl;
        http2 on;
        server_name hilal-bot.bekmuhammad.uz;

        ssl_certificate     /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;"""

new_https_block = """    server {
        listen 443 ssl;
        http2 on;
        server_name hilal-bot.bekmuhammad.uz;

        ssl_certificate     /etc/letsencrypt/live/hilal-bot.bekmuhammad.uz/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/hilal-bot.bekmuhammad.uz/privkey.pem;"""

content = content.replace(old_https_block, new_https_block)

with open('/root/tavba_bot/nginx/nginx.conf', 'w') as f:
    f.write(content)
print("✅ SSL paths updated")
PYEOF

# Nginx test va reload
docker exec tavba_nginx nginx -t && docker exec tavba_nginx nginx -s reload
echo "✅ Nginx reloaded with SSL"
