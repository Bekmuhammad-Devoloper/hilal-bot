import { Controller, Get, Post, Patch, Param, Body, Query } from "@nestjs/common";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post("register")
  async register(
    @Body() body: { telegramId: number; username: string; firstName: string; lastName: string; photoUrl?: string }
  ) {
    const user = await this.usersService.register(
      body.telegramId,
      body.username,
      body.firstName,
      body.lastName,
      body.photoUrl
    );
    return { ...user, telegramId: Number(user.telegramId) };
  }

  @Get("telegram/:telegramId")
  async findByTelegramId(@Param("telegramId") telegramId: string) {
    return this.usersService.findByTelegramId(parseInt(telegramId));
  }

  @Get()
  async findAll(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("search") search?: string
  ) {
    return this.usersService.findAll(
      parseInt(page || "1"),
      parseInt(limit || "20"),
      search
    );
  }

  @Get("dashboard")
  async getDashboard() {
    return this.usersService.getDashboardData();
  }

  @Get("stats")
  async getStats() {
    return this.usersService.getStats();
  }

  @Get("recent")
  async getRecent(@Query("limit") limit?: string) {
    return this.usersService.getRecentUsers(parseInt(limit || "5"));
  }

  @Get("weekly-stats")
  async getWeeklyStats() {
    return this.usersService.getWeeklyStats();
  }

  @Get("telegram-ids")
  async getAllTelegramIds() {
    return this.usersService.getAllTelegramIds();
  }

  @Post("refresh-photos")
  async refreshPhotos() {
    return this.usersService.refreshAllPhotos();
  }

  @Patch(":id/admin")
  async setAdmin(@Param("id") id: string, @Body() body: { isAdmin: boolean }) {
    return this.usersService.setAdmin(parseInt(id), body.isAdmin);
  }

  @Patch(":id/block")
  async blockUser(@Param("id") id: string, @Body() body: { isBlocked: boolean }) {
    return this.usersService.blockUser(parseInt(id), body.isBlocked);
  }
}
