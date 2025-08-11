import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Rule } from '../domain/rule.entity';
import { LeadSending, LeadSendingStatus } from '../domain/lead-sending.entity';
import { ExternalApiService } from './external-api.service';

@Injectable()
export class RulesMonitoringService {
  private readonly logger = new Logger(RulesMonitoringService.name);

  constructor(
    @InjectRepository(Rule) private readonly ruleRepo: Repository<Rule>,
    @InjectRepository(LeadSending)
    private readonly leadSendingRepo: Repository<LeadSending>,
    private readonly externalApi: ExternalApiService,
  ) {}

  async testRuleExecution(ruleId: string) {
    const rule = await this.ruleRepo.findOneBy({ id: ruleId });
    if (!rule) {
      throw new Error(`Rule ${ruleId} not found`);
    }

    this.logger.log(`Starting test execution for rule ${ruleId}`);

    const products = await this.externalApi.getProducts();
    this.logger.log(`Products test: Found ${products.length} products`);

    const testFilters = {
      limit: 5,
      ...(rule.productName ? { productName: rule.productName } : {}),
      ...(rule.vertical ? { vertical: rule.vertical } : {}),
      ...(rule.country ? { country: rule.country } : {}),
      ...(rule.status ? { status: rule.status } : {}),
    };

    let leadsTest;
    try {
      const raw = await this.externalApi.getLeads(testFilters);
      leadsTest = {
        status: 200,
        success: true,
        data: raw.slice(0, 3),
        leadCount: raw.length,
      };
    } catch (err: any) {
      leadsTest = {
        status: err?.response?.status || 'timeout',
        success: false,
        error: err?.message || 'Unknown error',
        leadCount: 0,
      };
    }

    return {
      ruleId,
      ruleName: rule.name,
      timestamp: new Date().toISOString(),
      tests: {
        products: {
          success: products.length > 0,
          count: products.length,
        },
        leads: leadsTest,
        configuration: {
          rule: {
            isActive: rule.isActive,
            isInfinite: rule.isInfinite,
            productName: rule.productName,
            country: rule.country,
            vertical: rule.vertical,
            status: rule.status,
            dailyCapLimit: rule.dailyCapLimit,
          },
        },
      },
    };
  }

  async testExternalAPIConnection() {
    return await this.externalApi.testConnection();
  }

  async getRuleDebugLogs(ruleId: string) {
    const rule = await this.ruleRepo.findOneBy({ id: ruleId });
    if (!rule) {
      throw new Error(`Rule ${ruleId} not found`);
    }

    const recentSendings = await this.leadSendingRepo.find({
      where: { ruleId },
      order: { sentAt: 'DESC' },
      take: 20,
    });

    return {
      ruleId,
      ruleName: rule.name,
      ruleConfig: {
        isActive: rule.isActive,
        isInfinite: rule.isInfinite,
        productName: rule.productName,
        productId: rule.productId,
        country: rule.country,
        vertical: rule.vertical,
        status: rule.status,
        dailyCapLimit: rule.dailyCapLimit,
        sendWindow: `${rule.sendWindowStart}-${rule.sendWindowEnd}`,
        intervals: `${rule.minInterval}-${rule.maxInterval}min`,
      },
      recentActivity: recentSendings.map((sending) => ({
        id: sending.id,
        subid: sending.subid,
        leadName: sending.leadName,
        phone: sending.phone,
        email: sending.email,
        country: sending.country,
        status: sending.status,
        responseStatus: sending.responseStatus,
        errorDetails: sending.errorDetails,
        sentAt: sending.sentAt.toISOString(),
      })),
      stats: {
        totalAttempts: recentSendings.length,
        successful: recentSendings.filter(
          (s) => s.status === LeadSendingStatus.SUCCESS,
        ).length,
        failed: recentSendings.filter(
          (s) => s.status === LeadSendingStatus.ERROR,
        ).length,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
