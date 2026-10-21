import { endOfMonth, parseDateOnly, startOfMonth } from './date.util';

describe('parseDateOnly', () => {
  it('grava yyyy-mm-dd ao meio-dia UTC', () => {
    const date = parseDateOnly('2026-03-10')!;
    expect(date.toISOString()).toBe('2026-03-10T12:00:00.000Z');
  });

  it('mantem Date intacto e aceita ISO completo', () => {
    const original = new Date('2026-03-10T00:00:00.000Z');
    expect(parseDateOnly(original)).toBe(original);
    expect(parseDateOnly('2026-03-10T08:30:00.000Z')!.toISOString()).toBe('2026-03-10T08:30:00.000Z');
  });

  it('retorna null para vazio', () => {
    expect(parseDateOnly('')).toBeNull();
    expect(parseDateOnly(null)).toBeNull();
    expect(parseDateOnly(undefined)).toBeNull();
  });

  it('lança para data invalida', () => {
    expect(() => parseDateOnly('nao-e-data')).toThrow();
  });
});

describe('limites de mes', () => {
  it('startOfMonth no primeiro dia 00:00:00.000', () => {
    expect(startOfMonth(new Date(2026, 2, 17, 14, 30)).toISOString()).toBe(
      new Date(2026, 2, 1, 0, 0, 0, 0).toISOString(),
    );
  });

  it('endOfMonth no ultimo dia 23:59:59.999', () => {
    const end = endOfMonth(new Date(2026, 1, 5));
    expect(end.getDate()).toBe(28);
    expect([end.getHours(), end.getMinutes(), end.getSeconds(), end.getMilliseconds()]).toEqual([23, 59, 59, 999]);
  });
});
