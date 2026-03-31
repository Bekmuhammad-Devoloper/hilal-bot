#!/bin/bash
BOT_TOKEN='8678765504:AAEMaeGLXerTqpOm2bdd6jgcB8PZKCwCAjk'
DB_PATH='/var/www/hilal-bot/backend/prisma/prisma/dev.db'

for TG_ID in 6340537709 8155313883; do
  PHOTOS=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getUserProfilePhotos?user_id=${TG_ID}&offset=0&limit=1")
  COUNT=$(echo "$PHOTOS" | python3 -c 'import sys,json; print(json.load(sys.stdin)["result"]["total_count"])')
  if [ "$COUNT" -gt 0 ]; then
    FILE_ID=$(echo "$PHOTOS" | python3 -c 'import sys,json; d=json.load(sys.stdin); print(d["result"]["photos"][0][-1]["file_id"])')
    FILE_INFO=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${FILE_ID}")
    FILE_PATH=$(echo "$FILE_INFO" | python3 -c 'import sys,json; print(json.load(sys.stdin)["result"]["file_path"])')
    PHOTO_URL="https://api.telegram.org/file/bot${BOT_TOKEN}/${FILE_PATH}"
    echo "User $TG_ID -> $PHOTO_URL"
    sqlite3 "$DB_PATH" "UPDATE User SET photoUrl='${PHOTO_URL}' WHERE telegramId=${TG_ID};"
  else
    echo "User $TG_ID has no photos"
  fi
done

echo 'Verify:'
sqlite3 "$DB_PATH" 'SELECT id, telegramId, photoUrl FROM User;'
