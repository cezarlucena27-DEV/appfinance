import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { roleLabels, translateLabel, accountTypeLabels } from '../lib/translations';
import {
  Users,
  UserCheck,
  UserX,
  ArrowUpRight,
  Wallet,
  Shield,
  Crown,
  UserPlus,
  X,
  Copy,
  Check,
  TrendingDown,
  TrendingUp,
  Edit2,
  Key,
  Trash2,
  Link2,
  Unlink,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ReorderablePanels } from '../components/ReorderablePanels';
import api from '../lib/api';

const PLANS = [
  { id: 'free', name: 'Gratuito', price: 0, features: ['Ate 50 transacoes/mes', 'Ate 1 conta', '1 cartao', 'Categorias padrao do sistema', 'Relatorios basicos', '1 usuario'] },
  { id: 'premium', name: 'Premium', price: 14.90, features: ['Transacoes ilimitadas (parceladas e recorrentes)', 'Ate 3 contas', 'Cartoes com fatura automatica', 'Orcamentos e metas ilimitados', 'Relatorios completos (fluxo de caixa, categorias, patrimonio)', 'Exportacao PDF/Excel', 'Backup manual', 'Ate 3 usuarios'] },
  { id: 'pro', name: 'Pro', price: 29.90, features: ['Tudo do Premium', 'Contas, cartoes e usuarios ilimitados', 'Backup automatico diario', 'Gestao familiar compartilhada'] },
];

