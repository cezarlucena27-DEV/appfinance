import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
    } catch (e) {
      console.error(
        '[aviso] Nao foi possivel conectar no banco na inicializacao - o app vai subir mesmo assim.',
        e instanceof Error ? e.message : e,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
