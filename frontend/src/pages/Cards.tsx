import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, X, CreditCard, Trash2, Pencil, Check, AlertCircle, Info } from 'lucide-react';
import { cardBrandLabels, translateLabel } from '../lib/translations';
import { isFreePlan, getPlanLimit } from '../lib/plan';

export function Cards() {
  const { user, cards, accounts, fetchCards, fetchAccounts, createCard, deleteCard } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [editCard, setEditCard] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    brand: 'other',
    limit: '',
    closingDay: '1',
    dueDay: '10',
    accountId: '',
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  useEffect(() => {
    fetchCards();
    fetchAccounts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editCard) {
        const api = (await import('../lib/api')).default;
        await api.put(`/cards/${editCard.id}`, { ...form, limit: parseFloat(form.limit), closingDay: parseInt(form.closingDay), dueDay: parseInt(form.dueDay) });
        showFeedback('success', 'Cartao atualizado com sucesso');
      } else {
        await createCard({
          ...form,
          limit: parseFloat(form.limit),
          closingDay: parseInt(form.closingDay),
          dueDay: parseInt(form.dueDay),
        });
        showFeedback('success', 'Cartao criado com sucesso');
      }
      await fetchCards();
      setShowModal(false);
      setEditCard(null);
      setForm({ name: '', brand: 'other', limit: '', closingDay: '1', dueDay: '10', accountId: '' });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao salvar cartao';
      showFeedback('error', Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (card: any) => {
    setEditCard(card);
    setForm({ name: card.name, brand: card.brand || 'other', limit: String(card.limit ?? ''), closingDay: String(card.closingDay ?? '1'), dueDay: String(card.dueDay ?? '10'), accountId: card.accountId || '' });
    setShowModal(true);
  };

  const openCreate = () => {
    setEditCard(null);
    setForm({ name: '', brand: 'other', limit: '', closingDay: '1', dueDay: '10', accountId: '' });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este cartao?')) return;
    try {
      await deleteCard(id);
      showFeedback('success', 'Cartao excluido com sucesso');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao excluir cartao';
      showFeedback('error', Array.isArray(msg) ? msg[0] : msg);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const brandColors: Record<string, string> = {
    visa: '#1A1F71',
    mastercard: '#EB001B',
    elo: '#FF5F00',
    amge: '#006FCF',
    other: '#64748B',
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
  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Cartoes de Credito</h1>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          <span className="hidden sm:inline">Novo Cartao</span>
        </button>
      </div>
      {isFreePlan(user?.workspace?.plan) && (
        <div className="mt-3 flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
          <Info size={16} className="shrink-0" />
          <span>Plano gratuito: {cards.length}/{getPlanLimit(user?.workspace?.plan, 'cards')} cartao</span>
          {cards.length >= getPlanLimit(user?.workspace?.plan, 'cards') && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-amber-200 dark:bg-amber-800 rounded">Limite atingido</span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card) => (
          <div key={card.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: (brandColors[card.brand] || '#64748B') + '20' }}
                >
                  <CreditCard size={28} style={{ color: brandColors[card.brand] || '#64748B' }} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{card.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{translateLabel(cardBrandLabels, card.brand)}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(card)}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Editar"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(card.id)}
                  className="p-2 text-gray-400 dark:text-gray-500 hover:text-danger dark:hover:text-danger transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t dark:border-gray-700 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Limite</span>
                <span className="font-medium">{formatCurrency(card.limit)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Fechamento</span>
                <span className="font-medium">Dia {card.closingDay}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Vencimento</span>
                <span className="font-medium">Dia {card.dueDay}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {cards.length === 0 && (
        <div className="card text-center py-12">
          <CreditCard size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">Nenhum cartao cadastrado</p>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
              <h2 className="text-lg font-semibold dark:text-gray-100">{editCard ? 'Editar Cartao' : 'Novo Cartao'}</h2>
              <button onClick={() => { setShowModal(false); setEditCard(null); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Nome</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ex: Nubank, Itau"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="label">Bandeira</label>
                <select
                  className="input"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                >
                  <option value="visa">Visa</option>
                  <option value="mastercard">Mastercard</option>
                  <option value="elo">Elo</option>
                  <option value="amge">American Express</option>
                  <option value="other">Outra</option>
                </select>
              </div>

              <div>
                <label className="label">Limite</label>
                <input
                  type="number"
                  step="0.01"
                  className="input"
                  placeholder="R$ 0,00"
                  value={form.limit}
                  onChange={(e) => setForm({ ...form, limit: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Dia Fechamento</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    className="input"
                    value={form.closingDay}
                    onChange={(e) => setForm({ ...form, closingDay: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Dia Vencimento</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    className="input"
                    value={form.dueDay}
                    onChange={(e) => setForm({ ...form, dueDay: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="label">Conta para Pagamento</label>
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
