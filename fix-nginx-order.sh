#!/bin/bash
set -e

echo "🔧 Nginx configni qayta tartiblamoqda..."
echo "   hilal-bot HTTPS blockini allohgaqayt.uz dan OLDIN qo'yish..."

python3 << 'PYEOF'
with open('/root/tavba_bot/nginx/nginx.conf', 'r') as f:
    content = f.read()

# Hilal bot HTTP va HTTPS server blocklarini ajratib olish
# Keyin allohgaqayt HTTPS blockidan oldin joylashtirish

# hilal-bot HTTP block
hilal_http_marker = "    # ============================================\n    # HILAL BOT - hilal-bot.bekmuhammad.uz\n    # ============================================"

# hilal-bot HTTP block ni topish
hilal_start = content.find(hilal_http_marker)
if hilal_start == -1:
    print("❌ hilal-bot block topilmadi!")
    exit(1)

# oxiridagi } dan oldin barcha hilal contentni olish
# hilal bloklari configning eng oxirida joylashgan (http{} yopilishidan oldin)
hilal_section = content[hilal_start:]
# Oxirgi } ni olib tashlash (http closing brace)
last_brace = hilal_section.rfind('}')
hilal_section = hilal_section[:last_brace].rstrip()

# Asosiy configdan hilal-bot qismini olib tashlash
main_config = content[:hilal_start].rstrip()

# allohgaqayt HTTPS block oldini topish
alloh_https = "    # HTTPS - will work after Let's Encrypt cert is obtained"
insert_point = main_config.find(alloh_https)

if insert_point == -1:
    print("❌ allohgaqayt HTTPS block topilmadi!")
    exit(1)

# Yangi config yaratish:
# 1) http{} boshlangani + allohgaqayt HTTP block
# 2) hilal-bot HTTP + HTTPS blocklari
# 3) allohgaqayt HTTPS block
# 4) http{} yopilishi

new_config = main_config[:insert_point]
new_config += hilal_section + "\n\n"
new_config += main_config[insert_point:]
new_config += "\n}\n"

with open('/root/tavba_bot/nginx/nginx.conf', 'w') as f:
    f.write(new_config)

print("✅ hilal-bot blocklari allohgaqayt HTTPS dan oldin joylashtirildi")
PYEOF

echo "🔍 Nginx test..."
docker exec tavba_nginx nginx -t
if [ $? -eq 0 ]; then
    docker exec tavba_nginx nginx -s reload
    echo "✅ Nginx reload OK!"
    echo ""
    echo "🔍 SSL tekshirish..."
    sleep 1
    curl -vs --resolve hilal-bot.bekmuhammad.uz:443:127.0.0.1 https://hilal-bot.bekmuhammad.uz 2>&1 | grep -E 'subject:|CN='
else
    echo "❌ Config xato! Backupdan tiklash..."
    cp /root/tavba_bot/nginx/nginx.conf.backup /root/tavba_bot/nginx/nginx.conf
    docker exec tavba_nginx nginx -s reload
    echo "⚠️ Qaytarildi"
fi
