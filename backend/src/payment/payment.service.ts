import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SubscriptionService } from "../subscription/subscription.service";
import axios from "axios";
import * as crypto from "crypto";

const CLICK_API = "https://api.click.uz/v2/merchant";

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private subService: SubscriptionService,
  ) {}

  // Click API uchun Auth header yaratish
  private getClickAuthHeader(): string {
    const merchantUserId = process.env.CLICK_MERCHANT_USER_ID || "81357";
    const secretKey = process.env.CLICK_SECRET_KEY || "SblP2wgqqjQ6ek";
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const digest = crypto.createHash("sha1").update(timestamp + secretKey).digest("hex");
    return `${merchantUserId}:${digest}:${timestamp}`;
  }

  private get serviceId(): number {
    return parseInt(process.env.CLICK_SERVICE_ID || "99386");
  }

  // 1-qadam: Karta token so'rash (SMS yuboriladi)
  async createCardToken(cardNumber: string, expireDate: string) {
    try {
      const res = await axios.post(
        `${CLICK_API}/card_token/request`,
        {
          service_id: this.serviceId,
          card_number: cardNumber.replace(/\s/g, ""),
          expire_date: expireDate, // MMYY format
          temporary: 1,
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Auth: this.getClickAuthHeader(),
          },
        },
      );

      console.log("[Click] card_token/request response:", JSON.stringify(res.data));

      if (res.data.error_code !== 0) {
        throw new Error(res.data.error_note || "Karta tokenizatsiya xatolik");
      }

      return {
        card_token: res.data.card_token,
        phone_number: res.data.phone_number,
      };
    } catch (e: any) {
      console.error("[Click] card_token/request error:", e?.response?.data || e.message);
      throw new Error(e?.response?.data?.error_note || e.message || "Click bilan bog'lanishda xatolik");
    }
  }

  // 2-qadam: SMS kodni tasdiqlash
  async verifyCardToken(cardToken: string, smsCode: string) {
    try {
      const res = await axios.post(
        `${CLICK_API}/card_token/verify`,
        {
          service_id: this.serviceId,
          card_token: cardToken,
          sms_code: smsCode,
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Auth: this.getClickAuthHeader(),
          },
        },
      );

      console.log("[Click] card_token/verify response:", JSON.stringify(res.data));

      if (res.data.error_code !== 0) {
        throw new Error(res.data.error_note || "SMS tasdiqlash xatolik");
      }

      return {
        confirmed: true,
        card_number: res.data.card_number, // masked: "8600 55** **** 3244"
      };
    } catch (e: any) {
      console.error("[Click] card_token/verify error:", e?.response?.data || e.message);
      throw new Error(e?.response?.data?.error_note || e.message || "SMS tasdiqlashda xatolik");
    }
  }

  // 3-qadam: Token orqali to'lov
  async payWithToken(cardToken: string, amount: number, merchantTransId: string) {
    try {
      const res = await axios.post(
        `${CLICK_API}/card_token/payment`,
        {
          service_id: this.serviceId,
          card_token: cardToken,
          amount: amount,
          transaction_parameter: merchantTransId,
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Auth: this.getClickAuthHeader(),
          },
        },
      );

      console.log("[Click] card_token/payment response:", JSON.stringify(res.data));

      if (res.data.error_code !== 0) {
        throw new Error(res.data.error_note || "To'lov amalga oshmadi");
      }

      return {
        payment_id: res.data.payment_id,
        payment_status: res.data.payment_status,
      };
    } catch (e: any) {
      console.error("[Click] card_token/payment error:", e?.response?.data || e.message);
      throw new Error(e?.response?.data?.error_note || e.message || "To'lovda xatolik");
    }
  }

  // To'lov yaratish (DB ga yozish)
  async createPayment(telegramId: number, planId: number, method: string = "click") {
    const user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
    });
    if (!user) throw new Error("User topilmadi");

    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new Error("Plan topilmadi");

    const payment = await this.prisma.payment.create({
      data: {
        userId: user.id,
        planId: plan.id,
        amount: plan.price,
        method,
        status: "pending",
      },
      include: { plan: true },
    });

    return payment;
  }

  // Click to'lovni yakunlash (token orqali real to'lov + obuna)
  async completeClickPayment(paymentId: number, cardToken: string, cardLast4: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { user: true, plan: true },
    });
    if (!payment) throw new Error("Payment topilmadi");

    // Click orqali haqiqiy to'lov
    const merchantTransId = `hilal-${paymentId}-${Date.now()}`;
    const clickResult = await this.payWithToken(cardToken, payment.amount, merchantTransId);

    // DB ni yangilash
    const updatedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "completed",
        cardLast4: cardLast4 || "****",
        transactionId: String(clickResult.payment_id),
      },
      include: { user: true, plan: true },
    });

    // Obuna yaratish
    const subscription = await this.subService.createSubscription(
      Number(updatedPayment.user.telegramId),
      updatedPayment.planId,
    );

    // Kanal invite link
    const inviteLink = await this.subService.createChannelInviteLink(
      Number(updatedPayment.user.telegramId),
    );

    // Foydalanuvchiga xabar yuborish
    this.notifyUser(updatedPayment, subscription, inviteLink, cardLast4);

    return { payment: updatedPayment, subscription, inviteLink };
  }

  // Eski confirmPayment (fallback)
  async confirmPayment(paymentId: number, cardLast4?: string, transactionId?: string) {
    const payment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "completed",
        cardLast4: cardLast4 || "0001",
        transactionId: transactionId || `TXN-${Date.now()}`,
      },
      include: { user: true, plan: true },
    });

    // Obuna yaratish
    const subscription = await this.subService.createSubscription(
      Number(payment.user.telegramId),
      payment.planId,
    );

    // Kanal invite link
    const inviteLink = await this.subService.createChannelInviteLink(
      Number(payment.user.telegramId),
    );

    // Foydalanuvchiga xabar yuborish
    this.notifyUser(payment, subscription, inviteLink, cardLast4);

    return { payment, subscription, inviteLink };
  }

  // Foydalanuvchiga TG xabar yuborish
  private async notifyUser(payment: any, subscription: any, inviteLink: string | null, cardLast4?: string) {
    try {
      const botToken = process.env.BOT_TOKEN;
      const endDate = new Date(subscription.endDate);
      const formattedDate = `${String(endDate.getDate()).padStart(2, "0")}.${String(endDate.getMonth() + 1).padStart(2, "0")}.${endDate.getFullYear()}`;

      let message =
        `💳 To'lov ****${cardLast4 || "0001"} kartasidan yechildi.\n\n` +
        `Keyingi obuna ${formattedDate} sanasida yechiladi\n\n` +
        `Maxsus kontentlarimiz siz uchun ochiq ⚡\n` +
        `Hoziroq kirish uchun pastdagi tugmani bosing`;

      const keyboard: any = {
        inline_keyboard: [],
      };

      if (inviteLink) {
        keyboard.inline_keyboard.push([{ text: "Kanalga kirish", url: inviteLink }]);
      }

      await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        chat_id: Number(payment.user.telegramId),
        text: message,
        reply_markup: keyboard,
      });

      // Welcome xabar
      if (inviteLink) {
        setTimeout(async () => {
          try {
            await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
              chat_id: Number(payment.user.telegramId),
              text: `Oson Turk Tiliga xush kelibsiz!\nEndi siz ham bizning bir qismimiz 🥳`,
              reply_markup: {
                inline_keyboard: [
                  [{ text: "Kanalga o'tish", url: `https://t.me/${(process.env.CHANNEL_ID || "@gulomjonhoca").replace("@", "")}` }],
                ],
              },
            });
          } catch (e) {}
        }, 2000);
      }
    } catch (e: any) {
      console.error("Notify error:", e?.response?.data || e.message);
    }
  }

  // To'lovni bekor qilish
  async cancelPayment(paymentId: number) {
    return this.prisma.payment.update({
      where: { id: paymentId },
      data: { status: "cancelled" },
    });
  }

  // Foydalanuvchining to'lovlari
  async getUserPayments(telegramId: number) {
    const user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
    });
    if (!user) return [];

    return this.prisma.payment.findMany({
      where: { userId: user.id },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });
  }

  // Barcha to'lovlar (admin)
  async findAll(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        include: { user: true, plan: true },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      payments: payments.map((p: any) => ({
        ...p,
        user: { ...p.user, telegramId: Number(p.user.telegramId) },
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Statistikalar
  async getStats() {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    const [totalPayments, pendingPayments, completedPayments, cancelledPayments, failedPayments, totalRevenue, todayRevenue, todayPayments] = await Promise.all([
      this.prisma.payment.count(),
      this.prisma.payment.count({ where: { status: "pending" } }),
      this.prisma.payment.count({ where: { status: "completed" } }),
      this.prisma.payment.count({ where: { status: "cancelled" } }),
      this.prisma.payment.count({ where: { status: "failed" } }),
      this.prisma.payment.aggregate({
        where: { status: "completed" },
        _sum: { amount: true },
      }),
      this.prisma.payment.aggregate({
        where: { status: "completed", createdAt: { gte: todayStart } },
        _sum: { amount: true },
      }),
      this.prisma.payment.count({
        where: { status: "completed", createdAt: { gte: todayStart } },
      }),
    ]);

    return {
      totalPayments,
      pending: pendingPayments,
      completedPayments,
      confirmed: completedPayments,
      cancelled: cancelledPayments,
      failed: failedPayments,
      totalRevenue: totalRevenue._sum.amount || 0,
      todayRevenue: todayRevenue._sum.amount || 0,
      todayPayments,
    };
  }

  async getRecentPayments(limit = 5) {
    const payments = await this.prisma.payment.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { user: true, plan: true },
    });
    return payments.map((p) => ({
      ...p,
      user: p.user ? { ...p.user, telegramId: Number(p.user.telegramId) } : null,
    }));
  }
}
