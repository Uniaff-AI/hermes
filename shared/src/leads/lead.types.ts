export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: LeadStatus;
  offerId?: string;
  source: string;
  notes?: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  lastContactAt?: Date;
}

export interface CreateLeadDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  source: string;
  notes?: string;
  offerId?: string;
}

export interface UpdateLeadDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  status?: LeadStatus;
  notes?: string;
  assignedTo?: string;
  offerId?: string;
}

export interface LeadFilter {
  status?: LeadStatus;
  source?: string;
  assignedTo?: string;
  offerId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
} 