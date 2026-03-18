# 🇹🇷 Hilal Bot - Oson Turk Tili

Turk tili kurslarini sotish uchun Telegram bot + Admin panel.

## 📁 Loyiha tuzilishi

```
hilal bot/
├── bot/          → Telegram Bot (grammY + TypeScript)
├── backend/      → REST API (NestJS + Prisma + SQLite)
├── admin/        → Admin Panel + WebApp (Next.js + TailwindCSS)
├── public/       → Umumiy rasmlar (logo, to'lov ikonkalari)
└── .gitignore
```

## 🚀 Ishga tushirish

### 1. Backend (NestJS) — Port: 7777
```bash
cd backend
cp .env.example .env    # .env faylni sozlang
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```
Backend: http://localhost:7777

### 2. Admin Panel (Next.js) — Port: 8888
```bash
cd admin
npm install
npm run dev
```
Admin: http://localhost:8888

### 3. Telegram Bot
```bash
cd bot
cp .env.example .env    # BOT_TOKEN ni yozing
npm install
npm run dev
```

## 📋 Imkoniyatlar

### Telegram Bot
- ✅ Kanalga obuna tekshirish
- 📚 Obuna rejalari (tariflar)
- 💳 Payme / Click orqali to'lov (simulyatsiya)
- 📦 Obuna boshqaruvi
- 👨‍💼 Admin panel kirish (/admin)

### Admin Panel
- 📊 Dashboard (statistika)
- 👥 Foydalanuvchilar ro'yxati va boshqaruvi
- � Obuna rejalari CRUD (qo'shish, tahrirlash, o'chirish)
- � Obunalar boshqaruvi
- 💳 To'lovlar boshqaruvi (tasdiqlash/rad etish)
- 📢 Broadcast (barchaga xabar yuborish)
- ⚙️ Sozlamalar (kanal, admin IDlar, to'lov raqamlari)
- 👑 Admin tayinlash / olib tashlash
- 💬 Foydalanuvchilarga shaxsiy xabar

### WebApp (Telegram Mini App)
- 🎨 Parallel Muhit uslubidagi dizayn
- 📱 Obuna rejalarini ko'rish
- 💳 Payme / Click to'lov (karta bilan)
- 📊 Obuna holatini boshqarish

## 🏗️ Texnologiyalar

| Qism | Texnologiya |
|------|------------|
| Bot | grammY + TypeScript |
| Backend | NestJS + Prisma + SQLite |
| Admin | Next.js 14 + TailwindCSS |
| WebApp | Next.js (Telegram WebApp) |

## ⚙️ Muhit o'zgaruvchilari

### Backend (`backend/.env`)
```
DATABASE_URL="file:./dev.db"
PORT=7777
JWT_SECRET=hilal-bot-secret-key-2024
BOT_TOKEN=your_bot_token_here
CHANNEL_ID=@gulomjonhoca
```

### Bot (`bot/.env`)
```
BOT_TOKEN=your_bot_token_here
API_URL=http://localhost:7777/api
WEBAPP_URL=http://localhost:8888
CHANNEL_ID=@gulomjonhoca
ADMIN_IDS=6340537709,8155313883
```

## 📂 To'lov ikonkalari

`admin/public/` va `public/` papkalarida:
- `payme-icon.svg` — Payme logotipi
- `click-icon.svg` — Click logotipi
- `logo.jpg` — Bot logotipi

## 🔑 Admin IDlar
- 6340537709
- 8155313883

## 📢 Kanal
- @gulomjonhoca (admin paneldan o'zgartirish mumkin)
