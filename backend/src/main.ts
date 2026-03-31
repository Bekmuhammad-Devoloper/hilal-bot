import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import * as express from "express";
import { join } from "path";

// BigInt JSON serialization qo'llab-quvvatlash
// Prisma BigInt fieldlarni JSON.stringify() qila olmasligi muammosini hal qiladi
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api");
  app.enableCors({
    origin: true, // Barcha origin'larni dinamik qabul qiladi (credentials bilan ishlaydi)
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Serve uploaded files from /uploads
  app.use("/uploads", express.static(join(process.cwd(), "uploads")));

  const port = process.env.PORT || 7777;
  await app.listen(port);
  console.log(`🚀 Backend ishga tushdi: http://localhost:${port}`);
  console.log(`📄 API: http://localhost:${port}/api`);
}
bootstrap().catch((err) => {
  console.error("❌ Backend ishga tushmadi:", err.message);
  process.exit(1);
});
