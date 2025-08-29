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

    // Handle default values for sendDateFrom when not provided
    const ruleData = {
      isActive: true,
      ...dto,
      // If sendDateFrom is not provided (null/undefined), default to today
      // This ensures rules start working immediately when created
      sendDateFrom: dto.sendDateFrom || new Date().toISOString().split('T')[0],
    };

    const entity = this.repo.create(ruleData as unknown as DeepPartial<Rule>);
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

    // Check if rule is being deactivated
    const wasActive = rule.isActive;
    const willBeActive =
      patch.isActive !== undefined ? patch.isActive : wasActive;

    // If rule is being deactivated, cancel scheduled leads
    if (wasActive && !willBeActive) {
      this.logger.log(
        `Rule ${id} being deactivated, cancelling scheduled leads`,
      );
      try {
        const cancelResult = this.leadScheduling.cancelScheduledLeads(id);
        this.logger.log(
          `Cancelled ${cancelResult.cancelledCount} scheduled leads for rule ${id}`,
        );
      } catch (error: any) {
        this.logger.error(
          `Failed to cancel scheduled leads for rule ${id}: ${error?.message || error}`,
        );
      }
    }

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

    // If rule is active after update, restart scheduling with new configurations
    if (savedRule.isActive) {
      this.logger.log(
        `Rule ${id} updated and is active - restarting scheduling with new configurations`,
      );
      this.logger.log(
        `New config: dailyLimit=${savedRule.dailyCapLimit}, window=${savedRule.sendWindowStart}-${savedRule.sendWindowEnd}, intervals=${savedRule.minIntervalMinutes}-${savedRule.maxIntervalMinutes}min`,
      );

      // Cancel any existing scheduled leads first
      try {
        const cancelResult = this.leadScheduling.cancelScheduledLeads(id);
        this.logger.log(
          `Cancelled ${cancelResult.cancelledCount} existing scheduled leads for rule ${id}`,
        );
      } catch (error: any) {
        this.logger.error(
          `Failed to cancel existing scheduled leads for rule ${id}: ${error?.message || error}`,
        );
      }

      // Start new scheduling processes asynchronously
      this.logger.log(`Starting new scheduling for updated rule ${id}`);
      this.scheduleInitialProcesses(savedRule);
      this.logger.log(`Rule ${id} scheduling restart completed`);
    } else {
      this.logger.log(
        `Rule ${id} updated but is not active - no scheduling restart needed`,
      );
    }

    return savedRule;
  }

  async remove(id: string): Promise<void> {
    // Cancel any scheduled leads before deletion
    this.logger.log(`Removing rule ${id}, cancelling scheduled leads`);
    try {
      const cancelResult = this.leadScheduling.cancelScheduledLeads(id);
      this.logger.log(
        `Cancelled ${cancelResult.cancelledCount} scheduled leads for rule ${id}`,
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to cancel scheduled leads for rule ${id}: ${error?.message || error}`,
      );
    }

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

  cancelScheduledLeads(id: string) {
    return this.leadScheduling.cancelScheduledLeads(id);
  }

  getScheduledLeadsStatus(id: string) {
    return this.leadScheduling.getScheduledLeadsStatus(id);
  }

  cleanupExpiredTimeouts() {
    return this.leadScheduling.cleanupExpiredTimeouts();
  }

  // Public method for scheduling lead sending (for Bull processor)
  public async scheduleLeadsSending(rule: Rule): Promise<void> {
    return this.leadScheduling.scheduleLeadsSending(rule);
  }

  // ===== Private helper methods =====
  private scheduleInitialProcesses(rule: Rule): void {
    this.logger.log(
      `Starting initial scheduling for rule ${rule.id}: ${rule.name}`,
    );

    // Use ONLY direct scheduling - avoid multiple scheduling sources that cause batch sending
    setImmediate(() => {
      this.leadScheduling
        .scheduleLeadsSending(rule)
        .catch((e) =>
          this.logger.error(
            `scheduleLeadsSending(${rule.id}) failed: ${e?.message || e}`,
          ),
        );
    });

    // Daily auto-start (00:00) - schedule next day planning
    setImmediate(() => {
      this.leadScheduling.planNextDay(rule.id).catch(() => {});
    });

    // NOTE: Removed BullMQ queue scheduling to prevent duplicate/parallel execution
    // which was causing batch sending instead of sequential lead processing
    this.logger.log(`Rule ${rule.id} scheduled using direct method only`);
  }
}
