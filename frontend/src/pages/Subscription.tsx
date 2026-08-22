import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Crown, Check, Star, Zap, Copy, X, CheckCircle } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import api from '../lib/api';

const FREE_PLAN_FEATURES = [
  'Ate 1 conta',
  'Ate 20 transacoes/mes',
  '1 cartao',
  '1 orcamento',
  '1 meta',
  'Relatorios basicos',
  '1 usuario',
];

const PREMIUM_PLAN_FEATURES = [
  'Dashboard completo',
  'Ate 3 contas',
  'Transacoes ilimitadas',
  'Categorias personalizadas',
  'Cartoes ilimitados',
  'Orcamentos ilimitados',
  'Metas ilimitadas',
  'Relatorios completos',
  'Relatorios em PDF',
  'Insights automaticos',
  '2 usuarios',
  'Gestao compartilhada para casal',
  'Configuracoes avancadas',
  'Suporte prioritario',
];

const PRO_PLAN_FEATURES = [
  'Tudo do Premium',
  'Usuarios da familia',
  'Gestao familiar',
  'Backup automatico',
  'Acesso a API',
  'Relatorios completos + PDF',
  'Insights automaticos',
  'Contas ilimitadas',
  'Transacoes ilimitadas',
  'Cartoes ilimitados',
  'Orcamentos ilimitados',
  'Metas ilimitadas',
  'Configuracoes avancadas',
  'Suporte prioritario',
];

