import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { LeadsService } from './leads.service';
import { LeadFiltersDto } from './dto/lead-filters.dto';
import { Lead } from '@/adapters/php-backend/php-backend.types';

@ApiTags('leads')
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all leads with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'List of leads retrieved successfully',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: [
      'new',
      'contacted',
      'qualified',
      'proposal',
      'negotiation',
      'closed_won',
      'closed_lost',
    ],
  })
  @ApiQuery({ name: 'source', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async findAll(@Query() filters: LeadFiltersDto): Promise<Lead[]> {
    return this.leadsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific lead by ID' })
  @ApiResponse({ status: 200, description: 'Lead retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Lead not found' })
  async findOne(@Param('id') id: string): Promise<Lead> {
    return this.leadsService.findOne(id);
  }

  // @Post()
  // @ApiOperation({ summary: 'Create a new lead' })
  // @ApiResponse({ status: 201, description: 'Lead created successfully' })
  // @ApiResponse({ status: 400, description: 'Invalid input data' })
  // async create(@Body() createLeadDto: CreateLeadDto): Promise<Lead> {
  //   return this.leadsService.create(createLeadDto);
  // }
}
