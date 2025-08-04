// src/rules/dto/create-rule.dto.ts

import {
    IsString,
    IsUUID,
    IsInt,
    Min,
    Max,
    IsBoolean,
    IsOptional,
    Matches,
} from 'class-validator';

export class CreateRuleDto {
    @IsString()
    name: string;

    @IsUUID()
    offerId: string;

    @IsString()
    offerName: string;

    @IsInt()
    @Min(1)
    @Max(1440, { message: 'periodMinutes must be between 1 and 1440' })
    periodMinutes: number;

    @IsInt()
    @Min(0)
    minInterval: number;

    @IsInt()
    @Min(0)
    maxInterval: number;

    @IsInt()
    @Min(1)
    @Max(10_000, { message: 'dailyLimit seems too large' })
    dailyLimit: number;

    @Matches(/^\d{2}:\d{2}$/, {
        message: 'sendWindowStart must be in format HH:MM',
    })
    sendWindowStart: string;

    @Matches(/^\d{2}:\d{2}$/, {
        message: 'sendWindowEnd must be in format HH:MM',
    })
    sendWindowEnd: string;

    /**
     * Опционально: если клиент не присылает isActive,
     * в базе по умолчанию запишется true
     */
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
