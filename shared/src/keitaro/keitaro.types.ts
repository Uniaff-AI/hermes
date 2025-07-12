export interface KeitaroConfig {
  apiUrl: string;
  apiKey: string;
  webhookSecret: string;
}

export interface KeitaroClick {
  id: string;
  campaignId: string;
  offerId: string;
  subId: string;
  ip: string;
  userAgent: string;
  referrer: string;
  timestamp: Date;
}

export interface KeitaroConversion {
  id: string;
  clickId: string;
  campaignId: string;
  offerId: string;
  subId: string;
  payout: number;
  currency: string;
  status: 'approved' | 'pending' | 'rejected';
  timestamp: Date;
}

export interface KeitaroWebhookPayload {
  click_id: string;
  campaign_id: string;
  offer_id: string;
  sub_id: string;
  payout?: number;
  currency?: string;
  status?: string;
  timestamp: number;
}

export interface KeitaroStats {
  campaignId: string;
  offerId: string;
  clicks: number;
  conversions: number;
  revenue: number;
  period: string;
} 