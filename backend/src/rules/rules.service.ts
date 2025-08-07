import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import axios, { AxiosRequestConfig } from 'axios';
import { ConfigService } from '@nestjs/config';

import { Rule } from './domain/rule.entity';
import { LeadSending, LeadSendingStatus } from './domain/lead-sending.entity';
import { CreateRuleDto } from './dto/create-rule.dto';
import { AppConfig } from '../config/app-config.type';

import { parseTimeHM, getTodayTimestamp } from '../utils/time.util';
import { randomInRange } from '../utils/random.util';

interface Lead {
  subid: string;
  productId: string;
  productName: string;
  aff: string;
  offer: string;
  offer_name: string;
  leadName: string;
  country: string;
  phone: string;
  ua: string;
  ip: string;
}

@Injectable()
export class RulesService {
  private readonly logger = new Logger(RulesService.name);

  private readonly leadsUrl: string;
  private readonly affiliateUrl: string;
  private readonly apiKey: string;
  private readonly timeoutMs: number;

  constructor(
    @InjectRepository(Rule)
    private readonly repo: Repository<Rule>,

    @InjectRepository(LeadSending)
    private readonly leadSendingRepo: Repository<LeadSending>,

    private readonly http: HttpService,
    private readonly config: ConfigService,

    @InjectQueue('lead-scheduler')
    private readonly leadSchedulerQueue: Queue,
  ) {
    const app = this.config.get<AppConfig>('app')!;
    this.leadsUrl = app.externalApis.leads.url;
    this.affiliateUrl = app.externalApis.affiliate.url;
    this.apiKey = app.externalApis.leads.apiKey;
    this.timeoutMs = app.externalApis.leads.timeout;
  }

  async createAndSchedule(dto: CreateRuleDto): Promise<Rule> {
    const rule = this.repo.create(dto);
    await this.repo.save(rule);
    await this.leadSchedulerQueue.add('schedule', { ruleId: rule.id });
    return rule;
  }

  findAll(): Promise<Rule[]> {
    return this.repo.find();
  }

  findOne(id: string): Promise<Rule | null> {
    return this.repo.findOneBy({ id });
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
    this.logger.log(`Rule ${id} deleted`);
  }

  async update(id: string, updateData: Partial<Rule>): Promise<Rule> {
    const rule = await this.repo.findOneBy({ id });
    if (!rule) {
      throw new Error(`Rule with id ${id} not found`);
    }

    const updatedRule = { ...rule, ...updateData };
    const savedRule = await this.repo.save(updatedRule);
    this.logger.log(`Rule ${id} updated`);
    return savedRule;
  }

  /**
   * Получение аналитики по правилу
   */
  async getRuleAnalytics(ruleId: string) {
    const rule = await this.repo.findOneBy({ id: ruleId });
    if (!rule) {
      throw new Error(`Rule ${ruleId} not found`);
    }

    const [sendings, totalSent, totalSuccess, totalErrors] = await Promise.all([
      this.leadSendingRepo.find({
        where: { ruleId },
        order: { sentAt: 'DESC' },
        take: 50, // Последние 50 отправок
      }),
      this.leadSendingRepo.count({ where: { ruleId } }),
      this.leadSendingRepo.count({
        where: { ruleId, status: LeadSendingStatus.SUCCESS },
      }),
      this.leadSendingRepo.count({
        where: { ruleId, status: LeadSendingStatus.ERROR },
      }),
    ]);

    const successRate =
      totalSent > 0 ? ((totalSuccess / totalSent) * 100).toFixed(1) : '0';
    const lastSending = sendings[0];

    return {
      rule,
      stats: {
        totalSent,
        totalSuccess,
        totalErrors,
        successRate: `${successRate}%`,
        lastSent: lastSending
          ? this.formatRelativeTime(lastSending.sentAt)
          : 'Никогда',
      },
      recentSendings: sendings.map((sending) => ({
        id: sending.id,
        subid: sending.subid,
        leadName: sending.leadName,
        phone: sending.phone,
        email: sending.email,
        status: sending.status,
        errorDetails: sending.errorDetails,
        sentAt: sending.sentAt,
      })),
    };
  }

