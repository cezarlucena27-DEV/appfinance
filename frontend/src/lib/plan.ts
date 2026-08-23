export const FREE_PLAN_LIMITS = {
  accounts: 1,
  transactionsPerMonth: 50,
  cards: 1,
  budgets: 1,
  goals: 1,
  users: 1,
};

export const PREMIUM_PLAN_LIMITS = {
  accounts: 3,
  transactionsPerMonth: Infinity,
  cards: Infinity,
  budgets: Infinity,
  goals: Infinity,
  users: 3,
};

export const PRO_PLAN_LIMITS = {
  accounts: Infinity,
  transactionsPerMonth: Infinity,
  cards: Infinity,
  budgets: Infinity,
  goals: Infinity,
  users: Infinity,
};

export function isFreePlan(plan?: string): boolean {
  return !plan || plan === 'free';
}

export function isPremiumPlan(plan?: string): boolean {
  return plan === 'premium';
}

export function isProPlan(plan?: string): boolean {
  return plan === 'pro';
}

export function getPlanLimits(plan?: string) {
  if (isFreePlan(plan)) return FREE_PLAN_LIMITS;
  if (isPremiumPlan(plan)) return PREMIUM_PLAN_LIMITS;
  if (isProPlan(plan)) return PRO_PLAN_LIMITS;
  return FREE_PLAN_LIMITS;
}

export function getPlanLimit(plan: string | undefined, feature: keyof typeof FREE_PLAN_LIMITS): number {
  const limits = getPlanLimits(plan);
  return limits[feature];
}

export function canCreateAccount(plan: string | undefined, currentCount: number): boolean {
  return currentCount < getPlanLimit(plan, 'accounts');
}

export function canCreateCard(plan: string | undefined, currentCount: number): boolean {
  return currentCount < getPlanLimit(plan, 'cards');
}

export function canCreateBudget(plan: string | undefined, currentCount: number): boolean {
  return currentCount < getPlanLimit(plan, 'budgets');
}

export function canCreateGoal(plan: string | undefined, currentCount: number): boolean {
  return currentCount < getPlanLimit(plan, 'goals');
}

export function canCreateTransaction(plan: string | undefined, currentMonthCount: number): boolean {
  return currentMonthCount < getPlanLimit(plan, 'transactionsPerMonth');
}

export function canInviteUser(plan: string | undefined, currentUserCount: number): boolean {
  return currentUserCount < getPlanLimit(plan, 'users');
}

export function getLimitMessage(plan: string | undefined, feature: keyof typeof FREE_PLAN_LIMITS): string {
  if (!isFreePlan(plan) && !isPremiumPlan(plan)) return '';
  const limit = getPlanLimit(plan, feature);
  if (limit === Infinity) return '';
  const labels: Record<keyof typeof FREE_PLAN_LIMITS, string> = {
    accounts: 'contas',
    transactionsPerMonth: 'transações por mês',
    cards: 'cartões',
    budgets: 'orçamentos',
    goals: 'metas',
    users: 'usuários',
  };
  const planName = isFreePlan(plan) ? 'gratuito' : 'Premium';
  if (feature === 'users') {
    return 'Para adicionar um usuário, faça um upgrade no seu plano';
  }
  return `Plano ${planName} permite até ${limit} ${labels[feature]}. Faça upgrade para remover limites.`;
}