import { Expose } from 'class-transformer';

export class RuleDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  offerId!: string;

  @Expose()
  offerName!: string;

  @Expose()
  periodMinutes!: number;

  @Expose()
  minInterval!: number;

  @Expose()
  maxInterval!: number;

  @Expose()
  dailyLimit!: number;

  @Expose()
  sendWindowStart!: string;

  @Expose()
  sendWindowEnd!: string;

  @Expose()
  isActive!: boolean;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
