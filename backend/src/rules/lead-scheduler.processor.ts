import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { RulesService } from './rules.service';
import { Rule } from './domain/rule.entity';

@Processor('lead-scheduler')
export class LeadSchedulerProcessor {
  constructor(private readonly rulesService: RulesService) {}

  @Process('schedule')
  async handleSchedule(job: Job<{ ruleId: string }>) {
    const rule = await this.rulesService.findOne(job.data.ruleId);
    if (!rule) {
      this.rulesService['logger'].warn(`Rule ${job.data.ruleId} not found`);
      return;
    }
    // прокинем выполнение
    await this.rulesService.scheduleLeadsSending(rule as Rule);
  }
}
