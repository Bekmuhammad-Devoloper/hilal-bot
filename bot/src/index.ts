import { Bot, InlineKeyboard, Keyboard } from "grammy";
import { config } from "./config";
import * as api from "./api";

const bot = new Bot(config.botToken);

// Telefon kutayotgan foydalanuvchilar seti
const awaitingPhone = new Set<number>();

// Plan cache (har safar API chaqirmaslik uchun)
let cachedPlans: any[] = [];
async function loadPlans() {
  try {
    cachedPlans = await api.getPlans();
  } catch (e) {
    console.error("loadPlans error:", e);
  }
}

// =============================================
// /start - Parallel Muhit uslubidagi welcome
// =============================================
bot.command("start", async (ctx) => {
  // Royxatdan otkazish (profil rasm bilan)
  let hasPhone = true;
  try {
    let photoUrl: string | undefined;
    try {
      const photos = await ctx.api.getUserProfilePhotos(ctx.from!.id, { offset: 0, limit: 1 });
      if (photos.total_count > 0) {
        const fileId = photos.photos[0][photos.photos[0].length - 1].file_id;
        const file = await ctx.api.getFile(fileId);
        photoUrl = `https://api.telegram.org/file/bot${config.botToken}/${file.file_path}`;
      }
    } catch (e) {}
    const result = await api.registerUser(
      ctx.from!.id,
      ctx.from!.username || "",
      ctx.from!.first_name || "",
      ctx.from!.last_name || "",
      photoUrl,
    );
    if (result && !result.phone) {
      hasPhone = false;
    }
  } catch (e) {}

  // Aktiv obunani tekshirish
  let sub: any = null;
  try {
    sub = await api.getActiveSubscription(ctx.from!.id);
  } catch (e) {
    console.error("getActiveSubscription error:", e);
  }

  // Obuna narxlarini olish
  let plansText = "";
  try {
    const plans = await api.getPlans();
    if (plans && plans.length > 0) {
      plansText = "\n💰 Obuna rejalari:\n";
      for (const plan of plans) {
        const price = Number(plan.price).toLocaleString("uz-UZ");
        plansText += `  • ${plan.name} — ${price} so'm (${plan.duration} kun)\n`;
      }
    }
  } catch (e) {}

  // Aktiv obuna bor bo'lsa — kanal linki bilan ko'rsat
  if (sub && sub.endDate) {
    const endDate = new Date(sub.endDate);
    const now = new Date();

    if (!isNaN(endDate.getTime())) {
      const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

      const keyboard = new InlineKeyboard()
        .webApp("📱 Ishga tushirish", `${config.webAppUrl}/app?user=${ctx.from!.id}`)
        .row()
        .url("📢 Kanalga o'tish", `https://t.me/${config.channelId.replace("@", "")}`);

      await ctx.reply(
        `✅ Sizning obunangiz faol!\n\n` +
        `📅 Obuna tugash sanasi: ${formatDate(endDate)}\n` +
        `⏳ Qolgan kunlar: ${daysLeft} kun\n` +
        plansText +
        `\nMaxsus kontentlarimiz siz uchun ochiq ⚡`,
        { reply_markup: keyboard },
      );
      return;
    }
  }

  // Obuna yo'q — har doim asosiy menyu (telefon bor-yo'qligi muhim emas)
  // Telefon yo'q bo'lsa, kontaktni so'raymiz lekin obuna sahifasi BLOKLANMAYDI
  const keyboard = new InlineKeyboard()
    .text("💳 Obuna sotib olish", "show_plans")
    .row()
    .webApp("📱 Mini-ilova", `${config.webAppUrl}/app?user=${ctx.from!.id}`)
    .row()
    .url("📜 Oferta", `${config.webAppUrl}/oferta`)
    .text("🆘 Yordam", "help_menu");

  await ctx.reply(
    `Hilal Edu ga xush kelibsiz! 👋\n\n` +
    `Bu yerda sizni:\n` +
    `⚡ Rivojlantiradigan muhit\n` +
    `✍ Takrorlanmas kontent\n` +
    `🗣 Ilm suhbatlari kutmoqda!\n` +
    plansText +
    `\nObuna sotib olish uchun "💳 Obuna sotib olish" tugmasini bosing 👇`,
    { reply_markup: keyboard },
  );

  // Agar telefon raqami yo'q bo'lsa — alohida xabar bilan kontaktni so'raymiz (ixtiyoriy)
  if (!hasPhone) {
    awaitingPhone.add(ctx.from!.id);
    const phoneKb = new Keyboard()
      .requestContact("📱 Telefon raqamni ulashish")
      .resized()
      .oneTime();
    try {
      await ctx.reply(
        `ℹ️ Telefon raqamingizni qo'shsangiz, to'lov va qo'llab-quvvatlash xizmatlari yanada qulay bo'ladi.\n\n` +
        `Bu ixtiyoriy — obuna sotib olish uchun shart emas.`,
        { reply_markup: phoneKb },
      );
    } catch (e) {}
  }
});

