import { Controller, Get, Post, Param, Query, Body } from "@nestjs/common";
import { SubscriptionService } from "./subscription.service";

@Controller("subscriptions")
export class SubscriptionController {
  constructor(private subService: SubscriptionService) {}

  // Foydalanuvchining aktiv obunasi
  @Get("active/:telegramId")
  async getActive(@Param("telegramId") telegramId: string) {
    return this.subService.getActiveSubscription(parseInt(telegramId));
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
