import { Prisma } from '@prisma/client';

export type MoneyInput = number | string | Prisma.Decimal;

export function money(value: MoneyInput | null | undefined): Prisma.Decimal {
  if (value === null || value === undefined) return new Prisma.Decimal(0);
  return new Prisma.Decimal(value);
}

export function moneyNumber(value: MoneyInput | null | undefined): number {
  if (value === null || value === undefined) return 0;
  return Number(value);
}

export function balanceDelta(type: string, amount: MoneyInput): Prisma.Decimal {
  const value = money(amount);
  if (type === 'income') return value;
  if (type === 'expense') return value.negated();
  return new Prisma.Decimal(0);
}
