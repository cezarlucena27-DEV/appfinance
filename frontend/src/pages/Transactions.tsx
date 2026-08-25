import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, X, ArrowUpRight, ArrowDownRight, Trash2, Pencil, Check, AlertCircle, Filter, Tag, Calendar, AlertTriangle, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '../lib/api';
import { format, isBefore, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export function Transactions() {
  const { 
    user,
    transactions, 
    accounts, 
    categories,
    alerts,
    fetchTransactions, 
    fetchAccounts, 
    fetchCategories,
    fetchAlerts,
    createTransaction,
    deleteTransaction,
    createAccount,
    createCategory
  } = useStore();
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    type: 'expense',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    accountId: '',
    categoryId: '',
    dueDate: '',
    isPaid: false,
  });
  const [showNewAccount, setShowNewAccount] = useState(false);
  const [newAccountForm, setNewAccountForm] = useState({ name: '', initialBalance: '', color: '#2563EB' });
  const [accountSaving, setAccountSaving] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryForm, setNewCategoryForm] = useState({ name: '', color: '#64748B' });
  const [categorySaving, setCategorySaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'overdue' | 'paid'>('all');
  const [dismissedAlert, setDismissedAlert] = useState(false);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  useEffect(() => {
    fetchTransactions();
    fetchAccounts();
    fetchCategories();
    fetchAlerts();
  }, []);

  // Reset dismissedAlert when alerts change and there are still alerts
  useEffect(() => {
    if (alerts && (alerts.overdueCount > 0 || alerts.upcomingCount > 0)) {
      setDismissedAlert(false);
    }
  }, [alerts]);

  const getTransactionStatus = (txn: any) => {
    if (txn.isPaid) return 'paid';
    if (!txn.dueDate) return 'none';
    const due = parseISO(txn.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return isBefore(due, today) ? 'overdue' : 'upcoming';
  };

  const statusLabels = {
    paid: { label: 'Pago', icon: CheckCircle, color: 'text-success bg-success/10', dotColor: 'bg-success' },
    overdue: { label: 'Vencido', icon: XCircle, color: 'text-danger bg-danger/10', dotColor: 'bg-danger' },
    upcoming: { label: 'A vencer', icon: Clock, color: 'text-warning bg-warning/10', dotColor: 'bg-yellow-500' },
    none: { label: '', icon: null, color: '', dotColor: '' },
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    const amount = parseFloat(form.amount) || 0;
    const selectedAccount = accounts.find((a: any) => a.id === form.accountId);
    
    // Show warning if insufficient balance but allow creation
    const showBalanceWarning = form.type === 'expense' && selectedAccount && amount > selectedAccount.currentBalance + 0.009;
    
    // Prepare payload - exclude dueDate/isPaid for income
    const payload = {
      ...form,
      amount: parseFloat(form.amount),
      ...(form.type === 'expense' ? { dueDate: form.dueDate || null, isPaid: form.isPaid } : { dueDate: null, isPaid: true }),
    };
    
    setLoading(true);
    try {
      if (editingId) {
        await api.put('/transactions/' + editingId, payload);
        showFeedback('success', 'Transacao atualizada com sucesso');
      } else {
        await createTransaction(payload);
        showFeedback('success', 'Transacao criada com sucesso');
      }
      
      // Show balance warning after successful creation if needed
      if (showBalanceWarning) {
        setTimeout(() => {
          showFeedback('error', `Atenção: Saldo insuficiente em "${selectedAccount.name}". Disponível: ${formatCurrency(selectedAccount.currentBalance)}. A despesa foi registrada mas não debitada (marque como "Pago" para debitar).`);
        }, 100);
      }
      
      await fetchTransactions();
      fetchAlerts();
      setShowModal(false);
      setEditingId(null);
      setForm({
        type: 'expense',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        accountId: '',
        categoryId: '',
        dueDate: '',
        isPaid: false,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Erro ao salvar transacao';
      setModalError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transacao?')) return;
    try {
      await deleteTransaction(id);
      fetchAlerts();
      showFeedback('success', 'Transacao excluida com sucesso');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao excluir transacao';
      showFeedback('error', Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const handleCreateAccount = async () => {
    if (!newAccountForm.name.trim()) {
      showFeedback('error', 'Informe o nome da conta');
      return;
    }
    setAccountSaving(true);
    try {
      const created = await createAccount({
        name: newAccountForm.name.trim(),
        type: 'checking',
        initialBalance: parseFloat(newAccountForm.initialBalance) || 0,
        color: newAccountForm.color,
      });
      setForm({ ...form, accountId: created.id });
      setShowNewAccount(false);
      setNewAccountForm({ name: '', initialBalance: '', color: '#2563EB' });
      showFeedback('success', 'Conta criada com sucesso');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Erro ao criar conta';
      showFeedback('error', Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setAccountSaving(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryForm.name.trim()) {
      showFeedback('error', 'Informe o nome da categoria');
      return;
    }
    setCategorySaving(true);
    try {
      const created = await createCategory({
        name: newCategoryForm.name.trim(),
        type: form.type,
        icon: 'tag',
        color: newCategoryForm.color,
      });
      setForm({ ...form, categoryId: created.id });
      setShowNewCategory(false);
      setNewCategoryForm({ name: '', color: '#64748B' });
      showFeedback('success', 'Categoria criada com sucesso');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao criar categoria';
      showFeedback('error', Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setCategorySaving(false);
    }
  };

  const openEdit = (txn: any) => {
    setEditingId(txn.id);
    setModalError(null);
    setForm({
      type: txn.type,
      amount: String(txn.amount),
      description: txn.description || '',
      date: txn.date.split('T')[0],
      accountId: txn.accountId,
      categoryId: txn.categoryId || '',
      dueDate: txn.dueDate ? txn.dueDate.split('T')[0] : '',
      isPaid: txn.isPaid || false,
    });
    setShowModal(true);
  };

  const openCreate = () => {
    setEditingId(null);
    setModalError(null);
    setForm({
      type: 'expense',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      accountId: '',
      categoryId: '',
      dueDate: '',
      isPaid: false,
    });
    setShowNewAccount(false);
    setShowNewCategory(false);
    setNewAccountForm({ name: '', initialBalance: '', color: '#2563EB' });
    setNewCategoryForm({ name: '', color: '#64748B' });
    setShowModal(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const filteredCategories = categories.filter(c => c.type === form.type);

  const toggleCat = (id: string) => {
    setSelectedCats(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const clearFilters = () => {
    setSelectedCats([]);
    setDateFrom('');
    setDateTo('');
  };

  const hasFilters = selectedCats.length > 0 || !!dateFrom || !!dateTo;

  const filtered = transactions.filter(t => {
    const tDate = (t.date || '').slice(0, 10);
    if (selectedCats.length > 0 && (!t.categoryId || !selectedCats.includes(t.categoryId))) return false;
    if (dateFrom && tDate < dateFrom) return false;
    if (dateTo && tDate > dateTo) return false;
    
    const status = getTransactionStatus(t);
    if (activeTab === 'upcoming' && status !== 'upcoming') return false;
    if (activeTab === 'overdue' && status !== 'overdue') return false;
    if (activeTab === 'paid' && status !== 'paid') return false;
    
    return true;
  });

  const byUser = new Map<string, { name: string; income: number; expenses: number; saldo: number }>();
  for (const t of filtered) {
    const uid = t.user?.id || user?.id || 'me';
    const uname = t.user?.name || user?.name || 'Voce';
    const cur = byUser.get(uid) || { name: uname, income: 0, expenses: 0, saldo: 0 };
    if (t.type === 'income') cur.income += t.amount;
    else cur.expenses += t.amount;
    cur.saldo = cur.income - cur.expenses;
    byUser.set(uid, cur);
  }
  const chartData = [...byUser.values()];
  const totalIncome = chartData.reduce((s, u) => s + u.income, 0);
  const totalExpenses = chartData.reduce((s, u) => s + u.expenses, 0);
  const totalSaldo = totalIncome - totalExpenses;

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

      {!dismissedAlert && alerts && (alerts.overdueCount > 0 || alerts.upcomingCount > 0) && (
        <div className="fixed top-4 left-4 right-4 z-40 md:left-auto md:right-4 md:w-96">
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 shadow-lg flex items-start gap-3">
            <AlertTriangle size={20} className="text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-yellow-800 dark:text-yellow-200">Atenção: Despesas pendentes</p>
              {alerts.overdueCount > 0 && (
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  <span className="font-medium">{alerts.overdueCount} vencida{alerts.overdueCount > 1 ? 's' : ''}</span> 
                  ({formatCurrency(alerts.overdueTotal)})
                </p>
              )}
              {alerts.upcomingCount > 0 && (
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  <span className="font-medium">{alerts.upcomingCount} a vencer</span> nos próximos {alerts.upcomingDays} dias 
                  ({formatCurrency(alerts.upcomingTotal)})
                </p>
              )}
            </div>
            <button 
              onClick={() => setDismissedAlert(true)}
              className="text-yellow-500 hover:text-yellow-700 dark:hover:text-yellow-300 p-1"
              aria-label="Dispensar alerta"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Transacoes</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          <span className="hidden sm:inline">Nova Transacao</span>
        </button>
      </div>

      <div className="flex gap-2 mb-4 border-b border-gray-200 dark:border-gray-700">
        {(['all', 'upcoming', 'overdue', 'paid'] as const).map(tab => {
          const count = transactions.filter(t => getTransactionStatus(t) === tab || (tab === 'all' && true)).length;
          const tabInfo = tab === 'all' ? { label: 'Todas', icon: null } : statusLabels[tab];
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors border-b-2 flex items-center gap-1 ${
                activeTab === tab
                  ? 'text-primary border-primary bg-primary/5'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-transparent'
              }`}
            >
              {tabInfo.icon && <tabInfo.icon size={14} />}
              {tabInfo.label}
              {tab !== 'all' && (
                <span className={`px-2 py-0.5 text-xs rounded-full ${tab === 'overdue' ? 'bg-danger/10 text-danger' : tab === 'upcoming' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' : 'bg-success/10 text-success'}`}>
                  {transactions.filter(t => getTransactionStatus(t) === tab).length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Filter size={18} className="text-primary" />
            Filtros
          </h2>
          {hasFilters && (
            <button onClick={clearFilters} className="text-sm text-primary hover:underline font-medium flex items-center gap-1">
              <X size={14} /> Limpar filtros
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm text-gray-500 dark:text-gray-400 self-center flex items-center gap-1">
            <Tag size={14} /> Categorias:
          </span>
          {categories.map(cat => {
            const active = selectedCats.includes(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => toggleCat(cat.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                  active
                    ? 'text-gray-900 dark:text-gray-100 border-transparent'
                    : 'text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                style={active ? { backgroundColor: cat.color + '30', borderColor: cat.color } : undefined}
                title={cat.type === 'income' ? 'Receita' : 'Despesa'}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                {cat.name}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-3">
          <div>
            <label className="label">De</label>
            <input
              type="date"
              className="input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Ate</label>
            <input
              type="date"
              className="input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Grafico por Usuario</h2>
          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-3">
            <span>{filtered.length} transacoes</span>
            <span className="text-success font-medium">{formatCurrency(totalIncome)} receitas</span>
            <span className="text-danger font-medium">{formatCurrency(totalExpenses)} despesas</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-medium">{formatCurrency(totalSaldo)} saldo</span>
          </div>
        </div>
        {filtered.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            {hasFilters ? 'Sem transacoes com os filtros selecionados' : 'Nenhuma transacao encontrada'}
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" tickFormatter={(v: number) => `R$${v}`} />
              <Tooltip formatter={(v: any) => formatCurrency(Number(v))} />
              <Legend />
              <Bar dataKey="income" name="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="saldo" name="Saldo" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="card text-center py-12">
            <ArrowUpRight size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">Nenhuma transacao encontrada</p>
          </div>
        ) : (
          filtered.map((transaction) => (
            <div 
              key={transaction.id}
              className="card flex items-center gap-4"
            >
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center shrink-0
                ${transaction.type === 'income' ? 'bg-success/10' : 'bg-danger/10'}
              `}>
                {transaction.type === 'income' ? (
                  <ArrowUpRight size={24} className="text-success" />
                ) : (
                  <ArrowDownRight size={24} className="text-danger" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {transaction.description || transaction.category?.name || 'Sem categoria'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {transaction.category?.name || 'Sem categoria'} · {transaction.account?.name || 'Sem conta'}
                </p>
                {transaction.user && transaction.user.id !== user?.id && (
                  <p className="text-xs text-primary mt-0.5">
                    {transaction.user.name || transaction.user.email}
                  </p>
                )}
              </div>

              <div className="text-right shrink-0">
                <p className={`font-semibold ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
                  {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
                {transaction.type === 'expense' && (() => {
                  const status = getTransactionStatus(transaction);
                  const info = statusLabels[status];
                  if (status !== 'none') {
                    return (
                      <span key={status} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${info.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${info.dotColor}`} />
                        {info.label}
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>

              <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => openEdit(transaction)}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Editar"
              >
                <Pencil size={16} />
              </button>
              <button
                onClick={() => handleDelete(transaction.id)}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-danger dark:hover:text-danger transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Excluir"
              >
                <Trash2 size={16} />
              </button>
            </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h2 className="text-lg font-semibold dark:text-gray-100">{editingId ? 'Editar Transacao' : 'Nova Transacao'}</h2>
              <button onClick={() => { setShowModal(false); setEditingId(null); setModalError(null); setShowNewAccount(false); setShowNewCategory(false); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: 'expense', categoryId: '', dueDate: '', isPaid: false })}
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    form.type === 'expense' 
                      ? 'bg-danger text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Despesa
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, type: 'income', categoryId: '', dueDate: '', isPaid: false })}
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    form.type === 'income' 
                      ? 'bg-success text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Receita
                </button>
              </div>

              <div>
                <label className="label">Valor</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="input text-2xl font-bold"
                  placeholder="R$ 0,00"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Descricao</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ex: Almoco no restaurante"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div>
                <label className="label">Data</label>
                <input
                  type="date"
                  className="input"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>

              {form.type === 'expense' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Vencimento</label>
                    <input
                      type="date"
                      className="input"
                      value={form.dueDate}
                      onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={form.isPaid}
                        onChange={(e) => setForm({ ...form, isPaid: e.target.checked })}
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pago</span>
                    </label>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between">
                  <label className="label">Conta</label>
                  <button
                    type="button"
                    onClick={() => setShowNewAccount(v => !v)}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    {showNewAccount ? 'Cancelar' : '+ Nova conta'}
                  </button>
                </div>
                <select
                  className="input"
                  value={form.accountId}
                  onChange={(e) => setForm({ ...form, accountId: e.target.value })}
                  required
                >
                  <option value="">Selecione uma conta</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
                {showNewAccount && (
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
                    <input
                      type="text"
                      className="input"
                      placeholder="Nome da conta (Ex: Itau, Carteira)"
                      value={newAccountForm.name}
                      onChange={(e) => setNewAccountForm({ ...newAccountForm, name: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        className="input flex-1"
                        placeholder="Saldo inicial (opcional)"
                        value={newAccountForm.initialBalance}
                        onChange={(e) => setNewAccountForm({ ...newAccountForm, initialBalance: e.target.value })}
                      />
                      <input
                        type="color"
                        className="w-12 h-11 rounded-lg cursor-pointer shrink-0"
                        value={newAccountForm.color}
                        onChange={(e) => setNewAccountForm({ ...newAccountForm, color: e.target.value })}
                        title="Cor da conta"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleCreateAccount}
                      disabled={accountSaving}
                      className="w-full btn-primary disabled:opacity-50"
                    >
                      {accountSaving ? 'Criando...' : 'Criar conta'}
                    </button>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="label">Categoria</label>
                  <button
                    type="button"
                    onClick={() => setShowNewCategory(v => !v)}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    {showNewCategory ? 'Cancelar' : '+ Nova categoria'}
                  </button>
                </div>
                <select
                  className="input"
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {filteredCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {showNewCategory && (
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
                    <input
                      type="text"
                      className="input"
                      placeholder={`Nome da categoria (${form.type === 'income' ? 'receita' : 'despesa'})`}
                      value={newCategoryForm.name}
                      onChange={(e) => setNewCategoryForm({ ...newCategoryForm, name: e.target.value })}
                    />
                    <input
                      type="color"
                      className="w-full h-10 rounded-lg cursor-pointer"
                      value={newCategoryForm.color}
                      onChange={(e) => setNewCategoryForm({ ...newCategoryForm, color: e.target.value })}
                      title="Cor da categoria"
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      disabled={categorySaving}
                      className="w-full btn-primary disabled:opacity-50"
                    >
                      {categorySaving ? 'Criando...' : 'Criar categoria'}
                    </button>
                  </div>
                )}
              </div>

              {modalError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-300">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

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
