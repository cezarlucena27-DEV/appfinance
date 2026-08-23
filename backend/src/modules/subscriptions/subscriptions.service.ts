import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  private getPixConfigPath() {
    const candidates = [
      join(process.cwd(), 'asaas-config.json'),
      join(process.cwd(), 'backend', 'asaas-config.json'),
      join(__dirname, '..', '..', '..', 'asaas-config.json'),
    ];
    for (const p of candidates) {
      try {
        if (existsSync(p)) return p;
      } catch {
        // next candidate
      }
    }
    return candidates[0];
  }

  private getPixKey(): string {
    // 1) variavel de ambiente (producao - arquivo fica fora do git por seguranca)
    const envKey = (process.env.PIX_KEY || '').trim();
    if (envKey) {
      if (/^\d{10,11}$/.test(envKey)) return '+55' + envKey;
      return envKey;
    }
    // 2) arquivo local de configuracao
    try {
      const raw = readFileSync(this.getPixConfigPath(), 'utf-8');
      const key = (JSON.parse(raw).pixKey || '').trim();
      if (/^\d{10,11}$/.test(key)) {
        return '+55' + key;
      }
      return key;
    } catch {
      return '';
    }
  }

  getPublicPaymentInfo() {
    // Nunca expor email pessoal ao publico - padrao generico "administrador"
    // (pode ser sobrescrito com um endereco real via arquivo de configuracao PIX se desejar)
    let financeEmail = 'administrador';
    try {
      const raw = readFileSync(this.getPixConfigPath(), 'utf-8');
      const configured = (JSON.parse(raw).financeEmail || '').trim();
      // so aceita endereco de email valido como override
      financeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(configured) ? configured : financeEmail;
    } catch {
      // keep default
    }
    return { pixKey: this.getPixKey(), financeEmail };
  }

  private emvField(id: string, value: string): string {
    const len = value.length.toString().padStart(2, '0');
    return `${id}${len}${value}`;
  }

  private crc16(payload: string): string {
    let crc = 0xffff;
    for (let i = 0; i < payload.length; i++) {
      crc ^= payload.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }

  private buildPixPayload(pixKey: string, amount: number, txid: string): string {
    const merchantName = 'FINANCEAPP';
    const merchantCity = 'SAO PAULO';
    const amountStr = amount.toFixed(2);

    let payload =
      this.emvField('00', '01') +
      this.emvField('01', '12') +
      this.emvField('26', this.emvField('00', 'br.gov.bcb.pix') + this.emvField('01', pixKey)) +
      this.emvField('52', '0000') +
      this.emvField('53', '986') +
      this.emvField('54', amountStr) +
      this.emvField('58', 'BR') +
      this.emvField('59', merchantName.substring(0, 25)) +
      this.emvField('60', merchantCity.substring(0, 15)) +
      this.emvField('62', this.emvField('05', txid.substring(0, 25)));

    payload += '6304';
    payload += this.crc16(payload);
    return payload;
  }

  async getPix(userId: string, planId: string) {
    if (!planId || planId === 'free') {
      throw new BadRequestException('Plano invalido para geracao de PIX');
    }

    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plano nao encontrado');

    const pixKey = this.getPixKey();
    if (!pixKey) {
      throw new BadRequestException('Chave PIX nao configurada pelo administrador');
    }

    const subscription = await this.prisma.subscription.findUnique({ where: { userId } });
    const txid = (subscription?.id || userId).replace(/[^a-zA-Z0-9]/g, '').substring(0, 25).toUpperCase();

    const payload = this.buildPixPayload(pixKey, plan.price, txid);

    return {
      pixKey,
      amount: plan.price,
      planName: plan.name,
      payload,
    };
  }

  private computeNextDueDate(billingDay: number, from = new Date()): Date {
    const day = Math.min(Math.max(Math.round(billingDay), 1), 28);
    const candidate = new Date(from.getFullYear(), from.getMonth(), day);
    if (candidate <= from) {
      return new Date(from.getFullYear(), from.getMonth() + 1, day);
    }
    return candidate;
  }

  async getCurrent(userId: string) {
    const [subscription, user] = await Promise.all([
      this.prisma.subscription.findUnique({
        where: { userId },
        include: { plan: true },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { createdAt: true },
      }),
    ]);

    const isActive = subscription?.status === 'active' && !!subscription?.planId;
    const planId = isActive ? subscription!.planId! : 'free';
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });

    const registrationDay = user ? Math.min(user.createdAt.getDate(), 28) : null;
    const billingDay = subscription?.billingDay ?? registrationDay;
    const nextDueDate = subscription?.nextDueDate ?? (billingDay ? this.computeNextDueDate(billingDay) : null);

    return {
      id: subscription?.id ?? null,
      planId,
      plan: plan
        ? { id: plan.id, name: plan.name, price: plan.price }
        : { id: 'free', name: 'Plano Gratuito', price: 0 },
      status: subscription?.status ?? 'active',
      value: subscription?.value ?? 0,
      billingDay,
      nextDueDate,
      createdAt: subscription?.createdAt ?? null,
    };
  }

  async getPlans() {
    return [
      {
        id: 'free',
        name: 'Plano Gratuito',
        price: 0,
        features: [
          'Ate 50 transacoes/mes',
          'Ate 1 conta',
          'Categorias padrao do sistema',
          'Orcamentos com alertas 80%/100%',
          'Metas de economia',
        ],
      },
      {
        id: 'premium',
        name: 'Plano Premium',
        price: 29.90,
        features: [
          'Transacoes ilimitadas (inclusive parceladas e recorrentes)',
          'Ate 3 contas (carteira, corrente, poupanca, investimento)',
          'Cartoes de credito com fatura automatica',
          'Relatorios: fluxo de caixa, por categoria e patrimonio',
          'Backup manual',
          'Ate 3 usuarios',
        ],
      },
      {
        id: 'pro',
        name: 'Plano Pro',
        price: 49.90,
        features: [
          'Tudo do Premium',
          'Contas, cartoes e usuarios ilimitados',
          'Backup automatico diario',
          'Suporte prioritario',
        ],
      },
    ];
  }

  async checkout(userId: string, plan: string, billingDay?: number) {
    const membership = await this.prisma.workspaceMember.findFirst({
      where: { userId },
      include: { workspace: true },
    });
    if (!membership) throw new NotFoundException('User has no workspace');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { createdAt: true },
    });

    const day =
      billingDay && billingDay >= 1 && billingDay <= 28
        ? Math.round(billingDay)
        : Math.min(user?.createdAt.getDate() ?? 1, 28);

    const nextDueDate = this.computeNextDueDate(day);

    await this.prisma.workspace.update({
      where: { id: membership.workspaceId },
      data: { plan },
    });

    const planRecord = await this.prisma.plan.findUnique({ where: { id: plan } });
    const value = planRecord?.price ?? (plan === 'premium' ? 29.9 : plan === 'pro' ? 49.9 : 0);

    const existing = await this.prisma.subscription.findUnique({ where: { userId } });
    if (existing) {
      return this.prisma.subscription.update({
        where: { userId },
        data: { planId: plan, status: 'active', billingDay: day, nextDueDate, value },
      });
    }
    return this.prisma.subscription.create({
      data: {
        userId,
        workspaceId: membership.workspaceId,
        planId: plan,
        status: 'active',
        billingDay: day,
        nextDueDate,
        value,
      },
    });
  }

  async getReminder(userId: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    const isPaying = !!sub && !!sub.planId && sub.planId !== 'free' && sub.status === 'active';
    const due = sub?.accessUntil || sub?.nextDueDate;

    if (!isPaying || !due) {
      return { show: false };
    }

    const msPerDay = 1000 * 60 * 60 * 24;
    const dueDateObj = new Date(due);
    const dueUtcDay = Date.UTC(dueDateObj.getUTCFullYear(), dueDateObj.getUTCMonth(), dueDateObj.getUTCDate());
    const nowObj = new Date();
    const nowUtcDay = Date.UTC(nowObj.getUTCFullYear(), nowObj.getUTCMonth(), nowObj.getUTCDate());
    const daysUntilDue = Math.round((dueUtcDay - nowUtcDay) / msPerDay);

    if (daysUntilDue < 0 || daysUntilDue > 5) {
      return { show: false };
    }

    await this.prisma.reminderView.create({
      data: { userId, daysUntilDue },
    });

    return {
      show: true,
      daysUntilDue,
      dueDate: due,
      planName: sub!.plan?.name || sub!.planId,
      value: sub!.value,
    };
  }

  async cancel(userId: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!sub) throw new NotFoundException('No subscription found');

    const membership = await this.prisma.workspaceMember.findFirst({
      where: { userId },
    });
    if (!membership) throw new NotFoundException('User has no workspace');

    await this.prisma.workspace.update({
      where: { id: membership.workspaceId },
      data: { plan: 'free' },
    });

    return this.prisma.subscription.update({
      where: { userId },
      data: { planId: null, status: 'cancelled' },
    });
  }
}
