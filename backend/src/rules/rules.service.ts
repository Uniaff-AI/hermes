import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

import { Rule } from './domain/rule.entity';
import { CreateRuleDto } from './dto/create-rule.dto';

// Import new services
import { ExternalApiService, Product } from './services/external-api.service';
import { LeadSchedulingService } from './services/lead-scheduling.service';
import { RulesAnalyticsService } from './services/rules-analytics.service';
import { RulesMonitoringService } from './services/rules-monitoring.service';

@Injectable()
export class RulesService {
  private readonly logger = new Logger(RulesService.name);

  constructor(
    @InjectRepository(Rule) private readonly repo: Repository<Rule>,
    private readonly externalApi: ExternalApiService,
    private readonly leadScheduling: LeadSchedulingService,
    private readonly analytics: RulesAnalyticsService,
    private readonly monitoring: RulesMonitoringService,
    @InjectQueue('lead-scheduler') private readonly leadSchedulerQueue: Queue,
  ) {}

  // ===== CRUD Operations =====
  async createAndSchedule(dto: CreateRuleDto): Promise<Rule> {
    // Manual validation for time window fields when isInfinite is false
    if (dto.isInfinite !== true) {
      const errors: string[] = [];

      if (!dto.sendWindowStart || !/^\d{2}:\d{2}$/.test(dto.sendWindowStart)) {
        errors.push(
          'sendWindowStart is required and must be in HH:MM format when isInfinite is false',
        );
      }

      if (!dto.sendWindowEnd || !/^\d{2}:\d{2}$/.test(dto.sendWindowEnd)) {
        errors.push(
          'sendWindowEnd is required and must be in HH:MM format when isInfinite is false',
        );
      }

      if (errors.length > 0) {
        throw new Error(`Validation failed: ${errors.join(', ')}`);
      }
    }

    const entity = this.repo.create({
      isActive: true,
      ...dto,
    } as unknown as DeepPartial<Rule>);
    const rule = await this.repo.save(entity);

    // Start processes asynchronously (do not block the rule creation)
    this.scheduleInitialProcesses(rule);

    return rule;
  }

  findAll(): Promise<Rule[]> {
    return this.repo.find();
  }

  findOne(id: string): Promise<Rule | null> {
    return this.repo.findOneBy({ id });
  }

  async update(id: string, patch: Partial<Rule>): Promise<Rule> {
    const rule = await this.findOne(id);
    if (!rule) throw new Error(`Rule ${id} not found`);

    this.logger.debug(
      `Updating rule ${id} with patch:`,
      JSON.stringify(patch, null, 2),
    );
    this.logger.debug(
      `Current rule status: ${rule.leadStatus} (type: ${typeof rule.leadStatus})`,
    );

    // Handle null values by converting them to undefined for TypeORM
    const processedPatch = { ...patch };

    // Fields that can be reset to null
    const nullableFields = [
      'leadDateFrom',
      'leadDateTo',
      'leadVertical',
      'leadCountry',
      'leadStatus',
      'leadAffiliate',
      'sendWindowStart',
      'sendWindowEnd',
      'sendDateFrom',
      'sendDateTo',
      'targetProductVertical',
      'targetProductCountry',
      'targetProductAffiliate',
    ];

    nullableFields.forEach((field) => {
      if (processedPatch[field] === null) {
        this.logger.debug(`Converting ${field} from null to undefined`);
        processedPatch[field] = undefined;
      }
    });

    this.logger.debug(
      `Processed patch:`,
      JSON.stringify(processedPatch, null, 2),
    );

    Object.assign(rule, processedPatch);

    this.logger.debug(
      `Rule before save - status: ${rule.leadStatus} (type: ${typeof rule.leadStatus})`,
    );

    const savedRule = await this.repo.save(rule);

    this.logger.debug(
      `Rule after save - leadStatus: ${savedRule.leadStatus} (type: ${typeof savedRule.leadStatus})`,
    );

    return savedRule;
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  // ===== Delegation to specialized services =====
  async getProducts(): Promise<Product[]> {
    return this.externalApi.getProducts();
  }

  async getAllRulesAnalytics() {
    return this.analytics.getAllRulesAnalytics();
  }

  async getRuleAnalytics(id: string) {
    return this.analytics.getRuleAnalytics(id);
  }

  async testRuleExecution(id: string) {
    return this.monitoring.testRuleExecution(id);
  }

  async manualTriggerRule(id: string) {
    return this.leadScheduling.manualTriggerRule(id);
  }

  async testExternalAPIConnection() {
    return this.monitoring.testExternalAPIConnection();
  }

  async getRuleDebugLogs(id: string) {
    return this.monitoring.getRuleDebugLogs(id);
  }

  // Public method for scheduling lead sending (for Bull processor)
  public async scheduleLeadsSending(rule: Rule): Promise<void> {
    return this.leadScheduling.scheduleLeadsSending(rule);
  }

  // ===== Private helper methods =====
  private scheduleInitialProcesses(rule: Rule): void {
    // Start the lead fetching asynchronously
    setImmediate(() => {
      this.leadScheduling
        .scheduleLeadsSending(rule)
        .catch((e) =>
          this.logger.error(
            `scheduleLeadsSending(${rule.id}) failed: ${e?.message || e}`,
          ),
        );
    });

    // Daily auto-start (00:00) - also asynchronously
    setImmediate(() => {
      this.leadScheduling.planNextDay(rule.id).catch(() => {});
    });

    // Add to BullMQ queue asynchronously
    setImmediate(async () => {
      try {
        this.logger.log(`Adding rule ${rule.id} to BullMQ queue`);
        const job = await this.leadSchedulerQueue.add('schedule', {
          ruleId: rule.id,
        });
        this.logger.log(
          `Successfully added job ${job.id} to BullMQ queue for rule ${rule.id}`,
        );
      } catch (e: any) {
        this.logger.error(
          `Bull enqueue failed for rule ${rule.id}: ${e?.message || e}`,
        );
      }
    });
  }
}
