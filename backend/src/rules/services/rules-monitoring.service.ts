import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Rule } from '../domain/rule.entity';
import { LeadSending, LeadSendingStatus } from '../domain/lead-sending.entity';
import { ExternalApiService } from './external-api.service';
import { getCurrentDateString } from '../../utils/time.util';

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

    const leadTestFilters = {
      limit: 5,
      ...(rule.leadStatus && rule.leadStatus !== 'ALL'
        ? { status: rule.leadStatus }
        : {}),
      ...(rule.leadVertical ? { vertical: rule.leadVertical } : {}),
      ...(rule.leadCountry ? { country: rule.leadCountry } : {}),
      ...(rule.leadAffiliate ? { aff: rule.leadAffiliate } : {}),
      ...(rule.leadDateFrom ? { date_from: rule.leadDateFrom } : {}),
      ...(rule.leadDateTo ? { date_to: rule.leadDateTo } : {}),
    };

    const targetProduct = {
      productId: rule.targetProductId,
      productName: rule.targetProductName,
      vertical: rule.targetProductVertical || rule.leadVertical,
      country: rule.targetProductCountry || rule.leadCountry,
      aff: rule.targetProductAffiliate || rule.leadAffiliate,
    };

    let leadsTest;
    try {
      const raw = await this.externalApi.getLeads(leadTestFilters);
      leadsTest = {
        status: 200,
        success: true,
        data: raw.slice(0, 3),
        leadCount: raw.length,
        filters: leadTestFilters,
        targetProduct,
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
            leadFilters: {
              status: rule.leadStatus,
              vertical: rule.leadVertical,
              country: rule.leadCountry,
              aff: rule.leadAffiliate,
              dateFrom: rule.leadDateFrom,
              dateTo: rule.leadDateTo,
            },
            targetProduct: {
              productId: rule.targetProductId,
              productName: rule.targetProductName,
              vertical: rule.targetProductVertical || rule.leadVertical,
              country: rule.targetProductCountry || rule.leadCountry,
              aff: rule.targetProductAffiliate || rule.leadAffiliate,
            },
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

    // Debug logging to check the actual status value from database
    this.logger.debug(
      `Rule ${ruleId} status from DB: ${rule.leadStatus} (type: ${typeof rule.leadStatus})`,
    );

    const recentSendings = await this.leadSendingRepo.find({
      where: { ruleId },
      order: { sentAt: 'DESC' },
      take: 10,
    });

    // Lead availability analysis
    let leadAnalysis: any = null;
    try {
      const testFilters = {
        limit: 5,
        // We are not searching by targetProductName - this is where we send, not where we take from.
        // We search for leads by lead filters.
        ...(rule.leadVertical ? { vertical: rule.leadVertical } : {}),
        ...(rule.leadCountry ? { country: rule.leadCountry } : {}),
        ...(rule.leadStatus && rule.leadStatus !== 'ALL'
          ? { status: rule.leadStatus }
          : {}),
        ...(rule.leadAffiliate ? { aff: rule.leadAffiliate } : {}),
      };

      const availableLeads = await this.externalApi.getLeads(testFilters);
      leadAnalysis = {
        available: availableLeads.length,
        filters: testFilters,
        sampleLeads: availableLeads.slice(0, 3).map((lead: any) => ({
          name: lead.name || lead.leadName || 'N/A',
          phone: lead.phone ? lead.phone.substring(0, 4) + '***' : 'N/A', // Маскировка телефона
          country: lead.country || 'N/A',
          status: lead.status || 'N/A',
        })),
      };
    } catch (error) {
      leadAnalysis = {
        available: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        filters: null,
        sampleLeads: [],
      };
    }

    // Rule configuration validation
    const validationIssues: string[] = [];

    if (!rule.isActive) {
      validationIssues.push('Правило неактивно');
    }

    if (!rule.targetProductName) {
      validationIssues.push('Не указан продукт');
    }

    if (!rule.leadCountry) {
      validationIssues.push('Не указана страна');
    }

    if (!rule.leadVertical) {
      validationIssues.push('Не указана вертикаль');
    }

    if (!rule.leadStatus) {
      validationIssues.push('Не указан статус лидов');
    }

    // Check the time window (only for non-infinite sending)
    if (!rule.isInfinite && rule.sendWindowStart && rule.sendWindowEnd) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute;

      const [startHour, startMinute] = rule.sendWindowStart
        .split(':')
        .map(Number);
      const [endHour, endMinute] = rule.sendWindowEnd.split(':').map(Number);
      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;

      let isInWindow = false;

      // If the start time is greater than the end time, it means the window crosses midnight
      if (startTime > endTime) {
        // The current time should be after the start OR before the end
        isInWindow = currentTime >= startTime || currentTime <= endTime;
      } else {
        // Normal window within one day
        isInWindow = currentTime >= startTime && currentTime <= endTime;
      }

      if (!isInWindow) {
        validationIssues.push(
          `Вне временного окна отправки (${rule.sendWindowStart}-${rule.sendWindowEnd})`,
        );
      }
    }

    // Check the lead date range (only for non-infinite sending)
    if (!rule.isInfinite && (rule.leadDateFrom || rule.leadDateTo)) {
      const currentDate = getCurrentDateString(); // Use local time

      if (rule.leadDateFrom && currentDate < rule.leadDateFrom) {
        validationIssues.push(
          `Дата начала фильтрации лидов еще не наступила (${rule.leadDateFrom})`,
        );
      }

      if (rule.leadDateTo && currentDate > rule.leadDateTo) {
        validationIssues.push(
          `Дата окончания фильтрации лидов уже прошла (${rule.leadDateTo})`,
        );
      }
    }

    // Check the send date range
    if (rule.sendDateFrom || rule.sendDateTo) {
      const currentDate = getCurrentDateString(); // Use local time

      if (rule.sendDateFrom && currentDate < rule.sendDateFrom) {
        validationIssues.push(
          `Дата начала отправки еще не наступила (${rule.sendDateFrom})`,
        );
      }

      if (rule.sendDateTo && currentDate > rule.sendDateTo) {
        validationIssues.push(
          `Дата окончания отправки уже прошла (${rule.sendDateTo})`,
        );
      }
    }

    // Check the limits
    if (rule.dailyCapLimit) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todaySendings = await this.leadSendingRepo.count({
        where: {
          ruleId,
          sentAt: today as any,
        },
      });

      if (todaySendings >= rule.dailyCapLimit) {
        validationIssues.push(
          `Достигнут дневной лимит (${todaySendings}/${rule.dailyCapLimit})`,
        );
      }
    }

    return {
      ruleId,
      ruleName: rule.name,
      ruleConfig: {
        isActive: rule.isActive,
        isInfinite: rule.isInfinite,
        productName: rule.targetProductName,
        productId: rule.targetProductId,
        country: rule.leadCountry,
        vertical: rule.leadVertical,
        status: rule.leadStatus,
        dailyCapLimit: rule.dailyCapLimit,
        sendWindow: `${rule.sendWindowStart}-${rule.sendWindowEnd}`,
        sendDateWindow: `${rule.sendDateFrom || 'не ограничено'}-${rule.sendDateTo || 'не ограничено'}`,
        intervals: `${rule.minIntervalMinutes}-${rule.maxIntervalMinutes}min`,
        dateFrom: rule.leadDateFrom,
        dateTo: rule.leadDateTo,
      },
      recentActivity: recentSendings.map((sending) => ({
        id: sending.id,
        subid: sending.leadSubid,
        leadName: sending.leadName,
        phone: sending.leadPhone,
        email: sending.leadEmail,
        country: sending.leadCountry,
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
      diagnostics: {
        validationIssues,
        leadAnalysis,
        lastCheck: new Date().toISOString(),
        ruleHealth: validationIssues.length === 0 ? 'healthy' : 'issues',
        recommendations: this.generateRecommendations(
          validationIssues,
          leadAnalysis,
          rule,
        ),
      },
      timestamp: new Date().toISOString(),
    };
  }

  private generateRecommendations(
    validationIssues: string[],
    leadAnalysis: any,
    rule: Rule,
  ): string[] {
    const recommendations: string[] = [];

    if (validationIssues.length > 0) {
      recommendations.push('Исправьте обнаруженные проблемы с конфигурацией');
    }

    if (leadAnalysis?.available === 0) {
      recommendations.push(
        'Нет доступных лидов с текущими фильтрами - расширьте критерии поиска',
      );
    }

    if (leadAnalysis?.error) {
      recommendations.push('Проблемы с внешним API - проверьте подключение');
    }

    if (validationIssues.includes('Вне временного окна отправки')) {
      recommendations.push(
        'Дождитесь наступления времени отправки или измените временное окно',
      );
    }

    if (validationIssues.includes('Достигнут дневной лимит')) {
      recommendations.push(
        'Дневной лимит исчерпан - дождитесь следующего дня или увеличьте лимит',
      );
    }

    if (recommendations.length === 0) {
      if (rule.isInfinite) {
        recommendations.push(
          'Правило настроено для бесконечной отправки - работает 24/7 без временных ограничений',
        );
      } else {
        recommendations.push(
          'Правило настроено корректно, ожидайте автоматического запуска',
        );
      }
    }

    return recommendations;
  }
}
