import { Controller, Get, Post, Param, Query, Body } from "@nestjs/common";
import { PaymentService } from "./payment.service";

@Controller("payments")
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  // ========== CLICK TOKENIZATSIYA API ==========

  // 1-qadam: Karta token so'rash (SMS yuboradi)
  @Post("click/token")
  async createCardToken(
    @Body() body: { cardNumber: string; expireDate: string },
  ) {
    try {
      const result = await this.paymentService.createCardToken(body.cardNumber, body.expireDate);
      return { success: true, ...result };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // 2-qadam: SMS kodni tasdiqlash
  @Post("click/verify")
  async verifyCardToken(
    @Body() body: { cardToken: string; smsCode: string },
  ) {
    try {
      const result = await this.paymentService.verifyCardToken(body.cardToken, body.smsCode);
      return { success: true, ...result };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // 3-qadam: Token orqali to'lov qilish (payment yaratish + Click to'lov + obuna)
  @Post("click/pay")
  async payWithClick(
    @Body() body: { telegramId: number; planId: number; cardToken: string; cardLast4: string },
  ) {
    try {
      // Avval DB da payment yaratish
      const payment = await this.paymentService.createPayment(body.telegramId, body.planId, "click");
      // Click orqali haqiqiy to'lov + obuna aktivatsiya
      const result = await this.paymentService.completeClickPayment(payment.id, body.cardToken, body.cardLast4);
      return { success: true, ...result };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // ========== TELEGRAM PAYMENTS API ==========

  // Telegram Payments orqali to'lovni tasdiqlash
  @Post("telegram-payment")
  async confirmTelegramPayment(
    @Body() body: {
      telegramId: number;
      planId: number;
      amount: number;
      currency: string;
      telegramPaymentChargeId: string;
      providerPaymentChargeId: string;
    },
  ) {
    try {
      const result = await this.paymentService.confirmTelegramPayment(
        body.telegramId,
        body.planId,
        body.amount,
        body.currency,
        body.telegramPaymentChargeId,
        body.providerPaymentChargeId,
      );
      return { success: true, ...result };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // ========== TELEGRAM INVOICE LINK ==========

  // WebApp uchun Telegram Invoice link yaratish
  @Post("create-invoice")
  async createInvoiceLink(
    @Body() body: { telegramId: number; planId: number },
  ) {
    try {
      const result = await this.paymentService.createTelegramInvoiceLink(body.telegramId, body.planId);
      return { success: true, ...result };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // ========== ESKI ENDPOINT LAR ==========

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
