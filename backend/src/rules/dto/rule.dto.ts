import { Expose } from 'class-transformer';

export class RuleDto {
    @Expose() id: string;
    @Expose() name: string;
    @Expose() offerId: string;
    @Expose() partnerId: string;
    @Expose() periodDays: number;
    @Expose() minInterval: number;
    @Expose() maxInterval: number;
    @Expose() dailyLimit: number;
    @Expose() sendStart: string;
    @Expose() sendEnd: string;
    @Expose() isActive: boolean;
}
