import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BaseRepository } from './base.repository';
import { Lead } from '@prisma/client';

@Injectable()
export class LeadsRepository extends BaseRepository<Lead> {
  constructor(private readonly prismaService: PrismaService) {
    super(prismaService, 'lead');
  }

  // Custom methods specific to Leads
  async findByEmail(email: string): Promise<Lead | null> {
    return await this.prisma.lead.findFirst({
      where: { email },
    });
  }

  async findByPhone(phone: string): Promise<Lead | null> {
    return await this.prisma.lead.findFirst({
      where: { phone },
    });
  }

  // Override base methods for type safety
  async create(data: Partial<Lead>): Promise<Lead> {
    return await this.prisma.lead.create({
      data: data as any,
    });
  }

  async findById(id: string): Promise<Lead | null> {
    return await this.prisma.lead.findUnique({
      where: { id },
    });
  }

  async findAll(): Promise<Lead[]> {
    return await this.prisma.lead.findMany();
  }

  async update(id: string, data: Partial<Lead>): Promise<Lead> {
    return await this.prisma.lead.update({
      where: { id },
      data: data as any,
    });
  }

  async delete(id: string): Promise<Lead> {
    return await this.prisma.lead.delete({
      where: { id },
    });
  }
}
