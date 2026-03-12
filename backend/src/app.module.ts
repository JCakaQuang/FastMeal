import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './modules/users/users.module';
import { DishesModule } from './modules/dishes/dishes.module';
import { DailyMenuModule } from './modules/daily-menu/daily-menu.module';
import { AuthModule } from './modules/auth/auth.module';
import { ChatModule } from './modules/chat/chat.module';
import { OrdersModule } from './modules/orders/orders.module';
import { BranchesModule } from './modules/branches/branches.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    DishesModule,
    DailyMenuModule,
    AuthModule,
    ChatModule,
    OrdersModule,
    BranchesModule,
  ],
})
export class AppModule {}