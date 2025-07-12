export interface Offer {
  id: string;
  name: string;
  description?: string;
  status: OfferStatus;
  price: number;
  currency: string;
  category: string;
  tags: string[];
  keitaroCampaignId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOfferDto {
  name: string;
  description?: string;
  price: number;
  currency: string;
  category: string;
  tags?: string[];
  keitaroCampaignId?: string;
}

export interface UpdateOfferDto {
  name?: string;
  description?: string;
  status?: OfferStatus;
  price?: number;
  currency?: string;
  category?: string;
  tags?: string[];
  keitaroCampaignId?: string;
}

export interface OfferFilter {
  status?: OfferStatus;
  category?: string;
  tags?: string[];
  priceFrom?: number;
  priceTo?: number;
  search?: string;
} 