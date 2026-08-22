import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, X, Tag, Trash2, Pencil, Check, AlertCircle } from 'lucide-react';

export function Categories() {
  const { categories, fetchCategories, createCategory, deleteCategory } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'expense',
    icon: 'tag',
    color: '#64748B',
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editCategory) {
        const api = (await import('../lib/api')).default;
        await api.put(`/categories/${editCategory.id}`, form);
        showFeedback('success', 'Categoria atualizada com sucesso');
      } else {
        await createCategory(form);
        showFeedback('success', 'Categoria criada com sucesso');
      }
      await fetchCategories();
      setShowModal(false);
      setEditCategory(null);
      setForm({ name: '', type: 'expense', icon: 'tag', color: '#64748B' });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao salvar categoria';
      showFeedback('error', Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (cat: any) => {
    setEditCategory(cat);
    setForm({ name: cat.name, type: cat.type, icon: cat.icon || 'tag', color: cat.color || '#64748B' });
    setShowModal(true);
  };

  const openCreate = () => {
    setEditCategory(null);
    setForm({ name: '', type: 'expense', icon: 'tag', color: '#64748B' });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria? As transacoes associadas perderao a referencia.')) return;
    try {
      await deleteCategory(id);
      showFeedback('success', 'Categoria excluida com sucesso');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao excluir categoria';
      showFeedback('error', Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const expenseCategories = categories.filter(c => c.type === 'expense');
  const incomeCategories = categories.filter(c => c.type === 'income');

  const renderCategoryGrid = (cats: any[]) => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {cats.map((category) => (
        <div 
          key={category.id}
          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl group"
        >
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: category.color + '20' }}
          >
            <Tag size={20} style={{ color: category.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
              {category.name}
            </p>
            {category.isDefault && (
              <span className="inline-flex items-center px-1.5 py-0.5 mt-1 rounded-full text-[10px] font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                Padrao
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0 max-sm:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => openEdit(category)}
              className="p-1 text-gray-400 dark:text-gray-500 hover:text-primary transition-colors"
              title="Editar"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => handleDelete(category.id)}
              className="p-1 text-gray-400 dark:text-gray-500 hover:text-danger transition-colors"
              title="Excluir"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

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
  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Categorias</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          <span className="hidden sm:inline">Nova Categoria</span>
        </button>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Despesas</h2>
        {expenseCategories.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">Nenhuma categoria de despesa</p>
        ) : renderCategoryGrid(expenseCategories)}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Receitas</h2>
        {incomeCategories.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">Nenhuma categoria de receita</p>
        ) : renderCategoryGrid(incomeCategories)}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h2 className="text-lg font-semibold dark:text-gray-100">
                {editCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h2>
              <button onClick={() => { setShowModal(false); setEditCategory(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Nome</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ex: Supermercado"
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
                  <option value="expense">Despesa</option>
                  <option value="income">Receita</option>
                </select>
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
