// src/rules/rules.service.ts

import { Injectable, Logger }        from '@nestjs/common';
import { InjectRepository }          from '@nestjs/typeorm';
import { Repository }                from 'typeorm';
import { HttpService }               from '@nestjs/axios';
import { firstValueFrom }            from 'rxjs';
import { ConfigService }             from '@nestjs/config';
import axios, { AxiosRequestConfig } from 'axios';

import { Rule }           from './domain/rule.entity';
import { CreateRuleDto }  from './dto/create-rule.dto';
import { AppConfig }      from '../config/app-config.type';

import { parseTimeHM, getTodayTimestamp } from '../utils/time.util';
import { randomInRange }                  from '../utils/random.util';

interface Product {
    productName: string;
    country:     string;
    vertical:    string;
    aff:         string;
    productId:   string;
}

interface Lead {
    sub_id:     string;
    aff:        string;
    offer:      string;
    offer_name: string;
    country:    string;
    name:       string;
    phone:      string;
    ua:         string;
    ip:         string;
}

@Injectable()
export class RulesService {
    private readonly logger = new Logger(RulesService.name);

    private readonly productsUrl:    string;
    private readonly leadsUrl:       string;
    private readonly affiliateUrl:   string;
    private readonly apiKey:         string;
    private readonly timeoutMs:      number;

    constructor(
        @InjectRepository(Rule) private readonly repo: Repository<Rule>,
        private readonly http:     HttpService,
        private readonly config:   ConfigService,
    ) {
        // Забираем сразу весь namespace 'app' из конфига
        const app = this.config.get<AppConfig>('app')!;
        this.productsUrl  = app.externalApis.products.url;
        this.leadsUrl     = app.externalApis.leads.url;
        this.affiliateUrl = app.externalApis.affiliate.url;
        this.apiKey       = app.externalApis.leads.apiKey;
        this.timeoutMs    = app.externalApis.leads.timeout;
    }

    // === 1) GET /rules/products ===
    // async getProducts(): Promise<Product[]> {
    //     const cfg: AxiosRequestConfig = {
    //         headers: { 'X-API-KEY': this.apiKey },
    //         timeout: this.timeoutMs,
    //     } as any;
    //
    //     try {
    //         const resp = await firstValueFrom(
    //             this.http.get<Product[]>(this.productsUrl, cfg),
    //         );
    //         return resp.data;
    //     } catch (err: any) {
    //         this.logger.error(`Failed to fetch products`, err.response?.data || err.message);
    //         return [];
    //     }
    // }

    // === 2) POST /rules ===
    async createAndSchedule(dto: CreateRuleDto): Promise<Rule> {
        const rule = this.repo.create(dto);
        await this.repo.save(rule);

        // fire-and-forget задача
        this.scheduleLeadsSending(rule).catch(e =>
            this.logger.error(`scheduleLeadsSending for ${rule.id} failed`, e),
        );

        return rule;
    }

    // === 3) GET /rules ===
    findAll(): string {
        return "mock";
    }

    // === 4) GET /rules/:id ===
    findOne(id: string): Promise<Rule | null> {
        return this.repo.findOneBy({ id });
    }

    // === 5) DELETE /rules/:id ===
    async remove(id: string): Promise<void> {
        await this.repo.delete(id);
        this.logger.log(`Rule ${id} deleted`);
    }

    // === Внутренние задачи ===

    /** 1) Запросить лиды, 2) расписать setTimeout, 3) отправить each lead */
    private async scheduleLeadsSending(rule: Rule): Promise<void> {
        // --- Fetch leads POST /get_leads
        const body = {
            limit:      rule.dailyLimit,
            offer_name: rule.offerName,
            // сюда при необходимости можно добавить country, вертикаль и т.п.
        };
        const cfgGet: AxiosRequestConfig = {
            headers: { 'X-API-KEY': this.apiKey, 'Content-Type': 'application/json' },
            timeout: this.timeoutMs,
        };

        let leads: Lead[] = [];
        try {
            const resp = await firstValueFrom(
                this.http.post<Lead[]>(this.leadsUrl, body, cfgGet),
            );
            leads = resp.data;
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                this.logger.error(
                    `Failed to fetch leads for rule ${rule.id}: ` +
                    `${err.response?.status} ${JSON.stringify(err.response?.data)}`
                );
            } else {
                this.logger.error(`Failed to fetch leads for rule ${rule.id}: ${err.message}`);
            }
            return;
        }

        const toSend = leads.slice(0, rule.dailyLimit);

        // --- Разобрать окно "HH:MM"
        let sh: number, sm: number, eh: number, em: number;
        try {
            [sh, sm] = parseTimeHM(rule.sendWindowStart);
            [eh, em] = parseTimeHM(rule.sendWindowEnd);
        } catch (e: any) {
            this.logger.warn(`Invalid sendWindow format for ${rule.id}: ${e.message}`);
            return;
        }

        const windowStart = getTodayTimestamp(sh, sm);
        const windowEnd   = getTodayTimestamp(eh, em);
        if (windowEnd <= windowStart) {
            this.logger.warn(`Empty/inverted window for rule ${rule.id}`);
            return;
        }

        // --- Расписание
        toSend.forEach(lead => {
            const rndMin  = randomInRange(rule.minInterval, rule.maxInterval);
            const at      = windowStart + rndMin * 60_000;
            const delay   = Math.max(at - Date.now(), 0);

            setTimeout(() => {
                this.sendOneLead(rule, lead).catch(e =>
                    this.logger.error(`Error sending lead ${lead.sub_id}: ${e.message}`),
                );
            }, delay);
        });

        this.logger.log(`Scheduled ${toSend.length} leads for rule ${rule.id}`);
    }

    /** Отправляет один лид в /add_lead */
    private async sendOneLead(rule: Rule, lead: Lead): Promise<void> {
        const cfgPost: AxiosRequestConfig = {
            headers: {
                'X-API-KEY':     this.apiKey,
                'Content-Type': 'application/json',
            },
            timeout: this.timeoutMs,
        };

        try {
            const resp = await firstValueFrom(
                this.http.post(this.affiliateUrl, lead, cfgPost),
            );
            if (resp.status === 200) {
                this.logger.log(`Lead ${lead.sub_id} sent successfully`);
            } else {
                this.logger.warn(`Affiliate returned ${resp.status} for ${lead.sub_id}`);
            }
        } catch (err: any) {
            if (axios.isAxiosError(err)) {
                this.logger.error(
                    `Failed to send lead ${lead.sub_id}: ` +
                    `${err.response?.status} ${JSON.stringify(err.response?.data)}`,
                );
            } else {
                this.logger.error(`Failed to send lead ${lead.sub_id}: ${err.message}`);
            }
        }
    }
}
