import { Controller, Post, Body } from "@nestjs/common";
import { BroadcastService } from "./broadcast.service";

@Controller("broadcast")
export class BroadcastController {
  constructor(private broadcastService: BroadcastService) {}

  @Post("all")
  async sendToAll(@Body() body: { message: string; photo?: string }) {
    return this.broadcastService.sendToAll(body.message, body.photo);
  }

  @Post("user")
  async sendToUser(@Body() body: { telegramId: number; message: string }) {
    return this.broadcastService.sendToUser(body.telegramId, body.message);
  }
}
