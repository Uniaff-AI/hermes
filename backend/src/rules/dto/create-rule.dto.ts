import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  Max,
  IsBoolean,
  Matches,
  IsNotEmpty,
  ValidateIf,
  MaxLength,
  IsIn,
} from 'class-validator';

/**
 * DTO for creating the redirect rule
 *
 * Clean structure without outdated fields.
 * Corresponds to the new architecture:
 * 1. Main settings
 * 2. Lead filters (get_leads criteria)
 * 3. Target product (where we send)
 * 4. Sending settings
 */
export class CreateRuleDto {
  // === MAIN SETTINGS ===
  @IsString()
  @IsNotEmpty({ message: 'Rule name is required' })
  @MaxLength(200, { message: 'Rule name must not exceed 200 characters' })
  name!: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsInt({ message: 'Daily cap limit must be an integer' })
  @Min(1, { message: 'Daily cap limit must be at least 1' })
  @Max(10000, { message: 'Daily cap limit must not exceed 10000' })
  dailyCapLimit!: number;

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
  @IsString()
  @IsNotEmpty({ message: 'Target product ID is required' })
  @MaxLength(50, {
    message: 'Target product ID must not exceed 50 characters',
  })
  @Matches(/^[a-zA-Z0-9_,-]+$/, {
    message: 'Target product ID contains invalid characters',
  })
  targetProductId!: string;

  @IsString()
  @IsNotEmpty({ message: 'Target product name is required' })
  @MaxLength(200, {
    message: 'Target product name must not exceed 200 characters',
  })
  targetProductName!: string;

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
  @IsInt()
  @Min(1, { message: 'Min interval must be at least 1 minute' })
  @Max(1440, {
    message: 'Min interval must not exceed 1440 minutes (24 hours)',
  })
  minIntervalMinutes!: number;

  @IsInt()
  @Min(1, { message: 'Max interval must be at least 1 minute' })
  @Max(1440, {
    message: 'Max interval must not exceed 1440 minutes (24 hours)',
  })
  maxIntervalMinutes!: number;

  @IsOptional()
  @IsBoolean()
  isInfinite?: boolean;

  // Time windows only for non-infinite sending
  @ValidateIf((o) => o.isInfinite !== true && o.sendWindowStart !== null)
  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/, {
    message: 'Send window start must be HH:MM or HH:MM:SS',
  })
  sendWindowStart?: string | null;

  @ValidateIf((o) => o.isInfinite !== true && o.sendWindowEnd !== null)
  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/, {
    message: 'Send window end must be HH:MM or HH:MM:SS',
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
