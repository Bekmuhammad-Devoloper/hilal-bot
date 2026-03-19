import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async register(telegramId: number, username: string, firstName: string, lastName: string) {
    return this.prisma.user.upsert({
      where: { telegramId: BigInt(telegramId) },
      update: { username, firstName, lastName },
      create: {
        telegramId: BigInt(telegramId),
        username,
        firstName,
        lastName,
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
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users: users.map(this.serializeUser),
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
    const totalUsers = await this.prisma.user.count();
    const todayUsers = await this.prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });
    const totalAdmins = await this.prisma.user.count({ where: { isAdmin: true } });

    const activeSubs = await this.prisma.subscription.count({
      where: { status: "active", endDate: { gt: now } },
    });
    const totalPayments = await this.prisma.payment.count({ where: { status: "completed" } });
    const totalRevenue = await this.prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "completed" },
    });

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
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);

      const [users, payments, revenue] = await Promise.all([
        this.prisma.user.count({ where: { createdAt: { gte: start, lt: end } } }),
        this.prisma.payment.count({ where: { status: "completed", createdAt: { gte: start, lt: end } } }),
        this.prisma.payment.aggregate({ _sum: { amount: true }, where: { status: "completed", createdAt: { gte: start, lt: end } } }),
      ]);

      days.push({
        date: start.toISOString().slice(0, 10),
        users,
        payments,
        revenue: revenue._sum.amount || 0,
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

  private serializeUser(user: any) {
    return {
      ...user,
      telegramId: Number(user.telegramId),
    };
  }
}
