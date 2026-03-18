import { Bot, InlineKeyboard } from "grammy";
import { config } from "./config";
import * as api from "./api";

const bot = new Bot(config.botToken);

// =============================================
// /start - Parallel Muhit uslubidagi welcome
// =============================================
bot.command("start", async (ctx) => {
  // Royxatdan otkazish
  try {
    await api.registerUser(
      ctx.from!.id,
      ctx.from!.username || "",
      ctx.from!.first_name || "",
      ctx.from!.last_name || "",
    );
  } catch (e) {}

  // Aktiv obunani tekshirish
  let sub: any = null;
  try {
    sub = await api.getActiveSubscription(ctx.from!.id);
  } catch (e) {}

  if (sub) {
    const endDate = new Date(sub.endDate);
    const now = new Date();
    const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    const keyboard = new InlineKeyboard()
      .webApp("\u{1F4F1} Ishga tushirish", `${config.webAppUrl}/app?user=${ctx.from!.id}`)
      .row()
      .url("\u{1F4E2} Kanalga o'tish", `https://t.me/${config.channelId.replace("@", "")}`);

    await ctx.reply(
      `\u2705 Sizning obunangiz faol!\n\n` +
      `\u{1F4C5} Obuna tugash sanasi: ${formatDate(endDate)}\n` +
      `\u23F3 Qolgan kunlar: ${daysLeft} kun\n\n` +
      `Maxsus kontentlarimiz siz uchun ochiq \u26A1`,
      { reply_markup: keyboard },
    );
    return;
  }

  // Obuna yoq - WebApp orqali boshlash
  const keyboard = new InlineKeyboard()
    .webApp("\u{1F680} BOSHLASH", `${config.webAppUrl}/app?user=${ctx.from!.id}`);

  await ctx.reply(
    `Bu bot nimalar qila oladi?\n\n` +
    `Bu yerda sizni:\n` +
    `\u26A1Rivojlantiradigan muhit\n` +
    `\u270DTakrorlanmas kontent\n` +
    `\u{1F5E3}Ilm suhbatlari kutmoqda!\n\n` +
    `Qo'shilish uchun "BOSHLASH" tugmasini bosing`,
    { reply_markup: keyboard },
  );
});

// =============================================
// /admin - Admin panel kirish
// =============================================
bot.command("admin", async (ctx) => {
  if (!config.adminIds.includes(ctx.from!.id)) {
    await ctx.reply("\u274C Sizda admin huquqi yo'q!");
    return;
  }

  try {
    const result = await api.generateAuthCode(ctx.from!.id);
    const loginUrl = `${config.webAppUrl}/auth?code=${result.code}`;

    const keyboard = new InlineKeyboard()
      .url("\u{1F510} Admin panelga kirish", loginUrl);

    await ctx.reply(
      `\u{1F510} Admin Panel\n\n` +
      `Quyidagi tugmani bosib admin panelga kiring.\n` +
      `\u23F0 Havola 5 daqiqa amal qiladi.\n\n` +
      `\u26A0\uFE0F Bu havolani boshqalarga bermang!`,
      { reply_markup: keyboard },
    );
  } catch (e: any) {
    await ctx.reply("\u274C Xatolik yuz berdi!");
  }
});

// =============================================
// /status - Obuna holati
// =============================================
bot.command("status", async (ctx) => {
  let sub: any = null;
  try {
    sub = await api.getActiveSubscription(ctx.from!.id);
  } catch (e) {}

  if (!sub) {
    const keyboard = new InlineKeyboard()
      .webApp("\u{1F680} Obuna bo'lish", `${config.webAppUrl}/app?user=${ctx.from!.id}`);

    await ctx.reply(
      `\u274C Sizda aktiv obuna yo'q.\n\n` +
      `Obuna bo'lish uchun quyidagi tugmani bosing:`,
      { reply_markup: keyboard },
    );
    return;
  }

  const endDate = new Date(sub.endDate);
  const now = new Date();
  const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  const keyboard = new InlineKeyboard()
    .webApp("\u{1F4F1} Boshqarish", `${config.webAppUrl}/app?user=${ctx.from!.id}`)
    .row()
    .url("\u{1F4E2} Kanalga o'tish", `https://t.me/${config.channelId.replace("@", "")}`);

  await ctx.reply(
    `\u{1F4CA} Obuna holati\n\n` +
    `\u2705 Status: Faol\n` +
    `\u{1F4C5} Tugash sanasi: ${formatDate(endDate)}\n` +
    `\u23F3 Qolgan kunlar: ${daysLeft} kun\n` +
    `\u{1F4CB} Reja: ${sub.plan?.name || "Standart"}`,
    { reply_markup: keyboard },
  );
});

// =============================================
// /help
// =============================================
bot.command("help", async (ctx) => {
  await ctx.reply(
    `\u{1F4CB} Buyruqlar:\n\n` +
    `/start \u2014 Botni boshlash\n` +
    `/status \u2014 Obuna holati\n` +
    `/help \u2014 Yordam\n\n` +
    `Savollaringiz bo'lsa, admin bilan bog'laning.`,
  );
});

