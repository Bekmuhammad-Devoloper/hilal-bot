import { Controller, Get, Post, Param, Query, Body } from "@nestjs/common";
import { SubscriptionService } from "./subscription.service";

@Controller("subscriptions")
export class SubscriptionController {
  constructor(private subService: SubscriptionService) {}

  // Foydalanuvchining aktiv obunasi
  @Get("active/:telegramId")
  async getActive(@Param("telegramId") telegramId: string) {
    const sub = await this.subService.getActiveSubscription(parseInt(telegramId));
    if (!sub) return { active: false };
    
    // Sanalarni ISO string formatida qaytarish (NaN oldini olish)
    return {
      ...sub,
      startDate: sub.startDate instanceof Date ? sub.startDate.toISOString() : sub.startDate,
      endDate: sub.endDate instanceof Date ? sub.endDate.toISOString() : sub.endDate,
      createdAt: sub.createdAt instanceof Date ? sub.createdAt.toISOString() : sub.createdAt,
      updatedAt: sub.updatedAt instanceof Date ? sub.updatedAt.toISOString() : sub.updatedAt,
    };
  }

  // Foydalanuvchining barcha obunalari
  @Get("user/:telegramId")
  async getUserSubs(@Param("telegramId") telegramId: string) {
    return this.subService.getUserSubscriptions(parseInt(telegramId));
  }

  // Obuna yaratish
  @Post("create")
  async create(@Body() body: { telegramId: number; planId: number }) {
    return this.subService.createSubscription(body.telegramId, body.planId);
  }

  // Admin: sovg'a obuna berish (to'lovsiz)
  @Post("gift")
  async giftSubscription(@Body() body: { telegramId: number; planId: number }) {
    const subscription = await this.subService.createSubscription(body.telegramId, body.planId);
    // Kanal invite link ham yaratish
    const inviteLink = await this.subService.createChannelInviteLink(body.telegramId);
    return { subscription, inviteLink };
  }

  // Obunani bekor qilish
  @Post("cancel/:telegramId")
  async cancel(@Param("telegramId") telegramId: string) {
    return this.subService.cancelSubscription(parseInt(telegramId));
  }

  // Kanal invite link
  @Get("invite/:telegramId")
  async getInviteLink(@Param("telegramId") telegramId: string) {
    const link = await this.subService.createChannelInviteLink(parseInt(telegramId));
    return { inviteLink: link };
  }

  // Muddati o'tganlarni tekshirish
  @Post("check-expired")
  async checkExpired() {
    const count = await this.subService.checkExpiredSubscriptions();
    return { expiredCount: count };
  }

  // Admin: barcha obunalar
  @Get()
  async findAll(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("status") status?: string,
  ) {
    return this.subService.findAll(
      parseInt(page || "1"),
      parseInt(limit || "20"),
      status,
    );
  }

  // Statistikalar
  @Get("stats")
  async getStats() {
    return this.subService.getStats();
  }
}
