import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { I18nModule } from '@nestjs/i18n';
import { ScheduleModule } from '@nestjs/schedule';

// Modules
import { AuthModule } from './modules/auth/auth.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { LeadsModule } from './modules/leads/leads.module';
import { OffersModule } from './modules/offers/offers.module';
import { RedirectsModule } from './modules/redirects/redirects.module';
import { RedirectAnalyticsModule } from './modules/redirect-analytics/redirect-analytics.module';
import { KeitaroIntegrationModule } from './modules/keitaro-integration/keitaro-integration.module';

// Common
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'hermes_crm',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
      logging: process.env.NODE_ENV !== 'production',
    }),

    // Internationalization
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: __dirname + '/i18n/',
        watch: true,
      },
    }),

    // Scheduling
    ScheduleModule.forRoot(),

    // Application modules
    CommonModule,
    AuthModule,
    DashboardModule,
    LeadsModule,
    OffersModule,
    RedirectsModule,
    RedirectAnalyticsModule,
    KeitaroIntegrationModule,
  ],
})
export class AppModule {} 