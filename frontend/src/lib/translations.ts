export const accountTypeLabels: Record<string, string> = {
  wallet: 'Carteira',
  checking: 'Conta Corrente',
  savings: 'Poupanca',
  investment: 'Investimento',
};

export const roleLabels: Record<string, string> = {
  master: 'Mestre',
  admin: 'Administrador',
  member: 'Comum',
};

export const cardBrandLabels: Record<string, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  elo: 'Elo',
  amge: 'American Express',
  other: 'Outra',
};

export const transactionTypeLabels: Record<string, string> = {
  expense: 'Despesa',
  income: 'Receita',
  transfer: 'Transferencia',
};

export const budgetPeriodLabels: Record<string, string> = {
  monthly: 'Mensal',
  weekly: 'Semanal',
  yearly: 'Anual',
};

export function translateLabel(map: Record<string, string>, value: string): string {
  return map[value] || value;
}
