import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { BaseRepository } from './base.repository';
import { Offer } from '@prisma/client';

@Injectable()
export class OffersRepository extends BaseRepository<Offer> {
  constructor(private readonly prismaService: PrismaService) {
    super(prismaService, 'offer');
  }

  // Custom methods specific to Offers
  async findByName(name: string): Promise<Offer | null> {
    return await this.prisma.offer.findFirst({
      where: { name },
    });
  }

  // Override base methods for type safety
  async create(data: Partial<Offer>): Promise<Offer> {
    return await this.prisma.offer.create({
      data: data as any,
    });
  }

  async findById(id: string): Promise<Offer | null> {
    return await this.prisma.offer.findUnique({
      where: { id },
    });
  }

  async findAll(): Promise<Offer[]> {
    return await this.prisma.offer.findMany();
  }

  async update(id: string, data: Partial<Offer>): Promise<Offer> {
    return await this.prisma.offer.update({
      where: { id },
      data: data as any,
    });
  }

  async delete(id: string): Promise<Offer> {
    return await this.prisma.offer.delete({
      where: { id },
    });
  }
}
