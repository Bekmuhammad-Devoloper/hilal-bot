import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import axios from "axios";

const BOT_TOKEN = process.env.BOT_TOKEN || "";

@Injectable()
export class BroadcastService {
  private readonly logger = new Logger(BroadcastService.name);

  constructor(private prisma: PrismaService) {}

  // Bitta userga xabar yuborish (text/photo/video)
  private async sendMsg(chatId: number, message: string, mediaType?: string, mediaUrl?: string) {
    const base = `https://api.telegram.org/bot${BOT_TOKEN}`;
    if (mediaType === "photo" && mediaUrl) {
      await axios.post(`${base}/sendPhoto`, {
        chat_id: chatId, photo: mediaUrl, caption: message || undefined, parse_mode: "HTML",
      });
    } else if (mediaType === "video" && mediaUrl) {
      await axios.post(`${base}/sendVideo`, {
        chat_id: chatId, video: mediaUrl, caption: message || undefined, parse_mode: "HTML",
      });
    } else {
      await axios.post(`${base}/sendMessage`, {
        chat_id: chatId, text: message, parse_mode: "HTML",
      });
    }
  }

  async sendToAll(message: string, mediaType?: string, mediaUrl?: string) {
    const users = await this.prisma.user.findMany({
      where: { isBlocked: false },
      select: { telegramId: true },
    });
    return this.broadcastToList(users.map(u => Number(u.telegramId)), message, mediaType, mediaUrl);
  }

  async sendToSelected(telegramIds: number[], message: string, mediaType?: string, mediaUrl?: string) {
    return this.broadcastToList(telegramIds, message, mediaType, mediaUrl);
  }

  async sendToUser(telegramId: number, message: string, mediaType?: string, mediaUrl?: string) {
    try {
      await this.sendMsg(telegramId, message, mediaType, mediaUrl);
      return { success: true };
    } catch (e) {
      return { success: false, error: "Failed to send message" };
    }
  }

  private async broadcastToList(chatIds: number[], message: string, mediaType?: string, mediaUrl?: string) {
    let sent = 0;
    let failed = 0;
    for (const chatId of chatIds) {
      try {
        await this.sendMsg(chatId, message, mediaType, mediaUrl);
        sent++;
      } catch (e) {
        failed++;
        this.logger.warn(`Failed to send to ${chatId}`);
      }
      await new Promise((r) => setTimeout(r, 50));
    }
    return { total: chatIds.length, sent, failed };
  }

  // Userlar ro'yxatini olish (tanlash uchun)
  async getUsers() {
    return this.prisma.user.findMany({
      where: { isBlocked: false },
      select: { id: true, telegramId: true, firstName: true, lastName: true, username: true, photoUrl: true },
      orderBy: { firstName: "asc" },
    });
  }
}
