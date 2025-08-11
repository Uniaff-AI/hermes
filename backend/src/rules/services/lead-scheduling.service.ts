import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';

import { Rule } from '../domain/rule.entity';
import { LeadSending, LeadSendingStatus } from '../domain/lead-sending.entity';
import { ExternalApiService, Lead } from './external-api.service';
import { RulesUtilsService } from './rules-utils.service';

@Injectable()
export class LeadSchedulingService {
  private readonly logger = new Logger(LeadSchedulingService.name);

  constructor(
    @InjectRepository(Rule) private readonly ruleRepo: Repository<Rule>,
    @InjectRepository(LeadSending)
    private readonly leadSendingRepo: Repository<LeadSending>,
    private readonly externalApi: ExternalApiService,
    private readonly utils: RulesUtilsService,
  ) {}

  async scheduleLeadsSending(rule: Rule): Promise<void> {
    if (!rule.isActive) {
      this.logger.log(`rule ${rule.id} paused — skip`);
      return;
    }

    // 1) Получаем лиды из внешнего API
    const leads = await this.fetchLeadsForRule(rule);

    if (!leads.length) {
      this.logger.warn(`rule ${rule.id}: no leads to send`);
      return;
    }

    // Если бесконечная отправка, отправляем все доступные лиды
    // Если обычная отправка, ограничиваем по dailyCapLimit
    const toSend = rule.isInfinite
      ? leads
      : leads.slice(0, rule.dailyCapLimit || 10);

    // 2) Определяем временное окно отправки
    const { windowStart, windowEnd } = this.calculateTimeWindow(rule);
    if (windowEnd <= windowStart && !rule.isInfinite) {
      this.logger.warn(`rule ${rule.id}: empty/inverted window`);
      return;
    }

    // 3) Планируем отправку лидов с интервалами
    this.scheduleLeadsWithIntervals(rule.id, toSend, windowStart, rule);

    this.logger.log(
      `rule ${rule.id}: scheduled ${toSend.length} leads${rule.isInfinite ? ' (infinite mode)' : ''}`,
    );
  }

  private async fetchLeadsForRule(rule: Rule): Promise<Lead[]> {
    // 1) Строим фильтры для запроса лидов
    const limit = rule.isInfinite ? 999999 : rule.dailyCapLimit || 10; // Используем 10 как fallback
    const filters = {
      limit,
      ...(rule.productName ? { productName: rule.productName } : {}),
      ...(rule.vertical ? { vertical: rule.vertical } : {}),
      ...(rule.country ? { country: rule.country } : {}),
      ...(rule.status ? { status: rule.status } : {}),
      ...(rule.dateFrom ? { date_from: rule.dateFrom } : {}),
      ...(rule.dateTo ? { date_to: rule.dateTo } : {}),
    };

    try {
      let raw = await this.externalApi.getLeads(filters);

      // Если отфильтрованные пустые — делаем фоллбэк по productName+limit
      if (
        raw.length === 0 &&
        (rule.vertical ||
          rule.country ||
          rule.status ||
          rule.dateFrom ||
          rule.dateTo)
      ) {
        this.logger.warn(
          `rule ${rule.id}: empty by filters, fallback request by productName only`,
        );
        const fallbackFilters = {
          limit,
          ...(rule.productName ? { productName: rule.productName } : {}),
        };
        raw = await this.externalApi.getLeads(fallbackFilters);
      }

      // Нормализация и локальные фильтры (offerId/dailyCapLimit)
      return this.normalizeAndFilterLeads(raw, rule);
    } catch (error) {
      this.logger.error(`Failed to fetch leads for rule ${rule.id}:`, error);
      return [];
    }
  }

  private normalizeAndFilterLeads(rawLeads: any[], rule: Rule): Lead[] {
    return rawLeads
      .filter((r) => {
        const sid = this.utils.getField(r, 'subid', 'subId', 'sub_id');
        const pid = this.utils.getField(
          r,
          'productId',
          'product_id',
          'product',
        );
        if (!sid || !pid) return false;

        if (rule.productId && String(pid) !== String(rule.productId)) {
          return false;
        }

        // Проверяем кап только если не бесконечная отправка
        if (!rule.isInfinite) {
          const redirects =
            r.redirects ?? r.redirects_count ?? r.redirectsCount;
          if (
            typeof redirects === 'number' &&
            typeof rule.dailyCapLimit === 'number' &&
            redirects > rule.dailyCapLimit
          ) {
            return false;
          }
        }
        return true;
      })
      .map<Lead>((r) => {
        const sid = this.utils.getField(r, 'subid', 'subId', 'sub_id')!;
        const pid = this.utils.getField(
          r,
          'productId',
          'product_id',
          'product',
        )!;
        const pnm =
          this.utils.getField(r, 'productName', 'product_name', 'product') ??
          '';
        const name =
          (r.leadName ?? r.name ?? '').toString().trim() || 'Unknown';

        return {
          subid: sid,
          productId: pid,
          productName: pnm,
          aff: (r.aff ?? '').toString(),
          country: (r.country ?? '').toString() || undefined,
          vertical: (r.vertical ?? '').toString() || undefined,
          status: (r.status ?? '').toString() || undefined,
          leadName: name,
          phone: (r.phone ?? '').toString() || undefined,
          email: (r.email ?? '').toString() || undefined,
          ip: (r.ip ?? '').toString() || undefined,
          ua: (r.ua ?? '').toString() || undefined,
          redirects: typeof r.redirects === 'number' ? r.redirects : undefined,
          date: (r.date ?? r.created_at ?? '').toString() || undefined,
        };
      });
  }

