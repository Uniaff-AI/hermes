import { Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';

import { PhpBackendClient } from './php-backend.client';
import {
  Lead,
  CreateLeadDto,
  LeadFilters,
  ExternalLead,
  ExternalLeadFilters,
  Offer,
  CreateOfferDto,
  OfferFilters,
  PaginatedResponse,
} from './php-backend.types';

@Injectable()
export class PhpBackendAdapter {
  private readonly logger = new Logger(PhpBackendAdapter.name);

  constructor(
    private readonly phpClient: PhpBackendClient,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  // Lead operations
  async getLeads(filters: LeadFilters = {}): Promise<Lead[]> {
    const cacheKey = `leads:${JSON.stringify(filters)}`;

    try {
      const cached = await this.cacheManager.get<Lead[]>(cacheKey);
      if (cached) {
        this.logger.debug(
          `Returning cached leads for filters: ${JSON.stringify(filters)}`
        );
        return cached;
      }

      const leads = await this.phpClient.get<Lead[]>('/leads', {
        params: filters,
      });

      await this.cacheManager.set(cacheKey, leads, 300); // Cache for 5 minutes
      return leads;
    } catch (error) {
      this.logger.error(`Failed to get leads: ${(error as Error).message}`);
      throw error;
    }
  }

  // External lead operations for rules module
  async getExternalLeads(
    filters: ExternalLeadFilters = {}
  ): Promise<ExternalLead[]> {
    const cacheKey = `external_leads:${JSON.stringify(filters)}`;

    try {
      const cached = await this.cacheManager.get<ExternalLead[]>(cacheKey);
      if (cached) {
        this.logger.debug(
          `Returning cached external leads for filters: ${JSON.stringify(filters)}`
        );
        return cached;
      }

      const leads = await this.phpClient.get<ExternalLead[]>('/get_leads', {
        params: filters,
      });

      await this.cacheManager.set(cacheKey, leads, 300); // Cache for 5 minutes
      return leads;
    } catch (error) {
      this.logger.error(
        `Failed to get external leads: ${(error as Error).message}`
      );
      throw error;
    }
  }

  async sendLeadToAffiliate(lead: ExternalLead): Promise<void> {
    try {
      await this.phpClient.post<void>('/add_lead', lead);
      this.logger.log(`Successfully sent lead ${lead.sub_id} to affiliate`);
    } catch (error) {
      this.logger.error(
        `Failed to send lead ${lead.sub_id} to affiliate: ${(error as Error).message}`
      );
      throw error;
    }
  }

  async getLead(id: string): Promise<Lead> {
    const cacheKey = `lead:${id}`;

    try {
      const cached = await this.cacheManager.get<Lead>(cacheKey);
      if (cached) {
        this.logger.debug(`Cache hit for lead: ${id}`);
        return cached;
      }

      const lead = await this.phpClient.get<Lead>(`/api/leads/${id}`);

      await this.cacheManager.set(cacheKey, lead, 300); // 5 minutes cache
      return lead;
    } catch (error) {
      this.logger.error(
        `Failed to get lead ${id}: ${(error as Error).message}`
      );
      throw error;
    }
  }

  async createLead(createLeadDto: CreateLeadDto): Promise<Lead> {
    try {
      const lead = await this.phpClient.post<Lead>('/api/leads', createLeadDto);

      // Invalidate related cache
      await this.invalidateLeadsCache();

      this.logger.log(`Created new lead: ${lead.id}`);
      return lead;
    } catch (error) {
      this.logger.error(`Failed to create lead: ${(error as Error).message}`);
      throw error;
    }
  }

  // Offer operations
  async getOffers(filters: OfferFilters = {}): Promise<Offer[]> {
    const cacheKey = `offers:${JSON.stringify(filters)}`;

    try {
      const cached = await this.cacheManager.get<Offer[]>(cacheKey);
      if (cached) {
        this.logger.debug(
          `Cache hit for offers with filters: ${JSON.stringify(filters)}`
        );
        return cached;
      }

      const params = new URLSearchParams();
      if (filters.leadId) params.append('lead_id', filters.leadId);
      if (filters.status) params.append('status', filters.status);
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());

      const endpoint = `/api/offers${params.toString() ? `?${params.toString()}` : ''}`;
      const response =
        await this.phpClient.get<PaginatedResponse<Offer>>(endpoint);

      await this.cacheManager.set(cacheKey, response.data, 300); // 5 minutes cache
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get offers: ${(error as Error).message}`);
      throw error;
    }
  }

  async getOffer(id: string): Promise<Offer> {
    const cacheKey = `offer:${id}`;

    try {
      const cached = await this.cacheManager.get<Offer>(cacheKey);
      if (cached) {
        this.logger.debug(`Cache hit for offer: ${id}`);
        return cached;
      }

      const offer = await this.phpClient.get<Offer>(`/api/offers/${id}`);

      await this.cacheManager.set(cacheKey, offer, 300); // 5 minutes cache
      return offer;
    } catch (error) {
      this.logger.error(
        `Failed to get offer ${id}: ${(error as Error).message}`
      );
      throw error;
    }
  }

  async createOffer(createOfferDto: CreateOfferDto): Promise<Offer> {
    try {
      const offer = await this.phpClient.post<Offer>(
        '/api/offers',
        createOfferDto
      );

      // Invalidate related cache
      await this.invalidateOffersCache();

      this.logger.log(`Created new offer: ${offer.id}`);
      return offer;
    } catch (error) {
      this.logger.error(`Failed to create offer: ${(error as Error).message}`);
      throw error;
    }
  }

  // Cache invalidation methods
  private async invalidateLeadsCache(): Promise<void> {
    try {
      const keys = await this.cacheManager.store.keys('leads:*');
      if (keys.length > 0) {
        await Promise.all(keys.map(key => this.cacheManager.del(key)));
        this.logger.debug(`Invalidated ${keys.length} leads cache keys`);
      }
    } catch (error) {
      this.logger.warn(
        `Failed to invalidate leads cache: ${(error as Error).message}`
      );
    }
  }

  private async invalidateOffersCache(): Promise<void> {
    try {
      const keys = await this.cacheManager.store.keys('offers:*');
      if (keys.length > 0) {
        await Promise.all(keys.map(key => this.cacheManager.del(key)));
        this.logger.debug(`Invalidated ${keys.length} offers cache keys`);
      }
    } catch (error) {
      this.logger.warn(
        `Failed to invalidate offers cache: ${(error as Error).message}`
      );
    }
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    try {
      await this.phpClient.get<any>('/api/health');
      return true;
    } catch (error) {
      this.logger.error(
        `PHP Backend health check failed: ${(error as Error).message}`
      );
      return false;
    }
  }
}
