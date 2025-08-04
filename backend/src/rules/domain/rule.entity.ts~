import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'rules' })
export class Rule {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    offerId: string;

    @Column()
    offerName: string;

    @Column()
    periodMinutes: number;

    @Column()
    minInterval: number;

    @Column()
    maxInterval: number;

    @Column()
    dailyLimit: number;

    @Column()
    sendWindowStart: string; // "HH:MM"

    @Column()
    sendWindowEnd: string;   // "HH:MM"
}
