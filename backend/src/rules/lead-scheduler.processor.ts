import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { RulesService } from './rules.service';
import { Rule } from './domain/rule.entity';

@Processor('lead-scheduler')
export class LeadSchedulerProcessor {
  private readonly logger = new Logger(LeadSchedulerProcessor.name);

  constructor(private readonly rulesService: RulesService) {}

  @Process('schedule')
  async handleSchedule(job: Job<{ ruleId: string }>) {
    this.logger.log(
      `🏃 Processing Bull job ${job.id} for rule ${job.data.ruleId}`,
    );

    const rule = await this.rulesService.findOne(job.data.ruleId);
    if (!rule) {
      this.logger.warn(`❌ Rule ${job.data.ruleId} not found`);
      return;
    }

    this.logger.log(
      `✅ Starting lead scheduling for rule ${rule.id}: ${rule.name}`,
    );

    try {
      await this.rulesService.scheduleLeadsSending(rule as Rule);
      this.logger.log(`✅ Completed lead scheduling for rule ${rule.id}`);
    } catch (error) {
      this.logger.error(
        `❌ Error in lead scheduling for rule ${rule.id}:`,
        error,
      );
      throw error;
    }
  }
}
