import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import axios, { AxiosRequestConfig } from 'axios';

import { AppConfig } from '../../config/app-config.type';
import { RulesUtilsService } from './rules-utils.service';

export type Product = {
  productName: string;
  country: string;
  vertical: string;
  aff: string;
  productId: string;
};

export type Lead = {
  productName: string;
  country: string;
  vertical?: string;
  aff?: string;
  productId: string;
  date?: string;
  subid: string;
  status?: string;
  leadName?: string;
  phone?: string;
  email?: string;
  ip?: string;
  ua?: string;
  redirects?: number;
};

@Injectable()
export class ExternalApiService {
  private readonly logger = new Logger(ExternalApiService.name);
  private readonly endpoints = { getLeads: '', getProducts: '', addLead: '' };
  private readonly apiKey: string;
  private readonly timeout: number;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly utils: RulesUtilsService,
  ) {
    const app = this.config.get<AppConfig>('app')!;
    this.endpoints.getLeads = app.externalApis.leads.url;
    this.endpoints.getProducts = app.externalApis.products.url;
    this.endpoints.addLead = app.externalApis.affiliate.url;
    this.apiKey = app.externalApis.leads.apiKey;
    this.timeout = app.externalApis.leads.timeout;
  }

  async getProducts(): Promise<Product[]> {
    const cfg: AxiosRequestConfig = {
      headers: { 'X-API-KEY': this.apiKey, Accept: 'application/json' },
      timeout: this.utils.minTimeout(this.timeout),
      validateStatus: () => true,
    };

    try {
      const resp = await firstValueFrom(
        this.http.get<Product[]>(this.endpoints.getProducts, cfg),
      );

      if (resp.status !== 200) {
        this.logger.error(
          `Products HTTP ${resp.status}: ${this.utils.stringify(resp.data)}`,
        );
        return [];
      }

      return Array.isArray(resp.data) ? resp.data : [];
    } catch (err: any) {
      const status = err?.response?.status;
      const details = err?.response?.data ?? err?.message ?? err;
      this.logger.error(
        `Failed to fetch products: ${status ?? ''} ${this.utils.stringify(details)}`,
      );
      return [];
    }
  }

  async getLeads(filters: {
    limit: number;
    productName?: string;
    vertical?: string;
    country?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<Lead[]> {
    const cfgLeads: AxiosRequestConfig = {
      headers: {
        'X-API-KEY': this.apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: this.utils.minTimeout(this.timeout),
      validateStatus: () => true,
    };

    try {
      const maxAttempts = 2;
      let resp: any;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          // Строим query параметры для GET запроса
          const queryParams = new URLSearchParams();
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
              queryParams.append(key, String(value));
            }
          });

          const url = queryParams.toString()
            ? `${this.endpoints.getLeads}?${queryParams.toString()}`
            : this.endpoints.getLeads;

          this.logger.debug?.(`GET ${url}`);

          resp = await firstValueFrom(this.http.get<any[]>(url, cfgLeads));

          if (resp.status === 200) break;

          if (resp.status >= 500 || resp.status === 429) {
            const backoff = Math.min(2000, 500 * Math.pow(2, attempt - 1));
            this.logger.warn(
              `get_leads HTTP ${resp.status}, retry in ${backoff}ms`,
            );
            await this.utils.sleep(backoff);
            if (attempt === maxAttempts) {
              throw new Error(
                `HTTP ${resp.status} ${this.utils.stringify(resp.data)}`,
              );
            }
            continue;
          }
          throw new Error(
            `HTTP ${resp.status} ${this.utils.stringify(resp.data)}`,
          );
        } catch (err: any) {
          const isTimeout =
            axios.isAxiosError(err) &&
            (err.code === 'ECONNABORTED' ||
              String(err.message).includes('timeout'));
          if (isTimeout && attempt < maxAttempts) {
            const backoff = Math.min(2000, 500 * Math.pow(2, attempt - 1));
            this.logger.warn(`get_leads timeout, retry in ${backoff}ms`);
            await this.utils.sleep(backoff);
            continue;
          }
          throw err;
        }
      }

      const raw: any[] = Array.isArray(resp.data) ? resp.data : [];
      this.logger.debug?.(
        `Raw leads: ${this.utils.stringify(raw).slice(0, 4000)}`,
      );

      return raw;
    } catch (err: any) {
      const status = err?.response?.status;
      const details = err?.response?.data ?? err?.message ?? err;
      this.logger.error(
        `Failed to fetch leads: ${status ?? ''} ${this.utils.stringify(details)}`,
      );
      throw err;
    }
  }

  async addLead(payload: {
    productName: string;
    country: string;
    vertical: string;
    aff: string;
    productId: string;
    subid: string;
    status: string;
    leadName: string;
    phone: string;
    email: string;
    ip: string;
    ua: string;
  }): Promise<{ status: number; data: any }> {
    const cfgPost: AxiosRequestConfig = {
      headers: { 'X-API-KEY': this.apiKey, 'Content-Type': 'application/json' },
      timeout: this.utils.minTimeout(this.timeout),
      validateStatus: () => true,
    };

    const maxAttempts = 3;
    let resp: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        resp = await firstValueFrom(
          this.http.post(this.endpoints.addLead, payload, cfgPost),
        );

        if (resp.status >= 200 && resp.status < 300) break;

        if (resp.status >= 500 || resp.status === 429) {
          const backoff = Math.min(4000, 1000 * Math.pow(2, attempt - 1));
          this.logger.warn(
            `add_lead HTTP ${resp.status}, retry in ${backoff}ms`,
          );
          await this.utils.sleep(backoff);
          if (attempt === maxAttempts) {
            throw new Error(
              `HTTP ${resp.status} ${this.utils.stringify(resp.data)}`,
            );
          }
          continue;
        }
        throw new Error(
          `HTTP ${resp.status} ${this.utils.stringify(resp.data)}`,
        );
      } catch (err: any) {
        const isTimeout =
          axios.isAxiosError(err) &&
          (err.code === 'ECONNABORTED' ||
            String(err.message).includes('timeout'));
        if (isTimeout && attempt < maxAttempts) {
          const backoff = Math.min(4000, 1000 * Math.pow(2, attempt - 1));
          this.logger.warn(`add_lead timeout, retry in ${backoff}ms`);
          await this.utils.sleep(backoff);
          continue;
        }
        throw err;
      }
    }

    return { status: resp.status, data: resp.data };
  }

  async testConnection(): Promise<{
    timestamp: string;
    endpoints: Record<string, any>;
  }> {
    const results = {
      timestamp: new Date().toISOString(),
      endpoints: {},
    };

    // Тест products endpoint
    try {
      const products = await this.getProducts();
      results.endpoints['products'] = {
        url: this.endpoints.getProducts,
        success: true,
        count: products.length,
        status: 200,
      };
    } catch (err: any) {
      results.endpoints['products'] = {
        url: this.endpoints.getProducts,
        success: false,
        error: err?.message || 'Unknown error',
        status: err?.response?.status || 'timeout',
      };
    }

    // Тест leads endpoint с минимальным запросом
    try {
      const testUrl = `${this.endpoints.getLeads}?limit=1`;
      const cfgLeads = {
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: this.utils.minTimeout(this.timeout),
        validateStatus: () => true,
      };

      const resp = await firstValueFrom(
        this.http.get<any[]>(testUrl, cfgLeads),
      );

      results.endpoints['leads'] = {
        url: this.endpoints.getLeads,
        success: resp.status === 200,
        status: resp.status,
        hasData: Array.isArray(resp.data) && resp.data.length > 0,
      };
    } catch (err: any) {
      results.endpoints['leads'] = {
        url: this.endpoints.getLeads,
        success: false,
        error: err?.message || 'Unknown error',
        status: err?.response?.status || 'timeout',
      };
    }

    return results;
  }
}
