import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, X, Target, CheckCircle, Pencil, Trash2, Check, AlertCircle, Info } from 'lucide-react';
import api from '../lib/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { isFreePlan, getPlanLimit } from '../lib/plan';

export function Goals() {
  const { user, goals, fetchGoals, createGoal, addGoalAmount } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [showAddAmount, setShowAddAmount] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    color: '#10B981',
  });
  const [amountToAdd, setAmountToAdd] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form, targetAmount: parseFloat(form.targetAmount) };
      if (editingId) {
        await api.put('/goals/' + editingId, data);
        showFeedback('success', 'Meta atualizada com sucesso');
      } else {
        await createGoal(data);
        showFeedback('success', 'Meta criada com sucesso');
      }
      await fetchGoals();
      setShowModal(false);
      setEditingId(null);
      setForm({ name: '', targetAmount: '', targetDate: '', color: '#10B981' });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao salvar meta';
      showFeedback('error', Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (goal: any) => {
    setEditingId(goal.id);
    setForm({
      name: goal.name,
      targetAmount: String(goal.targetAmount),
      targetDate: goal.targetDate ? goal.targetDate.slice(0, 10) : '',
      color: goal.color || '#10B981',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta meta?')) return;
    try {
      await api.delete('/goals/' + id);
      await fetchGoals();
      showFeedback('success', 'Meta excluida com sucesso');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao excluir meta';
      showFeedback('error', Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const handleAddAmount = async (goalId: string) => {
    if (!amountToAdd) return;
    setLoading(true);
    try {
      await addGoalAmount(goalId, parseFloat(amountToAdd));
      await fetchGoals();
      setShowAddAmount(null);
      setAmountToAdd('');
      showFeedback('success', 'Valor adicionado com sucesso');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao adicionar valor';
      showFeedback('error', Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

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
  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Metas</h1>
        <button onClick={() => { setEditingId(null); setForm({ name: '', targetAmount: '', targetDate: '', color: '#10B981' }); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          <span className="hidden sm:inline">Nova Meta</span>
        </button>
      </div>
      {isFreePlan(user?.workspace?.plan) && (
        <div className="mt-3 flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
          <Info size={16} className="shrink-0" />
          <span>Plano gratuito: {goals.length}/{getPlanLimit(user?.workspace?.plan, 'goals')} meta</span>
          {goals.length >= getPlanLimit(user?.workspace?.plan, 'goals') && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-amber-200 dark:bg-amber-800 rounded">Limite atingido</span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const isCompleted = goal.status === 'completed';
          
          return (
            <div key={goal.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: (goal.color || '#10B981') + '20' }}
                  >
                    <Target size={24} style={{ color: goal.color || '#10B981' }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{goal.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {goal.targetDate ? `Meta: ${format(new Date(goal.targetDate), 'dd/MM/yyyy', { locale: ptBR })}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {isCompleted && <CheckCircle size={20} className="text-success" />}
                  <button
                    onClick={() => handleEdit(goal)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:text-primary"
                    title="Editar"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:text-danger"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>{formatCurrency(goal.currentAmount)}</span>
                  <span>{formatCurrency(goal.targetAmount)}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="h-3 rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(progress, 100)}%`,
                      backgroundColor: goal.color || '#10B981'
                    }}
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{progress.toFixed(1)}% atingido</p>
              </div>

              {!isCompleted && (
                <button
                  onClick={() => setShowAddAmount(showAddAmount === goal.id ? null : goal.id)}
                  className="w-full btn-secondary flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Adicionar Valor
                </button>
              )}

              {showAddAmount === goal.id && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <label className="label">Valor para adicionar</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      className="input flex-1"
                      placeholder="R$ 0,00"
                      value={amountToAdd}
                      onChange={(e) => setAmountToAdd(e.target.value)}
                    />
                    <button
                      onClick={() => handleAddAmount(goal.id)}
                      disabled={loading || !amountToAdd}
                      className="btn-primary disabled:opacity-50"
                    >
                      Adicionar
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {goals.length === 0 && (
        <div className="card text-center py-12">
          <Target size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">Nenhuma meta criada</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h2 className="text-lg font-semibold dark:text-gray-100">{editingId ? 'Editar Meta' : 'Nova Meta'}</h2>
              <button onClick={() => { setShowModal(false); setEditingId(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Nome</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ex: Reserva de Emergencia"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Valor Alvo</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  placeholder="R$ 0,00"
                  value={form.targetAmount}
                  onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Data Alvo</label>
                <input
                  type="date"
                  className="input"
                  value={form.targetDate}
                  onChange={(e) => setForm({ ...form, targetDate: e.target.value })}
                  required
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
