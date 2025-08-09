import { IsInt, IsOptional, IsString, Matches, Min } from 'class-validator';

export class CreateRuleDto {
  @IsString()
  name!: string;

  // оффер
  @IsString()
  offerId!: string;

  @IsString()
  offerName!: string; // уйдёт в productName при запросе /get_leads

  // расписание/лимиты
  @IsInt() @Min(1)
  periodMinutes!: number;

  @IsInt() @Min(1)
  minInterval!: number;

  @IsInt() @Min(1)
  maxInterval!: number;

  @IsInt() @Min(1)
  dailyLimit!: number;

  @Matches(/^\d{2}:\d{2}$/, { message: 'sendWindowStart must be HH:MM' })
  sendWindowStart!: string;

  @Matches(/^\d{2}:\d{2}$/, { message: 'sendWindowEnd must be HH:MM' })
  sendWindowEnd!: string;

  // ---- ФИЛЬТРЫ к /get_leads ----
  @IsOptional() @IsString()
  vertical?: string;

  @IsOptional() @IsString()
  country?: string;

  @IsOptional() @IsString()
  status?: string;

  @IsOptional() @IsString()
  dateFrom?: string; // YYYY-MM-DD

  @IsOptional() @IsString()
  dateTo?: string;   // YYYY-MM-DD

  @IsOptional() @IsInt() @Min(0)
  cap?: number;

  // пауза при создании (необязательно)
  @IsOptional()
  isActive?: boolean;
}
