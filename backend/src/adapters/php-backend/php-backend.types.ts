// Lead types
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: LeadStatus;
  source?: string;
  createdAt: Date;
  updatedAt: Date;
}

// External lead types for rules module
export interface ExternalLead {
  sub_id: string;
  aff: string;
  offer: string;
  offer_name: string;
  country: string;
  name: string;
  phone: string;
  ua: string;
  ip: string;
}

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost',
}

export interface CreateLeadDto {
  name: string;
  email: string;
  phone?: string;
  source?: string;
}

export interface LeadFilters {
  status?: LeadStatus;
  source?: string;
  limit?: number;
  offset?: number;
}

// Extended lead filters for rules module
export interface ExternalLeadFilters {
  limit?: number;
  offer_name?: string;
  country?: string;
  status_id?: number;
  vertical_id?: number;
}

// Offer types
export interface Offer {
  id: string;
  leadId: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  status: OfferStatus;
  validUntil: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum OfferStatus {
  DRAFT = 'draft',
  SENT = 'sent',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export interface CreateOfferDto {
  leadId: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  validUntil: Date;
}

export interface OfferFilters {
  leadId?: string;
  status?: OfferStatus;
  limit?: number;
  offset?: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Error types
export interface ApiError {
  message: string;
  code: string;
  details?: any;
}
