import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import axios from "axios";

@Injectable()
export class SubscriptionService {
  constructor(private prisma: PrismaService) {}

  // Foydalanuvchining aktiv obunasini olish
  async getActiveSubscription(telegramId: number) {
    const user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
    });
    if (!user) return null;

    const now = new Date();
    return this.prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: "active",
        endDate: { gt: now },
      },
      include: { plan: true },
      orderBy: { endDate: "desc" },
    });
  }

  // Obuna yaratish (to'lovdan keyin)
  async createSubscription(telegramId: number, planId: number) {
    const user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
    });
    if (!user) throw new Error("User topilmadi");

    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new Error("Plan topilmadi");

    // Mavjud aktiv obunani tekshirish
    const existingSub = await this.getActiveSubscription(telegramId);
    const startDate = existingSub ? new Date(existingSub.endDate) : new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + plan.duration);

    const subscription = await this.prisma.subscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        status: "active",
        startDate,
        endDate,
      },
      include: { plan: true },
    });

    return subscription;
  }

  // Obunani bekor qilish
  async cancelSubscription(telegramId: number) {
    const sub = await this.getActiveSubscription(telegramId);
    if (!sub) return null;

    return this.prisma.subscription.update({
      where: { id: sub.id },
      data: { autoRenew: false, status: "cancelled" },
      include: { plan: true },
    });
  }

  // Foydalanuvchining barcha obunalari
  async getUserSubscriptions(telegramId: number) {
    const user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
    });
    if (!user) return [];

    return this.prisma.subscription.findMany({
      where: { userId: user.id },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });
  }

  // Barcha obunalar (admin uchun)
  async findAll(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [subs, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        skip,
        take: limit,
        include: { user: true, plan: true },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return {
      subscriptions: subs.map((s: any) => ({
        ...s,
        user: { ...s.user, telegramId: Number(s.user.telegramId) },
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Muddati o'tgan obunalarni tekshirish
  async checkExpiredSubscriptions() {
    const now = new Date();
    const expired = await this.prisma.subscription.findMany({
      where: {
        status: "active",
        endDate: { lt: now },
      },
      include: { user: true },
    });

    for (const sub of expired) {
      await this.prisma.subscription.update({
        where: { id: sub.id },
        data: { status: "expired" },
      });

      // Kanaldan chiqarish
      try {
        const channelId = process.env.CHANNEL_ID || "@gulomjonhoca";
        const botToken = process.env.BOT_TOKEN;
        await axios.post(`https://api.telegram.org/bot${botToken}/banChatMember`, {
          chat_id: channelId,
          user_id: Number(sub.user.telegramId),
          until_date: Math.floor(Date.now() / 1000) + 60, // 1 minut keyin unban
        });
        // Keyin unban — faqat chiqarish uchun
        setTimeout(async () => {
          try {
            await axios.post(`https://api.telegram.org/bot${botToken}/unbanChatMember`, {
              chat_id: channelId,
              user_id: Number(sub.user.telegramId),
              only_if_banned: true,
            });
          } catch (e) {}
        }, 5000);
      } catch (e) {}
    }

    return expired.length;
  }

  // Kanal invite link yaratish
  async createChannelInviteLink(telegramId: number) {
    const botToken = process.env.BOT_TOKEN;
    const channelId = process.env.CHANNEL_ID || "@gulomjonhoca";

    try {
      // Avval unban qilish (agar oldin ban bo'lgan bo'lsa)
      try {
        await axios.post(`https://api.telegram.org/bot${botToken}/unbanChatMember`, {
          chat_id: channelId,
          user_id: telegramId,
          only_if_banned: true,
        });
      } catch (e) {}

      // Invite link yaratish
      const res = await axios.post(`https://api.telegram.org/bot${botToken}/createChatInviteLink`, {
        chat_id: channelId,
        member_limit: 1,
        expire_date: Math.floor(Date.now() / 1000) + 3600, // 1 soat
        name: `User ${telegramId}`,
      });

      return res.data.result.invite_link;
    } catch (e: any) {
      console.error("Invite link error:", e?.response?.data || e.message);
      return null;
    }
  }

  // Statistikalar
  async getStats() {
    const now = new Date();
    const [totalSubs, activeSubs, expiredSubs, cancelledSubs] = await Promise.all([
      this.prisma.subscription.count(),
      this.prisma.subscription.count({ where: { status: "active", endDate: { gt: now } } }),
      this.prisma.subscription.count({ where: { status: "expired" } }),
      this.prisma.subscription.count({ where: { status: "cancelled" } }),
    ]);

    return { totalSubs, activeSubs, expiredSubs, cancelledSubs };
  }
}
