import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { HttpModule } from '@nestjs/axios';

import { Rule } from './domain/rule.entity';
import { LeadSending } from './domain/lead-sending.entity';
import { RulesService } from './rules.service';
import { RulesController } from './rules.controller';
import { LeadSchedulerProcessor } from './lead-scheduler.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Rule, LeadSending]),
    BullModule.registerQueue({ name: 'lead-scheduler' }),
    HttpModule,
  ],
  controllers: [RulesController],
  providers: [RulesService, LeadSchedulerProcessor],
})
export class RulesModule {}
