import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BaseRepository } from './base.repository';
import { Rule } from '@prisma/client';

@Injectable()
export class RulesRepository extends BaseRepository<Rule> {
  constructor(private readonly prismaService: PrismaService) {
    super(prismaService, 'rule');
  }

  // Custom methods specific to Rules
  async findByActiveStatus(isActive: boolean): Promise<Rule[]> {
    return await this.prisma.rule.findMany({
      where: { isActive },
    });
  }

  async findByOfferId(offerId: string): Promise<Rule[]> {
    return await this.prisma.rule.findMany({
      where: { offerId },
    });
  }

  // Override base methods if you need custom logic
  async create(data: Partial<Rule>): Promise<Rule> {
    return await this.prisma.rule.create({
      data: data as any,
    });
  }

  async findById(id: string): Promise<Rule | null> {
    return await this.prisma.rule.findUnique({
      where: { id },
    });
  }

  async findAll(): Promise<Rule[]> {
    return await this.prisma.rule.findMany();
  }

  async update(id: string, data: Partial<Rule>): Promise<Rule> {
    return await this.prisma.rule.update({
      where: { id },
      data: data as any,
    });
  }

  async delete(id: string): Promise<Rule> {
    return await this.prisma.rule.delete({
      where: { id },
    });
  }
}
