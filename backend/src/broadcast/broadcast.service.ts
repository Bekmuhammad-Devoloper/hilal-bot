import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const FormData = require("form-data");

const BOT_TOKEN = process.env.BOT_TOKEN || "";

@Injectable()
export class BroadcastService {
  private readonly logger = new Logger(BroadcastService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Checks if media is a local uploaded file (starts with /uploads/)
   */
  private isLocalFile(mediaUrl?: string): boolean {
    return !!mediaUrl && mediaUrl.startsWith("/uploads/");
  }

  /**
   * Gets absolute path for a local uploaded file
   */
  private getLocalPath(mediaUrl: string): string {
    const filename = mediaUrl.replace("/uploads/", "");
    return path.join(process.cwd(), "uploads", filename);
  }

  /**
   * Send message to a single user (supports text/photo/video, local files or URLs)
   */
  private async sendMsg(chatId: number, message: string, mediaType?: string, mediaUrl?: string) {
    const base = `https://api.telegram.org/bot${BOT_TOKEN}`;

    if (mediaType === "photo" && mediaUrl) {
      if (this.isLocalFile(mediaUrl)) {
        // Send local file via form-data
        const filePath = this.getLocalPath(mediaUrl);
        if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);
        const form = new FormData();
        form.append("chat_id", String(chatId));
        form.append("photo", fs.createReadStream(filePath));
        if (message) { form.append("caption", message); form.append("parse_mode", "HTML"); }
        await axios.post(`${base}/sendPhoto`, form, { headers: form.getHeaders() });
      } else {
        // Send URL directly
        await axios.post(`${base}/sendPhoto`, {
          chat_id: chatId, photo: mediaUrl, caption: message || undefined, parse_mode: "HTML",
        });
      }
    } else if (mediaType === "video" && mediaUrl) {
      if (this.isLocalFile(mediaUrl)) {
        const filePath = this.getLocalPath(mediaUrl);
        if (!fs.existsSync(filePath)) throw new Error(`File not found: ${filePath}`);
        const form = new FormData();
        form.append("chat_id", String(chatId));
        form.append("video", fs.createReadStream(filePath));
        if (message) { form.append("caption", message); form.append("parse_mode", "HTML"); }
        await axios.post(`${base}/sendVideo`, form, { headers: form.getHeaders() });
      } else {
        await axios.post(`${base}/sendVideo`, {
          chat_id: chatId, video: mediaUrl, caption: message || undefined, parse_mode: "HTML",
        });
      }
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
      } catch (e: any) {
        failed++;
        this.logger.warn(`Failed to send to ${chatId}: ${e?.response?.data?.description || e.message}`);
      }
      await new Promise((r) => setTimeout(r, 50));
    }
    return { total: chatIds.length, sent, failed };
  }

  // Userlar ro'yxatini olish (tanlash uchun)
  async getUsers() {
    const users = await this.prisma.user.findMany({
      where: { isBlocked: false },
      select: { id: true, telegramId: true, firstName: true, lastName: true, username: true, photoUrl: true },
      orderBy: { firstName: "asc" },
    });
    return users.map((u) => ({
      ...u,
      telegramId: Number(u.telegramId),
    }));
  }
}
