export enum OfferStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  ARCHIVED = 'ARCHIVED'
}

export interface OfferStatusConfig {
  value: OfferStatus;
  label: string;
  color: string;
} 