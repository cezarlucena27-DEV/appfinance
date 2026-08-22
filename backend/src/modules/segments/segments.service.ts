import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SegmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.segment.findMany({
      where: { isActive: true },
    });
  }
}
