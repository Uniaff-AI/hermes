import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { ExternalApisClient } from '@/adapters/external-apis/external-apis.client';
import { Rule } from '@prisma/client';
import { ExternalLead } from '@/adapters/php-backend/php-backend.types';

@Injectable()
export class RulesService {
  private readonly logger = new Logger(RulesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly externalApisClient: ExternalApisClient
  ) {}

  async create(dto: CreateRuleDto): Promise<Rule> {
    const rule = await this.prisma.rule.create({
      data: {
        name: dto.name,
        offerId: dto.offerId,
        offerName: dto.offerName,
        periodMinutes: dto.periodMinutes,
        minInterval: dto.minInterval,
        maxInterval: dto.maxInterval,
        dailyLimit: dto.dailyLimit,
        sendWindowStart: dto.sendWindowStart,
        sendWindowEnd: dto.sendWindowEnd,
        isActive: dto.isActive ?? true,
      },
    });

    // Fire-and-forget scheduling
    this.scheduleLeadsSending(rule).catch(err =>
      this.logger.error(`scheduleLeadsSending failed for rule ${rule.id}`, err)
    );

    return rule;
  }

  async findAll(): Promise<Rule[]> {
    return this.prisma.rule.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string): Promise<Rule | null> {
    return this.prisma.rule.findUnique({
      where: { id },
    });
  }

  async update(id: string, dto: UpdateRuleDto): Promise<Rule> {
    return this.prisma.rule.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.rule.delete({
      where: { id },
    });
    this.logger.log(`Rule ${id} deleted`);
  }

  private async scheduleLeadsSending(rule: Rule): Promise<void> {
    try {
      // Get leads from external API
      const leads = await this.getLeadsFromExternalApi(rule);
      const toSend = leads.slice(0, rule.dailyLimit);

      // Parse time window
      const [startHour, startMinute] = rule.sendWindowStart
        .split(':')
        .map(Number);
      const [endHour, endMinute] = rule.sendWindowEnd.split(':').map(Number);

      const now = new Date();
      const windowStartMs = new Date(now).setHours(
        startHour,
        startMinute,
        0,
        0
      );
      const windowEndMs = new Date(now).setHours(endHour, endMinute, 0, 0);
      const totalWindowMs = windowEndMs - windowStartMs;

      if (totalWindowMs <= 0) {
        this.logger.warn(`Invalid send window for rule ${rule.id}`);
        return;
      }

      // Schedule each lead
      for (const lead of toSend) {
        const randomMinutes = this.randomInRange(
          rule.minInterval,
          rule.maxInterval
        );
        const delayMs = randomMinutes * 60_000;
        const sendAt = windowStartMs + delayMs;
        const timeout = Math.max(sendAt - Date.now(), 0);

        setTimeout(() => {
          this.sendLeadToAffiliate(rule, lead).catch(err =>
            this.logger.error(`Failed to send lead ${lead.sub_id}`, err)
          );
        }, timeout);
      }

      this.logger.log(`Scheduled ${toSend.length} leads for rule ${rule.id}`);
    } catch (error) {
      this.logger.error(`Failed to schedule leads for rule ${rule.id}`, error);
    }
  }

  private async getLeadsFromExternalApi(rule: Rule): Promise<ExternalLead[]> {
    try {
      const leads = await this.externalApisClient.getLeads({
        limit: rule.dailyLimit,
        offer_name: rule.offerName,
      });

      // Transform the response to match ExternalLead interface
      return leads.map((lead: any) => ({
        sub_id: lead.sub_id || lead.id,
        aff: lead.aff || 'default',
        offer: rule.offerId,
        offer_name: rule.offerName,
        country: lead.country || 'unknown',
        name: lead.name,
        phone: lead.phone || '',
        ua: lead.ua || lead.userAgent || '',
        ip: lead.ip || '',
      }));
    } catch (error) {
      this.logger.error(
        `Failed to get leads from external API for rule ${rule.id}`,
        error
      );
      return [];
    }
  }

  private async sendLeadToAffiliate(
    rule: Rule,
    lead: ExternalLead
  ): Promise<void> {
    try {
      await this.externalApisClient.sendLeadToAffiliate(lead);
      this.logger.log(
        `Successfully sent lead ${lead.sub_id} for rule ${rule.id}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to send lead ${lead.sub_id} to affiliate`,
        error
      );
    }
  }

  private randomInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
