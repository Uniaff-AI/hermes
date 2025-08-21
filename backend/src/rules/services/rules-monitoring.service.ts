import { Injectable, Logger, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Rule } from '../domain/rule.entity';
import { LeadSending, LeadSendingStatus } from '../domain/lead-sending.entity';
import { ExternalApiService } from './external-api.service';
import { LeadSchedulingService } from './lead-scheduling.service';
import { getCurrentDateString } from '../../utils/time.util';

@Injectable()
export class RulesMonitoringService {
  private readonly logger = new Logger(RulesMonitoringService.name);

  constructor(
    @InjectRepository(Rule) private readonly ruleRepo: Repository<Rule>,
    @InjectRepository(LeadSending)
    private readonly leadSendingRepo: Repository<LeadSending>,
    private readonly externalApi: ExternalApiService,
    @Inject(forwardRef(() => LeadSchedulingService))
    private readonly leadScheduling: LeadSchedulingService,
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

    // Lead availability analysis with fallback logic
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

      this.logger.log(
        `Testing lead availability with filters: ${JSON.stringify(testFilters)}`,
      );

      let availableLeads: any[] = [];
      let usedFilters = testFilters;

      try {
        // Try with full filters first
        availableLeads = await this.externalApi.getLeads(testFilters);
        this.logger.log(
          `Full filters result: ${availableLeads.length} leads found`,
        );
      } catch (fullFilterError: any) {
        this.logger.warn(
          `Full filters failed: ${fullFilterError?.message || fullFilterError}`,
        );

        // Try with relaxed filters (only vertical and country)
        const relaxedFilters = {
          limit: 5,
          ...(rule.leadVertical ? { vertical: rule.leadVertical } : {}),
          ...(rule.leadCountry ? { country: rule.leadCountry } : {}),
        };

        try {
          this.logger.log(
            `Trying relaxed filters: ${JSON.stringify(relaxedFilters)}`,
          );
          availableLeads = await this.externalApi.getLeads(relaxedFilters);
          usedFilters = relaxedFilters;
          this.logger.log(
            `Relaxed filters result: ${availableLeads.length} leads found`,
          );
        } catch (relaxedError: any) {
          this.logger.warn(
            `Relaxed filters also failed: ${relaxedError?.message || relaxedError}`,
          );
          throw relaxedError;
        }
      }

      leadAnalysis = {
        available: availableLeads.length,
        filters: usedFilters,
        originalFilters: testFilters,
        sampleLeads: availableLeads.slice(0, 3).map((lead: any) => ({
          name: lead.name || lead.leadName || 'N/A',
          phone: lead.phone ? lead.phone.substring(0, 4) + '***' : 'N/A', // Маскировка телефона
          country: lead.country || 'N/A',
          status: lead.status || 'N/A',
          vertical: lead.vertical || 'N/A',
          aff: lead.aff || lead.affiliate || 'N/A',
        })),
        fallbackUsed: usedFilters !== testFilters,
      };
    } catch (error: any) {
      this.logger.error(
        `Lead analysis failed completely: ${error?.message || error}`,
      );
      leadAnalysis = {
        available: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        filters: null,
        sampleLeads: [],
        fallbackUsed: false,
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

      // Don't add as validation issue - this is just informational
      // Time window issues are handled gracefully in scheduling
      if (!isInWindow) {
        this.logger.debug(
          `Rule ${ruleId} is outside time window (${rule.sendWindowStart}-${rule.sendWindowEnd}) but will be processed when window opens`,
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
        scheduledLeads: this.leadScheduling.getScheduledLeadsStatus(ruleId),
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

    if (leadAnalysis?.error && leadAnalysis.error.includes('timeout')) {
      recommendations.push(
        'Таймаут внешнего API: возможно, слишком строгие фильтры или API перегружен. Попробуйте расширить критерии поиска или повторите попытку позже.',
      );

      if (rule.leadStatus === 'Reject') {
        recommendations.push(
          'Статус "Reject" может быть редким в базе лидов. Попробуйте изменить статус на "Lead" или "Sale" для увеличения результатов.',
        );
      }
    }

    if (leadAnalysis?.available === 0 && !leadAnalysis?.error) {
      if (leadAnalysis?.fallbackUsed) {
        recommendations.push(
          'Полные фильтры не дали результатов, но упрощенные фильтры тоже пусты. Проверьте доступность лидов для данной вертикали и страны.',
        );
      } else {
        recommendations.push(
          'Нет доступных лидов с текущими фильтрами. Рекомендации: 1) Измените статус лидов, 2) Расширьте географию, 3) Попробуйте другую вертикаль.',
        );
      }
    }

    if (leadAnalysis?.error && !leadAnalysis.error.includes('timeout')) {
      recommendations.push(
        'Проблемы с внешним API - проверьте подключение и настройки API',
      );
    }

    // Add time window recommendations based on current analysis
    if (!rule.isInfinite && rule.sendWindowStart && rule.sendWindowEnd) {
      const windowDurationMinutes = Math.abs(
        this.calculateWindowDuration(rule.sendWindowStart, rule.sendWindowEnd),
      );
      const avgInterval =
        (rule.minIntervalMinutes + rule.maxIntervalMinutes) / 2;
      const estimatedLeadsInWindow =
        Math.floor(windowDurationMinutes / avgInterval) + 1;

      if (estimatedLeadsInWindow < rule.dailyCapLimit) {
        recommendations.push(
          `Временное окно (${windowDurationMinutes} мин) может вместить ~${estimatedLeadsInWindow} лидов при интервале ${rule.minIntervalMinutes}-${rule.maxIntervalMinutes} мин. Для ${rule.dailyCapLimit} лидов рассмотрите: расширение окна или уменьшение интервала.`,
        );
      }
    }

    if (validationIssues.includes('Достигнут дневной лимит')) {
      recommendations.push(
        'Дневной лимит исчерпан - дождитесь следующего дня или увеличьте лимит',
      );
    }

    // Special recommendations for very fast intervals (less than 1 minute)
    if (rule.minIntervalMinutes < 1) {
      recommendations.push(
        `Интервал ${rule.minIntervalMinutes}-${rule.maxIntervalMinutes} минут очень короткий. Это может создать высокую нагрузку на внешний API.`,
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

  private calculateWindowDuration(startTime: string, endTime: string): number {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;

    // Handle window crossing midnight
    if (startMinutes > endMinutes) {
      return 24 * 60 - startMinutes + endMinutes;
    }

    return endMinutes - startMinutes;
  }
}
