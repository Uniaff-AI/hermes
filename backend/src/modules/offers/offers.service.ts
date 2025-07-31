import { Injectable, Logger } from '@nestjs/common';

import { PhpBackendAdapter } from '@/adapters/php-backend/php-backend.adapter';
import { Offer, CreateOfferDto, OfferFilters } from '@/adapters/php-backend/php-backend.types';
import { CreateOfferDto as CreateOfferDtoClass } from './dto/create-offer.dto';
import { OfferFiltersDto } from './dto/offer-filters.dto';

@Injectable()
export class OffersService {
  private readonly logger = new Logger(OffersService.name);

  constructor(private readonly phpBackendAdapter: PhpBackendAdapter) {}

  async findAll(filters: OfferFiltersDto): Promise<Offer[]> {
    this.logger.debug(`Finding offers with filters: ${JSON.stringify(filters)}`);
    
    const adapterFilters: OfferFilters = {
      leadId: filters.leadId,
      status: filters.status,
      limit: filters.limit,
      offset: filters.offset,
    };

    return this.phpBackendAdapter.getOffers(adapterFilters);
  }

  async findOne(id: string): Promise<Offer> {
    this.logger.debug(`Finding offer with ID: ${id}`);
    return this.phpBackendAdapter.getOffer(id);
  }

  async create(createOfferDto: CreateOfferDtoClass): Promise<Offer> {
    this.logger.debug(`Creating new offer: ${JSON.stringify(createOfferDto)}`);
    
    const adapterDto: CreateOfferDto = {
      leadId: createOfferDto.leadId,
      title: createOfferDto.title,
      description: createOfferDto.description,
      amount: createOfferDto.amount,
      currency: createOfferDto.currency,
      validUntil: new Date(createOfferDto.validUntil),
    };

    return this.phpBackendAdapter.createOffer(adapterDto);
  }
} 