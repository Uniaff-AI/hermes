import {
  IsString,
  IsUUID,
  IsNumber,
  Min,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreateRuleDto {
  @IsString()
  name!: string;

  @IsUUID()
  offerId!: string;

  @IsString()
  offerName!: string;

  @IsNumber()
  @Min(1)
  periodMinutes!: number;

  @IsNumber()
  @Min(0)
  minInterval!: number;

  @IsNumber()
  @Min(0)
  maxInterval!: number;

  @IsNumber()
  @Min(1)
  dailyLimit!: number;

  @IsString()
  sendWindowStart!: string; // "HH:MM"

  @IsString()
  sendWindowEnd!: string; // "HH:MM"

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