  /**
   * Получение общей аналитики по всем правилам
   */
  async getAllRulesAnalytics() {
    const rules = await this.repo.find();

    if (!rules || rules.length === 0) {
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

    const analyticsPromises = rules.map((rule) =>
      this.getRuleAnalytics(rule.id),
    );
    const rulesAnalytics = await Promise.all(analyticsPromises);

    const totalStats = rulesAnalytics.reduce(
      (acc, curr) => ({
        totalSent: acc.totalSent + curr.stats.totalSent,
        totalSuccess: acc.totalSuccess + curr.stats.totalSuccess,
        totalErrors: acc.totalErrors + curr.stats.totalErrors,
      }),
      { totalSent: 0, totalSuccess: 0, totalErrors: 0 },
    );

    const overallSuccessRate =
      totalStats.totalSent > 0
        ? ((totalStats.totalSuccess / totalStats.totalSent) * 100).toFixed(1)
        : '0';

    return {
      totalStats: {
        ...totalStats,
        successRate: `${overallSuccessRate}%`,
      },
      rules: rulesAnalytics,
    };
  }

  private formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));

    if (diffMin < 60) return `${diffMin} мин назад`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} ч назад`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} дн назад`;
  }

  /**
   * Основная логика рассылки:
   * 1) Получаем «сырые» данные лидов из внешнего API
   * 2) Фильтруем записи без subid или productId
   * 3) Приводим к единому интерфейсу Lead
   * 4) Берём ровно dailyLimit валидных записей
   * 5) Распределяем их во времени в заданном окне
   */
  public async scheduleLeadsSending(rule: Rule): Promise<void> {
    const axiosConfig: AxiosRequestConfig = {
      headers: {
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
      },
      timeout: this.timeoutMs,
    };

    let rawLeads: any[] = [];
    try {
      const resp = await firstValueFrom(
        this.http.post<any[]>(
          this.leadsUrl,
          {
            limit: rule.dailyLimit,
            offer_name: rule.offerName,
          },
          axiosConfig,
        ),
      );
      rawLeads = resp.data;
      this.logger.debug(
        `Raw leads for rule ${rule.id}: ${JSON.stringify(rawLeads, null, 2)}`,
      );
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        this.logger.error(
          `Failed to fetch leads for rule ${rule.id}: ` +
            `${err.response?.status} ${JSON.stringify(err.response?.data)}`,
        );
      } else {
        this.logger.error(
          `Failed to fetch leads for rule ${rule.id}: ${err.message}`,
        );
      }
      return;
    }

    // 2) Оставляем только те записи, где есть непустой subid и непустой productId
    const validRaw = rawLeads.filter((r) => {
      const sid = (r.subid ?? r.subId ?? r.sub_id) as string | undefined;
      const pid = (r.productId ?? r.product_id ?? r.product) as
        | string
        | undefined;
      return sid?.trim() !== '' && pid?.trim() !== '';
    });
    if (validRaw.length < rawLeads.length) {
      this.logger.warn(
        `Rule ${rule.id}: dropped ${rawLeads.length - validRaw.length} leads without subid or productId`,
      );
    }

    // 3) Нормализация структуры под интерфейс Lead
    const leads: Lead[] = validRaw.map((r) => {
      const rawSid = (r.subid ?? r.subId ?? r.sub_id)! as string;
      const rawPid = (r.productId ?? r.product_id ?? r.product)! as string;
      const rawPnm = (r.productName ??
        r.product_name ??
        r.offerName ??
        r.offer_name ??
        r.product)! as string;
      const rawName = (r.leadName ?? r.name ?? '').trim();
      return {
        subid: rawSid.trim(),
        productId: rawPid.trim(),
        productName: rawPnm.trim(),
        aff: (r.aff ?? '').trim(),
        offer: (r.offer ?? '').trim(),
        offer_name: (r.offer_name ?? r.offerName ?? '').trim(),
        leadName: rawName !== '' ? rawName : 'Unknown', // подставляем дефолт, если пустая
        country: (r.country ?? '').trim(),
        phone: (r.phone ?? '').trim(),
        ua: (r.ua ?? '').trim(),
        ip: (r.ip ?? '').trim(),
      };
    });

    // 4) Берём ровно dailyLimit первых валидных лидов
    const toSend = leads.slice(0, rule.dailyLimit);
    if (toSend.length < rule.dailyLimit) {
      this.logger.warn(
        `Rule ${rule.id}: only ${toSend.length} valid leads out of ${rule.dailyLimit} requested`,
      );
    }

    // 5) Расчёт таймингов
    let sh: number, sm: number, eh: number, em: number;
    try {
      [sh, sm] = parseTimeHM(rule.sendWindowStart);
      [eh, em] = parseTimeHM(rule.sendWindowEnd);
    } catch (e: any) {
      this.logger.warn(`Invalid sendWindow for rule ${rule.id}: ${e.message}`);
      return;
    }
    const windowStart = getTodayTimestamp(sh, sm);
    const windowEnd = getTodayTimestamp(eh, em);
    if (windowEnd <= windowStart) {
      this.logger.warn(`Empty/inverted window for rule ${rule.id}`);
      return;
    }

    toSend.forEach((lead) => {
      const rndMin = randomInRange(rule.minInterval, rule.maxInterval);
      const at = windowStart + rndMin * 60_000;
      const delay = Math.max(at - Date.now(), 0);

      setTimeout(() => {
        this.sendOneLead(rule.id, lead).catch((err) =>
          this.logger.error(`Error sending lead ${lead.subid}: ${err.message}`),
        );
      }, delay);
    });

    this.logger.log(`Scheduled ${toSend.length} leads for rule ${rule.id}`);
  }

  /**
   * Отправка одного лида во внешний API с сохранением результата в БД
   */
  private async sendOneLead(ruleId: string, lead: Lead): Promise<void> {
    const cfgPost: AxiosRequestConfig = {
      headers: {
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
      },
      timeout: this.timeoutMs,
    };

    // Логируем полный payload (включая productId, productName и leadName)
    this.logger.debug(
      `Payload to affiliate for rule ${ruleId}: ${JSON.stringify(lead)}`,
    );

    let leadSending: LeadSending;

    try {
      const resp = await firstValueFrom(
        this.http.post(this.affiliateUrl, lead, cfgPost),
      );

      // Создаем запись об успешной отправке
      leadSending = this.leadSendingRepo.create({
        ruleId,
        subid: lead.subid,
        leadName: lead.leadName,
        phone: lead.phone,
        email: lead.offer || undefined, // Используем offer как email если есть
        country: lead.country || undefined,
        status: LeadSendingStatus.SUCCESS,
        responseStatus: resp.status,
      });

      await this.leadSendingRepo.save(leadSending);

      if (resp.status === 200) {
        this.logger.log(`Rule ${ruleId}: lead ${lead.subid} sent successfully`);
      } else {
        this.logger.warn(
          `Rule ${ruleId}: affiliate returned ${resp.status} for ${lead.subid}`,
        );
      }
    } catch (err: any) {
      let errorDetails = '';
      let responseStatus: number | undefined;

      if (axios.isAxiosError(err)) {
        responseStatus = err.response?.status;
        errorDetails = `HTTP ${responseStatus}: ${JSON.stringify(err.response?.data)}`;
        this.logger.error(
          `Rule ${ruleId}: failed to send lead ${lead.subid}: ` +
            `${responseStatus} ${JSON.stringify(err.response?.data)}`,
        );
      } else {
        errorDetails = err.message;
        this.logger.error(
          `Rule ${ruleId}: failed to send lead ${lead.subid}: ${err.message}`,
        );
      }

      // Создаем запись об ошибке отправки
      leadSending = this.leadSendingRepo.create({
        ruleId,
        subid: lead.subid,
        leadName: lead.leadName,
        phone: lead.phone,
        email: lead.offer || undefined,
        country: lead.country || undefined,
        status: LeadSendingStatus.ERROR,
        errorDetails,
        responseStatus,
      });

      await this.leadSendingRepo.save(leadSending);
    }
  }
}
