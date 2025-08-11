import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('rules')
export class Rule {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text', default: 'Unnamed rule' })
  name!: string;

  @Column({ type: 'text', nullable: true })
  productId?: string;

  @Column({ type: 'text', nullable: true })
  productName?: string;

  @Column({ type: 'int' })
  periodMinutes!: number;

  @Column({ type: 'int' })
  minInterval!: number;

  @Column({ type: 'int' })
  maxInterval!: number;

  @Column({ type: 'int', nullable: true })
  dailyCapLimit?: number;

  // дефолты нужны, чтобы ALTER TABLE не падал на старых NULL
  @Column({ type: 'text', nullable: true })
  sendWindowStart?: string;

  @Column({ type: 'text', nullable: true })
  sendWindowEnd?: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'boolean', default: false })
  isInfinite!: boolean;

  @Column({ type: 'text', nullable: true })
  vertical?: string;

  @Column({ type: 'text', nullable: true })
  country?: string;

  @Column({ type: 'text', nullable: true })
  status?: string;

  @Column({ type: 'text', nullable: true })
  dateFrom?: string;

  @Column({ type: 'text', nullable: true })
  dateTo?: string;
}
