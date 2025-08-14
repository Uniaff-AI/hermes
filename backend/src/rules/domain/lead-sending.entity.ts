import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Rule } from './rule.entity';

export enum LeadSendingStatus {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  PENDING = 'PENDING',
  RETRY = 'RETRY',
}

@Entity({ name: 'lead_sending' })
@Index(['ruleId', 'sentAt'])
@Index(['status', 'sentAt'])
@Index(['targetProductId', 'sentAt'])
export class LeadSending {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  @Index()
  ruleId!: string;

  @ManyToOne(() => Rule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ruleId' })
  rule!: Rule;

  @Column({
    type: 'varchar',
    length: 100,
  })
  leadSubid!: string;

  @Column({
    type: 'varchar',
    length: 200,
  })
  leadName!: string;

  @Column({
    type: 'varchar',
    length: 50,
  })
  leadPhone!: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  leadEmail?: string;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
  })
  leadCountry?: string;

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
    type: 'enum',
    enum: LeadSendingStatus,
  })
  @Index()
  status!: LeadSendingStatus;

  @Column({
    type: 'int',
    nullable: true,
  })
  responseStatus?: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  errorDetails?: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  externalResponseId?: string;

  @CreateDateColumn()
  @Index()
  sentAt!: Date;

  @Column({
    type: 'int',
    default: 1,
  })
  attemptNumber!: number;

  @Column({
    type: 'int',
    nullable: true,
  })
  responseTimeMs?: number;
}