  private calculateTimeWindow(rule: Rule): {
    windowStart: number;
    windowEnd: number;
  } {
    if (rule.isInfinite) {
      // Для бесконечной отправки используем текущее время как начало окна
      return {
        windowStart: Date.now(),
        windowEnd: Date.now() + 24 * 60 * 60 * 1000, // +24 часа
      };
    }

    // Для обычной отправки проверяем временное окно
    if (!rule.sendWindowStart || !rule.sendWindowEnd) {
      throw new Error(`Missing time window for non-infinite rule ${rule.id}`);
    }

    let sh: number, sm: number, eh: number, em: number;
    try {
      [sh, sm] = this.utils.parseTimeHM(rule.sendWindowStart);
      [eh, em] = this.utils.parseTimeHM(rule.sendWindowEnd);
    } catch (e: any) {
      throw new Error(`Invalid window for rule ${rule.id}: ${e?.message || e}`);
    }

    return {
      windowStart: this.utils.getTodayTimestamp(sh, sm),
      windowEnd: this.utils.getTodayTimestamp(eh, em),
    };
  }

  private scheduleLeadsWithIntervals(
    ruleId: string,
    leads: Lead[],
    windowStart: number,
    rule: Rule,
  ): void {
    leads.forEach((lead) => {
      const rndMin = this.utils.randomInRange(
        rule.minInterval,
        rule.maxInterval,
      );
      const at = windowStart + rndMin * 60_000;
      const delay = Math.max(at - Date.now(), 0);

      setTimeout(() => {
        this.sendOneLead(ruleId, lead).catch((err) =>
          this.logger.error(
            `rule ${ruleId}: send ${lead.subid} error: ${err?.message || err}`,
          ),
        );
      }, delay);
    });
  }

  private async sendOneLead(ruleId: string, lead: Lead): Promise<void> {
    const payload = {
      productName: lead.productName,
      country: lead.country,
      vertical: lead.vertical ?? '',
      aff: lead.aff ?? '',
      productId: lead.productId,
      subid: lead.subid,
      status: lead.status ?? 'Sale',
      leadName: lead.leadName ?? '',
      phone: lead.phone ?? '',
      email: lead.email ?? '',
      ip: lead.ip ?? '',
      ua: lead.ua ?? '',
    };

    try {
      const result = await this.externalApi.addLead(payload);

      const ok = this.leadSendingRepo.create({
        ruleId,
        subid: lead.subid,
        leadName: lead.leadName || '',
        phone: lead.phone || '',
        email: lead.email || undefined,
        country: lead.country || undefined,
        status: LeadSendingStatus.SUCCESS,
        responseStatus: result.status,
      } as DeepPartial<LeadSending>);
      await this.leadSendingRepo.save(ok);

      this.logger.log(
        `rule ${ruleId}: lead ${lead.subid} sent (HTTP ${result.status})`,
      );
    } catch (err: any) {
      const status = err?.response?.status;
      const details = err?.response?.data ?? err?.message ?? err;

      const fail = this.leadSendingRepo.create({
        ruleId,
        subid: lead.subid,
        leadName: lead.leadName || '',
        phone: lead.phone || '',
        email: lead.email || undefined,
        country: lead.country || undefined,
        status: LeadSendingStatus.ERROR,
        responseStatus: status,
        errorDetails: this.utils.stringify(details),
      } as DeepPartial<LeadSending>);
      await this.leadSendingRepo.save(fail);

      this.logger.error(
        `rule ${ruleId}: send ${lead.subid} failed: ${status ?? ''} ${this.utils.stringify(details)}`,
      );
    }
  }

  async planNextDay(ruleId: string): Promise<void> {
    const rule = await this.ruleRepo.findOneBy({ id: ruleId });
    if (!rule) return;

    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0);
    const delay = nextMidnight.getTime() - now.getTime();

    setTimeout(
      async () => {
        const r = await this.ruleRepo.findOneBy({ id: ruleId });
        if (!r || !r.isActive) return;
        await this.scheduleLeadsSending(r);
        this.planNextDay(ruleId).catch(() => {});
      },
      Math.max(delay, 0),
    );
  }

  async manualTriggerRule(ruleId: string): Promise<{
    ruleId: string;
    ruleName: string;
    triggered: boolean;
    timestamp: string;
    message: string;
  }> {
    const rule = await this.ruleRepo.findOneBy({ id: ruleId });
    if (!rule) {
      throw new Error(`Rule ${ruleId} not found`);
    }

    this.logger.log(`Manually triggering rule ${ruleId}: ${rule.name}`);

    // Запускаем процесс отправки лидов
    await this.scheduleLeadsSending(rule);

    return {
      ruleId,
      ruleName: rule.name,
      triggered: true,
      timestamp: new Date().toISOString(),
      message: 'Rule execution started manually',
    };
  }
}
