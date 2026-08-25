import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, X, Wallet, Trash2, Pencil, Check, AlertCircle, Link2, Info, RefreshCw } from 'lucide-react';
import { accountTypeLabels, translateLabel } from '../lib/translations';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { isFreePlan, isProPlan, canCreateAccount, getPlanLimit, getLimitMessage } from '../lib/plan';

const PIE_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4', '#a855f7', '#ef4444', '#84cc16'];

export function Accounts() {
  const { user, accounts, fetchAccounts, createAccount, deleteAccount, recalculateBalance } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editAccount, setEditAccount] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'wallet',
    initialBalance: '',
    color: '#2563EB',
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editAccount) {
        const api = (await import('../lib/api')).default;
        await api.put(`/accounts/${editAccount.id}`, { ...form, initialBalance: parseFloat(form.initialBalance) || 0 });
        showFeedback('success', 'Conta atualizada com sucesso');
      } else {
        await createAccount({
          ...form,
          initialBalance: parseFloat(form.initialBalance) || 0,
        });
        showFeedback('success', 'Conta criada com sucesso');
      }
      await fetchAccounts();
      setShowModal(false);
      setEditAccount(null);
      setForm({ name: '', type: 'wallet', initialBalance: '', color: '#2563EB' });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Erro ao salvar conta';
      showFeedback('error', Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (account: any) => {
    setEditAccount(account);
    setForm({ name: account.name, type: account.type, initialBalance: String(account.initialBalance ?? ''), color: account.color || '#2563EB' });
    setShowModal(true);
  };

  const openCreate = () => {
    const plan = user?.workspace?.plan || 'free';
    if (!canCreateAccount(plan, accounts.length)) {
      setFeedback({ type: 'error', message: getLimitMessage(plan, 'accounts') });
      setTimeout(() => setFeedback(null), 4000);
      return;
    }
    setEditAccount(null);
    setForm({ name: '', type: 'wallet', initialBalance: '', color: '#2563EB' });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conta?')) return;
    try {
      await deleteAccount(id);
      showFeedback('success', 'Conta excluida com sucesso');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao excluir conta';
      showFeedback('error', Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);

  return (
    <div className="space-y-6">
      {feedback && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
          feedback.type === 'success' 
            ? 'bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
        }`}>
          {feedback.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          {feedback.message}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Contas</h1>
          <p className="text-gray-600 dark:text-gray-400">Saldo total: {formatCurrency(totalBalance)}</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          <span className="hidden sm:inline">Nova Conta</span>
        </button>
      </div>
      {!isProPlan(user?.workspace?.plan) && (
        <div className="mt-3 flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
          <Info size={16} className="shrink-0" />
          <span>{isFreePlan(user?.workspace?.plan) ? 'Plano gratuito' : 'Plano Premium'}: {accounts.length}/{getPlanLimit(user?.workspace?.plan, 'accounts')} contas</span>
          {accounts.length >= getPlanLimit(user?.workspace?.plan, 'accounts') && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-amber-200 dark:bg-amber-800 rounded">Limite atingido</span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => {
          const isOwner = account.userId === user?.id;
          const isShared = (account.sharedWith?.length ?? 0) > 0;
          const isLinked = (account.linkedWith?.length ?? 0) > 0;
          const pieData = (account.sharedUsers || [])
            .filter(u => u.available !== 0)
            .map((u, i) => ({ name: u.name, value: u.available, color: PIE_COLORS[i % PIE_COLORS.length] }));
          return (
          <div key={account.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: account.color + '20' }}
                >
                  <Wallet size={28} style={{ color: account.color }} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{account.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2 flex-wrap">
                    {translateLabel(accountTypeLabels, account.type)}
                    {isLinked && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                        <Link2 size={12} /> Conjunta com {account.linkedWith?.map(l => l.name).join(', ')}
                      </span>
                    )}
                    {isShared && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                        <Link2 size={12} /> Vinculada
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {isOwner && (
                  <>
                    <button
                      onClick={() => recalculateBalance(account.id)}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Recalcular saldo"
                    >
                      <RefreshCw size={16} />
                    </button>
                    <button
                      onClick={() => openEdit(account)}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Editar"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="p-2 text-gray-400 dark:text-gray-500 hover:text-danger dark:hover:text-danger transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t dark:border-gray-700">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {isLinked ? formatCurrency(account.groupBalance ?? account.currentBalance) : formatCurrency(account.currentBalance)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isLinked ? 'Saldo conjunto (contas vinculadas)' : isShared ? 'Saldo total (todos os usuarios)' : 'Saldo atual'}
              </p>
            </div>

            {(isLinked || isShared) && account.sharedUsers && (
              <div className="mt-4 pt-4 border-t dark:border-gray-700">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Disponivel por usuario</h4>
                {pieData.length > 0 ? (
                  <div className="flex items-center gap-4">
                    <div className="w-28 h-28 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={28} outerRadius={52} paddingAngle={2}>
                            {pieData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-2">
                      {account.sharedUsers.map((u, i) => (
                        <div key={u.id} className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                            {u.name}{u.isOwner && <span className="text-xs text-gray-400">(dona)</span>}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(u.available)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sem valores disponiveis por usuario</p>
                )}
                <div className="mt-4 space-y-2">
                  {account.sharedUsers.map(u => (
                    <div key={u.id} className="rounded-lg bg-gray-50 dark:bg-gray-800/60 p-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{u.name}</span>
                        <span className="text-gray-500 dark:text-gray-400 text-xs">{u.isOwner ? 'Proprietario' : 'Usuario vinculado'}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-xs">
                        <span className="text-green-600 dark:text-green-400">Receitas: {formatCurrency(u.income)}</span>
                        <span className="text-red-500 dark:text-red-400">Despesas: {formatCurrency(u.expenses)}</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">Disponivel: {formatCurrency(u.available)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          );
        })}
      </div>

      {accounts.length === 0 && (
        <div className="card text-center py-12">
          <Wallet size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">Nenhuma conta cadastrada</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h2 className="text-lg font-semibold dark:text-gray-100">{editAccount ? 'Editar Conta' : 'Nova Conta'}</h2>
              <button onClick={() => { setShowModal(false); setEditAccount(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Nome</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ex: Carteira, Nubank"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Tipo</label>
                <select
                  className="input"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="wallet">Carteira</option>
                  <option value="checking">Conta Corrente</option>
                  <option value="savings">Poupanca</option>
                  <option value="investment">Investimento</option>
                </select>
              </div>

              <div>
                <label className="label">Saldo Inicial</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  placeholder="R$ 0,00"
                  value={form.initialBalance}
                  onChange={(e) => setForm({ ...form, initialBalance: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Cor</label>
                <input
                  type="color"
                  className="w-full h-12 rounded-lg cursor-pointer"
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