// =============================================
// Kontakt (telefon raqam) handler
// =============================================
bot.on("message:contact", async (ctx) => {
  const userId = ctx.from!.id;

  if (!awaitingPhone.has(userId)) return;
  awaitingPhone.delete(userId);

  const phone = ctx.message.contact.phone_number;

  // Telefon raqamni backendga saqlash
  try {
    await api.updatePhone(userId, phone);
  } catch (e) {
    console.error("updatePhone error:", e);
  }

  // Obuna narxlarini olish
  let plansText = "";
  try {
    const plans = await api.getPlans();
    if (plans && plans.length > 0) {
      plansText = "\n💰 Obuna rejalari:\n";
      for (const plan of plans) {
        const price = Number(plan.price).toLocaleString("uz-UZ");
        plansText += `  • ${plan.name} — ${price} so'm (${plan.duration} kun)\n`;
      }
    }
  } catch (e) {}

  const keyboard = new InlineKeyboard()
    .text("💳 Obuna sotib olish", "show_plans")
    .row()
    .webApp("📱 Mini-ilova", `${config.webAppUrl}/app?user=${userId}`)
    .row()
    .url("📜 Oferta", `${config.webAppUrl}/oferta`)
    .text("🆘 Yordam", "help_menu");

  await ctx.reply(
    `✅ Ro'yxatdan o'tish muvaffaqiyatli!\n\n` +
    `📞 Telefon: ${phone}\n` +
    `Bu yerda sizni:\n` +
    `⚡ Rivojlantiradigan muhit\n` +
    `✍ Takrorlanmas kontent\n` +
    `🗣 Ilm suhbatlari kutmoqda!\n` +
    plansText +
    `\nObuna sotib olish uchun "💳 Obuna sotib olish" tugmasini bosing 👇`,
    { reply_markup: keyboard },
  );
});

// =============================================
// /pay - To'lov (plan tanlash)
// =============================================
bot.command("pay", async (ctx) => {
  await showPlanSelection(ctx);
});

async function showPlanSelection(ctx: any) {
  try {
    const plans = await api.getPlans();
    if (!plans || plans.length === 0) {
      await ctx.reply("❌ Hozircha obuna rejalari mavjud emas.");
      return;
    }

    const keyboard = new InlineKeyboard();
    for (const plan of plans) {
      const price = Number(plan.price).toLocaleString("uz-UZ");
      keyboard.text(`${plan.name} — ${price} so'm`, `buy_plan_${plan.id}`).row();
    }

    await ctx.reply(
      `💳 Obuna rejasini tanlang:\n\n` +
      `To'lov Telegram ichida (Payme yoki Click) xavfsiz amalga oshiriladi.\n` +
      `Karta ma'lumotlaringizni Telegram himoya qiladi 🔒\n\n` +
      `📜 Davom etish orqali siz Ommaviy Oferta (${config.webAppUrl}/oferta) shartlarini qabul qilasiz.`,
      { reply_markup: keyboard },
    );
  } catch (e) {
    console.error("showPlanSelection error:", e);
    await ctx.reply("❌ Xatolik yuz berdi. Qayta urinib ko'ring.");
  }
}

// =============================================
// /oferta - Oferta sahifasi
// =============================================
bot.command("oferta", async (ctx) => {
  const keyboard = new InlineKeyboard()
    .url("📜 Oferta bilan tanishish", `${config.webAppUrl}/oferta`);

  await ctx.reply(
    `📜 Ommaviy oferta\n\n` +
    `Hilal Edu xizmat ko'rsatish shartlari va to'lov tartibi haqida to'liq ma'lumot:\n\n` +
    `• Obuna narxlari\n` +
    `• To'lov usullari (Payme, Click)\n` +
    `• Bekor qilish va pul qaytarish\n` +
    `• Mualliflik huquqi\n\n` +
    `Batafsil o'qish uchun quyidagi tugmani bosing 👇`,
    { reply_markup: keyboard },
  );
});