// =============================================
// Callback queries
// =============================================
bot.on("callback_query:data", async (ctx) => {
  const data = ctx.callbackQuery.data;

  if (data === "check_sub") {
    let sub: any = null;
    try {
      sub = await api.getActiveSubscription(ctx.from!.id);
    } catch (e) {}

    if (sub) {
      await ctx.answerCallbackQuery({ text: "\u2705 Obunangiz faol!" });
      const keyboard = new InlineKeyboard()
        .url("\u{1F4E2} Kanalga o'tish", `https://t.me/${config.channelId.replace("@", "")}`);
      await ctx.reply("\u2705 Obunangiz tasdiqlandi! Kanalga kirishingiz mumkin.", {
        reply_markup: keyboard,
      });
    } else {
      await ctx.answerCallbackQuery({
        text: "\u274C Obuna topilmadi. Avval to'lov qiling.",
        show_alert: true,
      });
    }
    return;
  }

  await ctx.answerCallbackQuery();
});

// =============================================
// Web App data (tolov natijasi)
// =============================================
bot.on("message:web_app_data", async (ctx) => {
  try {
    const data = JSON.parse(ctx.message!.web_app_data!.data);

    if (data.action === "payment_created") {
      const keyboard = new InlineKeyboard()
        .webApp("\u{1F4F1} Ilovaga qaytish", `${config.webAppUrl}/app?user=${ctx.from!.id}`);

      await ctx.reply(
        `\u{1F4B3} To'lov so'rovi yaratildi!\n\n` +
        `\u{1F4B0} Summa: ${data.amount || "?"} so'm\n` +
        `\u{1F4DD} To'lov raqami: #${data.paymentId || "?"}\n\n` +
        `Admin tekshirgandan keyin obunangiz faollashadi.\n` +
        `\u2705 Obuna faollashganda sizga xabar yuboramiz!`,
        { reply_markup: keyboard },
      );
    }

    if (data.action === "payment_success") {
      let sub: any = null;
      try {
        sub = await api.getActiveSubscription(ctx.from!.id);
      } catch (e) {}

      if (sub) {
        const endDate = new Date(sub.endDate);

        let inviteLink: string | null = null;
        try {
          const res = await api.getInviteLink(ctx.from!.id);
          inviteLink = res.inviteLink;
        } catch (e) {}

        const keyboard = new InlineKeyboard();
        if (inviteLink) {
          keyboard.url("\u{1F517} Kanalga kirish", inviteLink).row();
        }
        keyboard.url("\u{1F4E2} Kanalga o'tish", `https://t.me/${config.channelId.replace("@", "")}`);

        await ctx.reply(
          `\u{1F4B3} To'lov tasdiqlandi!\n\n` +
          `Keyingi obuna ${formatDate(endDate)} sanasida tugaydi\n\n` +
          `Maxsus kontentlarimiz siz uchun ochiq \u26A1\n` +
          `Hoziroq kirish uchun pastdagi tugmani bosing`,
          { reply_markup: keyboard },
        );

        setTimeout(async () => {
          try {
            const kb = new InlineKeyboard()
              .url("\u{1F4E2} Kanalga o'tish", `https://t.me/${config.channelId.replace("@", "")}`);
            await ctx.reply(
              `Oson Turk Tiliga xush kelibsiz!\nEndi siz ham bizning bir qismimiz \u{1F973}`,
              { reply_markup: kb },
            );
          } catch (e) {}
        }, 2000);
      }
    }

    if (data.action === "subscription_cancelled") {
      const endDate = data.endDate ? new Date(data.endDate) : null;
      await ctx.reply(
        `Obunangiz muvaffaqiyatli bekor qilindi\n` +
        (endDate ? `Obunangiz tugash sanasi: ${formatDate(endDate)}\n\n` : "\n") +
        `O'sha kungacha bemalol foydalanishingiz mumkin.\n\n` +
        `Xohlasangiz, obunani qayta faollashtirish oson.`,
      );
    }
  } catch (e) {
    console.error("WebApp data error:", e);
  }
});

// =============================================
// Yordamchi funksiyalar
// =============================================
function formatDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}.${m}.${y}`;
}

// =============================================
// Xatoliklarni ushlash
// =============================================
bot.catch((err) => {
  console.error("Bot error:", err);
});

// =============================================
// Ishga tushirish
// =============================================
async function main() {
  console.log("\u{1F916} Bot ishga tushmoqda...");
  console.log(`\u{1F4E1} API: ${config.apiUrl}`);
  console.log(`\u{1F310} WebApp: ${config.webAppUrl}`);
  console.log(`\u{1F4E2} Kanal: ${config.channelId}`);

  // Graceful stop
  const stopBot = () => {
    console.log("Bot to'xtatilmoqda...");
    bot.stop();
    process.exit(0);
  };
  process.once("SIGINT", stopBot);
  process.once("SIGTERM", stopBot);

  await bot.start({
    onStart: () => console.log("✅ Bot muvaffaqiyatli ishga tushdi!"),
  });
}

main().catch((err) => {
  console.error("❌ Bot ishga tushmadi:", err.message);
  process.exit(1);
});
