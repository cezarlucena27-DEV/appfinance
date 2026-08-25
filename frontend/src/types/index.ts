export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  globalRole: string;
  workspaceId: string;
  workspace?: {
    id: string;
    name?: string;
    plan?: string;
  };
  isAdminApproved?: boolean;
  approvedBy?: string;
  adminPanels?: string;
  onboardingCompleted: boolean;
  isActive: boolean;
  createdAt: string;
  subscriptionBlocked?: boolean;
  blockReason?: string | null;
  accessUntil?: string | null;
  nextDueDate?: string | null;
}

export interface Account {
  id: string;
  name: string;
  type: string;
  initialBalance: number;
  currentBalance: number;
  icon: string;
  color: string;
  isPrimary: boolean;
  userId?: string;
  sharedWith?: {
    id: string;
    name: string;
    email: string;
  }[];
  linkedWith?: {
    id: string;
    name: string;
    color: string;
    currentBalance: number;
  }[];
  groupBalance?: number;
  sharedUsers?: {
    id: string;
    name: string;
    email: string;
    income: number;
    expenses: number;
    available: number;
    isOwner: boolean;
  }[];
}

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  description?: string;
  date: string;
  accountId: string;
  categoryId?: string;
  cardId?: string;
  account: Account;
  category?: Category;
  card?: Card;
  user?: { id: string; name: string; email: string };
  dueDate?: string;
  isPaid?: boolean;
  isRecurring?: boolean;
  recurrenceType?: string;
  totalInstallments?: number;
  currentInstallment?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
  isDefault: boolean;
}

export interface Card {
  id: string;
  name: string;
  brand: string;
  limit: number;
  closingDay: number;
  dueDay: number;
  accountId: string;
  account: Account;
}

export interface Budget {
  id: string;
  categoryId: string;
  month: number;
  year: number;
  limitAmount: number;
  category: Category;
  spent?: number;
  percentage?: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  status: string;
  icon: string;
  color: string;
}

export interface MonthlySummary {
  income: number;
  expenses: number;
  balance: number;
}

export interface UserAdmin {
  id: string;
  name: string;
  email: string;
  globalRole: string;
  role: string;
  workspaceId: string;
  workspace?: { id: string; name: string; plan: string };
  isActive: boolean;
  createdBy?: { id: string; name: string; email: string } | null;
  createdById?: string | null;
  createdAt: string;
  totalSpending: number;
  totalIncome: number;
  _count: {
    transactions: number;
    accounts: number;
    cards: number;
  };
}

export interface WorkspaceStats {
  workspace: {
    name: string;
    plan: string;
    createdAt: string;
  };
  totalUsers: number;
  activeUsers: number;
  totalTransactions: number;
  totalAccounts: number;
}

export interface Segment {
  id: string;
  name: string;
  icon: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
}

export interface MonthlyReport {
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
  transactions?: any[];
  byCategory: { category: string; color: string; total: number; count: number }[];
}

export interface Subscription {
  id: string;
  planId: string;
  status: string;
  currentPeriodEnd: string;
  plan?: Plan;
}

export interface HelpTicket {
  id: string;
  userId: string;
  user?: { id: string; name: string; email: string };
  subject: string;
  message: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  adminResponse?: string;
  respondedAt?: string;
}
