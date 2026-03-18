import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SubscriptionService } from "../subscription/subscription.service";
import axios from "axios";

@Injectable()
export class PaymentService {
  constructor(
    private prisma: PrismaService,
    private subService: SubscriptionService,
  ) {}

  // To'lov yaratish
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

  // To'lovni tasdiqlash (simulyatsiya — haqiqiy Click integratsiya keyinroq)
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

    return { payment, subscription, inviteLink };
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
    const [totalPayments, pendingPayments, completedPayments, cancelledPayments, failedPayments, totalRevenue] = await Promise.all([
      this.prisma.payment.count(),
      this.prisma.payment.count({ where: { status: "pending" } }),
      this.prisma.payment.count({ where: { status: "completed" } }),
      this.prisma.payment.count({ where: { status: "cancelled" } }),
      this.prisma.payment.count({ where: { status: "failed" } }),
      this.prisma.payment.aggregate({
        where: { status: "completed" },
        _sum: { amount: true },
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
    };
  }
}
