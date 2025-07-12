export interface AnalyticsData {
  period: string;
  metrics: AnalyticsMetric[];
}

export interface AnalyticsMetric {
  name: string;
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
}

export interface DashboardStats {
  totalLeads: number;
  activeLeads: number;
  totalOffers: number;
  activeOffers: number;
  totalRedirects: number;
  conversions: number;
  revenue: number;
}

export interface RedirectAnalytics {
  redirectId: string;
  redirectName: string;
  clicks: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  period: string;
}

export interface LeadAnalytics {
  status: string;
  count: number;
  percentage: number;
}

export interface OfferAnalytics {
  offerId: string;
  offerName: string;
  leads: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
} 