import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('rules')
@Index(['isActive', 'createdAt'])
@Index(['leadStatus', 'leadCountry'])
export class Rule {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200, default: 'Unnamed rule' })
  name!: string;

  @Column({ type: 'boolean', default: true })
  @Index()
  isActive!: boolean;

  @Column({ type: 'int', default: 100 })
  dailyCapLimit!: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  @Index()
  leadStatus?: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  leadVertical?: string;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  @Index()
  leadCountry?: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  leadAffiliate?: string;

  @Column({
    type: 'date',
    nullable: true,
  })
  leadDateFrom?: string | null;

  @Column({
    type: 'date',
    nullable: true,
  })
  leadDateTo?: string | null;

  @Column({
    type: 'varchar',
    length: 50,
  })
  @Index()
  targetProductId!: string;

  @Column({
    type: 'varchar',
    length: 200,
  })
  targetProductName!: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  targetProductVertical?: string;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  targetProductCountry?: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  targetProductAffiliate?: string;

  @Column({
    type: 'int',
    default: 5,
  })
  minIntervalMinutes!: number;

  @Column({
    type: 'int',
    default: 15,
  })
  maxIntervalMinutes!: number;

  @Column({
    type: 'boolean',
    default: false,
  })
  isInfinite!: boolean;

  @Column({
    type: 'time',
    nullable: true,
  })
  sendWindowStart?: string | null;

  @Column({
    type: 'time',
    nullable: true,
  })
  sendWindowEnd?: string | null;

  @Column({
    type: 'date',
    nullable: true,
  })
  sendDateFrom?: string | null;

  @Column({
    type: 'date',
    nullable: true,
  })
  sendDateTo?: string | null;

  @Column({
    type: 'boolean',
    default: false,
  })
  useEmail?: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  usePhone?: boolean;

  @Column({
    type: 'boolean',
    default: true,
  })
  useRedirect?: boolean;

  @CreateDateColumn()
  @Index()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
