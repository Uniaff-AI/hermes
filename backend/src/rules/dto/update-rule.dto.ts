import {
  IsString,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsOptional,
  Matches,
  MaxLength,
  IsIn,
  ValidateIf,
} from 'class-validator';

/**
 * DTO for updating the redirect rule
 *
 * Clean structure without outdated fields.
 * All fields are optional for partial update
 */
export class UpdateRuleDto {
  // === MAIN SETTINGS ===
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Rule name must not exceed 200 characters' })
  name?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Daily cap limit must be at least 1' })
  @Max(10000, { message: 'Daily cap limit must not exceed 10000' })
  dailyCapLimit?: number;

  // === LEAD FILTERS (get_leads criteria) ===
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Lead status must not exceed 50 characters' })
  @IsIn(['Sale', 'Lead', 'Reject', 'ALL'], {
    message: 'Lead status must be one of: Sale, Lead, Reject, ALL',
  })
  leadStatus?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Lead vertical must not exceed 100 characters' })
  leadVertical?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10, { message: 'Lead country must not exceed 10 characters' })
  @Matches(/^[A-Z]{2,10}$/, {
    message: 'Lead country must be 2-10 uppercase letters (ISO format)',
  })
  leadCountry?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, {
    message: 'Lead affiliate must not exceed 100 characters',
  })
  leadAffiliate?: string;

  @IsOptional()
  @ValidateIf((o) => o.leadDateFrom !== null)
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Lead date from must be in YYYY-MM-DD format',
  })
  leadDateFrom?: string | null;

  @IsOptional()
  @ValidateIf((o) => o.leadDateTo !== null)
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Lead date to must be in YYYY-MM-DD format',
  })
  leadDateTo?: string | null;

  // === TARGET PRODUCT (where we send) ===
  @IsOptional()
  @IsString()
  @MaxLength(50, {
    message: 'Target product ID must not exceed 50 characters',
  })
  @Matches(/^[a-zA-Z0-9_,-]+$/, {
    message: 'Target product ID contains invalid characters',
  })
  targetProductId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, {
    message: 'Target product name must not exceed 200 characters',
  })
  targetProductName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, {
    message: 'Target product vertical must not exceed 100 characters',
  })
  targetProductVertical?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10, {
    message: 'Target product country must not exceed 10 characters',
  })
  @Matches(/^[A-Z]{2,10}$/, {
    message: 'Target product country must be 2-10 uppercase letters',
  })
  targetProductCountry?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, {
    message: 'Target product affiliate must not exceed 100 characters',
  })
  targetProductAffiliate?: string;

  // === SENDING SETTINGS ===
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Min interval must be at least 1 minute' })
  @Max(1440, {
    message: 'Min interval must not exceed 1440 minutes (24 hours)',
  })
  minIntervalMinutes?: number;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Max interval must be at least 1 minute' })
  @Max(1440, {
    message: 'Max interval must not exceed 1440 minutes (24 hours)',
  })
  maxIntervalMinutes?: number;

  @IsOptional()
  @IsBoolean()
  isInfinite?: boolean;

  @IsOptional()
  @ValidateIf((o) => o.sendWindowStart !== null)
  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/, {
    message: 'Send window start must be in format HH:MM or HH:MM:SS',
  })
  sendWindowStart?: string | null;

  @IsOptional()
  @ValidateIf((o) => o.sendWindowEnd !== null)
  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/, {
    message: 'Send window end must be in format HH:MM or HH:MM:SS',
  })
  sendWindowEnd?: string | null;

  @IsOptional()
  @ValidateIf((o) => o.sendDateFrom !== null)
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Send date from must be in YYYY-MM-DD format',
  })
  sendDateFrom?: string | null;

  @IsOptional()
  @ValidateIf((o) => o.sendDateTo !== null)
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'Send date to must be in YYYY-MM-DD format',
  })
  sendDateTo?: string | null;

  @IsOptional()
  @IsBoolean()
  useEmail?: boolean;

  @IsOptional()
  @IsBoolean()
  usePhone?: boolean;

  @IsOptional()
  @IsBoolean()
  useRedirect?: boolean;
}
