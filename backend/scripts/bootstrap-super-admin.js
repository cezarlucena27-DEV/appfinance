// Promove o usuario definido em SUPER_ADMIN_EMAIL a platform_admin aprovado.
// Uso: node scripts/bootstrap-super-admin.js
// Requer DATABASE_URL e SUPER_ADMIN_EMAIL no ambiente (ou .env).
const { existsSync, readFileSync } = require('fs');
const { join } = require('path');

function loadEnvFile() {
  for (const file of [join(process.cwd(), '.env'), join(process.cwd(), '..', '.env')]) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, 'utf-8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_.]*)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const key = match[1];
      const value = (match[2] || '').trim().replace(/^["']|["']$/g, '');
      if (!(key in process.env)) process.env[key] = value;
    }
    break;
  }
}

async function main() {
  loadEnvFile();

  const email = (process.env.SUPER_ADMIN_EMAIL || '').trim().toLowerCase();
  if (!email) {
    console.error('[erro] SUPER_ADMIN_EMAIL nao definido.');
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error('[erro] DATABASE_URL nao definida.');
    process.exit(1);
  }

  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error(`[erro] Nenhum usuario com email ${email}. Registre a conta primeiro e rode de novo.`);
      process.exit(1);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        globalRole: 'platform_admin',
        isAdminApproved: true,
        isActive: true,
        adminPanels: 'all',
      },
      select: { id: true, email: true, globalRole: true, isAdminApproved: true },
    });
    console.log('[ok] Super admin provisionado:', updated);
  } catch (e) {
    console.error('[erro] Falha ao provisionar super admin:', e instanceof Error ? e.message : e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
