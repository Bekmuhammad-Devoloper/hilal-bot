import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { UsersModule } from "./users/users.module";
import { SettingsModule } from "./settings/settings.module";
import { AuthModule } from "./auth/auth.module";
import { BroadcastModule } from "./broadcast/broadcast.module";
import { SubscriptionModule } from "./subscription/subscription.module";
import { PaymentModule } from "./payment/payment.module";
import { PlanModule } from "./plan/plan.module";
import { UploadsModule } from "./uploads/uploads.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UsersModule,
    SettingsModule,
    BroadcastModule,
    SubscriptionModule,
    PaymentModule,
    PlanModule,
    UploadsModule,
  ],
})
export class AppModule {}
