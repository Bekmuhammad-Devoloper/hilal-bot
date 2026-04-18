#!/bin/bash
set -e

echo "🔧 Nginx configni tuzatish — hilal-bot http{} blokiga kirishi kerak..."

python3 << 'PYEOF'
with open('/root/tavba_bot/nginx/nginx.conf', 'r') as f:
    lines = f.readlines()

# 155-qatordagi yopuvchi } ni olib tashlash va faylning eng oxiriga qo'yish kerak
# Hozir 155-qatorda "}" bor — bu http{} ni yopadi, lekin hilal-bot blocklari undan keyin
# Faylni qayta yozish:
# 1) allohgaqayt HTTPS server bloki yopilgandan keyin (154-qator)
# 2) hilal-bot blocklari
# 3) eng oxirida } (http blokni yopish)

new_lines = []
found_early_close = False
for i, line in enumerate(lines):
    linenum = i + 1
    if linenum == 155 and line.strip() == '}':
        # Bu erta yopiladigan http{} braketni o'tkazib yuboramiz
        found_early_close = True
        new_lines.append('\n')  # bo'sh qator qo'yamiz
        continue
    new_lines.append(line)

if found_early_close:
    # Endi oxiridagi } allaqachon 242-qatorda bor — bu http{} ni yopadi
    print("✅ 155-qatordagi erta } olib tashlandi")
    print("   Oxiridagi } (242-qator) http{} ni to'g'ri yopadi")
else:
    print("⚠️ 155-qatorda } topilmadi — config allaqachon to'g'ri bo'lishi mumkin")

with open('/root/tavba_bot/nginx/nginx.conf', 'w') as f:
    f.writelines(new_lines)

print("✅ Config yangilandi")
PYEOF

echo "🔍 Nginx test..."
docker exec tavba_nginx nginx -t
if [ $? -eq 0 ]; then
    docker exec tavba_nginx nginx -s reload
    echo "✅ Nginx reload muvaffaqiyatli!"
else
    echo "❌ Nginx config xato! Backup dan tiklash..."
    cp /root/tavba_bot/nginx/nginx.conf.backup /root/tavba_bot/nginx/nginx.conf
    docker exec tavba_nginx nginx -s reload
    echo "⚠️ Backupga qaytarildi"
fi
