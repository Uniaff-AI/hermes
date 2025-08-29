import { z } from 'zod';

export interface ValidationError {
  field: string;
  message: string;
  details?: string;
}

export function validateRuleConsistency(data: {
  leadCountry?: string | null;
  targetProductCountry?: string | null;
  leadAffiliate?: string | null;
  targetProductAffiliate?: string | null;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  const hasLeadCountry = data.leadCountry && data.leadCountry.trim() !== '';
  const hasTargetCountry =
    data.targetProductCountry && data.targetProductCountry.trim() !== '';

  if (
    hasLeadCountry &&
    hasTargetCountry &&
    data.leadCountry !== data.targetProductCountry
  ) {
    errors.push({
      field: 'geographic_mismatch',
      message: 'Geographic mismatch detected',
      details: `Cannot redirect leads from ${data.leadCountry} to product for ${data.targetProductCountry}. Countries must match for proper lead redirection.`,
    });
  }

  const hasLeadAffiliate =
    data.leadAffiliate && data.leadAffiliate.trim() !== '';
  const hasTargetAffiliate =
    data.targetProductAffiliate && data.targetProductAffiliate.trim() !== '';

  if (
    hasLeadAffiliate &&
    hasTargetAffiliate &&
    data.leadAffiliate !== data.targetProductAffiliate
  ) {
    errors.push({
      field: 'affiliate_mismatch',
      message: 'Affiliate mismatch detected',
      details: `Cannot redirect leads from affiliate "${data.leadAffiliate}" to product for affiliate "${data.targetProductAffiliate}". Affiliates must match for proper lead redirection.`,
    });
  }

  return errors;
}

export function getValidationErrorMessage(errors: ValidationError[]): string {
  if (errors.length === 0) return '';

  const messages = errors.map((error) => {
    if (error.details) {
      return `${error.message}: ${error.details}`;
    }
    return error.message;
  });

  return messages.join('. ');
}

export function validateTimeWindows(data: {
  isInfinite?: boolean;
  sendWindowStart?: string | null;
  sendWindowEnd?: string | null;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  if (data.isInfinite !== true) {
    if (!data.sendWindowStart || !data.sendWindowEnd) {
      errors.push({
        field: 'time_windows',
        message: 'Time windows are required for non-infinite rules',
        details:
          'When isInfinite is false, both sendWindowStart and sendWindowEnd must be specified.',
      });
    } else {
      const timeRegex = /^\d{2}:\d{2}$/;
      if (
        !timeRegex.test(data.sendWindowStart) ||
        !timeRegex.test(data.sendWindowEnd)
      ) {
        errors.push({
          field: 'time_format',
          message: 'Invalid time format',
          details:
            'Time windows must be in HH:MM format (e.g., "09:00", "18:30").',
        });
      }
    }
  }

  return errors;
}

export function validateDateRanges(data: {
  leadDateFrom?: string | null;
  leadDateTo?: string | null;
  sendDateFrom?: string | null;
  sendDateTo?: string | null;
}): ValidationError[] {
  const errors: ValidationError[] = [];

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const today = new Date().toISOString().split('T')[0];

  if (data.leadDateFrom && !dateRegex.test(data.leadDateFrom)) {
    errors.push({
      field: 'leadDateFrom',
      message: 'Invalid lead date from format',
      details: 'Lead date from must be in YYYY-MM-DD format.',
    });
  }

  if (data.leadDateTo && !dateRegex.test(data.leadDateTo)) {
    errors.push({
      field: 'leadDateTo',
      message: 'Invalid lead date to format',
      details: 'Lead date to must be in YYYY-MM-DD format.',
    });
  }

  if (data.sendDateFrom && !dateRegex.test(data.sendDateFrom)) {
    errors.push({
      field: 'sendDateFrom',
      message: 'Invalid send date from format',
      details: 'Send date from must be in YYYY-MM-DD format.',
    });
  }

  if (data.sendDateTo && !dateRegex.test(data.sendDateTo)) {
    errors.push({
      field: 'sendDateTo',
      message: 'Invalid send date to format',
      details: 'Send date to must be in YYYY-MM-DD format.',
    });
  }

  // Validate date ranges (from < to)
  if (
    data.leadDateFrom &&
    data.leadDateTo &&
    data.leadDateFrom > data.leadDateTo
  ) {
    errors.push({
      field: 'lead_date_range',
      message: 'Invalid lead date range',
      details: 'Lead date from cannot be later than lead date to.',
    });
  }

  if (
    data.sendDateFrom &&
    data.sendDateTo &&
    data.sendDateFrom > data.sendDateTo
  ) {
    errors.push({
      field: 'send_date_range',
      message: 'Invalid send date range',
      details: 'Send date from cannot be later than send date to.',
    });
  }

  // Warn if send dates are in the past, but don't block creation
  // The backend will handle this gracefully
  if (data.sendDateTo && data.sendDateTo < today) {
    errors.push({
      field: 'sendDateTo',
      message: 'Send date to is in the past',
      details:
        'The end date for sending is in the past. The rule may not execute as expected.',
    });
  }

  return errors;
}
