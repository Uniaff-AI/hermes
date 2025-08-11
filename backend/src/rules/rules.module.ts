import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bull';

import { Rule } from './domain/rule.entity';
import { LeadSending } from './domain/lead-sending.entity';
import { RulesController } from './rules.controller';
import { RulesService } from './rules.service';
import { LeadSchedulerProcessor } from './lead-scheduler.processor';

// Новые сервисы
import { RulesUtilsService } from './services/rules-utils.service';
import { ExternalApiService } from './services/external-api.service';
import { LeadSchedulingService } from './services/lead-scheduling.service';
import { RulesAnalyticsService } from './services/rules-analytics.service';
import { RulesMonitoringService } from './services/rules-monitoring.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Rule, LeadSending]),
    HttpModule,
    BullModule.registerQueue({
      name: 'lead-scheduler',
    }),
  ],
  controllers: [RulesController],
  providers: [
    // Основной сервис
    RulesService,

    // Новые специализированные сервисы
    RulesUtilsService,
    ExternalApiService,
    LeadSchedulingService,
    RulesAnalyticsService,
    RulesMonitoringService,

    // Процессор очереди
    LeadSchedulerProcessor,
  ],
  exports: [RulesService],
})
export class RulesModule {}