// =============================================
// /terms - Xizmat shartlari (Telegram Payments LIVE uchun shart)
// =============================================
bot.command("terms", async (ctx) => {
  const keyboard = new InlineKeyboard()
    .url("📜 To'liq shartlar", `${config.webAppUrl}/oferta`);

  await ctx.reply(
    `📜 Xizmat ko'rsatish shartlari\n\n` +
    `1. Hilal Edu — ta'lim kontentiga obuna xizmati\n` +
    `2. To'lov Click orqali amalga oshiriladi\n` +
    `3. Obuna muddati tugagach, kanalga kirish cheklanadi\n` +
    `4. Pul qaytarish oferta shartlariga muvofiq\n` +
    `5. Kontentdan nusxa ko'chirish taqiqlanadi\n\n` +
    `To'liq ma'lumot uchun quyidagi tugmani bosing 👇`,
    { reply_markup: keyboard },
  );
});

// =============================================
// /support - Qo'llab-quvvatlash (Telegram Payments LIVE uchun shart)
// =============================================
bot.command("support", async (ctx) => {
  await ctx.reply(
    `🆘 Qo'llab-quvvatlash\n\n` +
    `Savollaringiz yoki muammolaringiz bo'lsa:\n\n` +
    `📧 Email: hilaledu.uz@gmail.com\n` +
    `📞 Telefon: +998 90 123 45 67\n` +
    `💬 Admin: @hilaledu_admin\n\n` +
    `Ish vaqti: 09:00 — 18:00 (dushanba-juma)\n` +
    `Javob berish muddati: 24 soat ichida`,
  );
});

// =============================================
// /admin - Admin panel kirish
// =============================================
bot.command("admin", async (ctx) => {
  if (!config.adminIds.includes(ctx.from!.id)) {
    await ctx.reply("❌ Sizda admin huquqi yo'q!");
    return;
  }

  try {
    const result = await api.generateAuthCode(ctx.from!.id);
    const loginUrl = `${config.webAppUrl}/auth?code=${result.code}`;

    const keyboard = new InlineKeyboard()
      .url("🔐 Admin panelga kirish", loginUrl);

    await ctx.reply(
      `🔐 Admin Panel\n\n` +
      `Quyidagi tugmani bosib admin panelga kiring.\n` +
      `⏰ Havola 5 daqiqa amal qiladi.\n\n` +
      `⚠️ Bu havolani boshqalarga bermang!`,
      { reply_markup: keyboard },
    );
  } catch (e: any) {
    await ctx.reply("❌ Xatolik yuz berdi!");
  }
});

// =============================================
// /status - Obuna holati
// =============================================
bot.command("status", async (ctx) => {
  let sub: any = null;
  try {
    sub = await api.getActiveSubscription(ctx.from!.id);
  } catch (e) {
    console.error("getActiveSubscription error:", e);
  }

  if (!sub || !sub.endDate) {
    const keyboard = new InlineKeyboard()
      .text("💳 Obuna sotib olish", "show_plans")
      .row()
      .webApp("📱 Ishga tushirish", `${config.webAppUrl}/app?user=${ctx.from!.id}`);

    await ctx.reply(
      `❌ Sizda aktiv obuna yo'q.\n\n` +
      `Obuna bo'lish uchun quyidagi tugmani bosing:`,
      { reply_markup: keyboard },
    );
    return;
  }

  const endDate = new Date(sub.endDate);
  const now = new Date();

  // endDate validligini tekshirish
  if (isNaN(endDate.getTime())) {
    const keyboard = new InlineKeyboard()
      .text("💳 Obuna sotib olish", "show_plans")
      .row()
      .webApp("📱 Ishga tushirish", `${config.webAppUrl}/app?user=${ctx.from!.id}`);

    await ctx.reply(
      `❌ Obuna ma'lumotlarida xatolik.\n\n` +
      `Iltimos, qaytadan obuna bo'ling:`,
      { reply_markup: keyboard },
    );
    return;
  }

  const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  const keyboard = new InlineKeyboard()
    .webApp("📱 Boshqarish", `${config.webAppUrl}/app?user=${ctx.from!.id}`)
    .row()
    .url("📢 Kanalga o'tish", `https://t.me/${config.channelId.replace("@", "")}`);

  await ctx.reply(
    `📊 Obuna holati\n\n` +
    `✅ Status: Faol\n` +
    `📅 Tugash sanasi: ${formatDate(endDate)}\n` +
    `⏳ Qolgan kunlar: ${daysLeft} kun\n` +
    `📋 Reja: ${sub.plan?.name || "Standart"}`,
    { reply_markup: keyboard },
  );
});

