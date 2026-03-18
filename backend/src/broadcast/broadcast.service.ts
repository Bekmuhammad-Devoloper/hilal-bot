import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import axios from "axios";

const BOT_TOKEN = process.env.BOT_TOKEN || "";

@Injectable()
export class BroadcastService {
  private readonly logger = new Logger(BroadcastService.name);

  constructor(private prisma: PrismaService) {}

  async sendToAll(message: string, photo?: string) {
    const users = await this.prisma.user.findMany({
      where: { isBlocked: false },
      select: { telegramId: true },
    });

    let sent = 0;
    let failed = 0;

    for (const user of users) {
      try {
        if (photo) {
          await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
            chat_id: Number(user.telegramId),
            photo,
            caption: message,
            parse_mode: "Markdown",
          });
        } else {
          await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: Number(user.telegramId),
            text: message,
            parse_mode: "Markdown",
          });
        }
        sent++;
      } catch (e) {
        failed++;
        this.logger.warn(`Failed to send to ${user.telegramId}`);
      }

      // Rate limit
      await new Promise((r) => setTimeout(r, 50));
    }

    return { total: users.length, sent, failed };
  }

  async sendToUser(telegramId: number, message: string) {
    try {
      await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        chat_id: telegramId,
        text: message,
        parse_mode: "Markdown",
      });
      return { success: true };
    } catch (e) {
      return { success: false, error: "Failed to send message" };
    }
  }
}
