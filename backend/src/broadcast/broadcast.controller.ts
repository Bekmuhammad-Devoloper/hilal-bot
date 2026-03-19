import { Controller, Post, Get, Body } from "@nestjs/common";
import { BroadcastService } from "./broadcast.service";

@Controller("broadcast")
export class BroadcastController {
  constructor(private broadcastService: BroadcastService) {}

  @Get("users")
  async getUsers() {
    return this.broadcastService.getUsers();
  }

  @Post("all")
  async sendToAll(@Body() body: { message: string; mediaType?: string; mediaUrl?: string }) {
    return this.broadcastService.sendToAll(body.message, body.mediaType, body.mediaUrl);
  }

  @Post("selected")
  async sendToSelected(@Body() body: { telegramIds: number[]; message: string; mediaType?: string; mediaUrl?: string }) {
    return this.broadcastService.sendToSelected(body.telegramIds, body.message, body.mediaType, body.mediaUrl);
  }

  @Post("user")
  async sendToUser(@Body() body: { telegramId: number; message: string; mediaType?: string; mediaUrl?: string }) {
    return this.broadcastService.sendToUser(body.telegramId, body.message, body.mediaType, body.mediaUrl);
  }
}