// =============================================
// /help
// =============================================
bot.command("help", async (ctx) => {
  await ctx.reply(
    `📋 Buyruqlar:\n\n` +
    `/start — Botni boshlash\n` +
    `/pay — Obuna sotib olish\n` +
    `/status — Obuna holati\n` +
    `/oferta — Xizmat shartlari\n` +
    `/terms — Foydalanish shartlari\n` +
    `/support — Qo'llab-quvvatlash\n` +
    `/help — Yordam\n\n` +
    `Savollaringiz bo'lsa, /support buyrug'ini yuboring.`,
  );
});

// =============================================
// Callback queries
// =============================================
bot.on("callback_query:data", async (ctx) => {
  const data = ctx.callbackQuery.data;

  // Plan tanlash — plan ro'yxatini ko'rsat
  if (data === "show_plans") {
    await ctx.answerCallbackQuery();
    await showPlanSelection(ctx);
    return;
  }

  // Yordam menyusi
  if (data === "help_menu") {
    await ctx.answerCallbackQuery();
    const kb = new InlineKeyboard()
      .url("📜 Oferta", `${config.webAppUrl}/oferta`)
      .row()
      .url("💬 Aloqa", "https://t.me/HilalEdu");
    await ctx.reply(
      `🆘 Qo'llab-quvvatlash\n\n` +
      `📋 Buyruqlar:\n` +
      `/start — Botni boshlash\n` +
      `/pay — Obuna sotib olish\n` +
      `/status — Obuna holati\n` +
      `/oferta — Xizmat shartlari\n` +
      `/support — Qo'llab-quvvatlash\n\n` +
      `📧 Email: hilol.edu@gmail.com\n` +
      `💬 Telegram: @HilalEdu`,
      { reply_markup: kb },
    );
    return;
  }

  // Plan sotib olish — Invoice yuborish
  if (data.startsWith("buy_plan_")) {
    await ctx.answerCallbackQuery();

    const planId = parseInt(data.replace("buy_plan_", ""));
    if (isNaN(planId)) {
      await ctx.reply("❌ Noto'g'ri reja.");
      return;
    }

    try {
      const plans = await api.getPlans();
      const plan = plans.find((p: any) => p.id === planId);
      if (!plan) {
        await ctx.reply("❌ Reja topilmadi.");
        return;
      }

      // Provider token tekshirish
      if (!config.clickProviderToken) {
        await ctx.reply(
          "❌ To'lov tizimi hali sozlanmagan.\n\n" +
          "Admin bilan bog'laning: /support"
        );
        console.error("CLICK_PROVIDER_TOKEN is not set!");
        return;
      }

      // Telegram Invoice yuborish
      // UZS uchun amount = real summa (exp=0 chunki UZS)
      // Masalan 67000 so'm = 6700000 (Telegram eng kichik birlik: tiyin, 1 so'm = 100 tiyin)
      const payload = JSON.stringify({
        planId: plan.id,
        telegramId: ctx.from!.id,
        planName: plan.name,
      });

      const prices = [{ label: plan.name, amount: plan.price * 100 }]; // UZS tiyin

      await ctx.api.sendInvoice(
        ctx.from!.id,
        `${plan.name} — Hilal Edu obuna`, // title
        `${plan.name} (${plan.duration} kun) — Hilal Edu ta'lim platformasi obunasi. To'lovdan keyin maxsus kanalga kirish huquqi ochiladi.`, // description
        payload, // payload
        "UZS", // currency
        prices, // prices
        {
          provider_token: config.clickProviderToken,
          need_phone_number: true,
          need_name: false,
          need_email: false,
          need_shipping_address: false,
          is_flexible: false,
          start_parameter: `plan_${plan.id}`,
          photo_url: "https://hilal-bot.bekmuhammad.uz/logo.png",
          photo_width: 512,
          photo_height: 512,
        },
      );
    } catch (e: any) {
      console.error("sendInvoice error:", e);
      await ctx.reply("❌ To'lov yaratishda xatolik. Qayta urinib ko'ring.");
    }
    return;
  }

  if (data === "check_sub") {
    let sub: any = null;
    try {
      sub = await api.getActiveSubscription(ctx.from!.id);
    } catch (e) {}

    if (sub) {
      await ctx.answerCallbackQuery({ text: "✅ Obunangiz faol!" });
      const keyboard = new InlineKeyboard()
        .url("📢 Kanalga o'tish", `https://t.me/${config.channelId.replace("@", "")}`);
      await ctx.reply("✅ Obunangiz tasdiqlandi! Kanalga kirishingiz mumkin.", {
        reply_markup: keyboard,
      });
    } else {
      await ctx.answerCallbackQuery({
        text: "❌ Obuna topilmadi. Avval to'lov qiling.",
        show_alert: true,
      });
    }
    return;
  }

  await ctx.answerCallbackQuery();
});

