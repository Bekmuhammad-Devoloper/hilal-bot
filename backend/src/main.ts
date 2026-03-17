import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api");
  app.enableCors({
    origin: "*",
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const port = process.env.PORT || 7777;
  await app.listen(port);
  console.log(`🚀 Backend ishga tushdi: http://localhost:${port}`);
  console.log(`📄 API: http://localhost:${port}/api`);
}
bootstrap();
