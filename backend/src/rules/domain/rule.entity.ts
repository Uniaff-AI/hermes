// src/rules/domain/rule.entity.ts

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

    @Column('int')
    periodMinutes: number;

    @Column('int')
    minInterval: number;

    @Column('int')
    maxInterval: number;

    @Column('int')
    dailyLimit: number;

    @Column()
    sendWindowStart: string; // формат "HH:MM"

    @Column()
    sendWindowEnd: string;   // формат "HH:MM"

    // новое поле, default = true
    @Column({ default: true })
    isActive: boolean;
}