// =============================================
// 🔥 TELEGRAM PAYMENTS: Pre-checkout query
// 10 soniya ichida javob berish SHART!
// =============================================
bot.on("pre_checkout_query", async (ctx) => {
  try {
    console.log("[Payment] pre_checkout_query:", JSON.stringify(ctx.preCheckoutQuery));

    // Payload ni tekshirish
    const payload = JSON.parse(ctx.preCheckoutQuery.invoice_payload);
    const planId = payload.planId;
    const telegramId = payload.telegramId;

    // Plan mavjudligini tekshirish
    const plans = await api.getPlans();
    const plan = plans.find((p: any) => p.id === planId);

    if (!plan) {
      await ctx.answerPreCheckoutQuery(false, {
        error_message: "Reja topilmadi. Iltimos, qayta urinib ko'ring.",
      });
      return;
    }

    // Narx mosligini tekshirish
    const expectedAmount = plan.price * 100; // tiyin
    if (ctx.preCheckoutQuery.total_amount !== expectedAmount) {
      await ctx.answerPreCheckoutQuery(false, {
        error_message: "Narx o'zgardi. Iltimos, qayta urinib ko'ring.",
      });
      return;
    }

    // Hammasi OK — to'lovni tasdiqlash
    await ctx.answerPreCheckoutQuery(true);
    console.log(`[Payment] pre_checkout approved for user ${telegramId}, plan ${planId}`);
  } catch (e: any) {
    console.error("[Payment] pre_checkout error:", e);
    // Xatolik bo'lsa ham TEZDA javob berish kerak
    try {
      await ctx.answerPreCheckoutQuery(false, {
        error_message: "Xatolik yuz berdi. Iltimos, qayta urinib ko'ring.",
      });
    } catch (e2) {
      console.error("[Payment] Failed to answer pre_checkout:", e2);
    }
  }
});

// =============================================
// 🔥 TELEGRAM PAYMENTS: Muvaffaqiyatli to'lov
// =============================================
bot.on("message:successful_payment", async (ctx) => {
  try {
    const payment = ctx.message!.successful_payment!;
    console.log("[Payment] successful_payment:", JSON.stringify(payment));

    const payload = JSON.parse(payment.invoice_payload);
    const planId = payload.planId;
    const telegramId = ctx.from!.id;

    // Summani so'mga aylantirish (tiyin -> so'm)
    const amountSom = Math.round(payment.total_amount / 100);

    // Backend ga to'lovni tasdiqlash
    const result = await api.confirmTelegramPayment(
      telegramId,
      planId,
      amountSom,
      payment.currency,
      payment.telegram_payment_charge_id,
      payment.provider_payment_charge_id,
    );

    console.log(`[Payment] confirmed for user ${telegramId}, plan ${planId}`);

    // Foydalanuvchiga muvaffaqiyat xabarini yuborish
    const sub = result.subscription;
    const inviteLink = result.inviteLink;
    const endDate = sub ? new Date(sub.endDate) : null;

    const keyboard = new InlineKeyboard();
    if (inviteLink) {
      keyboard.url("🔗 Kanalga kirish", inviteLink).row();
    }
    keyboard.url("📢 Kanalga o'tish", `https://t.me/${config.channelId.replace("@", "")}`);

    await ctx.reply(
      `🎉 To'lov muvaffaqiyatli!\n\n` +
      `💰 Summa: ${amountSom.toLocaleString("uz-UZ")} so'm\n` +
      `📋 Reja: ${payload.planName || "Obuna"}\n` +
      (endDate ? `📅 Obuna tugash sanasi: ${formatDate(endDate)}\n` : "") +
      `\nMaxsus kontentlarimiz siz uchun ochiq ⚡\n` +
      `Hoziroq kirish uchun pastdagi tugmani bosing 👇`,
      { reply_markup: keyboard },
    );

    // Welcome xabar
    setTimeout(async () => {
      try {
        const kb = new InlineKeyboard()
          .url("📢 Kanalga o'tish", `https://t.me/${config.channelId.replace("@", "")}`);
        await ctx.reply(
          `Oson Turk Tiliga xush kelibsiz!\nEndi siz ham bizning bir qismimiz 🥳`,
          { reply_markup: kb },
        );
      } catch (e) {}
    }, 2000);
  } catch (e: any) {
    console.error("[Payment] successful_payment processing error:", e);
    await ctx.reply(
      `💳 To'lov qabul qilindi!\n\n` +
      `Obunangiz yaqin vaqt ichida faollashadi.\n` +
      `Agar muammo bo'lsa: /support`,
    );
  }
});

