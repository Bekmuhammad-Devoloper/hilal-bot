import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as jwt from "jsonwebtoken";
import * as crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "hilal-bot-secret-key-2024";
const BOT_TOKEN = process.env.BOT_TOKEN || "";

// Vaqtinchalik auth kodlari: { telegramId: { code, expiresAt } }
const authCodes = new Map<number, { code: string; expiresAt: number }>();

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  // Botdan chaqiriladi — auth code generatsiya
  async generateAuthCode(telegramId: number) {
    const user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
    });

    if (!user || !user.isAdmin) {
      throw new UnauthorizedException("Siz admin emassiz!");
    }

    const code = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 daqiqa
    authCodes.set(telegramId, { code, expiresAt });

    return { code, telegramId };
  }

  // Admin panel — auth code orqali login
  async loginWithCode(code: string) {
    let foundTelegramId: number | null = null;

    for (const [telegramId, data] of authCodes.entries()) {
      if (data.code === code && data.expiresAt > Date.now()) {
        foundTelegramId = telegramId;
        break;
      }
    }

    if (!foundTelegramId) {
      throw new UnauthorizedException("Kod yaroqsiz yoki muddati o'tgan!");
    }

    // Kodni o'chirish (bir martalik)
    authCodes.delete(foundTelegramId);

    const user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(foundTelegramId) },
    });

    if (!user || !user.isAdmin) {
      throw new UnauthorizedException("Admin huquqi yo'q!");
    }

    const token = jwt.sign(
      {
        userId: user.id,
        telegramId: Number(user.telegramId),
        role: "admin",
        firstName: user.firstName,
        photoUrl: user.photoUrl || null,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      token,
      role: "admin",
      user: { ...user, telegramId: Number(user.telegramId) },
    };
  }

  // Telegram ID orqali to'g'ridan-to'g'ri login (admin uchun)
  async loginWithTelegramId(telegramId: number) {
    const user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
    });

    if (!user || !user.isAdmin) {
      throw new UnauthorizedException("Admin huquqi yo'q!");
    }

    const token = jwt.sign(
      {
        userId: user.id,
        telegramId: Number(user.telegramId),
        role: "admin",
        firstName: user.firstName,
        photoUrl: user.photoUrl || null,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      token,
      role: "admin",
      user: { ...user, telegramId: Number(user.telegramId) },
    };
  }

  // Telegram ID orqali user login (oddiy foydalanuvchi)
  async loginAsUser(telegramId: number) {
    let user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
    });

    if (!user) {
      throw new UnauthorizedException("Siz botda ro'yxatdan o'tmagansiz! Avval botda /start bosing.");
    }

    if (user.isBlocked) {
      throw new UnauthorizedException("Sizning hisobingiz bloklangan!");
    }

    const role = user.isAdmin ? "admin" : "user";

    const token = jwt.sign(
      {
        userId: user.id,
        telegramId: Number(user.telegramId),
        role,
        firstName: user.firstName,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      token,
      role,
      user: { ...user, telegramId: Number(user.telegramId) },
    };
  }

  verifyToken(token: string) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch {
      throw new UnauthorizedException("Token yaroqsiz");
    }
  }

  // Token dan user ma'lumotini olish
  async getMe(token: string) {
    const decoded: any = this.verifyToken(token);
    const user = await this.prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user) throw new UnauthorizedException("User topilmadi");

    // TG profile rasmini background'da yangilash (kutmasdan)
    this.fetchTelegramPhoto(Number(user.telegramId)).then((freshPhotoUrl) => {
      if (freshPhotoUrl && freshPhotoUrl !== user.photoUrl) {
        this.prisma.user.update({
          where: { id: user.id },
          data: { photoUrl: freshPhotoUrl },
        }).catch(() => {});
      }
    }).catch(() => {});

    return { ...user, telegramId: Number(user.telegramId) };
  }

  // Telegram Bot API orqali user profile rasmini olish
  async fetchTelegramPhoto(telegramId: number): Promise<string | null> {
    if (!BOT_TOKEN) return null;
    try {
      const res = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/getUserProfilePhotos?user_id=${telegramId}&offset=0&limit=1`
      );
      const data = await res.json();
      if (!data.ok || !data.result?.photos?.length) return null;

      const photos = data.result.photos[0];
      const largest = photos[photos.length - 1];
      const fileRes = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${largest.file_id}`
      );
      const fileData = await fileRes.json();
      if (!fileData.ok) return null;

      return `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileData.result.file_path}`;
    } catch {
      return null;
    }
  }
}
