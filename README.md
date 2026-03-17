# 🇹🇷 Hilal Bot - Oson Turk Tili

Turk tili kurslarini sotish uchun Telegram bot + Admin panel.

## 📁 Loyiha tuzilishi

```
hilal bot/
├── bot/          → Telegram Bot (grammY + TypeScript)
├── backend/      → REST API (NestJS + Prisma + SQLite)
├── admin/        → Admin Panel (Next.js + TailwindCSS)
```

## 🚀 Ishga tushirish

### 1. Backend (NestJS)
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```
Backend: http://localhost:3001

### 2. Admin Panel (Next.js)
```bash
cd admin
npm install
npm run dev
```
Admin: http://localhost:3000
Login: **admin** / **admin123**

### 3. Telegram Bot
```bash
cd bot
npm install
npm run dev
```

## 📋 Imkoniyatlar

### Telegram Bot
- ✅ Kanalga obuna tekshirish
- 📚 Kurslar katalogi (kategoriyalar bilan)
- 🛒 Savat (qo'shish, o'chirish, tozalash)
- 💳 Payme / Click orqali to'lov
- 📦 Buyurtmalar tarixi
- 👨‍💼 Admin tasdiqlash tizimi

### Admin Panel
- 📊 Dashboard (statistika)
- 👥 Foydalanuvchilar ro'yxati va boshqaruvi
- 📚 Kurslar CRUD (qo'shish, tahrirlash, o'chirish)
- 📦 Buyurtmalar boshqaruvi (tasdiqlash/rad etish)
- 📢 Broadcast (barchaga xabar yuborish)
- ⚙️ Sozlamalar (kanal o'zgartirish, admin IDlar)
- 👑 Admin tayinlash / olib tashlash
- 💬 Foydalanuvchilarga shaxsiy xabar

## ⚙️ Sozlamalar

### To'lov integratsiya
1. @BotFather ga boring
2. Bot sozlamalarida "Payments" bo'limini oching
3. Payme yoki Click ni ulang
4. Olingan tokenni `bot/.env` faylga yozing

### Admin IDlar
- 6340537709
- 8155313883

### Kanal
- @gulomjonhoca (admin paneldan o'zgartirish mumkin)