// =============================================
// Web App data (tolov natijasi)
// =============================================
bot.on("message:web_app_data", async (ctx) => {
  try {
    const data = JSON.parse(ctx.message!.web_app_data!.data);

    if (data.action === "payment_created") {
      const keyboard = new InlineKeyboard()
        .webApp("📱 Ilovaga qaytish", `${config.webAppUrl}/app?user=${ctx.from!.id}`);

      await ctx.reply(
        `💳 To'lov so'rovi yaratildi!\n\n` +
        `💰 Summa: ${data.amount || "?"} so'm\n` +
        `📝 To'lov raqami: #${data.paymentId || "?"}\n\n` +
        `Admin tekshirgandan keyin obunangiz faollashadi.\n` +
        `✅ Obuna faollashganda sizga xabar yuboramiz!`,
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
          keyboard.url("🔗 Kanalga kirish", inviteLink).row();
        }
        keyboard.url("📢 Kanalga o'tish", `https://t.me/${config.channelId.replace("@", "")}`);

        await ctx.reply(
          `💳 To'lov tasdiqlandi!\n\n` +
          `Keyingi obuna ${formatDate(endDate)} sanasida tugaydi\n\n` +
          `Maxsus kontentlarimiz siz uchun ochiq ⚡\n` +
          `Hoziroq kirish uchun pastdagi tugmani bosing`,
          { reply_markup: keyboard },
        );

        setTimeout(async () => {
          try {
            const kb = new InlineKeyboard()
              .url("📢 Kanalga o'tish", `https://t.me/${config.channelId.replace("@", "")}`);
            await ctx.reply(
              `Oson Turk Tiliga xush kelibsiz!\nEndi siz ham bizning bir qismimiz 🥳`,
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
  console.log("🤖 Bot ishga tushmoqda...");
  console.log(`📡 API: ${config.apiUrl}`);
  console.log(`🌐 WebApp: ${config.webAppUrl}`);
  console.log(`📢 Kanal: ${config.channelId}`);
  console.log(`💳 Click Provider: ${config.clickProviderToken ? "✅ sozlangan" : "❌ sozlanmagan"}`);

  // Plan cache yuklash
  await loadPlans();

  // Graceful stop
  const stopBot = () => {
    console.log("Bot to'xtatilmoqda...");
    bot.stop();
    process.exit(0);
  };
  process.once("SIGINT", stopBot);
  process.once("SIGTERM", stopBot);

  // Menu button sozlash
  try {
    await bot.api.setChatMenuButton({
      menu_button: {
        type: "web_app",
        text: "Hilal Edu",
        web_app: { url: `${config.webAppUrl}/app` },
      },
    });
  } catch (e) {}

  // Bot buyruqlarini sozlash
  try {
    await bot.api.setMyCommands([
      { command: "start", description: "Botni boshlash" },
      { command: "pay", description: "Obuna sotib olish" },
      { command: "status", description: "Obuna holati" },
      { command: "oferta", description: "Xizmat shartlari" },
      { command: "terms", description: "Foydalanish shartlari" },
      { command: "support", description: "Qo'llab-quvvatlash" },
      { command: "help", description: "Yordam" },
    ]);
  } catch (e) {}

  await bot.start({
    onStart: () => console.log("✅ Bot muvaffaqiyatli ishga tushdi!"),
  });
}

main().catch((err) => {
  console.error("❌ Bot ishga tushmadi:", err.message);
  process.exit(1);
});
