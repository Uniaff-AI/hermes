import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  IsBoolean,
  Matches,
  IsNotEmpty,
  ValidateIf,
} from 'class-validator';

export class CreateRuleDto {
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name!: string;

  @IsString()
  @IsNotEmpty({ message: 'Product ID is required' })
  productId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Product name is required' })
  productName!: string;

  @IsInt()
  @Min(1, { message: 'Period minutes must be at least 1' })
  periodMinutes!: number;

  @IsInt()
  @Min(1, { message: 'Min interval must be at least 1' })
  minInterval!: number;

  @IsInt()
  @Min(1, { message: 'Max interval must be at least 1' })
  maxInterval!: number;

  // dailyCapLimit обязателен всегда
  @IsInt({ message: 'dailyCapLimit must be an integer number' })
  @Min(1, { message: 'dailyCapLimit must not be less than 1' })
  dailyCapLimit!: number;

  // Временные окна только для не бесконечной отправки
  @ValidateIf((o) => o.isInfinite !== true)
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'sendWindowStart must be HH:MM' })
  sendWindowStart?: string;

  @ValidateIf((o) => o.isInfinite !== true)
  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'sendWindowEnd must be HH:MM' })
  sendWindowEnd?: string;

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

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isInfinite?: boolean;
}
