import {
  IsString,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsOptional,
  Matches,
} from 'class-validator';

export class UpdateRuleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  productId?: string;

  @IsString()
  @IsOptional()
  productName?: string;

  @IsInt()
  @Min(1)
  @Max(1440, { message: 'periodMinutes must be between 1 and 1440' })
  @IsOptional()
  periodMinutes?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  minInterval?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  maxInterval?: number;

  @IsInt()
  @Min(1)
  @Max(10_000, { message: 'dailyCapLimit seems too large' })
  @IsOptional()
  dailyCapLimit?: number;

  @Matches(/^\d{2}:\d{2}$/, {
    message: 'sendWindowStart must be in format HH:MM',
  })
  @IsOptional()
  sendWindowStart?: string;

  @Matches(/^\d{2}:\d{2}$/, {
    message: 'sendWindowEnd must be in format HH:MM',
  })
  @IsOptional()
  sendWindowEnd?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isInfinite?: boolean;

  @IsOptional()
  @IsString()
  vertical?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'dateFrom must be in YYYY-MM-DD format',
  })
  dateFrom?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'dateTo must be in YYYY-MM-DD format',
  })
  dateTo?: string;
}
