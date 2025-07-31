import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

@Injectable()
export class ExternalApisClient {
  private readonly logger = new Logger(ExternalApisClient.name);
  private readonly leadsApiUrl: string;
  private readonly affiliateApiUrl: string;
  private readonly timeout: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.leadsApiUrl =
      this.configService.get<string>('externalApis.leadsApi.baseUrl', {
        infer: true,
      }) ?? '';
    this.affiliateApiUrl =
      this.configService.get<string>('externalApis.affiliateApi.baseUrl', {
        infer: true,
      }) ?? '';
    this.timeout =
      this.configService.get<number>('externalApis.leadsApi.timeout', {
        infer: true,
      }) ?? 5000;
  }

  async getLeads(params: Record<string, any> = {}): Promise<any[]> {
    const url = `${this.leadsApiUrl}/get_leads/`;
    const requestConfig: AxiosRequestConfig = {
      timeout: this.timeout,
      params,
    };

    this.logger.debug(`GET ${url} with params: ${JSON.stringify(params)}`);

    try {
      const response: AxiosResponse<any[]> = await firstValueFrom(
        this.httpService.get<any[]>(url, requestConfig)
      );

      return response.data;
    } catch (error) {
      this.logger.error(`GET ${url} failed: ${(error as Error).message}`);
      throw error;
    }
  }

  async sendLeadToAffiliate(lead: any): Promise<void> {
    const url = `${this.affiliateApiUrl}/add_lead/`;
    const requestConfig: AxiosRequestConfig = {
      timeout: this.timeout,
    };

    this.logger.debug(`POST ${url} with lead: ${JSON.stringify(lead)}`);

    try {
      const response: AxiosResponse<void> = await firstValueFrom(
        this.httpService.post<void>(url, lead, requestConfig)
      );

      if (response.status === 200) {
        this.logger.log(`Successfully sent lead ${lead.sub_id} to affiliate`);
      } else {
        this.logger.warn(
          `Affiliate API returned ${response.status} for lead ${lead.sub_id}`
        );
      }
    } catch (error) {
      this.logger.error(`POST ${url} failed: ${(error as Error).message}`);
      throw error;
    }
  }
}
