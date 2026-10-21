// Garante, via Prisma Client, as tabelas que o "prisma db push" criaria.
// Necessario na Hostinger, onde o binario schema-engine nao pode ser executado
// (EACCES) e o db push falha. O Prisma Client usa outro motor e funciona.
// Idempotente: pode rodar em todo deploy. DDL igual ao gerado por
// "prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma".
const { PrismaClient } = require('@prisma/client');

const STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS \`RefreshSession\` (
    \`id\` VARCHAR(191) NOT NULL,
    \`userId\` VARCHAR(191) NOT NULL,
    \`currentJti\` VARCHAR(191) NOT NULL,
    \`previousJti\` VARCHAR(191) NULL,
    \`rotatedAt\` DATETIME(3) NULL,
    \`expiresAt\` DATETIME(3) NOT NULL,
    \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updatedAt\` DATETIME(3) NOT NULL,
    INDEX \`RefreshSession_userId_idx\`(\`userId\`),
    PRIMARY KEY (\`id\`),
    CONSTRAINT \`RefreshSession_userId_fkey\` FOREIGN KEY (\`userId\`) REFERENCES \`User\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
];

async function main() {
  const prisma = new PrismaClient();
  try {
    for (const sql of STATEMENTS) {
      await prisma.$executeRawUnsafe(sql);
    }
    console.log('[ok] Tabelas obrigatorias verificadas');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('[erro] falha ao garantir o schema:', err);
  process.exit(1);
});
