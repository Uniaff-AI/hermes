import { Injectable, Logger } from '@nestjs/common';

import { PhpBackendAdapter } from '@/adapters/php-backend/php-backend.adapter';
import { Lead, LeadFilters } from '@/adapters/php-backend/php-backend.types';
import { LeadFiltersDto } from './dto/lead-filters.dto';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(private readonly phpBackendAdapter: PhpBackendAdapter) {}

  async findAll(filters: LeadFiltersDto): Promise<Lead[]> {
    this.logger.debug(`Finding leads with filters: ${JSON.stringify(filters)}`);

    const adapterFilters: LeadFilters = {
      status: filters.status,
      source: filters.source,
      limit: filters.limit,
      offset: filters.offset,
    };

    return this.phpBackendAdapter.getLeads(adapterFilters);
  }

  async findOne(id: string): Promise<Lead> {
    this.logger.debug(`Finding lead with ID: ${id}`);
    return this.phpBackendAdapter.getLead(id);
  }

  // async create(createLeadDto: CreateLeadDtoClass): Promise<Lead> {
  //   this.logger.debug(`Creating new lead: ${JSON.stringify(createLeadDto)}`);

  //   // const adapterDto: CreateLeadDto = {
  //   //   name: createLeadDto.name,
  //   //   email: createLeadDto.email,
  //   //   phone: createLeadDto.phone,
  //   //   source: createLeadDto.source,
  //   // };

  //   return this.phpBackendAdapter.createLead(adapterDto);
  // }
}
