import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, X, PieChart, Pencil, Trash2, Check, AlertCircle, Info } from 'lucide-react';
import api from '../lib/api';
import { isFreePlan, getPlanLimit } from '../lib/plan';

export function Budgets() {
  const { user, budgets, categories, fetchBudgets, fetchCategories, createBudget } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    categoryId: '',
    limitAmount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form, limitAmount: parseFloat(form.limitAmount) };
      if (editingId) {
        await api.put('/budgets/' + editingId, data);
        showFeedback('success', 'Orcamento atualizado com sucesso');
      } else {
        await createBudget(data);
        showFeedback('success', 'Orcamento criado com sucesso');
      }
      await fetchBudgets();
      setShowModal(false);
      setEditingId(null);
      setForm({ categoryId: '', limitAmount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao salvar orcamento';
      showFeedback('error', Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este orcamento?')) return;
    try {
      await api.delete('/budgets/' + id);
      await fetchBudgets();
      showFeedback('success', 'Orcamento excluido com sucesso');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao excluir orcamento';
      showFeedback('error', Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const handleEdit = (budget: any) => {
    setEditingId(budget.id);
    setForm({
      categoryId: budget.categoryId,
      limitAmount: String(budget.limitAmount),
      month: budget.month,
      year: budget.year,
    });
    setShowModal(true);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ categoryId: '', limitAmount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() });
    setShowModal(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const expenseCategories = categories.filter(c => c.type === 'expense');

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
  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Orcamentos</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          <span className="hidden sm:inline">Novo Orcamento</span>
        </button>
      </div>
      {isFreePlan(user?.workspace?.plan) && (
        <div className="mt-3 flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
          <Info size={16} className="shrink-0" />
          <span>Plano gratuito: {budgets.length}/{getPlanLimit(user?.workspace?.plan, 'budgets')} orcamento</span>
          {budgets.length >= getPlanLimit(user?.workspace?.plan, 'budgets') && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-amber-200 dark:bg-amber-800 rounded">Limite atingido</span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgets.map((budget) => {
          const progress = budget.spent ? (budget.spent / budget.limitAmount) * 100 : 0;
          const isOverBudget = progress > 100;
          const isWarning = progress >= 80 && progress <= 100;
          
          return (
            <div key={budget.id} className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{budget.category.name}</h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(budget)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:text-primary"
                    title="Editar"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:text-danger"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                  <span className={`text-sm font-medium ml-1 ${
                    isOverBudget ? 'text-danger' : isWarning ? 'text-warning' : 'text-success'
                  }`}>
                    {progress.toFixed(0)}%
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>Gasto: {formatCurrency(budget.spent || 0)}</span>
                  <span>Limite: {formatCurrency(budget.limitAmount)}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all ${
                      isOverBudget ? 'bg-danger' : isWarning ? 'bg-warning' : 'bg-success'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>

              {isOverBudget && (
                <p className="text-sm text-danger font-medium">
                  Estourou {formatCurrency((budget.spent || 0) - budget.limitAmount)}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {budgets.length === 0 && (
        <div className="card text-center py-12">
          <PieChart size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">Nenhum orcamento criado</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h2 className="text-lg font-semibold dark:text-gray-100">{editingId ? 'Editar Orcamento' : 'Novo Orcamento'}</h2>
              <button onClick={() => { setShowModal(false); setEditingId(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Categoria</label>
                <select
                  className="input"
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {expenseCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Limite Mensal</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  placeholder="R$ 0,00"
                  value={form.limitAmount}
                  onChange={(e) => setForm({ ...form, limitAmount: e.target.value })}
                  required
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
