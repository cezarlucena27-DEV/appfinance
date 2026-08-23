import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Shield, Users, ArrowLeftRight, Wallet, CreditCard,
  RefreshCw,
  Key, Trash2, ChevronLeft, ChevronRight, AlertTriangle,
  CheckCircle, XCircle, Edit2, Settings as SettingsIcon, Lock,
  Palette, Puzzle, LogOut, Save, UserPlus, Globe, BarChart3, PieChart as PieIcon,
  FileSpreadsheet, MessageSquare, Mail, Check, X, Bell, Wifi,
  FileText, Image as ImageIcon, Download, Eye, Paperclip
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';
import api from '../lib/api';
import { roleLabels, translateLabel, accountTypeLabels } from '../lib/translations';
import { useStore } from '../store/useStore';
import { useTheme } from '../components/ThemeProvider';
import { MODULE_LIST } from './Settings';
import { format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const safeFormatDate = (dateStr: string | Date | null | undefined) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return isValid(d) ? format(d, 'dd/MM/yyyy', { locale: ptBR }) : '-';
};

const safeFormatDateTime = (dateStr: string | Date | null | undefined) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return isValid(d) ? format(d, 'dd/MM/yyyy HH:mm', { locale: ptBR }) : '-';
};

type Tab = 'overview' | 'financeiro' | 'report' | 'users' | 'transactions' | 'accounts' | 'cards' | 'categories' | 'budgets' | 'goals' | 'logs' | 'admins' | 'configs' | 'help';

interface FinanceSubscription {
  id: string;
  user: { id: string; name: string; email: string; isActive: boolean; createdAt: string };
  planId: string | null;
  planName: string;
  value: number;
  status: string;
  billingDay: number | null;
  nextDueDate: string | null;
  blocked: boolean;
  blockReason: string | null;
  accessUntil: string | null;
  paymentStatus: string;
  payments: { id: string; amount: number; status: string; dueDate: string; paidAt: string | null; notes: string | null; registeredBy: string | null; createdAt: string }[];
}

interface PaymentReceipt {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  senderName: string | null;
  senderEmail: string | null;
  note: string | null;
  status: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  createdAt: string;
}

const SUPER_ADMIN_EMAIL = 'cezar.lucena27@gmail.com';

const actionLabels: Record<string, string> = {
  create: 'Criacao',
  update: 'Edicao',
  delete: 'Exclusao',
};

const entityLabels: Record<string, string> = {
  transaction: 'Transacao',
  account: 'Conta',
  card: 'Cartao',
  category: 'Categoria',
  budget: 'Orcamento',
  goal: 'Meta',
  auth: 'Autenticacao',
  user: 'Usuario',
  admin: 'Admin',
};

interface AdminUser {
  id: string;
  name: string;
  email: string;
  globalRole: string;
  role: string;
  workspaceId: string;
  workspace?: { id: string; name: string; plan: string };
  isActive: boolean;
  isAdminApproved?: boolean;
  approvedBy?: string;
  adminPanels?: string;
  createdBy?: { id: string; name: string; email: string } | null;
  createdById?: string | null;
  createdAt: string;
  lastLogin?: string;
  totalSpending?: number;
  totalIncome?: number;
  _count?: { transactions: number; accounts: number; cards: number };
}