export function MasterDashboard() {
  const {
    user,
    users,
    workspaceStats,
    accounts,
    fetchUsers,
    fetchWorkspaceStats,
    fetchAccounts,
    toggleUserActive,
    updateUserRole,
    inviteUser,
    updateWorkspacePlan,
    editUser,
    resetUserPassword,
    deleteUser,
  } = useStore();

  if (user?.role !== 'master' && user?.globalRole !== 'platform_admin') {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Painel Mestre</h1>
        <div className="card text-center py-12">
          <Crown size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">Acesso restrito ao proprietario do workspace</p>
        </div>
      </div>
    );
  }

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '' });
  const [inviteResult, setInviteResult] = useState<{ tempPassword: string } | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [planLoading, setPlanLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [editLoading, setEditLoading] = useState(false);

  const [resetResult, setResetResult] = useState<{ email: string; tempPassword: string } | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [filterVinculo, setFilterVinculo] = useState<'all' | 'mine'>('all');
  const [linkLoading, setLinkLoading] = useState<string | null>(null);

  const [workspaceAccounts, setWorkspaceAccounts] = useState<any[]>([]);
  const [activityAccount, setActivityAccount] = useState<any>(null);
  const [activityData, setActivityData] = useState<any>(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchWorkspaceStats();
    fetchAccounts();
    fetchWorkspaceAccounts();
  }, []);

  const fetchWorkspaceAccounts = async () => {
    try {
      const { data } = await api.get('/accounts/workspace');
      setWorkspaceAccounts(data);
    } catch {}
  };

  const openAccountActivity = async (accountId: string) => {
    setActivityLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/accounts/workspace/${accountId}/transactions`);
      setActivityAccount(data.account);
      setActivityData(data.transactions);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar movimentacoes');
    }
    setActivityLoading(false);
  };

  const exportWorkspaceExcel = async () => {
    setExportLoading(true);
    setError('');
    try {
      const { data } = await api.get('/accounts/workspace/export/excel', { responseType: 'blob' });
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `workspace-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao exportar dados do workspace');
    }
    setExportLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleInvite = async () => {
    setError('');
    setInviteResult(null);
    if (!inviteForm.name.trim() || !inviteForm.email.trim()) {
      setError('Preencha nome e e-mail');
      return;
    }
    setInviteLoading(true);
    try {
      const result = await inviteUser(inviteForm.email.trim(), inviteForm.name.trim());
      setInviteResult(result);
      setInviteForm({ name: '', email: '' });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erro ao adicionar usuario');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleChangePlan = async (planId: string) => {
    setPlanLoading(true);
    try {
      await updateWorkspacePlan(planId);
      setShowPlanModal(false);
      setMsg('Plano alterado com sucesso');
    } catch {
      setError('Erro ao alterar plano');
    } finally {
      setPlanLoading(false);
    }
  };

  const handleLink = async (accountId: string, memberId: string, linked: boolean) => {
    setLinkLoading(`${accountId}:${memberId}`);
    setError('');
    try {
      if (linked) {
        await api.delete(`/accounts/${accountId}/share/${memberId}`);
      } else {
        await api.post(`/accounts/${accountId}/share`, { userId: memberId });
      }
      await fetchAccounts();
      setMsg(linked ? 'Conta desvinculada do usuario' : 'Conta vinculada ao usuario');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao alterar vinculacao');
    }
    setLinkLoading(null);
  };

  const copyPassword = () => {
    if (inviteResult) {
      navigator.clipboard.writeText(inviteResult.tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEditUser = (u: any) => {
    setEditingUser(u);
    setEditForm({ name: u.name, email: u.email });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setEditLoading(true);
    try {
      await editUser(editingUser.id, editForm);
      setEditingUser(null);
      setMsg('Usuario atualizado com sucesso');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar usuario');
    }
    setEditLoading(false);
  };

  const handleResetPassword = async (userId: string) => {
    if (!confirm('Tem certeza? Uma nova senha sera gerada.')) return;
    setResetLoading(true);
    try {
      const tempPassword = await resetUserPassword(userId);
      const u = users.find(u => u.id === userId);
      setResetResult({ email: u?.email || '', tempPassword });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao resetar senha');
    }
    setResetLoading(false);
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`EXCLUIR permanentemente o usuario ${userName}? Esta acao nao pode ser desfeita.`)) return;
    setDeleteLoading(userId);
    try {
      await deleteUser(userId);
      setMsg('Usuario excluido com sucesso');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao excluir usuario');
    }
    setDeleteLoading(null);
  };

  const copyResetPassword = () => {
    if (resetResult) {
      navigator.clipboard.writeText(resetResult.tempPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      master: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
      admin: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      member: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[role] || styles.member}`}>
        {translateLabel(roleLabels, role)}
      </span>
    );
  };

  const currentPlan = PLANS.find(p => p.id === workspaceStats?.workspace?.plan) || PLANS[0];
  const myAccounts = accounts.filter(a => a.userId === user?.id);
  const members = users.filter(u => u.role !== 'master');

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Painel Mestre</h1>
          <Crown size={24} className="text-yellow-500" />
        </div>
        <div className="flex flex-wrap items-center gap-3">
        <button onClick={() => setShowInviteModal(true)} className="btn-primary flex items-center gap-2">
          <UserPlus size={18} />
          Adicionar Usuario
        </button>
        <button
          onClick={exportWorkspaceExcel}
          disabled={exportLoading}
          className="btn-secondary flex items-center gap-2 disabled:opacity-50"
        >
          <FileSpreadsheet size={18} />
          Exportar Excel
        </button>
      </div>
      </div>

      {msg && <div className="p-3 bg-green-50 dark:bg-green-900/30 text-success rounded-lg text-sm">{msg}</div>}
      {error && <div className="p-3 bg-red-50 dark:bg-red-900/30 text-danger rounded-lg text-sm">{error}</div>}

      <ReorderablePanels storageKey="master">
        {[
          /* Stats Cards */
          <div key="stats" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Usuarios</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{workspaceStats?.totalUsers || 0}</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Users size={24} className="text-primary" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ativos</p>
              <p className="text-2xl font-bold text-success">{workspaceStats?.activeUsers || 0}</p>
            </div>
            <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
              <UserCheck size={24} className="text-success" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Transacoes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{workspaceStats?.totalTransactions || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <ArrowUpRight size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Contas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{workspaceStats?.totalAccounts || 0}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
              <Wallet size={24} className="text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>
          ,

          /* Workspace Info */
          <div key="workspace" className="card">
            {workspaceStats?.workspace ? (
              <>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Informacoes do Workspace</h2>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Nome</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{workspaceStats.workspace.name}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Plano</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{currentPlan.name}</p>
                      <button
                        onClick={() => setShowPlanModal(true)}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        Alterar
                      </button>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Valor Mensal</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(currentPlan.price)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Criado em</p>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {format(new Date(workspaceStats.workspace.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">Carregando informacoes do workspace...</div>
            )}
          </div>,

          /* Users List */
          <div key="users" className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Usuarios ({users.length})</h2>
        </div>

        {users.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Users size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p>Nenhum usuario encontrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFilterVinculo('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filterVinculo === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Todos os usuarios ({users.length})
              </button>
              <button
                onClick={() => setFilterVinculo('mine')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filterVinculo === 'mine'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Meus usuarios ({users.filter(u => u.createdById === user?.id).length})
              </button>
            </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Nome</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">E-mail</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Funcao</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Criado por</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Receitas</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Despesas</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Transacoes</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Cadastro</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {(filterVinculo === 'mine' ? users.filter(u => u.createdById === user?.id) : users).map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="py-3 px-4">
            <div className="flex flex-wrap items-center gap-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {u.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{u.email}</td>
                    <td className="py-3 px-4">{getRoleBadge(u.role)}</td>
                    <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                      {u.createdBy ? (
                        <span className="flex items-center gap-1">
                          <span className="w-5 h-5 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-[10px] font-medium text-purple-700 dark:text-purple-300">
                            {u.createdBy.name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                          {u.createdBy.name || u.createdBy.email}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                      }`}>
                        {u.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-medium text-success flex items-center justify-end gap-1">
                        <TrendingUp size={14} />
                        {formatCurrency(u.totalIncome)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-sm font-medium text-danger flex items-center justify-end gap-1">
                        <TrendingDown size={14} />
                        {formatCurrency(u.totalSpending)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{u._count.transactions}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {format(new Date(u.createdAt), 'dd/MM/yyyy')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        {u.role !== 'master' && (
                          <>
                            <button
                              onClick={() => handleEditUser(u)}
                              className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-500 transition-colors"
                              title="Editar usuario"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleResetPassword(u.id)}
                              disabled={resetLoading}
                              className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-yellow-500 transition-colors disabled:opacity-50"
                              title="Redefinir senha"
                            >
                              <Key size={16} />
                            </button>
                            {u.role === 'admin' && (
                              <button
                                onClick={() => updateUserRole(u.id, 'member')}
                                className="p-2 rounded-lg transition-colors text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                title="Rebaixar para comum"
                              >
                                <Shield size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (u.isActive) {
                                  const msg = prompt(`Motivo do bloqueio de ${u.name} (aparecera no login):`);
                                  if (msg === null) return;
                                  toggleUserActive(u.id, msg);
                                } else {
                                  toggleUserActive(u.id);
                                }
                              }}
                              className={`p-2 rounded-lg transition-colors ${
                                u.isActive
                                  ? 'text-danger hover:bg-red-50 dark:hover:bg-red-900/30'
                                  : 'text-success hover:bg-green-50 dark:hover:bg-green-900/30'
                              }`}
                              title={u.isActive ? 'Desativar' : 'Ativar'}
                            >
                              {u.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              disabled={deleteLoading === u.id}
                              className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-danger transition-colors disabled:opacity-50"
                              title="Excluir usuario"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                        {u.role === 'master' && (
                          <span className="text-xs text-gray-400 dark:text-gray-500 italic">Proprietario</span>
                        )}
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
        ,
        /* Vinculacao de Contas */
        <div key="vinculacao" className="card">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Vinculacao de Contas</h2>
            <Link2 size={20} className="text-indigo-500" />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Vincule uma conta sua a um usuario para gestao conjunta: ambos veem as contas um do outro, os valores sao somados e o grafico mostra o disponivel de cada um. Ao desvincular, cada um volta a ver apenas os proprios valores.
          </p>

          {myAccounts.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Wallet size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>Nenhuma conta para vincular</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myAccounts.map((account) => (
                <div key={account.id} className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: account.color + '20' }}
                    >
                      <Wallet size={20} style={{ color: account.color }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{account.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {translateLabel(accountTypeLabels, account.type)} · {formatCurrency(account.currentBalance)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      account.sharedWith?.length
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {account.sharedWith?.length ? `${account.sharedWith.length} vinculado(s)` : 'Sem vinculacao'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {members.length === 0 && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 italic">Nenhum usuario cadastrado para vincular</p>
                    )}
                    {members.map((m) => {
                      const linked = account.sharedWith?.some((s) => s.id === m.id) ?? false;
                      return (
                        <div key={m.id} className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-7 h-7 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-[11px] font-medium text-purple-700 dark:text-purple-300 shrink-0">
                              {m.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{m.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{m.email}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleLink(account.id, m.id, linked)}
                            disabled={linkLoading === `${account.id}:${m.id}`}
                            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                              linked
                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {linkLoading === `${account.id}:${m.id}` ? (
                              '...'
                            ) : linked ? (
                              <>
                                <Unlink size={14} /> Desvincular
                              </>
                            ) : (
                              <>
                                <Link2 size={14} /> Vincular
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {workspaceAccounts.filter((a) => !a.linkedToMaster).length > 0 && (
            <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Contas dos usuarios sem vinculacao</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Acesse tudo que o usuario movimentou e fez dentro da conta.
              </p>
              <div className="space-y-2">
                {workspaceAccounts
                  .filter((a) => !a.linkedToMaster)
                  .map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 dark:bg-gray-800 p-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: account.color + '20' }}
                        >
                          <Wallet size={18} style={{ color: account.color }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{account.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {account.owner.name} · {formatCurrency(account.currentBalance)} · {account.transactionCount}{' '}
                            transacoes
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => openAccountActivity(account.id)}
                        disabled={activityLoading}
                        className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        <Eye size={14} /> Ver movimentacoes
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      ]}
      </ReorderablePanels>

      {/* Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl p-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Alterar Plano</h2>
              <button onClick={() => setShowPlanModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLANS.map((plan) => {
                const isCurrent = plan.id === workspaceStats?.workspace?.plan;
                return (
                  <div
                    key={plan.id}
                    className={`relative p-6 rounded-xl border-2 transition-all ${
                      isCurrent
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    {isCurrent && (
                      <span className="absolute top-3 right-3 text-xs bg-primary text-white px-2 py-1 rounded-full font-medium">
                        Atual
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{plan.name}</h3>
                    <p className="text-2xl font-bold text-primary mt-2">
                      {plan.price === 0 ? 'Gratis' : `R$ ${plan.price.toFixed(2)}`}
                      {plan.price > 0 && <span className="text-sm font-normal text-gray-500 dark:text-gray-400">/mes</span>}
                    </p>
                    <ul className="mt-4 space-y-2">
                      {plan.features.map((f, i) => (
                        <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <Check size={14} className="text-success shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    {!isCurrent && (
                      <button
                        onClick={() => handleChangePlan(plan.id)}
                        disabled={planLoading}
                        className="w-full mt-4 btn-primary disabled:opacity-50"
                      >
                        {planLoading ? 'Alterando...' : 'Selecionar'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Adicionar Usuario</h2>
              <button onClick={() => { setShowInviteModal(false); setInviteResult(null); setInviteForm({ name: '', email: '' }); setError(''); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={24} />
              </button>
            </div>

            {inviteResult ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-xl">
                  <p className="text-sm font-medium text-success mb-2">Usuario adicionado com sucesso!</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Compartilhe a senha temporaria com o usuario. Ele precisara trocar no primeiro login.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-3 bg-white dark:bg-gray-800 rounded-lg font-mono text-sm text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700">
                      {inviteResult.tempPassword}
                    </div>
                    <button onClick={copyPassword} className="p-3 rounded-lg bg-primary text-white hover:bg-blue-700 transition-colors">
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
                <button onClick={() => { setInviteResult(null); }} className="btn-secondary w-full">
                  Adicionar outro
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="label">Nome</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Nome do usuario"
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">E-mail</label>
                  <input
                    type="email"
                    className="input"
                    placeholder="email@exemplo.com"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
                  />
                </div>
                <button onClick={handleInvite} disabled={inviteLoading} className="btn-primary w-full disabled:opacity-50">
                  {inviteLoading ? 'Adicionando...' : 'Adicionar'}
                </button>
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/30 text-danger rounded-lg text-sm">{error}</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Editar Usuario</h2>
              <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Nome</label>
                <input
                  type="text"
                  className="input"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="label">E-mail</label>
                <input
                  type="email"
                  className="input"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setEditingUser(null)} className="btn-secondary">Cancelar</button>
              <button onClick={handleSaveEdit} disabled={editLoading} className="btn-primary disabled:opacity-50">
                {editLoading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Result Modal */}
      {resetResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Senha Redefinida</h2>
              <button onClick={() => setResetResult(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X size={24} />
              </button>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
              <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-2">
                Nova senha gerada para {resetResult.email}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Compartilhe esta senha com o usuario. Ele precisara trocar no proximo login.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-white dark:bg-gray-800 rounded-lg font-mono text-sm text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700">
                  {resetResult.tempPassword}
                </div>
                <button onClick={copyResetPassword} className="p-3 rounded-lg bg-primary text-white hover:bg-blue-700 transition-colors">
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>
            <button onClick={() => setResetResult(null)} className="btn-secondary w-full mt-4">
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Account Activity Modal */}
      {activityAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl p-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Movimentacoes da conta</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {activityAccount.name} · {activityAccount.owner.name} · {formatCurrency(activityAccount.currentBalance)}
                </p>
              </div>
              <button
                onClick={() => { setActivityAccount(null); setActivityData(null); }}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>
            <div className="overflow-y-auto">
              {activityData === null ? (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">Carregando...</div>
              ) : activityData.length === 0 ? (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">Nenhuma movimentacao nesta conta</div>
              ) : (
                <div className="space-y-2">
                  {activityData.map((t: any) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 dark:bg-gray-800 p-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            t.type === 'income' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                          }`}
                        >
                          {t.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {t.description || t.category?.name || 'Sem descricao'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(t.date), 'dd/MM/yyyy', { locale: ptBR })} · {t.category?.name || 'Sem categoria'} ·{' '}
                            {t.user?.name || '—'}
                          </p>
                        </div>
                      </div>
                      <span className={`text-sm font-semibold shrink-0 ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                        {t.type === 'income' ? '+' : '-'}
                        {formatCurrency(t.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
