import { Prisma } from '@prisma/client';
import { balanceDelta, money, moneyNumber } from './money';

describe('money', () => {
  it('converte null/undefined em zero', () => {
    expect(money(null).toString()).toBe('0');
    expect(money(undefined).toString()).toBe('0');
    expect(moneyNumber(null)).toBe(0);
    expect(moneyNumber(undefined)).toBe(0);
  });

  it('preserva precisao decimal de strings', () => {
    const value = money('10.10');
    expect(value.toString()).toBe('10.1');
    expect(moneyNumber('1234.56')).toBe(1234.56);
  });

  it('aceita Decimal e number', () => {
    expect(money(new Prisma.Decimal('5.55')).toString()).toBe('5.55');
    expect(moneyNumber(new Prisma.Decimal('5.55'))).toBe(5.55);
  });
});

describe('balanceDelta', () => {
  it('soma receita', () => {
    expect(balanceDelta('income', '100.25').toString()).toBe('100.25');
  });

  it('subtrai despesa', () => {
    expect(balanceDelta('expense', '100.25').toString()).toBe('-100.25');
  });

  it('ignora tipos desconhecidos', () => {
    expect(balanceDelta('transfer', '100').toString()).toBe('0');
  });
});
