export type PlanName = 'free' | 'premium' | 'pro';

export interface PlanLimits {
  accounts: number;
  transactions: number;
  cards: number;
  budgets: number;
  goals: number;
  members: number;
  categories: number;
}

const UNLIMITED = 999999;

export const PLAN_LIMITS: Record<PlanName, PlanLimits> = {
  free: { accounts: 1, transactions: 50, cards: 2, budgets: 3, goals: 1, members: 1, categories: 20 },
  premium: { accounts: 3, transactions: UNLIMITED, cards: 5, budgets: UNLIMITED, goals: 5, members: 3, categories: UNLIMITED },
  pro: { accounts: UNLIMITED, transactions: UNLIMITED, cards: UNLIMITED, budgets: UNLIMITED, goals: UNLIMITED, members: UNLIMITED, categories: UNLIMITED },
};

export function normalizePlan(plan?: string | null): PlanName {
  return plan === 'premium' || plan === 'pro' ? plan : 'free';
}

export function getPlanLimits(plan?: string | null): PlanLimits {
  return PLAN_LIMITS[normalizePlan(plan)];
}
