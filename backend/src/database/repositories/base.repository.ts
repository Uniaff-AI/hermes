import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export abstract class BaseRepository<T> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly modelName: string
  ) {}

  async create(data: any): Promise<T> {
    return await (this.prisma as any)[this.modelName].create({
      data,
    });
  }

  async findById(id: string): Promise<T | null> {
    return await (this.prisma as any)[this.modelName].findUnique({
      where: { id },
    });
  }

  async findAll(): Promise<T[]> {
    return await (this.prisma as any)[this.modelName].findMany();
  }

  async update(id: string, data: any): Promise<T> {
    return await (this.prisma as any)[this.modelName].update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<T> {
    return await (this.prisma as any)[this.modelName].delete({
      where: { id },
    });
  }
}