export function Subscription() {
  const { user, plans, subscription, fetchPlans, fetchSubscription, checkoutSubscription, cancelSubscription } = useStore();
  const [loading, setLoading] = useState(false);
  const [planToCheckout, setPlanToCheckout] = useState<string | null>(null);
  const [pixData, setPixData] = useState<{ pixKey: string; amount: number; planName: string; payload: string } | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const [showThanks, setShowThanks] = useState(false);
  const [billingDay, setBillingDay] = useState<number>(() => {
    const createdAt = user?.createdAt ? new Date(user.createdAt) : new Date();
    return Math.min(createdAt.getDate(), 28);
  });

  useEffect(() => {
    fetchPlans();
    fetchSubscription();
  }, []);

  const handleCheckout = async (planId: string) => {
    if (planId === 'free') {
      setLoading(true);
      try {
        await checkoutSubscription(planId);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
      return;
    }
    const createdAt = user?.createdAt ? new Date(user.createdAt) : new Date();
    setBillingDay(Math.min(createdAt.getDate(), 28));
    setPlanToCheckout(planId);
  };

  const confirmCheckout = async () => {
    if (!planToCheckout) return;
    setLoading(true);
    try {
      await checkoutSubscription(planToCheckout, billingDay);
      const { data } = await api.get('/subscriptions/pix', { params: { plan: planToCheckout } });
      setPixData(data);
      setPixCopied(false);
      setPlanToCheckout(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyPixPayload = () => {
    if (pixData) {
      navigator.clipboard.writeText(pixData.payload);
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 3000);
    }
  };

  const closePixModal = () => {
    setPixData(null);
    setShowThanks(true);
  };

  const handleCancel = async () => {
    if (confirm('Tem certeza que deseja cancelar sua assinatura?')) {
      setLoading(true);
      try {
        await cancelSubscription();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const planIcons = [Zap, Star, Crown];
  const planColors = ['text-primary', 'text-yellow-500', 'text-purple-500'];
  const planBgColors = ['bg-primary/10', 'bg-yellow-500/10', 'bg-purple-500/10'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Assinatura</h1>
        <p className="text-gray-600 dark:text-gray-400">Gerencie seu plano e assinatura</p>
      </div>

      {/* Current subscription */}
      {subscription && subscription.status === 'active' && (
        <div className="card bg-gradient-to-r from-primary to-blue-700 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <Crown size={28} />
              </div>
              <div>
                <p className="text-sm text-blue-100">Plano Atual</p>
                <h2 className="text-xl font-bold">{subscription.plan?.name || 'Plano'}</h2>
                {subscription.plan?.id === 'free' && (
                  <p className="text-sm text-blue-200 mt-1">Plano Gratuito</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{formatCurrency(subscription.plan?.price || 0)}</p>
              <p className="text-sm text-blue-100">/mes</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
            <p className="text-sm text-blue-100">
              Proxima cobranca: {subscription.nextDueDate
                ? new Date(subscription.nextDueDate).toLocaleDateString('pt-BR')
                : '-'}
              {subscription.billingDay ? ` (todo dia ${subscription.billingDay})` : ''}
            </p>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="text-sm text-white/80 hover:text-white underline disabled:opacity-50"
            >
              Cancelar assinatura
            </button>
          </div>
        </div>
      )}

      {(!subscription || subscription.status !== 'active') && (
        <div className="card text-center py-8">
          <Crown size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Sem assinatura ativa</h2>
          <p className="text-gray-500 dark:text-gray-400">Escolha um plano para desbloquear todos os recursos</p>
        </div>
      )}

      {/* Available plans */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Planos Disponiveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, index) => {
            const Icon = planIcons[index % planIcons.length];
            const isCurrentPlan = subscription?.planId === plan.id && subscription?.status === 'active';
            const features = plan.id === 'free' ? FREE_PLAN_FEATURES : plan.id === 'premium' ? PREMIUM_PLAN_FEATURES : plan.id === 'pro' ? PRO_PLAN_FEATURES : plan.features;
            return (
              <div
                key={plan.id}
                className={`card relative ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-white text-xs font-medium px-3 py-1 rounded-full">
                      Plano Atual
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 ${planBgColors[index % planBgColors.length]} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <Icon size={32} className={planColors[index % planColors.length]} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">{formatCurrency(plan.price)}</span>
                    <span className="text-gray-500 dark:text-gray-400">/mes</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check size={18} className="text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleCheckout(plan.id)}
                  disabled={loading || isCurrentPlan}
                  className={`w-full py-3 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                    isCurrentPlan
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'btn-primary'
                  }`}
                >
                  {isCurrentPlan ? 'Plano Atual' : loading ? 'Processando...' : 'Escolher Plano'}
                </button>
              </div>
            );
          })}
        </div>

        {plans.length === 0 && (
          <div className="card text-center py-12">
            <Crown size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">Nenhum plano disponivel no momento</p>
          </div>
        )}
      </div>

      {/* Billing Day Modal */}
      {planToCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6 max-h-[92vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
              Melhor data para pagamento
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Escolha o dia do mes em que a cobranca recorrente sera feita.
            </p>
            <label className="label">Dia do mes</label>
            <select
              className="input"
              value={billingDay}
              onChange={(e) => setBillingDay(Number(e.target.value))}
            >
              {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>
                  Dia {day}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              A assinatura sera cobrada todo dia {billingDay}. A proxima cobranca sera em{' '}
              {new Date(
                new Date().getFullYear(),
                billingDay <= new Date().getDate() ? new Date().getMonth() + 1 : new Date().getMonth(),
                billingDay
              ).toLocaleDateString('pt-BR')}
              .
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setPlanToCheckout(null)}
                className="btn-secondary flex-1"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={confirmCheckout}
                className="btn-primary flex-1 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Processando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* PIX QR Code Modal */}
      {pixData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6 relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={closePixModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={22} />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 text-center">
              Pagamento via PIX
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 text-center">
              {pixData.planName} — {formatCurrency(pixData.amount)}/mes
            </p>
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-white rounded-xl border border-gray-200 dark:border-gray-700">
                <QRCodeCanvas value={pixData.payload} size={220} level="M" />
              </div>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Chave PIX</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{pixData.pixKey}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Valor</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{formatCurrency(pixData.amount)}</span>
              </div>
            </div>
            <button
              onClick={copyPixPayload}
              className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                pixCopied
                  ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                  : 'btn-primary'
              }`}
            >
              {pixCopied ? <Check size={18} /> : <Copy size={18} />}
              {pixCopied ? 'Codigo copiado!' : 'Copiar codigo Pix (copia e cola)'}
            </button>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-center">
              Escaneie o QR Code no app do seu banco ou use o codigo copia e cola. A assinatura sera cobrada todo dia {billingDay}.
            </p>
          </div>
        </div>
      )}
      {/* Thank You Modal */}
      {showThanks && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md p-6 text-center max-h-[92vh] overflow-y-auto">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-success" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Obrigado pela sua compra!
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              Seu sistema esta liberado e aguardando aprovacao do nosso financeiro.
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
              Isso nao impacta voce em nada no sistema.
            </p>
            <button onClick={() => setShowThanks(false)} className="btn-primary w-full">
              Entendi
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
