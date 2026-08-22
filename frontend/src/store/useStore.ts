import { create } from 'zustand';
import api from '../lib/api';
import { User, Account, Transaction, Category, Card, Budget, Goal, MonthlySummary, UserAdmin, WorkspaceStats, Segment, Plan, MonthlyReport, HelpTicket } from '../types';
import { isFreePlan, canCreateAccount, canCreateCard, canCreateBudget, canCreateGoal, canCreateTransaction, canInviteUser, getLimitMessage } from '../lib/plan';

interface AppState {
  user: User | null;
  authLoading: boolean;
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  cards: Card[];
  budgets: Budget[];
  goals: Goal[];
  summary: MonthlySummary | null;
  users: UserAdmin[];
  workspaceStats: WorkspaceStats | null;
  segments: Segment[];
  plans: Plan[];
  subscription: any;
  monthlyReport: MonthlyReport | null;
  enabledModules: string[];
  helpTickets: HelpTicket[];
  helpTicketsLoading: boolean;
  
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, wantsAdmin?: boolean) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  toggleModule: (moduleId: string) => void;
  
  fetchAccounts: () => Promise<void>;
  createAccount: (data: any) => Promise<any>;
  deleteAccount: (id: string) => Promise<void>;
  
  fetchTransactions: (filters?: any) => Promise<void>;
  createTransaction: (data: any) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  fetchCategories: () => Promise<void>;
  createCategory: (data: any) => Promise<any>;
  deleteCategory: (id: string) => Promise<void>;
  
  fetchCards: () => Promise<void>;
  createCard: (data: any) => Promise<void>;
  deleteCard: (id: string) => Promise<void>;
  
  fetchBudgets: () => Promise<void>;
  createBudget: (data: any) => Promise<void>;
  
  fetchGoals: () => Promise<void>;
  createGoal: (data: any) => Promise<void>;
  addGoalAmount: (id: string, amount: number) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  
  fetchSummary: () => Promise<void>;
  
  fetchUsers: () => Promise<void>;
  fetchWorkspaceStats: () => Promise<void>;
  toggleUserActive: (id: string, message?: string) => Promise<void>;
  updateUserRole: (id: string, role: string) => Promise<void>;
  inviteUser: (email: string, name: string) => Promise<{ tempPassword: string }>;
  updateWorkspacePlan: (plan: string) => Promise<void>;
  editUser: (id: string, data: { name?: string; email?: string }) => Promise<void>;
  resetUserPassword: (id: string) => Promise<string>;
  deleteUser: (id: string) => Promise<void>;
  
  fetchSegments: () => Promise<void>;
  fetchPlans: () => Promise<void>;
  fetchSubscription: () => Promise<void>;
  checkoutSubscription: (plan: string, billingDay?: number) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  completeOnboarding: (data: any) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  fetchMonthlyReport: (month: number, year: number, scope?: string) => Promise<void>;
  checkAuth: () => Promise<void>;
  
  fetchHelpTickets: () => Promise<void>;
  createHelpTicket: (data: { subject: string; message: string; category: string }) => Promise<void>;
  updateHelpTicketStatus: (id: string, status: string) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  authLoading: true,
  enabledModules: (() => {
    const stored = localStorage.getItem('financeapp_modules');
    if (!stored) return ['transactions','accounts','cards','categories','budgets','goals','reports','subscription'];
    try { return JSON.parse(stored); } catch { return ['transactions','accounts','cards','categories','budgets','goals','reports','subscription']; }
  })(),
  accounts: [],
  transactions: [],
  categories: [],
  cards: [],
  budgets: [],
  goals: [],
  summary: null,
  users: [],
  workspaceStats: null,
  segments: [],
  plans: [],
  subscription: null,
  monthlyReport: null,
  helpTickets: [],
  helpTicketsLoading: false,

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    set({ user: data.user });
  },

  register: async (name, email, password, wantsAdmin = false) => {
    const { data } = await api.post('/auth/register', { name, email, password, wantsAdmin });
    if (!wantsAdmin) {
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      set({ user: data.user });
    }
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, accounts: [], transactions: [], categories: [], cards: [], budgets: [], goals: [], summary: null, users: [], workspaceStats: null, segments: [], plans: [], subscription: null, monthlyReport: null });
  },

  fetchProfile: async () => {
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data });
    } catch {}
  },

  toggleModule: (moduleId) => {
    const { enabledModules } = get();
    const next = enabledModules.includes(moduleId)
      ? enabledModules.filter((id) => id !== moduleId)
      : [...enabledModules, moduleId];
    localStorage.setItem('financeapp_modules', JSON.stringify(next));
    set({ enabledModules: next });
  },

  fetchAccounts: async () => {
    const { data } = await api.get('/accounts');
    set({ accounts: data });
  },

