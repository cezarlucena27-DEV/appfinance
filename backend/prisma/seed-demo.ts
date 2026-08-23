import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { DEFAULT_CATEGORIES } from '../src/common/default-categories';

const prisma = new PrismaClient();

const DEMO_USERS = [
  {
    name: 'Demo Free',
    email: 'demo.free@financeapp.com',
    password: 'demo1234',
    workspaceName: 'Workspace Demo Free',
    plan: 'free',
  },
  {
    name: 'Demo Premium',
    email: 'demo.premium@financeapp.com',
    password: 'demo1234',
    workspaceName: 'Workspace Demo Premium',
    plan: 'premium',
  },
  {
    name: 'Demo Pro',
    email: 'demo.pro@financeapp.com',
    password: 'demo1234',
    workspaceName: 'Workspace Demo Pro',
    plan: 'pro',
  },
];

async function main() {
  const nextDueDate = new Date();
  nextDueDate.setMonth(nextDueDate.getMonth() + 1);

  await prisma.plan.upsert({
    where: { name: 'Plano Gratuito' },
    update: {},
    create: { id: 'free', name: 'Plano Gratuito', price: 0, description: 'Ate 3 contas, 50 transacoes/mes, categorias basicas, 1 usuario' },
  });
  await prisma.plan.upsert({
    where: { name: 'Plano Premium' },
    update: {},
    create: { id: 'premium', name: 'Plano Premium', price: 29.9, description: 'Contas e transacoes ilimitadas, relatorios PDF, insights, ate 3 usuarios, suporte prioritario' },
  });
  await prisma.plan.upsert({
    where: { name: 'Plano Pro' },
    update: {},
    create: { id: 'pro', name: 'Plano Pro', price: 49.9, description: 'Tudo do Premium, usuarios ilimitados, backup automatico, API access, suporte 24/7' },
  });
  console.log('Planos garantidos no banco (free, premium, pro).');

  for (const demo of DEMO_USERS) {
    const existing = await prisma.user.findUnique({ where: { email: demo.email } });
    if (existing) {
      console.log(`Usuario ${demo.email} ja existe. Atualizando plano para ${demo.plan}...`);
      const membership = await prisma.workspaceMember.findFirst({ where: { userId: existing.id } });
      if (membership) {
        await prisma.workspace.update({ where: { id: membership.workspaceId }, data: { plan: demo.plan } });
      }
      await prisma.subscription.upsert({
        where: { userId: existing.id },
        update: { planId: demo.plan, status: 'active', nextDueDate },
        create: {
          userId: existing.id,
          workspaceId: membership?.workspaceId || '',
          planId: demo.plan,
          status: 'active',
          value: demo.plan === 'premium' ? 29.9 : demo.plan === 'pro' ? 49.9 : 0,
          nextDueDate,
        },
      });
      continue;
    }

    const passwordHash = await bcrypt.hash(demo.password, 12);

    const user = await prisma.user.create({
      data: {
        name: demo.name,
        email: demo.email,
        passwordHash,
        globalRole: 'regular',
        isActive: true,
        isAdminApproved: true,
        defaultsCreated: true,
      },
    });

    const workspace = await prisma.workspace.create({
      data: {
        name: demo.workspaceName,
        ownerId: user.id,
        plan: demo.plan,
      },
    });

    await prisma.workspaceMember.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        role: 'master',
      },
    });

    await prisma.category.createMany({
      data: DEFAULT_CATEGORIES.map(cat => ({ ...cat, userId: user.id })),
    });

    await prisma.subscription.create({
      data: {
        userId: user.id,
        workspaceId: workspace.id,
        planId: demo.plan,
        status: 'active',
        value: demo.plan === 'premium' ? 29.9 : demo.plan === 'pro' ? 49.9 : 0,
        nextDueDate,
      },
    });

    console.log(`Criado: ${demo.name} <${demo.email}> | senha: ${demo.password} | plano: ${demo.plan}`);
  }

  console.log('Seed de usuarios demo concluido.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
