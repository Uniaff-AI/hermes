import {
  IsString,
  IsUUID,
  IsNumber,
  Min,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class UpdateRuleDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID()
  offerId?: string;

  @IsOptional()
  @IsString()
  offerName?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  periodMinutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minInterval?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxInterval?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  dailyLimit?: number;

  @IsOptional()
  @IsString()
  sendWindowStart?: string; // "HH:MM"

  @IsOptional()
  @IsString()
  sendWindowEnd?: string; // "HH:MM"

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
