import { getPlanLimits, normalizePlan, PLAN_LIMITS } from './plan-limits';

describe('plan-limits', () => {
  it('normaliza planos desconhecidos para free', () => {
    expect(normalizePlan(undefined)).toBe('free');
    expect(normalizePlan('enterprise')).toBe('free');
    expect(normalizePlan('premium')).toBe('premium');
    expect(normalizePlan('pro')).toBe('pro');
  });

  it('aplica limites do plano free', () => {
    const limits = getPlanLimits('free');
    expect(limits.accounts).toBe(1);
    expect(limits.transactions).toBe(50);
    expect(limits.cards).toBe(2);
    expect(limits.budgets).toBe(3);
    expect(limits.goals).toBe(1);
    expect(limits.members).toBe(1);
    expect(limits.categories).toBe(20);
  });

  it('pro nao tem limite pratico', () => {
    const limits = getPlanLimits('pro');
    expect(limits.accounts).toBe(999999);
    expect(limits.transactions).toBe(999999);
  });

  it('cada plano tem todas as chaves', () => {
    const keys = Object.keys(PLAN_LIMITS.free).sort();
    for (const plan of Object.values(PLAN_LIMITS)) {
      expect(Object.keys(plan).sort()).toEqual(keys);
    }
  });
});
