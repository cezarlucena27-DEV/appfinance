import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { accountTypeLabels, translateLabel } from '../lib/translations';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Link2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import api from '../lib/api';
import { ReorderablePanels } from '../components/ReorderablePanels';

export function Dashboard() {
  const {
    accounts,
    transactions,
    summary,
    goals,
    fetchAccounts,
    fetchTransactions,
    fetchSummary,
    fetchBudgets,
    fetchGoals
  } = useStore();

  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceFilter, setBalanceFilter] = useState({ startDate: '', endDate: '' });

  const loadMonthlyBalances = async () => {
    setBalanceLoading(true);
    try {
      const params = new URLSearchParams();
      if (balanceFilter.startDate) params.append('startDate', balanceFilter.startDate);
      if (balanceFilter.endDate) params.append('endDate', balanceFilter.endDate);
      const { data } = await api.get(`/transactions/monthly-balances?${params.toString()}`);
      setMonthlyData(data);
    } catch {}
    setBalanceLoading(false);
  };

  useEffect(() => {
    fetchAccounts();
    fetchTransactions({ startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(), endDate: new Date().toISOString() });
    fetchSummary();
    fetchBudgets();
    fetchGoals();
    loadMonthlyBalances();
  }, []);

  useEffect(() => { loadMonthlyBalances(); }, [balanceFilter]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Painel</h1>
        <Link to="/transactions" className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          <span className="hidden sm:inline">Nova Transacao</span>
        </Link>
      </div>

      <ReorderablePanels storageKey="dashboard">
        {[
          /* Summary Cards */
          <div key="summary" className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receitas</p>
              <p className="text-2xl font-bold text-success">
                {formatCurrency(summary?.income || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
              <TrendingUp size={24} className="text-success" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Despesas</p>
              <p className="text-2xl font-bold text-danger">
                {formatCurrency(summary?.expenses || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-danger/10 rounded-xl flex items-center justify-center">
              <TrendingDown size={24} className="text-danger" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Saldo</p>
              <p className={`text-2xl font-bold ${(summary?.balance || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatCurrency(summary?.balance || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Wallet size={24} className="text-primary" />
            </div>
          </div>
        </div>
      </div>
          ,

          /* Monthly Balances Chart */
          <div key="chart" className="card space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Saldos e Despesas por Mes</h2>
          <div className="flex flex-wrap gap-2 items-end">
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
            {(balanceFilter.startDate || balanceFilter.endDate) && (
              <button
                onClick={() => setBalanceFilter({ startDate: '', endDate: '' })}
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
          ,

          /* Accounts */
          <div key="accounts" className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Contas</h2>
          <Link to="/accounts" className="text-primary text-sm font-medium hover:underline">
            Ver todas
          </Link>
        </div>
        
        {accounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Wallet size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p>Nenhuma conta cadastrada</p>
            <Link to="/accounts" className="text-primary text-sm font-medium hover:underline mt-2 inline-block">
              Criar primeira conta
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <div 
                key={account.id}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: account.color + '20' }}
                  >
                    <Wallet size={24} style={{ color: account.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      {account.name}
                      {(account.linkedWith?.length ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
                          <Link2 size={12} /> Conjunta
                        </span>
                      )}
                      {(account.sharedWith?.length ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                          <Link2 size={12} /> Vinculada
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{translateLabel(accountTypeLabels, account.type)}</p>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {account.linkedWith?.length
                      ? formatCurrency(account.groupBalance ?? account.currentBalance)
                      : formatCurrency(account.currentBalance)}
                  </p>
                </div>
                {account.sharedWith && account.sharedWith.length > 0 && account.sharedUsers && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-1.5">
                    {account.sharedUsers.map((u, i) => (
                      <div key={u.id} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4', '#a855f7'][i % 6] }} />
                          {u.name}{u.isOwner && <span className="text-gray-400">(dona)</span>}
                        </span>
                        <span className="text-red-500 dark:text-red-400">{formatCurrency(u.expenses)} despesas</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(u.available)} disp.</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
          ,

          /* Recent Transactions */
          <div key="transactions" className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Ultimas Transacoes</h2>
          <Link to="/transactions" className="text-primary text-sm font-medium hover:underline">
            Ver todas
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <ArrowUpRight size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p>Nenhuma transacao registrada</p>
            <Link to="/transactions" className="text-primary text-sm font-medium hover:underline mt-2 inline-block">
              Adicionar primeira transacao
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction) => (
              <div 
                key={transaction.id}
                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
              >
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${transaction.type === 'income' ? 'bg-success/10' : 'bg-danger/10'}
                `}>
                  {transaction.type === 'income' ? (
                    <ArrowUpRight size={20} className="text-success" />
                  ) : (
                    <ArrowDownRight size={20} className="text-danger" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {transaction.description || transaction.category?.name || 'Sem categoria'}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {transaction.category?.name || 'Sem categoria'} · {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
                <p className={`font-semibold ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
                  {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
          ,

          /* Goals */
          ...(goals.length > 0 ? [
            <div key="goals" className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Metas</h2>
                <Link to="/goals" className="text-primary text-sm font-medium hover:underline">
                  Ver todas
                </Link>
              </div>
              
              <div className="space-y-4">
                {goals.filter(g => g.status === 'active').slice(0, 3).map((goal) => {
                  const progress = (goal.currentAmount / goal.targetAmount) * 100;
                  return (
                    <div key={goal.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900 dark:text-gray-100">{goal.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                        </p>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all"
                          style={{ 
                            width: `${Math.min(progress, 100)}%`,
                            backgroundColor: goal.color 
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{progress.toFixed(1)}%</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ] : []),
        ]}
      </ReorderablePanels>
    </div>
  );
}
