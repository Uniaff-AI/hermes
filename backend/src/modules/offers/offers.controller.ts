import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { OfferFiltersDto } from './dto/offer-filters.dto';
import { Offer } from '@/adapters/php-backend/php-backend.types';

@ApiTags('offers')
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all offers with optional filters' })
  @ApiResponse({ status: 200, description: 'List of offers retrieved successfully' })
  @ApiQuery({ name: 'leadId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  async findAll(@Query() filters: OfferFiltersDto): Promise<Offer[]> {
    return this.offersService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific offer by ID' })
  @ApiResponse({ status: 200, description: 'Offer retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  async findOne(@Param('id') id: string): Promise<Offer> {
    return this.offersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new offer' })
  @ApiResponse({ status: 201, description: 'Offer created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(@Body() createOfferDto: CreateOfferDto): Promise<Offer> {
    return this.offersService.create(createOfferDto);
  }
} 