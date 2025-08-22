import { Injectable, Logger } from '@nestjs/common';
import { Rule } from '../../domain/rule.entity';
import { Lead, ExternalApiService } from '../external-api.service';
import { RulesUtilsService } from '../rules-utils.service';

/**
 * Service responsible for fetching and filtering leads from external API
 * Handles lead retrieval, normalization, and filtering logic
 */
@Injectable()
export class LeadFetcherService {
  private readonly logger = new Logger(LeadFetcherService.name);

  constructor(
    private readonly externalApi: ExternalApiService,
    private readonly utils: RulesUtilsService,
  ) {}

  /**
   * Fetch and filter leads for a specific rule
   */
  async fetchLeadsForRule(rule: Rule): Promise<Lead[]> {
    // 1) Build filters for the lead request
    // Use dailyCapLimit directly - it's guaranteed to be a valid number from DB (has default: 100)
    const limit = rule.isInfinite ? 999999 : rule.dailyCapLimit;
    const filters = {
      limit,
      // DO NOT SEARCH by targetProductName - this is the target product where we send
      // Search leads by lead filters (where we get them)
      ...(rule.leadVertical ? { vertical: rule.leadVertical } : {}),
      ...(rule.leadCountry ? { country: rule.leadCountry } : {}),
      ...(rule.leadStatus && rule.leadStatus !== 'ALL'
        ? { status: rule.leadStatus }
        : {}),
      ...(rule.leadAffiliate ? { aff: rule.leadAffiliate } : {}),
      ...(rule.leadDateFrom ? { date_from: rule.leadDateFrom } : {}),
      ...(rule.leadDateTo ? { date_to: rule.leadDateTo } : {}),
    };

    try {
      let raw = await this.externalApi.getLeads(filters);

      // If the filtered leads are empty — make a fallback without filters or by vertical
      if (
        raw.length === 0 &&
        (rule.leadVertical ||
          rule.leadCountry ||
          (rule.leadStatus && rule.leadStatus !== 'ALL') ||
          rule.leadAffiliate ||
          rule.leadDateFrom ||
          rule.leadDateTo)
      ) {
        this.logger.warn(
          `rule ${rule.id}: empty by filters, fallback request with relaxed filters`,
        );
        // Fallback: use only vertical or no filters at all
        // Keep the same limit logic for consistency
        const fallbackFilters = {
          limit,
          ...(rule.leadVertical ? { vertical: rule.leadVertical } : {}),
        };
        raw = await this.externalApi.getLeads(fallbackFilters);
      }

      // Normalization and local filters (offerId/dailyCapLimit)
      this.logger.log(
        `About to normalize ${raw.length} raw leads for rule ${rule.id}`,
      );
      const normalizedLeads = this.normalizeAndFilterLeads(raw, rule);
      this.logger.log(
        `After normalization: ${normalizedLeads.length} leads for rule ${rule.id}`,
      );
      return normalizedLeads;
    } catch (error) {
      this.logger.error(`Failed to fetch leads for rule ${rule.id}:`, error);
      return [];
    }
  }

  /**
   * Normalize raw leads and apply local filters
   */
  private normalizeAndFilterLeads(rawLeads: any[], rule: Rule): Lead[] {
    this.logger.log(
      `normalizeAndFilterLeads: Processing ${rawLeads.length} raw leads for rule ${rule.id}`,
    );

    let filteredCount = 0;
    let noSubidCount = 0;
    let verticalMismatchCount = 0;
    let countryMismatchCount = 0;
    let affiliateMismatchCount = 0;
    let statusMismatchCount = 0;
    let redirectsLimitCount = 0;

    const filtered = rawLeads
      .filter((r) => {
        const sid = this.utils.getField(r, 'subid', 'subId', 'sub_id');
        const pid = this.utils.getField(
          r,
          'productId',
          'product_id',
          'product',
        );
        if (!sid || !pid) {
          noSubidCount++;
          return false;
        }

        // DO NOT filter by targetProductId - leads can be from any product
        // targetProductId is where we redirect, not where we get leads
        // Leads are filtered by leadVertical, leadCountry, leadStatus, leadAffiliate

        // Match vertical if specified in rule
        if (rule.leadVertical) {
          const leadVertical = String(r.vertical || '');
          if (leadVertical !== rule.leadVertical) {
            verticalMismatchCount++;
            return false;
          }
        }

        // Match country if specified in rule
        if (rule.leadCountry) {
          const leadCountry = String(r.country || '').toUpperCase();
          const ruleCountry = String(rule.leadCountry).toUpperCase();
          if (leadCountry !== ruleCountry) {
            countryMismatchCount++;
            return false;
          }
        }

        // Match affiliate if specified in rule
        if (rule.leadAffiliate) {
          const leadAff = String(r.aff || r.affiliate || '');
          if (leadAff !== rule.leadAffiliate) {
            affiliateMismatchCount++;
            return false;
          }
        }

        // Match status if specified in rule and not "ALL"
        if (rule.leadStatus && rule.leadStatus !== 'ALL') {
          const leadStatus = String(r.status || '');
          if (leadStatus !== rule.leadStatus) {
            statusMismatchCount++;
            return false;
          }
        }

        // Check the cap only if not infinite sending
        if (!rule.isInfinite) {
          const redirects =
            r.redirects ?? r.redirects_count ?? r.redirectsCount;
          if (
            typeof redirects === 'number' &&
            typeof rule.dailyCapLimit === 'number' &&
            redirects > rule.dailyCapLimit
          ) {
            redirectsLimitCount++;
            return false;
          }
        }
        filteredCount++;
        return true;
      })
      .map<Lead>((r) => {
        const sid = this.utils.getField(r, 'subid', 'subId', 'sub_id')!;
        const pid = this.utils.getField(
          r,
          'productId',
          'product_id',
          'product',
        )!;
        const pnm =
          this.utils.getField(r, 'productName', 'product_name', 'product') ??
          '';
        const name =
          (r.leadName ?? r.name ?? '').toString().trim() || 'Unknown';

        return {
          subid: sid,
          productId: pid,
          productName: pnm,
          aff: (r.aff ?? r.affiliate ?? '').toString(),
          country: (r.country ?? '').toString() || undefined,
          vertical: (r.vertical ?? '').toString() || undefined,
          status: (r.status ?? '').toString() || undefined,
          leadName: name,
          phone: (r.phone ?? '').toString() || undefined,
          email: (r.email ?? '').toString() || undefined,
          ip: (r.ip ?? '').toString() || undefined,
          ua: (r.ua ?? '').toString() || undefined,
          redirects: typeof r.redirects === 'number' ? r.redirects : undefined,
          date: (r.date ?? r.created_at ?? '').toString() || undefined,
        };
      });

    // Log the filtering statistics
    this.logger.log(`📊 Filtering stats for rule ${rule.id}:`);
    this.logger.log(`📥 Raw leads received: ${rawLeads.length}`);
    this.logger.log(`✅ Leads passed filters: ${filteredCount}`);
    this.logger.log(`🚫 No subid/productId: ${noSubidCount}`);
    this.logger.log(`🚫 Vertical mismatch: ${verticalMismatchCount}`);
    this.logger.log(`🚫 Country mismatch: ${countryMismatchCount}`);
    this.logger.log(`🚫 Affiliate mismatch: ${affiliateMismatchCount}`);
    this.logger.log(`🚫 Status mismatch: ${statusMismatchCount}`);
    this.logger.log(`🚫 Redirects limit: ${redirectsLimitCount}`);
    this.logger.log(`📤 Final leads to send: ${filtered.length}`);

    return filtered;
  }
}