createAccount: async (accountData) => {
    const { user, accounts } = get();
    const plan = user?.workspace?.plan || 'free';
    if (!canCreateAccount(plan, accounts.length)) {
      throw new Error(getLimitMessage(plan, 'accounts'));
    }
    const { data } = await api.post('/accounts', accountData);
    get().fetchAccounts();
    return data;
  },

  deleteAccount: async (id) => {
    await api.delete(`/accounts/${id}`);
    get().fetchAccounts();
  },

  fetchTransactions: async (filters) => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.type) params.append('type', filters.type);
    const { data } = await api.get(`/transactions?${params.toString()}`);
    set({ transactions: data });
  },

createTransaction: async (transactionData) => {
    const { user, transactions } = get();
    const plan = user?.workspace?.plan || 'free';
    if (!isFreePlan(plan)) {
      await api.post('/transactions', transactionData);
      get().fetchTransactions();
      get().fetchAccounts();
      get().fetchSummary();
      return;
    }
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const currentMonthTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return tDate.getMonth() + 1 === currentMonth && tDate.getFullYear() === currentYear;
    }).length;
    if (!canCreateTransaction(plan, currentMonthTransactions)) {
      throw new Error(getLimitMessage(plan, 'transactionsPerMonth'));
    }
    await api.post('/transactions', transactionData);
    get().fetchTransactions();
    get().fetchAccounts();
    get().fetchSummary();
  },

  deleteTransaction: async (id) => {
    await api.delete(`/transactions/${id}`);
    get().fetchTransactions();
    get().fetchAccounts();
    get().fetchSummary();
  },

  fetchCategories: async () => {
    const { data } = await api.get('/categories');
    set({ categories: data });
  },

  createCategory: async (categoryData) => {
    const { data } = await api.post('/categories', categoryData);
    get().fetchCategories();
    return data;
  },

  deleteCategory: async (id) => {
    await api.delete(`/categories/${id}`);
    get().fetchCategories();
  },

  fetchCards: async () => {
    const { data } = await api.get('/cards');
    set({ cards: data });
  },

  createCard: async (cardData) => {
    const { user, cards } = get();
    const plan = user?.workspace?.plan || 'free';
    if (!canCreateCard(plan, cards.length)) {
      throw new Error(getLimitMessage(plan, 'cards'));
    }
    await api.post('/cards', cardData);
    get().fetchCards();
  },

  deleteCard: async (id) => {
    await api.delete(`/cards/${id}`);
    get().fetchCards();
  },

  fetchBudgets: async () => {
    const { data } = await api.get('/budgets');
    set({ budgets: data });
  },

createBudget: async (budgetData) => {
    const { user, budgets } = get();
    const plan = user?.workspace?.plan || 'free';
    if (!canCreateBudget(plan, budgets.length)) {
      throw new Error(getLimitMessage(plan, 'budgets'));
    }
    await api.post('/budgets', budgetData);
    get().fetchBudgets();
  },

  fetchGoals: async () => {
    const { data } = await api.get('/goals');
    set({ goals: data });
  },

