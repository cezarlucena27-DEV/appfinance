import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { FileText, Download, Table2, BarChart3, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '../lib/api';
import { isFreePlan } from '../lib/plan';

export function Reports() {
  const { user, monthlyReport, fetchMonthlyReport } = useStore();
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [scope, setScope] = useState<'individual' | 'conjunto'>('individual');

  useEffect(() => {
    fetchMonthlyReport(month, year, scope);
  }, [month, year, scope]);

  const downloadExport = async (type: 'csv' | 'pdf' | 'excel') => {
    try {
      const { data } = await api.get(`/reports/export/${type}?month=${month}&year=${year}&scope=${scope}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio-${month}-${year}-${scope}.${type === 'excel' ? 'xlsx' : type}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Erro ao exportar relatorio');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
  ];

  const handleMonthChange = (delta: number) => {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    } else if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    setMonth(newMonth);
    setYear(newYear);
  };

  const maxCategoryTotal = Math.max(
    ...(monthlyReport?.byCategory?.map((c) => c.total) || [0]),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Relatorios</h1>
          <p className="text-gray-600 dark:text-gray-400">Analise financeira mensal</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isFreePlan(user?.workspace?.plan) && (
            <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-3 py-1.5">
              <Lock size={14} className="shrink-0" />
              <span>Relatorios basicos no plano gratuito</span>
            </div>
          )}
          <div className="inline-flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
            <button
              onClick={() => setScope('individual')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                scope === 'individual'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Individual
            </button>
            <button
              onClick={() => setScope('conjunto')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                scope === 'conjunto'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Conjunto
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => downloadExport('csv')} className="btn-secondary flex items-center gap-2">
              <Download size={18} />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
            {isFreePlan(user?.workspace?.plan) ? (
              <>
                <button disabled className="btn-secondary flex items-center gap-2 opacity-50 cursor-not-allowed" title="Disponivel no plano Premium">
                  <Table2 size={18} />
                  <span className="hidden sm:inline">Exportar Excel</span>
                  <Lock size={14} className="ml-1" />
                </button>
                <button disabled className="btn-primary flex items-center gap-2 opacity-50 cursor-not-allowed" title="Disponivel no plano Premium">
                  <FileText size={18} />
                  <span className="hidden sm:inline">Exportar PDF</span>
                  <Lock size={14} className="ml-1" />
                </button>
              </>
            ) : (
              <>
                <button onClick={() => downloadExport('excel')} className="btn-secondary flex items-center gap-2">
                  <Table2 size={18} />
                  <span className="hidden sm:inline">Exportar Excel</span>
                </button>
                <button onClick={() => downloadExport('pdf')} className="btn-primary flex items-center gap-2">
                  <FileText size={18} />
                  <span className="hidden sm:inline">Exportar PDF</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => handleMonthChange(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-lg font-bold"
          >
            &lsaquo;
          </button>
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {monthNames[month - 1]} {year}
            </h2>
          </div>
          <button
            onClick={() => handleMonthChange(1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-lg font-bold"
          >
            &rsaquo;
          </button>
        </div>
      </div>

      {monthlyReport ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Receitas</p>
                  <p className="text-2xl font-bold text-success">
                    {formatCurrency(monthlyReport.totalIncome)}
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
                    {formatCurrency(monthlyReport.totalExpenses)}
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
                  <p
                    className={
                      'text-2xl font-bold ' +
                      (monthlyReport.balance >= 0 ? 'text-success' : 'text-danger')
                    }
                  >
                    {formatCurrency(monthlyReport.balance)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <BarChart3 size={24} className="text-primary" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-3">
              <FileText size={20} className="text-gray-400 dark:text-gray-500" />
              <p className="text-gray-600 dark:text-gray-400">
                Total de transacoes no periodo:{' '}
                <span className="font-bold text-gray-900 dark:text-gray-100">{monthlyReport.transactionCount}</span>
              </p>
            </div>
          </div>

          {monthlyReport.byCategory && monthlyReport.byCategory.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Gastos por Categoria</h2>
              <div className="space-y-4">
                {monthlyReport.byCategory.map((cat, index) => {
                  const percentage = maxCategoryTotal > 0
                    ? (cat.total / maxCategoryTotal) * 100
                    : 0;
                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{cat.category}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">({cat.count})</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {formatCurrency(cat.total)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: percentage + '%',
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {monthlyReport.transactions && monthlyReport.transactions.length > 0 && (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Detalhamento das Transacoes</h2>
              <div className="space-y-3">
                {monthlyReport.transactions.map((transaction: any) => (
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
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {transaction.description || transaction.category?.name || 'Sem categoria'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {transaction.category?.name || 'Sem categoria'} · {transaction.account?.name || 'Sem conta'}
                        {scope === 'conjunto' && transaction.user?.name && (
                          <> · {transaction.user.name}</>
                        )}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`font-semibold ${transaction.type === 'income' ? 'text-success' : 'text-danger'}`}>
                        {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="card text-center py-12">
          <BarChart3 size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">Carregando relatorio...</p>
        </div>
      )}
    </div>
  );
}
