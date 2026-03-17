import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getAll() {
    const settings = await this.prisma.settings.findMany();
    const result: Record<string, any> = {};
    for (const s of settings) {
      try {
        result[s.key] = JSON.parse(s.value);
      } catch {
        result[s.key] = s.value;
      }
    }
    return result;
  }

  async get(key: string) {
    const setting = await this.prisma.settings.findUnique({ where: { key } });
    if (!setting) return null;
    try {
      return JSON.parse(setting.value);
    } catch {
      return setting.value;
    }
  }

  async set(key: string, value: any) {
    const strValue = typeof value === "string" ? value : JSON.stringify(value);
    return this.prisma.settings.upsert({
      where: { key },
      update: { value: strValue },
      create: { key, value: strValue },
    });
  }

  async setMany(settings: Record<string, any>) {
    const results = [];
    for (const [key, value] of Object.entries(settings)) {
      results.push(await this.set(key, value));
    }
    return results;
  }
}
