import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { OfferStatus } from '@/adapters/php-backend/php-backend.types';

export class CreateOfferDto {
  @ApiProperty({ description: 'Lead ID for this offer' })
  @IsString()
  // leadId: string;
  @ApiProperty({ description: 'Offer title' })
  @IsString()
  // title: string;
  @ApiProperty({ description: 'Offer description' })
  @IsString()
  // description: string;
  @ApiProperty({ description: 'Offer amount' })
  @IsNumber()
  // amount: number;
  @ApiProperty({ description: 'Currency code (e.g., USD, EUR)' })
  @IsString()
  // currency: string;
  @ApiProperty({ description: 'Offer expiration date' })
  @IsDateString()
  // validUntil: string;
  @ApiPropertyOptional({ description: 'Offer status', enum: OfferStatus })
  @IsOptional()
  @IsEnum(OfferStatus)
  status?: OfferStatus;
}
