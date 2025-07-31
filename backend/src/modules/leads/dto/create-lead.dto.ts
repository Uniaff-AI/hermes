import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { LeadStatus } from '@/adapters/php-backend/php-backend.types';

export class CreateLeadDto {
  @ApiProperty({ description: 'Lead name' })
  @IsString()
  // name: string;
  @ApiProperty({ description: 'Lead email address' })
  @IsEmail()
  // email: string;
  @ApiPropertyOptional({ description: 'Lead phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Lead source', enum: LeadStatus })
  @IsOptional()
  @IsEnum(LeadStatus)
  source?: string;
}
