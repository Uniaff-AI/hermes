import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('rules')
export class Rule {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  offerId!: string;

  @Column()
  offerName!: string;

  @Column()
  periodMinutes!: number;

  @Column()
  minInterval!: number;

  @Column()
  maxInterval!: number;

  @Column()
  dailyLimit!: number;

  @Column()
  sendWindowStart!: string; // формат "HH:MM"

  @Column()
  sendWindowEnd!: string; // формат "HH:MM"

  @Column({ default: true })
  isActive!: boolean;
}
