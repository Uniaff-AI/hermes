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
  offerName?: string;

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
  @Max(10_000, { message: 'dailyLimit seems too large' })
  @IsOptional()
  dailyLimit?: number;

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
}
