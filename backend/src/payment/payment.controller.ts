import { Controller, Get, Post, Param, Query, Body } from "@nestjs/common";
import { PaymentService } from "./payment.service";

@Controller("payments")
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  // To'lov yaratish
  @Post("create")
  async create(@Body() body: { telegramId: number; planId: number; method?: string }) {
    return this.paymentService.createPayment(body.telegramId, body.planId, body.method);
  }

  // To'lovni tasdiqlash
  @Post("confirm/:id")
  async confirm(
    @Param("id") id: string,
    @Body() body: { cardLast4?: string; transactionId?: string },
  ) {
    return this.paymentService.confirmPayment(parseInt(id), body.cardLast4, body.transactionId);
  }

  // To'lovni bekor qilish
  @Post("cancel/:id")
  async cancel(@Param("id") id: string) {
    return this.paymentService.cancelPayment(parseInt(id));
  }

  // Foydalanuvchining to'lovlari
  @Get("user/:telegramId")
  async getUserPayments(@Param("telegramId") telegramId: string) {
    return this.paymentService.getUserPayments(parseInt(telegramId));
  }

  // Admin: barcha to'lovlar
  @Get()
  async findAll(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("status") status?: string,
  ) {
    return this.paymentService.findAll(
      parseInt(page || "1"),
      parseInt(limit || "20"),
      status,
    );
  }

  // To'lov statistikasi
  @Get("stats")
  async getStats() {
    return this.paymentService.getStats();
  }

  // Oxirgi to'lovlar
  @Get("recent")
  async getRecent(@Query("limit") limit?: string) {
    return this.paymentService.getRecentPayments(parseInt(limit || "5"));
  }
}
