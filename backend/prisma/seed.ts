import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Settings
  const settings = [
    { key: "channelUsername", value: "@gulomjonhoca" },
    { key: "channelUrl", value: "https://t.me/gulomjonhoca" },
    { key: "adminIds", value: JSON.stringify([6340537709, 8155313883]) },
    { key: "botName", value: "Oson Turk Tili" },
    { key: "welcomeMessage", value: "Turk tilini oson va samarali o'rganing! ⚡\nBizning maxsus kontentlarimiz siz uchun ochiq.\nHoziroq qo'shiling!" },
    { key: "subscriptionMessage", value: "Obuna bo'lish uchun quyidagi tugmani bosing" },
  ];

  for (const s of settings) {
    await prisma.settings.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  // Admin users
  const adminIds = [6340537709, 8155313883];
  for (const id of adminIds) {
    await prisma.user.upsert({
      where: { telegramId: BigInt(id) },
      update: { isAdmin: true },
      create: {
        telegramId: BigInt(id),
        firstName: "Admin",
        isAdmin: true,
      },
    });
  }

  // Subscription plans
  const plans = [
    {
      name: "Oson Turk Tili",
      description: "Turk tili kursi — oylik obuna",
      price: 67000,
      duration: 30,
      features: JSON.stringify([
        "Eksklyuziv kontent",
        "Matnlar, savol-javoblar va rivojlanishingizga yordam beradigan videolar",
        "Turk tili muhiti — fikrlash va o'sish istagidagi odamlar bilan muloqot qilish imkoni",
        "Haftasiga yangi 2ta dars — Har dushanba va payshanba kunlari",
      ]),
      isActive: true,
      sortOrder: 1,
    },
    {
      name: "Premium obuna",
      description: "To'liq premium kurs — 3 oylik",
      price: 180000,
      duration: 90,
      features: JSON.stringify([
        "Barcha asosiy obuna imkoniyatlari",
        "Shaxsiy mentor bilan 1:1 darslar",
        "Maxsus grammatika materiallari",
        "Imtihonga tayyorgarlik",
        "Sertifikat",
      ]),
      isActive: true,
      sortOrder: 2,
    },
  ];

  for (const plan of plans) {
    const existing = await prisma.plan.findFirst({ where: { name: plan.name } });
    if (!existing) {
      await prisma.plan.create({ data: plan });
    }
  }

  console.log("✅ Seed completed!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
