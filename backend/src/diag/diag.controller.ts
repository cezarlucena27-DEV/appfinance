import { Controller, Get } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

// Diagnostico temporario de conexao com o banco. Retorna apenas informacoes
// mascaradas (host/usuario, nunca senha). Remover quando estabilizar.
@Controller('diag')
export class DiagController {
  @Get('db')
  async db() {
    const url = process.env.DATABASE_URL || '';
    let host: string | null = null;
    let user: string | null = null;
    let dbName: string | null = null;
    try {
      const parsed = new URL(url);
      host = parsed.host;
      user = parsed.username;
      dbName = parsed.pathname.replace(/^\//, '') || null;
    } catch {
      host = 'URL-INVALIDA';
    }
    const isPlaceholder = host === 'localhost:5432' || !url;
    let connectOk = false;
    let error: string | null = null;
    if (!isPlaceholder) {
      const client = new PrismaClient();
      try {
        await client.$queryRaw`SELECT 1`;
        connectOk = true;
      } catch (e) {
        error = e instanceof Error ? e.message.split('\n').slice(-2).join(' ').substring(0, 200) : String(e);
      } finally {
        await client.$disconnect().catch(() => undefined);
      }
    }
    return {
      hasUrl: Boolean(url),
      isPlaceholder,
      host,
      user,
      dbName,
      connectOk,
      error,
    };
  }
}
