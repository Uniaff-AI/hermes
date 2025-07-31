import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { BullModule } from '@nestjs/bull';
import { HttpModule } from '@nestjs/axios';
import * as redisStore from 'cache-manager-redis-store';

import AppConfig from './config/app.config';
import { PrismaModule } from './database/database.module';
import { LeadsModule } from './modules/leads/leads.module';
import { OffersModule } from './modules/offers/offers.module';
import { RulesModule } from './modules/rules/rules.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [AppConfig],
    }),

    // Database
    PrismaModule,

    // Cache with Redis
    CacheModule.register({
      isGlobal: true,
      store: redisStore as any,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      ttl: parseInt(process.env.REDIS_TTL || '300', 10),
      password: process.env.REDIS_PASSWORD,
    }),

    // Queue with BullMQ
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD,
      },
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    }),

    // HTTP client for external API calls
    HttpModule,

    // Feature modules
    LeadsModule,
    OffersModule,
    RulesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
