import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Rule } from './rule.entity';

export enum LeadSendingStatus {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

@Entity({ name: 'lead_sending' })
export class LeadSending {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  ruleId!: string;

  @ManyToOne(() => Rule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ruleId' })
  rule!: Rule;

  @Column()
  subid!: string;

  @Column()
  leadName!: string;

  @Column()
  phone!: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({
    type: 'enum',
    enum: LeadSendingStatus,
  })
  status!: LeadSendingStatus;

  @Column({ type: 'text', nullable: true })
  errorDetails?: string;

  @Column({ type: 'int', nullable: true })
  responseStatus?: number;

  @CreateDateColumn()
  sentAt!: Date;
}
