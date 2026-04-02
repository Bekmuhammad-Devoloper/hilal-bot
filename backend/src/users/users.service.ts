import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const BOT_TOKEN = process.env.BOT_TOKEN || "";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async register(telegramId: number, username: string, firstName: string, lastName: string, photoUrl?: string) {
    const data: any = { username, firstName, lastName };
    if (photoUrl) data.photoUrl = photoUrl;
    return this.prisma.user.upsert({
      where: { telegramId: BigInt(telegramId) },
      update: data,
      create: {
        telegramId: BigInt(telegramId),
        username,
        firstName,
        lastName,
        ...(photoUrl ? { photoUrl } : {}),
      },
    });
  }

  async findByTelegramId(telegramId: number) {
    const user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
    });
    if (!user) throw new NotFoundException("Foydalanuvchi topilmadi");
    return this.serializeUser(user);
  }

  async findAll(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { username: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          subscriptions: {
            where: { status: "active" },
            include: { plan: true },
            orderBy: { endDate: "desc" },
            take: 1,
          },
          payments: {
            where: { status: "completed" },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users: users.map((u) => ({
        ...this.serializeUser(u),
        activeSubscription: u.subscriptions[0]
          ? {
              status: u.subscriptions[0].status,
              startDate: u.subscriptions[0].startDate,
              endDate: u.subscriptions[0].endDate,
              planName: u.subscriptions[0].plan?.name || null,
            }
          : null,
        lastPaymentMethod: u.payments[0]?.method || null,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async setAdmin(userId: number, isAdmin: boolean) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isAdmin },
    });
    return this.serializeUser(user);
  }

  async blockUser(userId: number, isBlocked: boolean) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isBlocked },
    });
    return this.serializeUser(user);
  }

  async getStats() {
    const now = new Date();
    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));

    const [totalUsers, todayUsers, totalAdmins, activeSubs, totalPayments, totalRevenue] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      this.prisma.user.count({ where: { isAdmin: true } }),
      this.prisma.subscription.count({ where: { status: "active", endDate: { gt: now } } }),
      this.prisma.payment.count({ where: { status: "completed" } }),
      this.prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "completed" } }),
    ]);

    return {
      totalUsers,
      todayUsers,
      totalAdmins,
      activeSubs,
      totalPayments,
      totalRevenue: totalRevenue._sum.amount || 0,
    };
  }

  async getRecentUsers(limit = 5) {
    const users = await this.prisma.user.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
    });
    return users.map(this.serializeUser);
  }

  async getWeeklyStats() {
    const days: { date: string; users: number; payments: number; revenue: number }[] = [];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 1);
    weekEnd.setHours(0, 0, 0, 0);

    // 3 ta so'rov bilan 7 kunlik data olish (21 o'rniga 3 ta query)
    const [users, payments, revenues] = await Promise.all([
      this.prisma.user.findMany({
        where: { createdAt: { gte: weekStart, lt: weekEnd } },
        select: { createdAt: true },
      }),
      this.prisma.payment.findMany({
        where: { status: "completed", createdAt: { gte: weekStart, lt: weekEnd } },
        select: { createdAt: true, amount: true },
      }),
      Promise.resolve(null), // placeholder
    ]);

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);

      const dayUsers = users.filter(u => u.createdAt.toISOString().slice(0, 10) === dateStr).length;
      const dayPayments = payments.filter(p => p.createdAt.toISOString().slice(0, 10) === dateStr);

      days.push({
        date: dateStr,
        users: dayUsers,
        payments: dayPayments.length,
        revenue: dayPayments.reduce((sum, p) => sum + (p.amount || 0), 0),
      });
    }
    return days;
  }

  async getAllTelegramIds() {
    const users = await this.prisma.user.findMany({
      where: { isBlocked: false },
      select: { telegramId: true },
    });
    return users.map((u) => Number(u.telegramId));
  }

  // Telegram Bot API orqali user profile rasmini olish
  async fetchTelegramPhoto(telegramId: number): Promise<string | null> {
    if (!BOT_TOKEN) return null;
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/getUserProfilePhotos?user_id=${telegramId}&offset=0&limit=1`
      );
      const data = await res.json();
      if (!data.ok || !data.result?.photos?.length) return null;

      const photos = data.result.photos[0];
      const largest = photos[photos.length - 1];
      const fileRes = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${largest.file_id}`
      );
      const fileData = await fileRes.json();
      if (!fileData.ok) return null;

      return `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileData.result.file_path}`;
    } catch {
      return null;
    }
  }

  // Rasmlarini yangilash (sahifadagi userlar uchun)
  private async refreshPhotosForUsers(users: any[]) {
    const promises = users.map(async (u) => {
      try {
        const photoUrl = await this.fetchTelegramPhoto(Number(u.telegramId));
        if (photoUrl) {
          await this.prisma.user.update({
            where: { id: u.id },
            data: { photoUrl },
          });
        }
      } catch {}
    });
    await Promise.all(promises);
  }

  // Barcha userlarning rasmlarini yangilash
  async refreshAllPhotos() {
    const users = await this.prisma.user.findMany({
      select: { id: true, telegramId: true },
    });
    let updated = 0;
    for (const u of users) {
      try {
        const photoUrl = await this.fetchTelegramPhoto(Number(u.telegramId));
        if (photoUrl) {
          await this.prisma.user.update({
            where: { id: u.id },
            data: { photoUrl },
          });
          updated++;
        }
      } catch {}
    }
    return { total: users.length, updated };
  }

  // User detail (admin uchun)
  async getUserDetail(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: "desc" },
        },
        payments: {
          include: { plan: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!user) throw new NotFoundException("Foydalanuvchi topilmadi");

    const now = new Date();
    const activeSub = user.subscriptions.find(
      (s) => s.status === "active" && new Date(s.endDate) > now,
    );

    return {
      ...this.serializeUser(user),
      activeSubscription: activeSub
        ? {
            ...activeSub,
            planName: activeSub.plan?.name || null,
          }
        : null,
      subscriptions: user.subscriptions.map((s) => ({
        ...s,
        planName: s.plan?.name || null,
      })),
      payments: user.payments.map((p) => ({
        ...p,
        planName: p.plan?.name || null,
      })),
      totalPayments: user.payments.filter((p) => p.status === "completed").length,
      totalSpent: user.payments
        .filter((p) => p.status === "completed")
        .reduce((sum, p) => sum + p.amount, 0),
    };
  }

  private serializeUser(user: any) {
    return {
      ...user,
      telegramId: Number(user.telegramId),
    };
  }

  // Dashboard uchun barcha ma'lumotlarni bitta so'rov bilan olish
  private dashboardCache: { data: any; time: number } | null = null;

  async getDashboardData() {
    // 15 soniya cache
    if (this.dashboardCache && Date.now() - this.dashboardCache.time < 15000) {
      return this.dashboardCache.data;
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    // Barcha so'rovlarni PARALLEL yuborish (1 ta katta Promise.all)
    const [
      totalUsers, todayUsers, totalAdmins,
      activeSubs, totalSubs, expiredSubs, cancelledSubs,
      totalPayments, pendingPayments, completedPayments, cancelledPayments, failedPayments,
      totalRevenue, todayRevenue, todayPayments,
      recentUsers, recentPayments,
      weekUsers, weekPayments,
    ] = await Promise.all([
      // User stats
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      this.prisma.user.count({ where: { isAdmin: true } }),
      // Sub stats
      this.prisma.subscription.count({ where: { status: "active", endDate: { gt: now } } }),
      this.prisma.subscription.count(),
      this.prisma.subscription.count({ where: { status: "expired" } }),
      this.prisma.subscription.count({ where: { status: "cancelled" } }),
      // Payment stats
      this.prisma.payment.count(),
      this.prisma.payment.count({ where: { status: "pending" } }),
      this.prisma.payment.count({ where: { status: "completed" } }),
      this.prisma.payment.count({ where: { status: "cancelled" } }),
      this.prisma.payment.count({ where: { status: "failed" } }),
      this.prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "completed" } }),
      this.prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "completed", createdAt: { gte: todayStart } } }),
      this.prisma.payment.count({ where: { status: "completed", createdAt: { gte: todayStart } } }),
      // Recent data
      this.prisma.user.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
      this.prisma.payment.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { user: true, plan: true } }),
      // Weekly data (2 queries instead of 21)
      this.prisma.user.findMany({ where: { createdAt: { gte: weekStart } }, select: { createdAt: true } }),
      this.prisma.payment.findMany({ where: { status: "completed", createdAt: { gte: weekStart } }, select: { createdAt: true, amount: true } }),
    ]);

    // Weekly stats hisoblash (in-memory)
    const weekly: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
      const dUsers = weekUsers.filter((u: any) => u.createdAt.toISOString().slice(0, 10) === dateStr).length;
      const dPayments = weekPayments.filter((p: any) => p.createdAt.toISOString().slice(0, 10) === dateStr);
      weekly.push({ date: dateStr, users: dUsers, payments: dPayments.length, revenue: dPayments.reduce((s: number, p: any) => s + (p.amount || 0), 0) });
    }

    const result = {
      stats: { totalUsers, todayUsers, totalAdmins, activeSubs, totalPayments, totalRevenue: totalRevenue._sum.amount || 0 },
      subStats: { totalSubs, activeSubs, expiredSubs, cancelledSubs },
      paymentStats: { totalPayments, pending: pendingPayments, completedPayments, confirmed: completedPayments, cancelled: cancelledPayments, failed: failedPayments, totalRevenue: totalRevenue._sum.amount || 0, todayRevenue: todayRevenue._sum.amount || 0, todayPayments },
      recentPayments: recentPayments.map((p: any) => ({ ...p, user: p.user ? { ...p.user, telegramId: Number(p.user.telegramId) } : null })),
      recentUsers: recentUsers.map((u: any) => ({ ...u, telegramId: Number(u.telegramId) })),
      weekly,
    };

    this.dashboardCache = { data: result, time: Date.now() };
    return result;
  }
}