createGoal: async (goalData) => {
    const { user, goals } = get();
    const plan = user?.workspace?.plan || 'free';
    if (!canCreateGoal(plan, goals.length)) {
      throw new Error(getLimitMessage(plan, 'goals'));
    }
    await api.post('/goals', goalData);
    get().fetchGoals();
  },

  addGoalAmount: async (id, amount) => {
    await api.post(`/goals/${id}/add-amount`, { amount });
    get().fetchGoals();
  },

  deleteGoal: async (id) => {
    await api.delete(`/goals/${id}`);
    get().fetchGoals();
  },

  fetchSummary: async () => {
    const { data } = await api.get('/transactions/summary');
    set({ summary: data });
  },

  fetchUsers: async () => {
    const { data } = await api.get('/users');
    set({ users: data });
  },

  fetchWorkspaceStats: async () => {
    const { data } = await api.get('/users/stats');
    set({ workspaceStats: data });
  },

  toggleUserActive: async (id, message) => {
    await api.patch(`/users/${id}/toggle-active`, message ? { message } : {});
    get().fetchUsers();
    get().fetchWorkspaceStats();
  },

  updateUserRole: async (id, role) => {
    await api.patch(`/users/${id}/role`, { role });
    get().fetchUsers();
  },

  inviteUser: async (email, name) => {
    const { user, users } = get();
    const plan = user?.workspace?.plan || 'free';
    const currentUserCount = users.filter(u => u.isActive).length;
    if (!canInviteUser(plan, currentUserCount)) {
      throw new Error(getLimitMessage(plan, 'users'));
    }
    const { data } = await api.post('/users/invite', { email, name });
    get().fetchUsers();
    get().fetchWorkspaceStats();
    return { tempPassword: data.tempPassword };
  },

  updateWorkspacePlan: async (plan) => {
    await api.patch('/users/workspace/plan', { plan });
    get().fetchWorkspaceStats();
  },

  editUser: async (id: string, data: { name?: string; email?: string }) => {
    await api.put(`/users/${id}`, data);
    get().fetchUsers();
  },

  resetUserPassword: async (id: string) => {
    const { data } = await api.post(`/users/${id}/reset-password`);
    return data.tempPassword;
  },

  deleteUser: async (id: string) => {
    await api.delete(`/users/${id}`);
    get().fetchUsers();
    get().fetchWorkspaceStats();
  },

  fetchSegments: async () => {
    const { data } = await api.get('/segments');
    set({ segments: data });
  },

  fetchPlans: async () => {
    const { data } = await api.get('/subscriptions/plans');
    set({ plans: data });
  },

  fetchSubscription: async () => {
    const { data } = await api.get('/subscriptions');
    set({ subscription: data });
  },

  checkoutSubscription: async (plan, billingDay?) => {
    await api.post('/subscriptions/checkout', { plan, billingDay });
    get().fetchSubscription();
  },

  cancelSubscription: async () => {
    await api.post('/subscriptions/cancel');
    get().fetchSubscription();
  },

  completeOnboarding: async (data) => {
    await api.post('/onboarding', data);
    const me = await api.get('/auth/me');
    set({ user: me.data });
  },

  changePassword: async (currentPassword, newPassword) => {
    await api.post('/auth/change-password', { currentPassword, newPassword });
  },

  fetchMonthlyReport: async (month, year, scope = 'individual') => {
    const { data } = await api.get(`/reports/monthly?month=${month}&year=${year}&scope=${scope}`);
    set({ monthlyReport: data });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { set({ authLoading: false }); return; }
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data, authLoading: false });
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ authLoading: false });
    }
  },

  fetchHelpTickets: async () => {
    set({ helpTicketsLoading: true });
    try {
      const { data } = await api.get('/help/tickets');
      set({ helpTickets: data });
    } catch {}
    set({ helpTicketsLoading: false });
  },

  createHelpTicket: async (ticketData) => {
    await api.post('/help/tickets', ticketData);
    get().fetchHelpTickets();
  },

  updateHelpTicketStatus: async (id, status) => {
    await api.patch(`/help/tickets/${id}/status`, { status });
    get().fetchHelpTickets();
  },
}));
