import { Controller, Post, Get, Body, Headers, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  // Bot orqali admin code olish
  @Post("generate-code")
  async generateCode(@Body() body: { telegramId: number }) {
    return this.authService.generateAuthCode(body.telegramId);
  }

  // Code orqali login (admin panelda)
  @Post("login-code")
  async loginWithCode(@Body() body: { code: string }) {
    return this.authService.loginWithCode(body.code);
  }

  // Telegram ID orqali to'g'ridan-to'g'ri admin login
  @Post("login-telegram")
  async loginWithTelegramId(@Body() body: { telegramId: number }) {
    return this.authService.loginWithTelegramId(body.telegramId);
  }

  // Telegram ID orqali user login (barcha foydalanuvchilar)
  @Post("login-user")
  async loginAsUser(@Body() body: { telegramId: number }) {
    return this.authService.loginAsUser(body.telegramId);
  }

  // Token tekshirish
  @Get("me")
  async getMe(@Headers("authorization") auth: string) {
    const token = auth?.replace("Bearer ", "");
    if (!token) throw new UnauthorizedException("Token topilmadi");
    return this.authService.getMe(token);
  }
}
