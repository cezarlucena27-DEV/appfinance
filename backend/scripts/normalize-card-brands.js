// Converte codigos antigos de bandeira para o formato canonico.
// Idempotente: pode rodar em todo deploy.
const { PrismaClient } = require('@prisma/client');

const LEGACY_BRANDS = { amge: 'amex', outra: 'other' };

async function main() {
  const prisma = new PrismaClient();
  try {
    for (const [from, to] of Object.entries(LEGACY_BRANDS)) {
      const { count } = await prisma.card.updateMany({ where: { brand: from }, data: { brand: to } });
      if (count) console.log(`[ok] ${count} cartao(oes) com bandeira '${from}' convertidos para '${to}'`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('[erro] falha ao normalizar bandeiras de cartao:', err);
  process.exit(1);
});
