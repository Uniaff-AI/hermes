import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Rule } from '../domain/rule.entity';
import { LeadSending, LeadSendingStatus } from '../domain/lead-sending.entity';

@Injectable()
export class RulesAnalyticsService {
  private readonly logger = new Logger(RulesAnalyticsService.name);

  constructor(
    @InjectRepository(Rule) private readonly ruleRepo: Repository<Rule>,
    @InjectRepository(LeadSending)
    private readonly leadSendingRepo: Repository<LeadSending>,
  ) {}

  async cleanupOrphanedLeadSendings(): Promise<number> {
    try {
      // Get all existing active rule IDs
      const existingRules = await this.ruleRepo.find({
        where: { isActive: true },
        select: ['id'],
      });
      const existingRuleIds = existingRules.map((rule) => rule.id);

      this.logger.debug(
        `Found ${existingRuleIds.length} active rules for cleanup check`,
      );

      if (existingRuleIds.length === 0) {
        // If there are no active rules, delete all LeadSending records
        const result = await this.leadSendingRepo
          .createQueryBuilder('sending')
          .delete()
          .execute();

        this.logger.log(
          `Cleaned up all ${result.affected || 0} lead sendings (no active rules)`,
        );
        return result.affected || 0;
      }

      // Delete LeadSending records for non-existent or inactive rules
      const result = await this.leadSendingRepo
        .createQueryBuilder('sending')
        .delete()
        .where('ruleId NOT IN (:...ruleIds)', {
          ruleIds: existingRuleIds,
        })
        .execute();

      this.logger.log(
        `Cleaned up ${result.affected || 0} orphaned lead sendings`,
      );
      return result.affected || 0;
    } catch (error) {
      this.logger.error('Error cleaning up orphaned lead sendings:', error);
      return 0;
    }
  }

  async getAllRulesAnalytics(): Promise<{
    totalStats: {
      totalSent: number;
      totalSuccess: number;
      totalErrors: number;
      successRate: string;
    };
    rules: any[];
  }> {
    try {
      // First, clean up old LeadSending records for deleted rules
      await this.cleanupOrphanedLeadSendings();

      // Get only existing rules from the database
      const rules = await this.ruleRepo.find({
        where: { isActive: true }, // Only active rules
        select: ['id', 'name', 'targetProductName', 'isActive'],
      });

      this.logger.debug(`Found ${rules.length} active rules in database`);

      if (rules.length === 0) {
        return {
          totalStats: {
            totalSent: 0,
            totalSuccess: 0,
            totalErrors: 0,
            successRate: '0%',
          },
          rules: [],
        };
      }

      // Get analytics only for existing active rules
      const analyticsPromises = rules.map(async (rule) => {
        try {
          // Additional check that the rule exists
          const exists = await this.ruleRepo.findOneBy({
            id: rule.id,
            isActive: true,
          });
          if (!exists) {
            this.logger.warn(
              `Active rule ${rule.id} not found during analytics fetch`,
            );
            return null;
          }
          return await this.getRuleAnalytics(rule.id);
        } catch (error: any) {
          this.logger.warn(
            `Failed to get analytics for rule ${rule.id}: ${error?.message || error}`,
          );
          return null;
        }
      });

      const rulesAnalyticsResults = await Promise.all(analyticsPromises);

      // Filter only successful analytics results
      const rulesAnalytics = rulesAnalyticsResults.filter(
        (result) => result !== null,
      );

      this.logger.debug(
        `Successfully got analytics for ${rulesAnalytics.length} active rules`,
      );

      // Calculate total stats
      const totalStats = {
        totalSent: 0,
        totalSuccess: 0,
        totalErrors: 0,
        successRate: '0%',
      };

      rulesAnalytics.forEach((ruleAnalytics) => {
        totalStats.totalSent += ruleAnalytics.stats.totalSent;
        totalStats.totalSuccess += ruleAnalytics.stats.totalSuccess;
        totalStats.totalErrors += ruleAnalytics.stats.totalErrors;
      });

      if (totalStats.totalSent > 0) {
        const successRate =
          (totalStats.totalSuccess / totalStats.totalSent) * 100;
        totalStats.successRate = `${successRate.toFixed(1)}%`;
      }

      return {
        totalStats,
        rules: rulesAnalytics,
      };
    } catch (error) {
      this.logger.error('Error getting all rules analytics:', error);
      throw error;
    }
  }

  async getRuleAnalytics(ruleId: string): Promise<{
    rule: {
      id: string;
      name: string;
      productName: string;
      isActive: boolean;
    };
    stats: {
      totalSent: number;
      totalSuccess: number;
      totalErrors: number;
      successRate: string;
      lastSent: string;
    };
    recentSendings: any[];
  }> {
    try {
      const rule = await this.ruleRepo.findOneBy({ id: ruleId });
      if (!rule) {
        throw new Error(`Rule ${ruleId} not found`);
      }

      // Get all lead sendings for this rule (get all for proper analytics)
      const sendings = await this.leadSendingRepo.find({
        where: { ruleId },
        order: { sentAt: 'DESC' },
        take: 100, // Show up to 100 recent sendings for proper analytics
      });

      // Count the statistics
      const totalSent = sendings.length;
      const totalSuccess = sendings.filter(
        (s) => s.status === LeadSendingStatus.SUCCESS,
      ).length;
      const totalErrors = sendings.filter(
        (s) => s.status === LeadSendingStatus.ERROR,
      ).length;

      let successRate = '0%';
      if (totalSent > 0) {
        const rate = (totalSuccess / totalSent) * 100;
        successRate = `${rate.toFixed(1)}%`;
      }

      const lastSent =
        sendings.length > 0
          ? sendings[0].sentAt.toISOString()
          : new Date().toISOString();

      // Format the last sendings for the frontend
      const recentSendings = sendings.map((sending) => ({
        id: sending.id,
        subid: sending.leadSubid,
        leadName: sending.leadName,
        phone: sending.leadPhone,
        email: sending.leadEmail,
        status: sending.status,
        errorDetails: sending.errorDetails,
        sentAt: sending.sentAt.toISOString(),
      }));

      return {
        rule: {
          id: rule.id,
          name: rule.name,
          productName: rule.targetProductName || 'Не указан',
          isActive: rule.isActive,
        },
        stats: {
          totalSent,
          totalSuccess,
          totalErrors,
          successRate,
          lastSent,
        },
        recentSendings,
      };
    } catch (error) {
      this.logger.error(`Error getting analytics for rule ${ruleId}:`, error);
      throw error;
    }
  }
}
