import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import * as path from "path";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const dbPath = path.resolve(process.cwd(), "prisma", "dev.db");
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || `file:${dbPath}`,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log("✅ Prisma DB connected");
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
