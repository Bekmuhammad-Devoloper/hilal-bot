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
    // SQLite WAL mode — tezroq concurrent read/write
    await this.$executeRawUnsafe("PRAGMA journal_mode=WAL;");
    await this.$executeRawUnsafe("PRAGMA busy_timeout=5000;");
    console.log("✅ Prisma DB connected (WAL mode)");
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