export function Admin() {
  const location = useLocation();
  const user = useStore((s) => s.user);
  const [activeTab, setActiveTab] = useState<Tab>((location.state?.tab as Tab) || 'overview');
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const [logs, setLogs] = useState<any[]>([]);
  const [logPage, setLogPage] = useState(1);
  const [logTotal, setLogTotal] = useState(0);
  const [logTotalPages, setLogTotalPages] = useState(0);
  const [logFilterEntity, setLogFilterEntity] = useState('');
  const [logFilterAction, setLogFilterAction] = useState('');
  const [auditStats, setAuditStats] = useState<any>(null);

  const [pendingAdmins, setPendingAdmins] = useState<AdminUser[]>([]);
  const [approvedAdmins, setApprovedAdmins] = useState<AdminUser[]>([]);

  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({ name: '', email: '' });
  const [newAdminResult, setNewAdminResult] = useState<{ email: string; tempPassword: string } | null>(null);
  const [panelsAdmin, setPanelsAdmin] = useState<AdminUser | null>(null);
  const [panelsSelection, setPanelsSelection] = useState<string[]>([]);
  const [blockUser, setBlockUser] = useState<AdminUser | null>(null);
  const [blockMessage, setBlockMessage] = useState('');

  const [filterPlan, setFilterPlan] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', globalRole: '', isActive: true });

  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const [configTab, setConfigTab] = useState('profile');
  const { theme, setTheme } = useTheme();
  const { user: currentUser, segments, fetchSegments, changePassword, enabledModules, toggleModule, logout, fetchProfile } = useStore();
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [configMsg, setConfigMsg] = useState('');
  const [configError, setConfigError] = useState('');
  const [asaasConfig, setAsaasConfig] = useState({ apiKey: '', webhookUrl: '', environment: 'sandbox', pixKey: '' });
  const [asaasLoading, setAsaasLoading] = useState(false);
  const [chartMode, setChartMode] = useState<'bars' | 'pie' | 'donut'>('bars');
  const [usersView, setUsersView] = useState<'table' | 'tree'>('table');
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceFilter, setBalanceFilter] = useState({ userId: '', startDate: '', endDate: '' });
  const [reportData, setReportData] = useState<any>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const [onlineData, setOnlineData] = useState<any>(null);

  const [helpTickets, setHelpTickets] = useState<any[]>([]);
  const [helpTicketsLoading, setHelpTicketsLoading] = useState(false);
  const [helpFilterStatus, setHelpFilterStatus] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all');
  const [helpFilterCategory, setHelpFilterCategory] = useState('');
  const [respondingTicket, setRespondingTicket] = useState<any>(null);
  const [responseMessage, setResponseMessage] = useState('');

  const [financeSubs, setFinanceSubs] = useState<FinanceSubscription[]>([]);
  const [financeLoading, setFinanceLoading] = useState(false);
  const [reminderViews, setReminderViews] = useState<any[]>([]);
  const [financeExpanded, setFinanceExpanded] = useState<string | null>(null);
  const [blockTarget, setBlockTarget] = useState<FinanceSubscription | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [unblockTarget, setUnblockTarget] = useState<FinanceSubscription | null>(null);
  const [unblockDate, setUnblockDate] = useState('');
  const [payTarget, setPayTarget] = useState<FinanceSubscription | null>(null);
  const [payForm, setPayForm] = useState({ amount: '', dueDate: '', notes: '' });
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [previewReceipt, setPreviewReceipt] = useState<PaymentReceipt | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const showFeedback = (type: 'success' | 'error', msg: string) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4000);
  };

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab as Tab);
    }
  }, [location.state]);

  const loadInitial = async () => {
    setLoading(true);
    try {
      await fetchProfile();
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);

      if (isSuperAdmin) {
        const pendingRes = await api.get('/admin/pending-admins');
        setPendingAdmins(pendingRes.data);
        const approvedRes = await api.get('/admin/approved-admins');
        setApprovedAdmins(approvedRes.data);
      }
    } catch {}
    setLoading(false);
  };

  const loadTabData = async () => {
    setDataLoading(true);
    setData([]);
    const params = new URLSearchParams();
    if (selectedUserId) params.append('userId', selectedUserId);
    if (activeTab === 'transactions' || activeTab === 'budgets') {
      params.append('month', String(month));
      params.append('year', String(year));
    }
    const qs = params.toString();
    try {
      if (activeTab === 'logs') {
        await loadLogs();
      } else if (activeTab === 'admins') {
        await loadAdmins();
      } else if (activeTab === 'users') {
        setData(users);
      } else if (activeTab === 'report') {
        setDataLoading(false);
      } else if (activeTab !== 'overview') {
        const { data: d } = await api.get(`/admin/all-${activeTab === 'transactions' ? 'transactions' : activeTab}?${qs}`);
        setData(d);
      }
    } catch {}
    setDataLoading(false);
  };

  const loadLogs = async (page: number = 1) => {
    try {
      const params = new URLSearchParams({ page: String(page), limit: '30' });
      if (selectedUserId) params.append('userId', selectedUserId);
      if (logFilterEntity) params.append('entity', logFilterEntity);
      if (logFilterAction) params.append('action', logFilterAction);
      const { data } = await api.get(`/admin/audit-logs?${params.toString()}`);
      setLogs(data.logs);
      setLogTotal(data.total);
      setLogPage(data.page);
      setLogTotalPages(data.totalPages);
    } catch {}
  };

  const loadAuditStats = async () => {
    try {
      const { data } = await api.get('/admin/audit-stats');
      setAuditStats(data);
    } catch {}
  };

  const loadAdmins = async () => {
    if (!isSuperAdmin) return;
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        api.get('/admin/pending-admins'),
        api.get('/admin/approved-admins'),
      ]);
      setPendingAdmins(pendingRes.data);
      setApprovedAdmins(approvedRes.data);
    } catch {}
  };

  const loadHelpTickets = async () => {
    setHelpTicketsLoading(true);
    try {
      const { data } = await api.get('/admin/help/tickets');
      setHelpTickets(data);
    } catch {}
    setHelpTicketsLoading(false);
  };

  const handleHelpResponse = async (ticketId: string) => {
    if (!responseMessage.trim()) {
      showFeedback('error', 'Digite uma resposta');
      return;
    }
    setActionLoading(`help-response-${ticketId}`);
    try {
      await api.patch(`/admin/help/tickets/${ticketId}/respond`, { response: responseMessage });
      showFeedback('success', 'Resposta enviada');
      setRespondingTicket(null);
      setResponseMessage('');
      await loadHelpTickets();
    } catch (err: any) {
      showFeedback('error', err?.response?.data?.message || 'Erro ao responder');
    }
    setActionLoading(null);
  };

  const handleHelpStatusChange = async (ticketId: string, status: string) => {
    setActionLoading(`help-status-${ticketId}`);
    try {
      await api.patch(`/admin/help/tickets/${ticketId}/status`, { status });
      showFeedback('success', 'Status atualizado');
      await loadHelpTickets();
    } catch (err: any) {
      showFeedback('error', err?.response?.data?.message || 'Erro ao atualizar status');
    }
    setActionLoading(null);
  };

  useEffect(() => {
    const tab = location.state?.tab as Tab;
    if (tab && tab !== activeTab) setActiveTab(tab);
  }, [location.state?.tab]);

  useEffect(() => { loadInitial(); }, []);
  useEffect(() => { loadTabData(); }, [activeTab, selectedUserId, month, year]);

  useEffect(() => {
    if (activeTab !== 'overview') return;
    let cancelled = false;
    const loadOnline = async () => {
      try {
        const { data } = await api.get('/admin/online');
        if (!cancelled) setOnlineData(data);
      } catch {}
    };
    loadOnline();
    const id = setInterval(loadOnline, 30000);
    return () => { cancelled = true; clearInterval(id); };
  }, [activeTab]);
  useEffect(() => {
    if (activeTab === 'logs') {
      loadLogs(1);
      loadAuditStats();
    }
  }, [activeTab, logFilterEntity, logFilterAction]);


  useEffect(() => {
    if (activeTab === 'configs') {
      fetchSegments();
      loadAsaasConfig();
    }
    if (activeTab === 'help') {
      loadHelpTickets();
    }
    if (activeTab === 'financeiro') {
      loadFinanceSubs();
    }
  }, [activeTab]);

  const loadAsaasConfig = async () => {
    try {
      const { data } = await api.get('/admin/asaas-config');
      setAsaasConfig(data);
    } catch {}
  };

  const loadFinanceSubs = async () => {
    setFinanceLoading(true);
    try {
      const [subsRes, viewsRes, receiptsRes] = await Promise.all([
        api.get('/admin/subscriptions-finance'),
        api.get('/admin/reminder-views'),
        api.get('/admin/payment-receipts').catch(() => ({ data: [] })),
      ]);
      setFinanceSubs(subsRes.data);
      setReminderViews(viewsRes.data);
      setReceipts(receiptsRes.data);
    } catch {
      setFeedback({ type: 'error', msg: 'Erro ao carregar assinaturas' });
    } finally {
      setFinanceLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handlePreviewReceipt = async (r: PaymentReceipt) => {
    setPreviewReceipt(r);
    setPreviewUrl('');
    setPreviewLoading(true);
    try {
      const { data } = await api.get(`/admin/payment-receipts/${r.id}/file`, { responseType: 'blob' });
      setPreviewUrl(URL.createObjectURL(data));
    } catch {
      showFeedback('error', 'Erro ao carregar comprovante');
      setPreviewReceipt(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setPreviewReceipt(null);
  };

  const handleToggleReceiptReviewed = async (r: PaymentReceipt) => {
    const next = r.status === 'reviewed' ? 'pending' : 'reviewed';
    try {
      await api.put(`/admin/payment-receipts/${r.id}/status`, { status: next });
      setReceipts((prev) => prev.map((x) => (x.id === r.id ? { ...x, status: next } : x)));
      showFeedback('success', next === 'reviewed' ? 'Comprovante marcado como analisado' : 'Comprovante voltou para pendente');
    } catch (err: any) {
      showFeedback('error', err?.response?.data?.message || 'Erro ao atualizar comprovante');
    }
  };

  const handleDeleteReceipt = async (r: PaymentReceipt) => {
    if (!confirm('Excluir este comprovante definitivamente?')) return;
    try {
      await api.delete(`/admin/payment-receipts/${r.id}`);
      setReceipts((prev) => prev.filter((x) => x.id !== r.id));
      showFeedback('success', 'Comprovante excluido');
    } catch (err: any) {
      showFeedback('error', err?.response?.data?.message || 'Erro ao excluir comprovante');
    }
  };

  const handleBlockUser = async () => {
    if (!blockTarget) return;
    setActionLoading('block');
    try {
      await api.post(`/admin/subscriptions-finance/${blockTarget.user.id}/block`, { reason: blockReason || 'Falta de pagamento' });
      setFeedback({ type: 'success', msg: `Usuario ${blockTarget.user.name} bloqueado` });
      setBlockTarget(null);
      setBlockReason('');
      await loadFinanceSubs();
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err?.response?.data?.message || 'Erro ao bloquear usuario' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnblockUser = async () => {
    if (!unblockTarget) return;
    setActionLoading('unblock');
    try {
      await api.post(`/admin/subscriptions-finance/${unblockTarget.user.id}/unblock`, { accessUntil: unblockDate || undefined });
      setFeedback({ type: 'success', msg: `Usuario ${unblockTarget.user.name} liberado${unblockDate ? ` ate ${safeFormatDate(unblockDate)}` : ''}` });
      setUnblockTarget(null);
      setUnblockDate('');
      await loadFinanceSubs();
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err?.response?.data?.message || 'Erro ao liberar usuario' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRegisterPayment = async () => {
    if (!payTarget || !payForm.dueDate) return;
    setActionLoading('payment');
    try {
      await api.post(`/admin/subscriptions-finance/${payTarget.user.id}/payments`, {
        amount: payForm.amount ? Number(payForm.amount) : undefined,
        dueDate: payForm.dueDate,
        notes: payForm.notes || undefined,
      });
      setFeedback({ type: 'success', msg: `Pagamento registrado para ${payTarget.user.name}` });
      setPayTarget(null);
      setPayForm({ amount: '', dueDate: '', notes: '' });
      await loadFinanceSubs();
    } catch (err: any) {
      setFeedback({ type: 'error', msg: err?.response?.data?.message || 'Erro ao registrar pagamento' });
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    if (activeTab === 'report') {
      setReportLoading(true);
      const params = new URLSearchParams({ month: String(month), year: String(year) });
      if (selectedUserId) params.append('userId', selectedUserId);
      api.get(`/admin/report?${params.toString()}`)
        .then(res => setReportData(res.data))
        .catch(() => setReportData(null))
        .finally(() => setReportLoading(false));
    }
  }, [activeTab, selectedUserId, month, year]);

  const loadMonthlyBalances = async () => {
    setBalanceLoading(true);
    try {
      const params = new URLSearchParams();
      if (balanceFilter.userId) params.append('userId', balanceFilter.userId);
      if (balanceFilter.startDate) params.append('startDate', balanceFilter.startDate);
      if (balanceFilter.endDate) params.append('endDate', balanceFilter.endDate);
      const { data } = await api.get(`/admin/monthly-balances?${params.toString()}`);
      setMonthlyData(data);
    } catch {}
    setBalanceLoading(false);
  };

  useEffect(() => { loadMonthlyBalances(); }, [balanceFilter]);

  const handleSaveAsaasConfig = async () => {
    setAsaasLoading(true);
    setConfigError('');
    setConfigMsg('');
    try {
      await api.put('/admin/asaas-config', asaasConfig);
      setConfigMsg('Configuracao Asaas salva com sucesso');
    } catch (err: any) {
      setConfigError(err?.response?.data?.message || 'Erro ao salvar configuracao Asaas');
    }
    setAsaasLoading(false);
  };

  const handleChangePassword = async () => {
    setConfigError('');
    setConfigMsg('');
    if (passwordForm.new !== passwordForm.confirm) {
      setConfigError('Senhas nao coincidem');
      return;
    }
    try {
      await changePassword(passwordForm.current, passwordForm.new);
      setConfigMsg('Senha alterada com sucesso');
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch {
      setConfigError('Erro ao alterar senha');
    }
  };

  const handleApproveAdmin = async (userId: string) => {
    setActionLoading(`approve-${userId}`);
    try {
      await api.post(`/admin/approve-admin/${userId}`);
      showFeedback('success', 'Admin aprovado com sucesso');
      await loadAdmins();
    } catch (err: any) {
      showFeedback('error', err?.response?.data?.message || 'Erro ao aprovar admin');
    }
    setActionLoading(null);
  };

  const handleRejectAdmin = async (userId: string) => {
    setActionLoading(`reject-${userId}`);
    try {
      await api.post(`/admin/reject-admin/${userId}`);
      showFeedback('success', 'Solicitacao rejeitada');
      await loadAdmins();
    } catch (err: any) {
      showFeedback('error', err?.response?.data?.message || 'Erro ao rejeitar admin');
    }
    setActionLoading(null);
  };

  const handleRevokeAdmin = async (userId: string) => {
    if (!confirm('Tem certeza que deseja revogar o acesso de admin deste usuario?')) return;
    setActionLoading(`revoke-${userId}`);
    try {
      await api.post(`/admin/revoke-admin/${userId}`);
      showFeedback('success', 'Acesso de admin revogado');
      await loadAdmins();
      await loadInitial();
    } catch (err: any) {
      showFeedback('error', err?.response?.data?.message || 'Erro ao revogar admin');
    }
    setActionLoading(null);
  };

  const handleCreateAdmin = async () => {
    if (!newAdminForm.name.trim() || !newAdminForm.email.trim()) {
      showFeedback('error', 'Informe nome e email');
      return;
    }
    setActionLoading('create-admin');
    try {
      const { data } = await api.post('/admin/admins', newAdminForm);
      setNewAdminResult({ email: data.email, tempPassword: data.tempPassword });
      setNewAdminForm({ name: '', email: '' });
      showFeedback('success', 'Admin incluido com sucesso');
      await loadAdmins();
      await loadInitial();
    } catch (err: any) {
      showFeedback('error', err?.response?.data?.message || 'Erro ao incluir admin');
    }
    setActionLoading(null);
  };

  const handleOpenPanels = (a: AdminUser) => {
    let panels: string[] = [];
    try {
      panels = a.adminPanels && a.adminPanels !== 'all' ? JSON.parse(a.adminPanels) : [];
    } catch {}
    setPanelsSelection(panels);
    setPanelsAdmin(a);
  };

  const handleSavePanels = async () => {
    if (!panelsAdmin) return;
    setActionLoading(`panels-${panelsAdmin.id}`);
    try {
      await api.put(`/admin/admins/${panelsAdmin.id}/panels`, { panels: panelsSelection });
      showFeedback('success', 'Paineis atualizados');
      setPanelsAdmin(null);
      await loadAdmins();
      await fetchProfile();
    } catch (err: any) {
      showFeedback('error', err?.response?.data?.message || 'Erro ao atualizar paineis');
    }
    setActionLoading(null);
  };

  const handleEditUser = (u: AdminUser) => {
    setEditingUser(u);
    setEditForm({ name: u.name, email: u.email, globalRole: u.globalRole, isActive: u.isActive });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    setActionLoading(`edit-${editingUser.id}`);
    try {
      await api.put(`/admin/users/${editingUser.id}`, editForm);
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...editForm } : u));
      setEditingUser(null);
      showFeedback('success', 'Usuario atualizado com sucesso');
      await loadAdmins();
    } catch (err: any) {
      showFeedback('error', err?.response?.data?.message || 'Erro ao atualizar usuario');
    }
    setActionLoading(null);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionLoading(`role-${userId}`);
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
      showFeedback('success', 'Funcao atualizada com sucesso');
    } catch (err: any) {
      showFeedback('error', err?.response?.data?.message || 'Erro ao atualizar funcao');
    }
    setActionLoading(null);
  };

  const handleToggleActive = async (userId: string, message?: string) => {
    setActionLoading(`active-${userId}`);
    try {
      const { data } = await api.put(`/admin/users/${userId}/toggle-active`, message ? { message } : {});
      setUsers(users.map(u => u.id === userId ? { ...u, isActive: data.isActive } : u));
      showFeedback('success', data.isActive ? 'Usuario ativado' : 'Usuario desativado');
      await loadAdmins();
    } catch (err: any) {
      showFeedback('error', err?.response?.data?.message || 'Erro ao alterar status');
    }
    setActionLoading(null);
  };

  const handleOpenBlockModal = (u: AdminUser) => {
    setBlockUser(u);
    setBlockMessage('');
  };

  const handleConfirmBlock = async () => {
    if (!blockUser) return;
    await handleToggleActive(blockUser.id, blockMessage);
    setBlockUser(null);
  };

  const handleResetPassword = async (userId: string) => {
    if (!confirm('Tem certeza? Uma nova senha sera gerada.')) return;
    setActionLoading(`pwd-${userId}`);
    try {
      const { data } = await api.post(`/admin/users/${userId}/reset-password`);
      showFeedback('success', `Nova senha para ${data.email}: ${data.tempPassword}`);
    } catch (err: any) {
      showFeedback('error', err?.response?.data?.message || 'Erro ao resetar senha');
    }
    setActionLoading(null);
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!confirm(`EXCLUIR permanentemente o usuario ${email}? Esta acao nao pode ser desfeita.`)) return;
    setActionLoading(`delete-${userId}`);
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      if (selectedUserId === userId) setSelectedUserId('');
      showFeedback('success', 'Usuario excluido com sucesso');
    } catch (err: any) {
      showFeedback('error', err?.response?.data?.message || 'Erro ao excluir usuario');
    }
    setActionLoading(null);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!confirm('Excluir esta transacao?')) return;
    setActionLoading(`del-t-${id}`);
    try {
      await api.delete(`/transactions/${id}`);
      setData(data.filter((t: any) => t.id !== id));
      showFeedback('success', 'Transacao excluida');
    } catch (err: any) {
      showFeedback('error', err?.response?.data?.message || 'Erro ao excluir');
    }
    setActionLoading(null);
  };

  const exportExcel = async () => {
    setActionLoading('export-excel');
    try {
      const params = new URLSearchParams();
      if (selectedUserId) params.append('userId', selectedUserId);
      if (activeTab === 'transactions' || activeTab === 'budgets' || activeTab === 'report') {
        params.append('month', String(month));
        params.append('year', String(year));
      }
      const { data } = await api.get(`/admin/export-excel?${params.toString()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `financeapp-admin-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showFeedback('success', 'Planilha Excel exportada');
    } catch (err: any) {
      showFeedback('error', err?.response?.data?.message || 'Erro ao exportar planilha');
    }
    setActionLoading(null);
  };

  const handleDeleteAccount = async (id: string) => {
    if (!confirm('Excluir esta conta?')) return;
    setActionLoading(`del-a-${id}`);
    try {
      await api.delete(`/accounts/${id}`);
      setData(data.filter((a: any) => a.id !== id));
      showFeedback('success', 'Conta excluida');
    } catch (err: any) {
      showFeedback('error', err?.response?.data?.message || 'Erro ao excluir');
    }
    setActionLoading(null);
  };

  const handleDeleteCard = async (id: string) => {
    if (!confirm('Excluir este cartao?')) return;
    setActionLoading(`del-c-${id}`);
    try {
      await api.delete(`/cards/${id}`);
      setData(data.filter((c: any) => c.id !== id));
      showFeedback('success', 'Cartao excluido');
    } catch (err: any) {
      showFeedback('error', err?.response?.data?.message || 'Erro ao excluir');
    }
    setActionLoading(null);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Excluir esta categoria?')) return;
    setActionLoading(`del-cat-${id}`);
    try {
      await api.delete(`/categories/${id}`);
      setData(data.filter((c: any) => c.id !== id));
      showFeedback('success', 'Categoria excluida');
    } catch (err: any) {
      showFeedback('error', err?.response?.data?.message || 'Erro ao excluir');
    }
    setActionLoading(null);
  };

  if (user?.globalRole !== 'platform_admin') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Painel Administrativo</h1>
        <div className="card text-center py-12">
          <Shield size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">Acesso restrito a administradores</p>
        </div>
      </div>
    );
  }

  const isSuper = user?.email === SUPER_ADMIN_EMAIL;
  let allowedPanels: string[] = [];
  try {
    if (!isSuper && user?.adminPanels && user.adminPanels !== 'all') {
      allowedPanels = JSON.parse(user.adminPanels);
    }
  } catch {}
  const tabAllowed = isSuper || (activeTab === 'admins' ? false : allowedPanels.length === 0 || allowedPanels.includes(activeTab) || activeTab === 'overview');
  if (!tabAllowed) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Painel Administrativo</h1>
        <div className="card text-center py-12">
          <Shield size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">Voce nao tem acesso a este painel</p>
        </div>
      </div>
    );
  }

  const monthNames = ['Janeiro','Fevereiro','Marco','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

  return (
    <div className="space-y-6">
      {feedback && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${feedback.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
          {feedback.msg}
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4 max-h-[92vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Editar Usuario</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Nome</label>
                <input className="input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div>
                <label className="label">Email</label>
                <input className="input" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
              </div>
              <div>
                <label className="label">Role Global</label>
                <select className="input" value={editForm.globalRole} onChange={(e) => setEditForm({ ...editForm, globalRole: e.target.value })}>
                  <option value="regular">Regular</option>
                  <option value="platform_admin">Admin Plataforma</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="editActive" checked={editForm.isActive} onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })} className="w-4 h-4" />
                <label htmlFor="editActive" className="text-sm text-gray-700 dark:text-gray-300">Ativo</label>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setEditingUser(null)} className="btn-secondary">Cancelar</button>
              <button onClick={handleSaveUser} disabled={actionLoading === `edit-${editingUser.id}`} className="btn-primary">
                {actionLoading === `edit-${editingUser.id}` ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4 max-h-[92vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Incluir Admin</h3>
            {newAdminResult ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-sm">
                  <p className="font-medium text-green-800 dark:text-green-300 mb-2">Admin criado com sucesso!</p>
                  <p className="text-gray-700 dark:text-gray-300">Email: <span className="font-medium">{newAdminResult.email}</span></p>
                  <p className="text-gray-700 dark:text-gray-300">Senha temporaria: <span className="font-mono font-bold text-green-700 dark:text-green-300">{newAdminResult.tempPassword}</span></p>
                </div>
                <button onClick={() => setShowAddAdminModal(false)} className="w-full btn-primary">Fechar</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="label">Nome</label>
                  <input className="input" value={newAdminForm.name} onChange={(e) => setNewAdminForm({ ...newAdminForm, name: e.target.value })} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input className="input" type="email" value={newAdminForm.email} onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })} />
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => setShowAddAdminModal(false)} className="btn-secondary">Cancelar</button>
                  <button onClick={handleCreateAdmin} disabled={actionLoading === 'create-admin'} className="btn-primary">
                    {actionLoading === 'create-admin' ? 'Incluindo...' : 'Incluir'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {panelsAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4 max-h-[92vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Gerenciar Paineis</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{panelsAdmin.name} ({panelsAdmin.email})</p>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: 'overview', label: 'Visao Geral' },
                { id: 'report', label: 'Relatorios' },
                { id: 'users', label: 'Usuarios' },
                { id: 'transactions', label: 'Transacoes' },
                { id: 'accounts', label: 'Contas' },
                { id: 'cards', label: 'Cartoes' },
                { id: 'categories', label: 'Categorias' },
                { id: 'budgets', label: 'Orcamentos' },
                { id: 'goals', label: 'Metas' },
                { id: 'logs', label: 'Auditoria' },
                { id: 'configs', label: 'Configuracoes' },
              ].map((p) => (
                <label key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={panelsSelection.includes(p.id)}
                    onChange={(e) => {
                      setPanelsSelection((prev) =>
                        e.target.checked ? [...prev, p.id] : prev.filter((x) => x !== p.id)
                      );
                    }}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{p.label}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setPanelsAdmin(null)} className="btn-secondary">Cancelar</button>
              <button onClick={handleSavePanels} disabled={actionLoading === `panels-${panelsAdmin.id}`} className="btn-primary">
                {actionLoading === `panels-${panelsAdmin.id}` ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {blockUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4 max-h-[92vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Bloquear acesso</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{blockUser.name} ({blockUser.email})</p>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Motivo (aparecera na tela de login quando a pessoa tentar entrar)
            </label>
            <textarea
              className="input w-full"
              rows={3}
              placeholder="Ex.: Violacao das regras de uso"
              value={blockMessage}
              onChange={(e) => setBlockMessage(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setBlockUser(null)} className="btn-secondary">Cancelar</button>
              <button onClick={handleConfirmBlock} disabled={actionLoading === `active-${blockUser.id}`} className="btn-primary">
                {actionLoading === `active-${blockUser.id}` ? 'Bloqueando...' : 'Bloquear'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {isSuperAdmin ? 'Painel de Controle Total' : 'Painel Administrativo'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isSuperAdmin ? 'Controle completo sobre todos os usuarios e dados do sistema' : 'Gerenciamento do sistema'}
          </p>
        </div>
        <button onClick={() => { loadInitial(); loadTabData(); }} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw size={16} /> Atualizar
        </button>
        <button
          onClick={exportExcel}
          disabled={actionLoading === 'export-excel'}
          className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
        >
          <FileSpreadsheet size={16} /> Exportar Excel
        </button>
      </div>

      {loading ? (
        <div className="card text-center py-12"><p className="text-gray-500 dark:text-gray-400">Carregando...</p></div>
      ) : (
        <>
          {stats && activeTab === 'overview' && (
            <>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Visao Geral do Sistema</h2>
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                  {(['bars', 'pie', 'donut'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setChartMode(mode)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        chartMode === mode
                          ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                      }`}
                    >
                      {mode === 'bars' ? <BarChart3 size={14} /> : <PieIcon size={14} />}
                      {mode === 'bars' ? 'Barras' : mode === 'pie' ? 'Pizza' : 'Rosca'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Usuarios Online Agora */}
              <div className="card space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${onlineData?.onlineNow ? 'bg-success opacity-75' : 'bg-gray-400 opacity-50'}`}></span>
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${onlineData?.onlineNow ? 'bg-success' : 'bg-gray-400'}`}></span>
                    </span>
                    Usuarios Online Agora
                    <Wifi size={14} className="text-gray-400" />
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>Pico 30 min: <strong className="text-gray-700 dark:text-gray-200">{onlineData?.peakLast30Min ?? 0}</strong></span>
                    <span>Atualiza a cada 30s</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-end gap-6">
                  <div>
                    <p className="text-5xl font-bold text-success leading-none">{onlineData?.onlineNow ?? 0}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      online agora · {stats.activeUsers} usuarios ativos no total
                    </p>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={onlineData?.timeline || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="onlineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#9ca3af33" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} interval={4} tickLine={false} axisLine={false} stroke="#9ca3af" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} stroke="#9ca3af" />
                    <Tooltip
                      formatter={(value: any) => [`${value} usuario(s)`, 'Ativos']}
                      labelStyle={{ color: '#374151' }}
                      contentStyle={{ borderRadius: 8, fontSize: 12 }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} fill="url(#onlineGradient)" />
                  </AreaChart>
                </ResponsiveContainer>

                {onlineData?.users?.length > 0 && (
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Conectados agora</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {onlineData.users.map((u: any) => (
                        <div key={u.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <span className="relative shrink-0">
                            <span className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white text-xs font-medium">
                              {u.name?.charAt(0).toUpperCase() || '?'}
                            </span>
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success border-2 border-white dark:border-gray-900 rounded-full"></span>
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{u.name}</span>
                            <span className="block text-[10px] text-gray-500 dark:text-gray-400 truncate">
                              {u.email} · ha {u.secondsAgo < 60 ? `${u.secondsAgo}s` : `${Math.floor(u.secondsAgo / 60)}min`}
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Grafico de Genero */}
                <div className="card space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Genero</h3>
                  {(() => {
                    const genderCounts: Record<string, number> = { Homens: 0, Mulheres: 0, Outro: 0, 'Nao informado': 0 };
                    (stats.genderBreakdown || []).forEach((g: any) => {
                      const v = (g.gender || '').toLowerCase();
                      if (v === 'masculino' || v === 'homme') genderCounts['Homens'] += g.count;
                      else if (v === 'feminino' || v === 'femme') genderCounts['Mulheres'] += g.count;
                      else if (v === 'outro') genderCounts['Outro'] += g.count;
                      else genderCounts['Nao informado'] += g.count;
                    });
                    const genderColors: Record<string, string> = { Homens: '#3b82f6', Mulheres: '#ec4899', Outro: '#a855f7', 'Nao informado': '#9ca3af' };
                    const merged = Object.entries(genderCounts)
                      .map(([label, count]) => ({ label, count, color: genderColors[label] }))
                      .filter(g => g.count > 0);
                    const total = merged.reduce((s, g) => s + g.count, 0) || 1;

                    if (chartMode === 'bars') {
                      return merged.map((g: any) => (
                        <div key={g.label} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 dark:text-gray-400">{g.label}</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{g.count} ({Math.round((g.count / total) * 100)}%)</span>
                          </div>
                          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${(g.count / total) * 100}%`, backgroundColor: g.color }} />
                          </div>
                        </div>
                      ));
                    }

                    return (
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={merged}
                            dataKey="count"
                            nameKey="label"
                            cx="50%"
                            cy="50%"
                            outerRadius={chartMode === 'donut' ? 80 : 90}
                            innerRadius={chartMode === 'donut' ? 45 : 0}
                            label={({ label, percent }: any) => `${label}: ${Math.round(percent * 100)}%`}
                          >
                            {merged.map((g: any) => <Cell key={g.label} fill={g.color} />)}
                          </Pie>
                          <Tooltip formatter={(value: any) => `${value} usuarios`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    );
                  })()}
                </div>

                {/* Grafico de Planos */}
                <div className="card space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Planos Assinados</h3>
                  {(() => {
                    const planMap: Record<string, { label: string; color: string; count: number }> = {
                      free: { label: 'Gratuito', color: '#9ca3af', count: 0 },
                      pro: { label: 'Pro', color: '#a855f7', count: 0 },
                      premium: { label: 'Premium', color: '#eab308', count: 0 },
                    };
                    (stats.plansBreakdown || []).forEach((p: any) => {
                      if (planMap[p.plan]) planMap[p.plan].count = p.count;
                    });
                    const merged = Object.values(planMap).filter(p => p.count > 0);
                    const total = merged.reduce((s, p) => s + p.count, 0) || 1;

                    if (chartMode === 'bars') {
                      return merged.map((p) => (
                        <div key={p.label} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600 dark:text-gray-400">{p.label}</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{p.count} ({Math.round((p.count / total) * 100)}%)</span>
                          </div>
                          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${(p.count / total) * 100}%`, backgroundColor: p.color }} />
                          </div>
                        </div>
                      ));
                    }

                    return (
                      <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                          <Pie
                            data={merged}
                            dataKey="count"
                            nameKey="label"
                            cx="50%"
                            cy="50%"
                            outerRadius={chartMode === 'donut' ? 80 : 90}
                            innerRadius={chartMode === 'donut' ? 45 : 0}
                            label={({ label, percent }: any) => `${label}: ${Math.round(percent * 100)}%`}
                          >
                            {merged.map((p: any) => <Cell key={p.label} fill={p.color} />)}
                          </Pie>
                          <Tooltip formatter={(value: any) => `${value} assinaturas`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    );
                  })()}
                </div>
              </div>

              {/* Grafico de Saldos e Despesas por Mes */}
              <div className="card space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Saldos e Despesas por Mes</h3>
                  <div className="flex flex-wrap gap-2 items-end">
                    <div>
                      <label className="label">Usuario</label>
                      <select
                        className="input"
                        value={balanceFilter.userId}
                        onChange={(e) => setBalanceFilter({ ...balanceFilter, userId: e.target.value })}
                      >
                        <option value="">Todos os usuarios</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>{u.name || u.email}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">De</label>
                      <input
                        type="month"
                        className="input"
                        value={balanceFilter.startDate}
                        onChange={(e) => setBalanceFilter({ ...balanceFilter, startDate: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label">Ate</label>
                      <input
                        type="month"
                        className="input"
                        value={balanceFilter.endDate}
                        onChange={(e) => setBalanceFilter({ ...balanceFilter, endDate: e.target.value })}
                      />
                    </div>
                    {(balanceFilter.userId || balanceFilter.startDate || balanceFilter.endDate) && (
                      <button
                        onClick={() => setBalanceFilter({ userId: '', startDate: '', endDate: '' })}
                        className="text-sm text-primary hover:underline mb-0.5"
                      >
                        Limpar filtros
                      </button>
                    )}
                  </div>
                </div>
                {balanceLoading ? (
                  <p className="text-center py-8 text-gray-500 dark:text-gray-400">Carregando dados...</p>
                ) : monthlyData.length === 0 ? (
                  <p className="text-center py-8 text-gray-500 dark:text-gray-400">Nenhum dado no periodo selecionado</p>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <ComposedChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                      <Legend />
                      <Bar dataKey="income" name="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expenses" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      <Line dataKey="balance" name="Saldo" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>
            </>
          )}

          {activeTab !== 'overview' && activeTab !== 'report' && activeTab !== 'users' && activeTab !== 'logs' && activeTab !== 'admins' && activeTab !== 'configs' && (
            <div className="card">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="label">Filtrar por usuario</label>
                  <select className="input" value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
                    <option value="">Todos os usuarios</option>
              {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name || u.email}</option>
                    ))}
                  </select>
                </div>
                {(activeTab === 'transactions' || activeTab === 'budgets') && (
                  <div className="flex flex-wrap gap-2 items-end">
                    <div>
                      <label className="label">Mes</label>
                      <select className="input" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                        {monthNames.map((n, i) => <option key={i} value={i + 1}>{n}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label">Ano</label>
                      <input type="number" className="input w-24" value={year} onChange={(e) => setYear(Number(e.target.value))} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'report' && (
            <div className="card">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="label">Filtrar por usuario</label>
                  <select className="input" value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
                    <option value="">Todos os usuarios</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name || u.email}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-wrap gap-2 items-end">
                  <div>
                    <label className="label">Mes</label>
                    <select className="input" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                      {monthNames.map((n, i) => <option key={i} value={i + 1}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Ano</label>
                    <input type="number" className="input w-24" value={year} onChange={(e) => setYear(Number(e.target.value))} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            {dataLoading ? (
              <p className="text-center py-8 text-gray-500 dark:text-gray-400">Carregando dados...</p>
            ) : renderContent()}
          </div>
        </>
      )}
    </div>
  );

  function renderFinanceiro() {
    const statusLabels: Record<string, { label: string; cls: string }> = {
      active: { label: 'Liberado', cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
      free: { label: 'Plano Gratuito', cls: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
      overdue: { label: 'Vencido', cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' },
      blocked: { label: 'Bloqueado', cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Financeiro - Assinaturas</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Historico de pagamentos e controle de acesso por falta de pagamento</p>
          </div>
          <button onClick={loadFinanceSubs} disabled={financeLoading} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={16} className={financeLoading ? 'animate-spin' : ''} /> Atualizar
          </button>
        </div>

        {/* Comprovantes enviados pelos usuarios */}
        <div className="card">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-1">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Paperclip size={16} className="text-primary" />
                Comprovantes enviados
                {receipts.filter((r) => r.status === 'pending').length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300">
                    {receipts.filter((r) => r.status === 'pending').length} pendente(s)
                  </span>
                )}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Enviados pelos usuarios na Central de Ajuda (tela de login, aba Comprovante)
              </p>
            </div>
            <button onClick={loadFinanceSubs} disabled={financeLoading} className="btn-secondary text-sm px-3 py-1.5">
              <RefreshCw size={14} className={financeLoading ? 'animate-spin' : ''} /> Atualizar
            </button>
          </div>
          {receipts.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-4">Nenhum comprovante enviado ainda</p>
          ) : (
            <div className="space-y-2 mt-3 max-h-96 overflow-y-auto pr-1">
              {receipts.map((r) => {
                const matched = financeSubs.find((s) => s.user.email.toLowerCase() === (r.senderEmail || ''));
                const isImage = r.mimeType.startsWith('image/');
                const Icon = isImage ? ImageIcon : FileText;
                return (
                  <div key={r.id} className={`flex flex-wrap items-center gap-3 p-3 rounded-lg border text-sm ${r.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900' : 'bg-gray-50 dark:bg-gray-800 border-transparent'}`}>
                    <div className="w-9 h-9 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center shrink-0">
                      <Icon size={17} className="text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {r.senderName || 'Sem nome'}
                        {matched && (
                          <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 align-middle">
                            usuario: {matched.user.email}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {r.senderEmail || '-'} · {safeFormatDateTime(r.createdAt)}
                      </p>
                      {r.note && <p className="text-xs text-gray-500 dark:text-gray-400 italic truncate mt-0.5">"{r.note}"</p>}
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0 ${
                      r.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                    }`}>
                      {r.status === 'pending' ? 'Pendente' : `Analisado${r.reviewedBy ? ` por ${r.reviewedBy}` : ''}`}
                    </span>
                    <div className="flex items-center gap-2 ml-auto shrink-0">
                      <button onClick={() => handlePreviewReceipt(r)} className="btn-secondary text-xs px-2.5 py-1.5 flex items-center gap-1">
                        <Eye size={13} /> Ver
                      </button>
                      {r.status === 'pending' && (
                        <button onClick={() => handleToggleReceiptReviewed(r)} className="btn-primary text-xs px-2.5 py-1.5">
                          Analisado
                        </button>
                      )}
                      <button onClick={() => handleDeleteReceipt(r)} title="Excluir" className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {financeLoading && financeSubs.length === 0 ? (
          <div className="card text-center py-8 text-gray-500 dark:text-gray-400">Carregando...</div>
        ) : financeSubs.length === 0 ? (
          <div className="card text-center py-8 text-gray-500 dark:text-gray-400">Nenhuma assinatura encontrada</div>
        ) : (
          <div className="space-y-3">
            {financeSubs.map((sub) => {
              const st = statusLabels[sub.paymentStatus] || statusLabels.active;
              return (
                <div key={sub.id} className={`card ${sub.blocked ? 'border border-red-300 dark:border-red-900' : ''}`}>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[200px]">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{sub.user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{sub.user.email}</p>
                    </div>
                    <div className="min-w-[120px]">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Plano</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{sub.planName}</p>
                    </div>
                    <div className="min-w-[100px]">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Valor</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatCurrency(sub.value)}</p>
                    </div>
                    <div className="min-w-[130px]">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{sub.blocked ? 'Liberado ate' : 'Prox. cobranca'}</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {safeFormatDate(sub.accessUntil || sub.nextDueDate)}
                        {sub.billingDay ? ` (dia ${sub.billingDay})` : ''}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${st.cls}`}>{st.label}</span>
                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        onClick={() => setPayTarget(sub)}
                        className="btn-secondary text-sm px-3 py-1.5"
                      >
                        Registrar pagamento
                      </button>
                      {sub.blocked ? (
                        <button
                          onClick={() => { setUnblockTarget(sub); setUnblockDate(''); }}
                          className="btn-primary text-sm px-3 py-1.5"
                        >
                          Liberar
                        </button>
                      ) : (
                        <button
                          onClick={() => { setBlockTarget(sub); setBlockReason(''); }}
                          className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                        >
                          Bloquear
                        </button>
                      )}
                      <button
                        onClick={() => setFinanceExpanded(financeExpanded === sub.id ? null : sub.id)}
                        className="btn-secondary text-sm px-3 py-1.5"
                      >
                        {financeExpanded === sub.id ? 'Ocultar historico' : 'Historico'}
                      </button>
                    </div>
                  </div>

                  {financeExpanded === sub.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Historico de pagamentos</h4>
                      {sub.payments.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum pagamento registrado</p>
                      ) : (
                        <div className="space-y-2">
                          {sub.payments.map((p) => (
                            <div key={p.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                              <CheckCircle size={16} className="text-success shrink-0" />
                              <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(p.amount)}</span>
                              <span className="text-gray-500 dark:text-gray-400">venc. {safeFormatDateTime(p.dueDate)}</span>
                              <span className="text-gray-500 dark:text-gray-400">pago {safeFormatDateTime(p.paidAt)}</span>
                              {p.notes && <span className="text-gray-400 truncate">({p.notes})</span>}
                              <span className="ml-auto text-xs text-gray-400">por {p.registeredBy || '-'}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Reminder views */}
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Lembretes de cobranca visualizados</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Ultima vez que cada usuario viu o alerta de vencimento (5 dias antes do pagamento)
          </p>
          {reminderViews.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum lembrete visualizado ainda</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {reminderViews.map((v) => (
                <div key={v.id} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                  <Bell size={15} className="text-yellow-500 shrink-0" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">{v.user?.name}</span>
                  <span className="text-gray-500 dark:text-gray-400 truncate hidden sm:inline">{v.user?.email}</span>
                  <span className="ml-auto text-gray-600 dark:text-gray-300 shrink-0">
                    visto em {safeFormatDateTime(v.viewedAt)}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 shrink-0">
                    faltavam {v.daysUntilDue} {v.daysUntilDue === 1 ? 'dia' : 'dias'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Block Modal */}
        {blockTarget && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6 max-h-[92vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Bloquear usuario</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {blockTarget.user.name} ({blockTarget.user.email}) nao podera entrar no sistema ate ser liberado.
              </p>
              <label className="label">Motivo</label>
              <input className="input" value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="Falta de pagamento" />
              <div className="flex gap-3 mt-6">
                <button onClick={() => setBlockTarget(null)} className="btn-secondary flex-1" disabled={actionLoading === 'block'}>Cancelar</button>
                <button onClick={handleBlockUser} className="flex-1 py-2.5 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50" disabled={actionLoading === 'block'}>
                  {actionLoading === 'block' ? 'Bloqueando...' : 'Bloquear'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Unblock Modal */}
        {unblockTarget && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6 max-h-[92vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Liberar usuario</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Escolha ate quando {unblockTarget.user.name} ficara liberado (data de vencimento).
              </p>
              <label className="label">Liberado ate</label>
              <input type="date" className="input" value={unblockDate} onChange={(e) => setUnblockDate(e.target.value)} />
              <div className="flex gap-3 mt-6">
                <button onClick={() => setUnblockTarget(null)} className="btn-secondary flex-1" disabled={actionLoading === 'unblock'}>Cancelar</button>
                <button onClick={handleUnblockUser} className="btn-primary flex-1 disabled:opacity-50" disabled={actionLoading === 'unblock'}>
                  {actionLoading === 'unblock' ? 'Liberando...' : 'Liberar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {payTarget && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6 max-h-[92vh] overflow-y-auto">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Registrar pagamento</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {payTarget.user.name} sera liberado automaticamente ate a nova data de vencimento.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="label">Valor pago</label>
                  <input type="number" step="0.01" className="input" value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} placeholder={String(payTarget.value)} />
                </div>
                <div>
                  <label className="label">Novo vencimento</label>
                  <input type="date" className="input" value={payForm.dueDate} onChange={(e) => setPayForm({ ...payForm, dueDate: e.target.value })} />
                </div>
                <div>
                  <label className="label">Observacoes</label>
                  <input className="input" value={payForm.notes} onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })} placeholder="Ex: PIX recebido" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setPayTarget(null)} className="btn-secondary flex-1" disabled={actionLoading === 'payment'}>Cancelar</button>
                <button onClick={handleRegisterPayment} className="btn-primary flex-1 disabled:opacity-50" disabled={actionLoading === 'payment' || !payForm.dueDate}>
                  {actionLoading === 'payment' ? 'Registrando...' : 'Registrar'}
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Receipt Preview Modal */}
        {previewReceipt && (
          <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={closePreview}>
            <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between gap-3 p-5 border-b border-gray-200 dark:border-gray-700">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{previewReceipt.originalName}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {previewReceipt.senderName || 'Sem nome'} · {previewReceipt.senderEmail || '-'} · {formatFileSize(previewReceipt.size)} · {safeFormatDateTime(previewReceipt.createdAt)}
                  </p>
                  {previewReceipt.note && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-1">"{previewReceipt.note}"</p>
                  )}
                </div>
                <button onClick={closePreview} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 shrink-0">
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-950 p-4 min-h-0">
                {previewLoading ? (
                  <p className="text-center py-12 text-gray-500 dark:text-gray-400">Carregando comprovante...</p>
                ) : previewUrl ? (
                  previewReceipt.mimeType.startsWith('image/') ? (
                    <img src={previewUrl} alt={previewReceipt.originalName} className="max-w-full max-h-[60vh] mx-auto rounded-lg shadow" />
                  ) : (
                    <iframe src={previewUrl} title={previewReceipt.originalName} className="w-full h-[60vh] rounded-lg bg-white" />
                  )
                ) : (
                  <p className="text-center py-12 text-gray-500 dark:text-gray-400">Nao foi possivel exibir o arquivo. Use o botao baixar abaixo.</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
                <a
                  href={previewUrl || '#'}
                  download={previewReceipt.originalName}
                  className={`btn-secondary text-sm px-3 py-2 flex items-center gap-2 ${!previewUrl ? 'pointer-events-none opacity-50' : ''}`}
                >
                  <Download size={15} /> Baixar
                </a>
                {previewReceipt.status === 'pending' && (
                  <button
                    onClick={() => { handleToggleReceiptReviewed(previewReceipt); setPreviewReceipt({ ...previewReceipt, status: 'reviewed' }); }}
                    className="btn-primary text-sm px-3 py-2"
                  >
                    Marcar como analisado
                  </button>
                )}
                <button
                  onClick={() => { handleDeleteReceipt(previewReceipt); closePreview(); }}
                  className="ml-auto px-3 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 size={15} /> Excluir
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderContent() {
    if (activeTab === 'overview') {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Graficos exibidos acima
        </div>
      );
    }

    if (activeTab === 'financeiro') {
      return renderFinanceiro();
    }

    if (activeTab === 'report') {
      return renderReport();
    }

    if (activeTab === 'logs') {
      return renderLogs();
    }

    if (activeTab === 'admins') {
      return renderAdmins();
    }

    if (activeTab === 'configs') {
      return renderConfigs();
    }

    if (activeTab === 'help') {
      return renderHelp();
    }

    if (activeTab === 'users') {
      return renderUsersList();
    }

    if (!data || data.length === 0) {
      return <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nenhum registro encontrado</p>;
    }

    if (activeTab === 'transactions') {
      return (
        <div className="space-y-3">
          {data.map((t: any) => (
            <div key={t.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-success/10' : 'bg-danger/10'}`}>
                <ArrowLeftRight size={18} className={t.type === 'income' ? 'text-success' : 'text-danger'} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{t.description || t.category?.name || 'Sem categoria'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t.user?.name || t.user?.email} · {t.category?.name || 'Sem cat.'} · {t.account?.name || 'Sem conta'}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`font-semibold ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>{t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{safeFormatDate(t.date)}</p>
              </div>
              {isSuperAdmin && (
                <button
                  onClick={() => handleDeleteTransaction(t.id)}
                  disabled={actionLoading === `del-t-${t.id}`}
                  className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                  title="Excluir"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'accounts') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((a: any) => (
            <div key={a.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: a.color + '20' }}>
                <Wallet size={24} style={{ color: a.color }} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">{a.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{translateLabel(accountTypeLabels, a.type)} · {a.user?.name || a.user?.email}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(a.currentBalance)}</p>
                {isSuperAdmin && (
                  <button
                    onClick={() => handleDeleteAccount(a.id)}
                    disabled={actionLoading === `del-a-${a.id}`}
                    className="text-xs text-red-500 hover:text-red-700 mt-1"
                  >
                    Excluir
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'cards') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((c: any) => (
            <div key={c.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <CreditCard size={20} className="text-primary" />
                  <p className="font-medium text-gray-900 dark:text-gray-100">{c.name}</p>
                </div>
                {isSuperAdmin && (
                  <button
                    onClick={() => handleDeleteCard(c.id)}
                    disabled={actionLoading === `del-c-${c.id}`}
                    className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                    title="Excluir"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{c.brand} · Final {c.lastDigits}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{c.user?.name || c.user?.email}</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-2">Limite: {formatCurrency(c.limit)}</p>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'categories') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((c: any) => (
            <div key={c.id} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: c.color }} />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">{c.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{c.type} · {c.user?.name || c.user?.email}</p>
              </div>
              {isSuperAdmin && (
                <button
                  onClick={() => handleDeleteCategory(c.id)}
                  disabled={actionLoading === `del-cat-${c.id}`}
                  className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                  title="Excluir"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'budgets') {
      return (
        <div className="space-y-3">
          {data.map((b: any) => {
            const pct = b.limitAmount > 0 ? Math.min(((b.spent || 0) / b.limitAmount) * 100, 100) : 0;
            return (
              <div key={b.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{b.category?.name || 'Sem categoria'}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{formatCurrency(b.spent || 0)} / {formatCurrency(b.limitAmount)}</p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{b.user?.name || b.user?.email} · {monthNames[(b.month || 1) - 1]} {b.year}</p>
              </div>
            );
          })}
        </div>
      );
    }

    if (activeTab === 'goals') {
      return (
        <div className="space-y-3">
          {data.map((g: any) => {
            const pct = g.targetAmount > 0 ? Math.min((g.currentAmount / g.targetAmount) * 100, 100) : 0;
            return (
              <div key={g.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{g.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{formatCurrency(g.currentAmount)} / {formatCurrency(g.targetAmount)}</p>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                  <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: g.color || '#6366f1' }} />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{g.user?.name || g.user?.email}</p>
              </div>
            );
          })}
        </div>
      );
    }

    return null;
  }

  function renderHelp() {
    const statusLabels: Record<string, string> = {
      all: 'Todos',
      open: 'Abertos',
      in_progress: 'Em andamento',
      resolved: 'Resolvidos',
      closed: 'Fechados',
    };
    const categoryLabels: Record<string, string> = {
      geral: 'Geral',
      tecnico: 'Tecnico',
      cobranca: 'Cobranca',
      sugestao: 'Sugestao',
      bug: 'Bug',
    };
    const statusColors: Record<string, string> = {
      open: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      in_progress: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      resolved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      closed: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    };

    const filteredTickets = helpTickets.filter(t => {
      if (helpFilterStatus !== 'all' && t.status !== helpFilterStatus) return false;
      if (helpFilterCategory && t.category !== helpFilterCategory) return false;
      return true;
    });

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Central de Suporte</h2>
          <div className="flex flex-wrap gap-2">
            <select className="input w-auto" value={helpFilterStatus} onChange={(e) => setHelpFilterStatus(e.target.value as any)}>
              <option value="all">Todos</option>
              <option value="open">Abertos</option>
              <option value="in_progress">Em andamento</option>
              <option value="resolved">Resolvidos</option>
              <option value="closed">Fechados</option>
            </select>
            <select className="input w-auto" value={helpFilterCategory} onChange={(e) => setHelpFilterCategory(e.target.value)}>
              <option value="">Todas categorias</option>
              <option value="geral">Geral</option>
              <option value="tecnico">Tecnico</option>
              <option value="cobranca">Cobranca</option>
              <option value="sugestao">Sugestao</option>
              <option value="bug">Bug</option>
            </select>
          </div>
        </div>

        {helpTicketsLoading ? (
          <div className="card text-center py-8"><p className="text-gray-500 dark:text-gray-400">Carregando...</p></div>
        ) : filteredTickets.length === 0 ? (
          <div className="card text-center py-12">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">Nenhuma solicitacao encontrada</p>
          </div>
        ) : (
          <div className="card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-3 font-medium text-gray-600 dark:text-gray-400">Usuario</th>
                    <th className="text-left py-3 px-3 font-medium text-gray-600 dark:text-gray-400">Assunto</th>
                    <th className="text-left py-3 px-3 font-medium text-gray-600 dark:text-gray-400">Categoria</th>
                    <th className="text-left py-3 px-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-3 font-medium text-gray-600 dark:text-gray-400">Data</th>
                    <th className="text-right py-3 px-3 font-medium text-gray-600 dark:text-gray-400">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white text-xs font-medium">
                            {ticket.user?.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{ticket.user?.name || 'Desconhecido'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{ticket.user?.email || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{ticket.subject}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{ticket.message}</p>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                          {categoryLabels[ticket.category] || ticket.category}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[ticket.status] || statusColors.open}`}>
                          {statusLabels[ticket.status] || ticket.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-600 dark:text-gray-400">
                        {safeFormatDate(ticket.createdAt)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center justify-end gap-1">
                          {respondingTicket?.id === ticket.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                className="input w-48"
                                placeholder="Sua resposta..."
                                value={responseMessage}
                                onChange={(e) => setResponseMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleHelpResponse(ticket.id)}
                              />
                              <button
                                onClick={() => handleHelpResponse(ticket.id)}
                                disabled={actionLoading === `help-response-${ticket.id}`}
                                className="p-1.5 rounded-lg bg-primary text-white hover:bg-blue-700 disabled:opacity-50"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => { setRespondingTicket(null); setResponseMessage(''); }}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setRespondingTicket(ticket)}
                              disabled={actionLoading === `help-response-${ticket.id}`}
                              className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                              title="Responder"
                            >
                              <Mail size={16} />
                            </button>
                          )}
                          <select
                            className="input w-auto text-xs py-1 px-2"
                            value={ticket.status}
                            onChange={(e) => handleHelpStatusChange(ticket.id, e.target.value)}
                            disabled={actionLoading === `help-status-${ticket.id}`}
                          >
                            <option value="open">Aberto</option>
                            <option value="in_progress">Em andamento</option>
                            <option value="resolved">Resolvido</option>
                            <option value="closed">Fechado</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderReport() {
    if (reportLoading) {
      return <p className="text-center py-8 text-gray-500 dark:text-gray-400">Carregando relatorio...</p>;
    }
    if (!reportData) {
      return <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nenhum dado para o mes selecionado</p>;
    }

    const { totalIncome, totalExpenses, balance, transactionCount, transactions, incomeByCategory, expensesByCategory } = reportData;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-sm text-gray-500 dark:text-gray-400">Receitas</p>
            <p className="text-2xl font-bold text-success">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500 dark:text-gray-400">Despesas</p>
            <p className="text-2xl font-bold text-danger">{formatCurrency(totalExpenses)}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500 dark:text-gray-400">Saldo</p>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-success' : 'text-danger'}`}>{formatCurrency(balance)}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500 dark:text-gray-400">Transacoes</p>
            <p className="text-2xl font-bold">{transactionCount}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-success" /> Receitas por Categoria
            </h3>
            {incomeByCategory.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">Sem receitas neste mes</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={incomeByCategory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                    <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                    <Bar dataKey="total" name="Total" radius={[6, 6, 0, 0]}>
                      {incomeByCategory.map((c: any) => <Cell key={c.category} fill={c.color} />)}
                    </Bar>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="mt-4 space-y-2">
              {incomeByCategory.map((c: any) => (
                <div key={c.category} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-gray-700 dark:text-gray-300">{c.category}</span>
                  </span>
                  <span className="text-success font-medium">{formatCurrency(c.total)} <span className="text-xs text-gray-400">({c.count})</span></span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-danger" /> Despesas por Categoria
            </h3>
            {expensesByCategory.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm">Sem despesas neste mes</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={expensesByCategory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                    <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
                    <Bar dataKey="total" name="Total" radius={[6, 6, 0, 0]}>
                      {expensesByCategory.map((c: any) => <Cell key={c.category} fill={c.color} />)}
                    </Bar>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="mt-4 space-y-2">
              {expensesByCategory.map((c: any) => (
                <div key={c.category} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="text-gray-700 dark:text-gray-300">{c.category}</span>
                  </span>
                  <span className="text-danger font-medium">{formatCurrency(c.total)} <span className="text-xs text-gray-400">({c.count})</span></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Detalhamento das Transacoes</h3>
          {transactions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhuma transacao neste mes</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((t: any) => (
                <div key={t.id} className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-success/10' : 'bg-danger/10'}`}>
                    {t.type === 'income' ? <ArrowLeftRight size={16} className="text-success" /> : <ArrowLeftRight size={16} className="text-danger" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{t.description || 'Sem descricao'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {safeFormatDate(t.date)} - {t.category?.name || 'Sem categoria'} - {t.account?.name || 'Sem conta'}
                      {t.user && <span> - {t.user.name || t.user.email}</span>}
                    </p>
                  </div>
                  <p className={`font-semibold shrink-0 ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderUsersList() {
    const filteredUsers = users.filter((u) => {
      if (filterPlan && (u.workspace?.plan || 'free') !== filterPlan) return false;
      if (filterDateFrom) {
        const from = new Date(filterDateFrom);
        const created = new Date(u.createdAt);
        if (created < from) return false;
      }
      if (filterDateTo) {
        const to = new Date(filterDateTo);
        to.setHours(23, 59, 59);
        const created = new Date(u.createdAt);
        if (created > to) return false;
      }
      return true;
    });

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setUsersView('table')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                usersView === 'table'
                  ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <Users size={14} />
              Tabela
            </button>
            <button
              onClick={() => setUsersView('tree')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                usersView === 'tree'
                  ? 'bg-white dark:bg-gray-700 text-primary shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              <Shield size={14} />
              Vinculos
            </button>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">{filteredUsers.length} usuario(s)</span>
        </div>

        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="label">Plano</label>
            <select className="input" value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)}>
              <option value="">Todos</option>
              <option value="free">Gratuito</option>
              <option value="pro">Pro</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          <div>
            <label className="label">Criado desde</label>
            <input type="date" className="input" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="label">Criado ate</label>
            <input type="date" className="input" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} />
          </div>
          {(filterPlan || filterDateFrom || filterDateTo) && (
            <button onClick={() => { setFilterPlan(''); setFilterDateFrom(''); setFilterDateTo(''); }} className="text-sm text-primary hover:underline mb-0.5">
              Limpar filtros
            </button>
          )}
        </div>

        {usersView === 'tree' ? renderUsersTree(filteredUsers) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-3 font-medium text-gray-600 dark:text-gray-400">Nome</th>
                <th className="text-left py-3 px-3 font-medium text-gray-600 dark:text-gray-400">Email</th>
                <th className="text-left py-3 px-3 font-medium text-gray-600 dark:text-gray-400">Funcao</th>
                <th className="text-left py-3 px-3 font-medium text-gray-600 dark:text-gray-400">Plano</th>
                <th className="text-left py-3 px-3 font-medium text-gray-600 dark:text-gray-400">Status</th>
                <th className="text-left py-3 px-3 font-medium text-gray-600 dark:text-gray-400">Criado em</th>
                <th className="text-left py-3 px-3 font-medium text-gray-600 dark:text-gray-400">Ultimo acesso</th>
                <th className="text-left py-3 px-3 font-medium text-gray-600 dark:text-gray-400">Criado por</th>
                <th className="text-left py-3 px-3 font-medium text-gray-600 dark:text-gray-400">Dados</th>
                <th className="text-right py-3 px-3 font-medium text-gray-600 dark:text-gray-400">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800`}>
                  <td className="py-3 px-3 font-medium text-gray-900 dark:text-gray-100">{u.name || '-'}</td>
                  <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{u.email}</td>
                  <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                    <select
                      className="input text-xs py-1 px-2"
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      disabled={actionLoading === `role-${u.id}`}
                    >
                      <option value="member">Comum</option>
                      <option value="admin">Admin</option>
                      <option value="master">Master</option>
                    </select>
                  </td>
                  <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      u.workspace?.plan === 'pro' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                      : u.workspace?.plan === 'premium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {u.workspace?.plan === 'pro' ? 'Pro' : u.workspace?.plan === 'premium' ? 'Premium' : 'Gratuito'}
                    </span>
                  </td>
                  <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => u.isActive ? handleOpenBlockModal(u) : handleToggleActive(u.id)}
                      disabled={actionLoading === `active-${u.id}`}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}
                    >
                      {u.isActive ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="py-3 px-3 text-gray-500 dark:text-gray-400 text-xs">
                    {safeFormatDate(u.createdAt)}
                  </td>
                  <td className="py-3 px-3 text-gray-500 dark:text-gray-400 text-xs">
                    {u.lastLogin ? (() => { const d = new Date(u.lastLogin); return isValid(d) ? format(d, 'dd/MM/yyyy HH:mm') : <span className="text-gray-400 dark:text-gray-500 italic">Nunca</span>; })() : <span className="text-gray-400 dark:text-gray-500 italic">Nunca</span>}
                  </td>
                  <td className="py-3 px-3 text-xs" onClick={(e) => e.stopPropagation()}>
                    {u.createdBy ? (
                      <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                        <span className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-[10px] font-medium text-purple-700 dark:text-purple-300 shrink-0">
                          {u.createdBy.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                        {u.createdBy.name || u.createdBy.email}
                      </span>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500 italic">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-gray-500 dark:text-gray-400 text-xs">
                    {u._count?.transactions ?? 0} trans. · {u._count?.accounts ?? 0} contas
                  </td>
                  <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleEditUser(u)}
                        className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-500"
                        title="Editar"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleResetPassword(u.id)}
                        disabled={actionLoading === `pwd-${u.id}`}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                        title="Resetar senha"
                      >
                        <Key size={14} />
                      </button>
                      {(user?.globalRole === 'platform_admin' || user?.role === 'master') && u.role !== 'master' && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          disabled={actionLoading === `delete-${u.id}`}
                          className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                          title="Excluir usuario"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>
    );
  }

  function renderUsersTree(usersList: AdminUser[]) {
    const byCreator = new Map<string, AdminUser[]>();
    usersList.forEach((u) => {
      if (!u.createdById) return;
      const arr = byCreator.get(u.createdById) || [];
      arr.push(u);
      byCreator.set(u.createdById, arr);
    });

    const linkedIds = new Set<string>();
    byCreator.forEach((children) => children.forEach((c) => linkedIds.add(c.id)));

    const creators = usersList.filter((u) => u.role === 'master' || byCreator.has(u.id));
    const unlinked = usersList.filter((u) => u.role !== 'master' && !byCreator.has(u.id) && !linkedIds.has(u.id));
    const totalLinked = usersList.filter((u) => u.createdById).length;

    const avatar = (name: string, color: string, size = 'w-9 h-9 text-sm') => (
      <div className={`${size} rounded-full ${color} flex items-center justify-center shrink-0`}>
        <span className="text-white font-semibold">{name.charAt(0).toUpperCase() || '?'}</span>
      </div>
    );

    const planBadge = (plan?: string) => (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
        plan === 'pro' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
        : plan === 'premium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
      }`}>
        {plan === 'pro' ? 'Pro' : plan === 'premium' ? 'Premium' : 'Gratuito'}
      </span>
    );

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3">
            <p className="text-xs text-purple-600 dark:text-purple-300 flex items-center gap-1"><Shield size={12} /> Masters</p>
            <p className="text-xl font-bold text-purple-700 dark:text-purple-300">{creators.length}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
            <p className="text-xs text-blue-600 dark:text-blue-300 flex items-center gap-1"><Users size={12} /> Vinculados</p>
            <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{totalLinked}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1"><UserPlus size={12} /> Sem vinculo</p>
            <p className="text-xl font-bold text-gray-700 dark:text-gray-300">{unlinked.length}</p>
          </div>
        </div>

        {creators.map((master) => {
          const children = byCreator.get(master.id) || [];
          return (
            <div key={master.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-3">
                {avatar(master.name, 'bg-purple-500', 'w-10 h-10 text-base')}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{master.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{master.email} · {master.workspace?.name || 'Sem workspace'} {planBadge(master.workspace?.plan)}</p>
                </div>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 shrink-0">
                  {translateLabel(roleLabels, master.role)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">{children.length} usuario(s)</span>
              </div>

              {children.length > 0 ? (
                <div className="mt-4 ml-4 sm:ml-6 border-l-2 border-purple-200 dark:border-purple-800 pl-4 space-y-2">
                  {children.map((child) => (
                    <div key={child.id} className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-lg p-2.5">
                      {avatar(child.name, child.role === 'admin' ? 'bg-blue-500' : 'bg-gray-400', 'w-8 h-8 text-xs')}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{child.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{child.email}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${
                        child.role === 'admin' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                      }`}>
                        {translateLabel(roleLabels, child.role)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${child.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                        {child.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 hidden sm:inline">
                        {child._count?.transactions ?? 0} trans.
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 ml-4 sm:ml-6 text-xs text-gray-400 dark:text-gray-500 italic">
                  Nenhum usuario vinculado a este master
                </p>
              )}
            </div>
          );
        })}

        {unlinked.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
            <p className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <UserPlus size={16} className="text-gray-400" />
              Usuarios sem vinculo ({unlinked.length})
            </p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {unlinked.map((u) => (
                <div key={u.id} className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-lg p-2.5">
                  {avatar(u.name, 'bg-gray-400', 'w-8 h-8 text-xs')}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{u.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{u.email}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${u.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}`}>
                    {u.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderAdmins() {
    if (!isSuperAdmin) {
      return (
        <div className="text-center py-8">
          <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-500" />
          <p className="text-gray-500 dark:text-gray-400">Apenas o super admin pode gerenciar administradores</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {pendingAdmins.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <AlertTriangle size={20} className="text-yellow-500" />
              Solicitacoes Pendentes ({pendingAdmins.length})
            </h3>
            <div className="space-y-3">
              {pendingAdmins.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{a.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{a.email}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">Solicitado em: {safeFormatDate(a.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveAdmin(a.id)}
                      disabled={actionLoading === `approve-${a.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50"
                    >
                      <CheckCircle size={14} /> Aprovar
                    </button>
                    <button
                      onClick={() => handleRejectAdmin(a.id)}
                      disabled={actionLoading === `reject-${a.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50"
                    >
                      <XCircle size={14} /> Rejeitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <CheckCircle size={20} className="text-green-500" />
              Admins Aprovados ({approvedAdmins.length})
            </h3>
            <button
              onClick={() => { setShowAddAdminModal(true); setNewAdminResult(null); }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90"
            >
              <UserPlus size={16} /> Incluir Admin
            </button>
          </div>
          {approvedAdmins.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">Nenhum admin aprovado ainda</p>
          ) : (
            <div className="space-y-3">
              {approvedAdmins.map((a) => {
                const isSuper = a.email === SUPER_ADMIN_EMAIL;
                return (
                <div key={a.id} className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      {a.name}
                      {isSuper && <span className="text-[10px] font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">Super Admin</span>}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{a.email}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      Aprovado por: {a.approvedBy || 'N/A'}
                    </p>
                    {!isSuper && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        Paineis: {a.adminPanels && a.adminPanels !== 'all'
                          ? (() => { try { return JSON.parse(a.adminPanels).length === 0 ? 'nenhum' : JSON.parse(a.adminPanels).join(', '); } catch { return 'nenhum'; } })()
                          : 'todos'}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!isSuper && (
                      <button
                        onClick={() => a.isActive ? handleOpenBlockModal(a) : handleToggleActive(a.id)}
                        disabled={actionLoading === `active-${a.id}`}
                        title={a.isActive ? 'Clique para inativar' : 'Clique para ativar'}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 ${a.isActive ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500'}`}
                      >
                        {a.isActive ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {a.isActive ? 'Ativo' : 'Inativo'}
                      </button>
                    )}
                    {!isSuper && (
                      <button
                        onClick={() => handleOpenPanels(a)}
                        disabled={actionLoading === `panels-${a.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
                      >
                        <PieIcon size={14} /> Paineis
                      </button>
                    )}
                    {!isSuper && (
                      <button
                        onClick={() => handleEditUser(a)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600"
                      >
                        <Edit2 size={14} /> Editar
                      </button>
                    )}
                    {!isSuper && (
                      <button
                        onClick={() => handleResetPassword(a.id)}
                        disabled={actionLoading === `pwd-${a.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-50"
                      >
                        <Key size={14} /> Alterar Senha
                      </button>
                    )}
                    <button
                      onClick={() => handleRevokeAdmin(a.id)}
                      disabled={isSuper || actionLoading === `revoke-${a.id}`}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 ${isSuper ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'}`}
                    >
                      <XCircle size={14} /> Revogar Acesso
                    </button>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderLogs() {
    return (
      <div className="space-y-4">
        {auditStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total de logs</p>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{auditStats.total}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Ultimas 24h</p>
              <p className="text-xl font-bold text-primary">{auditStats.recentCount}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Por acao</p>
              {auditStats.byAction?.map((a: any) => (
                <p key={a.action} className="text-xs text-gray-700 dark:text-gray-300">{actionLabels[a.action] || a.action}: {a.count}</p>
              ))}
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">Por entidade</p>
              {auditStats.byEntity?.map((e: any) => (
                <p key={e.entity} className="text-xs text-gray-700 dark:text-gray-300">{entityLabels[e.entity] || e.entity}: {e.count}</p>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 flex-wrap">
          <select className="input text-sm" value={logFilterEntity} onChange={(e) => setLogFilterEntity(e.target.value)}>
            <option value="">Todas as entidades</option>
            <option value="transaction">Transacao</option>
            <option value="account">Conta</option>
            <option value="card">Cartao</option>
            <option value="category">Categoria</option>
            <option value="budget">Orcamento</option>
            <option value="goal">Meta</option>
            <option value="auth">Autenticacao</option>
          </select>
          <select className="input text-sm" value={logFilterAction} onChange={(e) => setLogFilterAction(e.target.value)}>
            <option value="">Todas as acoes</option>
            <option value="create">Criacao</option>
            <option value="update">Edicao</option>
            <option value="delete">Exclusao</option>
          </select>
        </div>

        {logs.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nenhum log encontrado</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log: any) => (
              <div key={log.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      log.action === 'create' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                      log.action === 'update' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                      {actionLabels[log.action] || log.action}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                      {entityLabels[log.entity] || log.entity}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {log.user?.name || log.user?.email || 'Sistema'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {safeFormatDate(log.createdAt)}
                  </span>
                </div>
                {log.newValues && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
                    Dados: {typeof log.newValues === 'string' ? log.newValues.substring(0, 120) : JSON.stringify(log.newValues).substring(0, 120)}...
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {logTotalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => loadLogs(logPage - 1)} disabled={logPage <= 1} className="btn-secondary text-sm disabled:opacity-50">
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">Pagina {logPage} de {logTotalPages} ({logTotal} registros)</span>
            <button onClick={() => loadLogs(logPage + 1)} disabled={logPage >= logTotalPages} className="btn-secondary text-sm disabled:opacity-50">
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    );
  }

  function renderConfigs() {
    const configTabs = [
      { id: 'profile', label: 'Perfil', icon: SettingsIcon },
      { id: 'password', label: 'Senha', icon: Lock },
      { id: 'modules', label: 'Modulos', icon: Puzzle },
      { id: 'segment', label: 'Segmento', icon: Shield },
      { id: 'theme', label: 'Tema', icon: Palette },
      { id: 'asaas', label: 'Asaas', icon: Globe },
      { id: 'danger', label: 'Conta', icon: LogOut },
    ];

    return (
      <div className="space-y-4">
        {configMsg && (
          <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm">{configMsg}</div>
        )}
        {configError && (
          <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm">{configError}</div>
        )}

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Abas: dropdown no celular, coluna no desktop */}
          <div className="lg:w-56 shrink-0">
            <select
              value={configTab}
              onChange={(e) => setConfigTab(e.target.value)}
              className="input w-full lg:hidden"
              aria-label="Seções de configuração"
            >
              {configTabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}
                </option>
              ))}
            </select>
            <nav className="hidden lg:flex lg:flex-col gap-1">
              {configTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setConfigTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap text-left ${
                      configTab === tab.id
                        ? 'bg-primary text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex-1">
            {/* Profile */}
            {configTab === 'profile' && (
              <div className="card space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Perfil</h2>
                <div>
                  <label className="label">Nome</label>
                  <input type="text" className="input" value={currentUser?.name || ''} disabled />
                </div>
                <div>
                  <label className="label">E-mail</label>
                  <input type="email" className="input" value={currentUser?.email || ''} disabled />
                </div>
                <div>
                  <label className="label">Funcao</label>
                  <input type="text" className="input" value={translateLabel(roleLabels, currentUser?.role || '')} disabled />
                </div>
              </div>
            )}

            {/* Password */}
            {configTab === 'password' && (
              <div className="card space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Alterar Senha</h2>
                <div>
                  <label className="label">Senha atual</label>
                  <input type="password" className="input" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} />
                </div>
                <div>
                  <label className="label">Nova senha</label>
                  <input type="password" className="input" value={passwordForm.new} onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })} />
                </div>
                <div>
                  <label className="label">Confirmar nova senha</label>
                  <input type="password" className="input" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} />
                </div>
                <button onClick={handleChangePassword} className="btn-primary flex items-center gap-2">
                  <Save size={18} /> Salvar
                </button>
              </div>
            )}

            {/* Modules */}
            {configTab === 'modules' && (
              <div className="card space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Modulos Ativos</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Selecione os modulos que deseja exibir no menu lateral.</p>
                <div className="space-y-2">
                  {MODULE_LIST.map((mod) => {
                    const Icon = mod.icon;
                    const enabled = enabledModules.includes(mod.id);
                    return (
                      <label
                        key={mod.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          enabled
                            ? 'border-primary/30 bg-primary/5'
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-60'
                        }`}
                      >
                        <div className="relative">
                          <input type="checkbox" checked={enabled} onChange={() => toggleModule(mod.id)} className="sr-only" />
                          <div className={`w-10 h-6 rounded-full transition-colors ${enabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform mt-1 ${enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                          </div>
                        </div>
                        <Icon size={20} className={enabled ? 'text-primary' : 'text-gray-400 dark:text-gray-500'} />
                        <span className="font-medium text-gray-900 dark:text-gray-100">{mod.label}</span>
                      </label>
                    );
                  })}
                </div>
                <button
                  onClick={() => { localStorage.setItem('financeapp_modules', JSON.stringify(MODULE_LIST.map(m => m.id))); useStore.setState({ enabledModules: MODULE_LIST.map(m => m.id) }); }}
                  className="btn-secondary text-sm"
                >
                  Ativar todos
                </button>
              </div>
            )}

            {/* Segment */}
            {configTab === 'segment' && (
              <div className="card space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Segmento de Trabalho</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Selecione o segmento que melhor descreve sua area de atuacao.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {segments.map((segment) => (
                    <div
                      key={segment.id}
                      className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        currentUser?.role === segment.name
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <Shield size={24} className="text-primary mb-2" />
                      <p className="font-medium text-gray-900 dark:text-gray-100">{segment.name}</p>
                    </div>
                  ))}
                </div>
                {segments.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">Nenhum segmento disponivel</p>
                )}
              </div>
            )}

            {/* Theme */}
            {configTab === 'theme' && (
              <div className="card space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tema</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Escolha a aparencia do aplicativo.</p>
                <div className="grid grid-cols-3 gap-3">
                  {([
                    { value: 'light' as const, label: 'Claro' },
                    { value: 'dark' as const, label: 'Escuro' },
                    { value: 'system' as const, label: 'Sistema' },
                  ]).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setTheme(opt.value)}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        theme === opt.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <Palette size={24} className="mx-auto mb-2" />
                      <p className="font-medium text-sm">{opt.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Asaas */}
            {configTab === 'asaas' && (
              <div className="card space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                  <Globe size={20} /> Configuracao Asaas
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Configure a integracao com o gateway de pagamentos Asaas para cobrancas e assinaturas.</p>
                <div>
                  <label className="label">Ambiente</label>
                  <select className="input" value={asaasConfig.environment} onChange={(e) => setAsaasConfig({ ...asaasConfig, environment: e.target.value })}>
                    <option value="sandbox">Sandbox (Testes)</option>
                    <option value="production">Producao</option>
                  </select>
                </div>
                <div>
                  <label className="label">API Key</label>
                  <input type="password" className="input" placeholder="Sua API key do Asaas" value={asaasConfig.apiKey} onChange={(e) => setAsaasConfig({ ...asaasConfig, apiKey: e.target.value })} />
                </div>
                <div>
                  <label className="label">Chave PIX</label>
                  <input type="text" className="input" placeholder="Chave PIX para recebimento (ex: email, CPF/CNPJ, telefone)" value={asaasConfig.pixKey} onChange={(e) => setAsaasConfig({ ...asaasConfig, pixKey: e.target.value })} />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Chave usada para gerar os QR Codes de pagamento das assinaturas</p>
                </div>
                <div>
                  <label className="label">URL do Webhook</label>
                  <input type="text" className="input" placeholder="https://seu-app.com/api/webhooks/asaas" value={asaasConfig.webhookUrl} onChange={(e) => setAsaasConfig({ ...asaasConfig, webhookUrl: e.target.value })} />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">URL para receber notificacoes de pagamento do Asaas</p>
                </div>
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-800">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Instrucoes</h3>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>1. Acesse <a href="https://www.asaas.com" target="_blank" className="text-primary hover:underline">asaas.com</a> e crie uma conta</li>
                    <li>2. Vá em Configuracoes &gt; API e copie sua chave de acesso</li>
                    <li>3. Configure a URL de webhook para receber atualizacoes de pagamento</li>
                    <li>4. Em ambiente de teste, use os dados de sandbox do Asaas</li>
                  </ul>
                </div>
                <button onClick={handleSaveAsaasConfig} disabled={asaasLoading} className="btn-primary flex items-center gap-2">
                  <Save size={18} /> {asaasLoading ? 'Salvando...' : 'Salvar Configuracao'}
                </button>
              </div>
            )}

            {/* Account / Danger Zone */}
            {configTab === 'danger' && (
              <div className="card space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Conta</h2>
                <div className="border border-red-200 dark:border-red-900/50 rounded-xl p-4 space-y-3">
                  <h3 className="font-medium text-red-600 dark:text-red-400">Zona de perigo</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Ao sair, voce sera desconectado e precisara fazer login novamente.
                  </p>
                  <button
                    onClick={() => { logout(); window.location.href = '/login'; }}
                    className="btn-danger flex items-center gap-2"
                  >
                    <LogOut size={18} /> Sair da conta
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
