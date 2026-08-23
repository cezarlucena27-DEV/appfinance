import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { useTheme } from '../components/ThemeProvider';
import { roleLabels, translateLabel } from '../lib/translations';
import { Settings as SettingsIcon, Lock, Palette, LogOut, Save, Shield, Puzzle, ArrowLeftRight, Wallet, CreditCard, Tag, PieChart, Target, FileText, Briefcase,
  Car, Laptop, Code, Camera, Dumbbell, Scissors, Sparkles,
  Heart, Scale, Calculator, BookOpen, Stethoscope, Activity,
  ShoppingBag, Truck, ChefHat, Zap, Droplets, Hammer,
  Flower2, Brain, Apple, Ruler, Globe, MessageCircle, HelpCircle, BookOpen as BookOpenIcon, MessageSquare, Send, AlertCircle
} from 'lucide-react';

const iconMap: Record<string, any> = {
  car: Car, laptop: Laptop, palette: Palette, code: Code,
  camera: Camera, dumbbell: Dumbbell, scissors: Scissors, sparkles: Sparkles,
  heart: Heart, scale: Scale, calculator: Calculator, book: BookOpen,
  stethoscope: Stethoscope, activity: Activity, 'shopping-bag': ShoppingBag,
  truck: Truck, 'chef-hat': ChefHat, zap: Zap, droplets: Droplets,
  hammer: Hammer, flower: Flower2, brain: Brain, apple: Apple,
  ruler: Ruler, globe: Globe, target: Target, 'message-circle': MessageCircle,
  briefcase: Briefcase,
};

export const MODULE_LIST = [
  { id: 'transactions', label: 'Transacoes', icon: ArrowLeftRight },
  { id: 'accounts', label: 'Contas', icon: Wallet },
  { id: 'cards', label: 'Cartoes', icon: CreditCard },
  { id: 'categories', label: 'Categorias', icon: Tag },
  { id: 'budgets', label: 'Orcamentos', icon: PieChart },
  { id: 'goals', label: 'Metas', icon: Target },
  { id: 'reports', label: 'Relatorios', icon: FileText },
  { id: 'subscription', label: 'Assinatura', icon: CreditCard },
];

const ALL_MODULE_IDS = MODULE_LIST.map(m => m.id);

export function Settings() {
  const { user, segments, fetchSegments, changePassword, logout, enabledModules, toggleModule } = useStore();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const moduleList = user?.role === 'member'
    ? MODULE_LIST.filter((m) => m.id !== 'subscription')
    : MODULE_LIST;

  useEffect(() => { fetchSegments(); }, []);

  const handleChangePassword = async () => {
    setError('');
    setMsg('');
    if (passwordForm.new !== passwordForm.confirm) {
      setError('Senhas nao coincidem');
      return;
    }
    try {
      await changePassword(passwordForm.current, passwordForm.new);
      setMsg('Senha alterada com sucesso');
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch {
      setError('Erro ao alterar senha');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: SettingsIcon },
    { id: 'password', label: 'Senha', icon: Lock },
    { id: 'modules', label: 'Modulos', icon: Puzzle },
    { id: 'segment', label: 'Segmento', icon: Shield },
    { id: 'theme', label: 'Tema', icon: Palette },
    { id: 'help', label: 'Ajuda', icon: HelpCircle },
    { id: 'danger', label: 'Conta', icon: LogOut },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Configuracoes</h1>

      {msg && (
        <div className="p-3 bg-green-50 dark:bg-green-900/30 text-success rounded-lg text-sm">{msg}</div>
      )}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/30 text-danger rounded-lg text-sm">{error}</div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Abas: dropdown no celular, coluna no desktop */}
        <div className="lg:w-56 shrink-0">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="input w-full lg:hidden"
            aria-label="Seções de configurações"
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.label}
              </option>
            ))}
          </select>
          <nav className="hidden lg:flex lg:flex-col gap-1" aria-label="Configurações">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap text-left ${
                    activeTab === tab.id
                      ? 'bg-primary text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon size={18} className="flex-shrink-0" aria-hidden="true" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Perfil</h2>
              <div>
                <label className="label">Nome</label>
                <input
                  type="text"
                  className="input"
                  value={user?.name || ''}
                  disabled
                />
              </div>
              <div>
                <label className="label">E-mail</label>
                <input
                  type="email"
                  className="input"
                  value={user?.email || ''}
                  disabled
                />
              </div>
              <div>
                <label className="label">Funcao</label>
                <input
                  type="text"
                  className="input"
                  value={translateLabel(roleLabels, user?.role || '')}
                  disabled
                />
              </div>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Alterar Senha</h2>
              <div>
                <label className="label">Senha atual</label>
                <input
                  type="password"
                  className="input"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Nova senha</label>
                <input
                  type="password"
                  className="input"
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Confirmar nova senha</label>
                <input
                  type="password"
                  className="input"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                />
              </div>
              <button onClick={handleChangePassword} className="btn-primary flex items-center gap-2">
                <Save size={18} />
                Salvar
              </button>
            </div>
          )}

          {/* Modules Tab */}
          {activeTab === 'modules' && (
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Modulos Ativos</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Selecione os modulos que deseja exibir no menu lateral.</p>
              <div className="space-y-2">
                {moduleList.map((mod) => {
                  const Icon = mod.icon;
                  const enabled = enabledModules.includes(mod.id);
                  return (
                    <label
                      key={mod.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                        enabled
                          ? 'border-primary/30 bg-primary/5'
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 opacity-60'
                      }`}
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={() => toggleModule(mod.id)}
                          className="sr-only"
                        />
                        <div className={`w-10 h-6 rounded-full transition-colors ${enabled ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform mt-1 ${enabled ? 'translate-x-5' : 'translate-x-1'}`} />
                        </div>
                      </div>
                      <Icon size={20} className={enabled ? 'text-primary' : 'text-gray-400 dark:text-gray-500'} />
                      <span className="font-medium text-gray-900 dark:text-gray-100">{mod.label}</span>
                    </label>
                  );
                })}
              </div>
              <button
                onClick={() => { localStorage.setItem('financeapp_modules', JSON.stringify(ALL_MODULE_IDS)); useStore.setState({ enabledModules: ALL_MODULE_IDS }); }}
                className="btn-secondary text-sm"
              >
                Ativar todos
              </button>
            </div>
          )}

          {/* Segment Tab */}
          {activeTab === 'segment' && (
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Segmento de Trabalho</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Selecione o segmento que melhor descreve sua area de atuacao.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {segments.map((segment) => {
                  const Icon = iconMap[segment.icon] || Briefcase;
                  return (
                    <div
                      key={segment.id}
                      className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        user?.role === segment.name
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <Icon size={24} className="text-primary mb-2" />
                      <p className="font-medium text-gray-900 dark:text-gray-100">{segment.name}</p>
                    </div>
                  );
                })}
              </div>
              {segments.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">Nenhum segmento disponivel</p>
              )}
            </div>
          )}

          {/* Theme Tab */}
          {activeTab === 'theme' && (
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tema</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Escolha a aparencia do aplicativo.</p>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { value: 'light' as const, label: 'Claro' },
                  { value: 'dark' as const, label: 'Escuro' },
                  { value: 'system' as const, label: 'Sistema' },
                ]).map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTheme(opt.value)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      theme === opt.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Palette size={24} className="mx-auto mb-2" />
                    <p className="font-medium text-sm">{opt.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Help Tab */}
          {activeTab === 'help' && (
            <HelpTab />
          )}

          {/* Danger Zone Tab */}
          {activeTab === 'danger' && (
            <div className="card space-y-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Conta</h2>
              <div className="border border-red-200 dark:border-red-900/50 rounded-xl p-4 space-y-3">
                <h3 className="font-medium text-danger">Zona de perigo</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Ao sair, voce sera desconectado e precisara fazer login novamente.
                </p>
                <button
                  onClick={() => { logout(); window.location.href = '/login'; }}
                  className="btn-danger flex items-center gap-2"
                >
                  <LogOut size={18} />
                  Sair da conta
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HelpTab() {
  const { helpTickets, helpTicketsLoading, fetchHelpTickets, createHelpTicket } = useStore();
  const [activeDoc, setActiveDoc] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '', category: 'geral' });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHelpTickets();
  }, [fetchHelpTickets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMsg('');
    if (!form.subject.trim() || !form.message.trim()) {
      setError('Preencha assunto e mensagem');
      return;
    }
    setSubmitting(true);
    try {
      await createHelpTicket({ subject: form.subject, message: form.message, category: form.category });
      setMsg('Sua duvida foi enviada para a equipe de suporte. Responderemos em breve!');
      setForm({ subject: '', message: '', category: 'geral' });
      setShowForm(false);
    } catch {
      setError('Erro ao enviar. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const docs = [
    { id: 'manual', title: 'Manual do Usuario', icon: BookOpenIcon, desc: 'Guia completo de todas as funcionalidades do FinanceApp' },
    { id: 'onboarding', title: 'Guia de Inicio Rapido', icon: HelpCircle, desc: 'Passo a passo para configurar sua conta em minutos' },
    { id: 'faq', title: 'Perguntas Frequentes', icon: MessageSquare, desc: 'Respostas para as duvidas mais comuns' },
    { id: 'master', title: 'Guia do Usuario Master', icon: Briefcase, desc: 'Como gerenciar workspace, membros, assinatura e backups' },
    { id: 'politicas', title: 'Politicas e Termos', icon: AlertCircle, desc: 'Termos de uso, privacidade, cancelamento e LGPD' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Central de Ajuda</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">Documentacao, FAQ e canal de suporte</p>
        </div>
        {!showForm && !activeDoc && (
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
            <MessageSquare size={18} />
            Enviar Duvida
          </button>
        )}
      </div>

      {msg && <div className="p-3 bg-green-50 dark:bg-green-900/30 text-success rounded-lg text-sm">{msg}</div>}
      {error && <div className="p-3 bg-red-50 dark:bg-red-900/30 text-danger rounded-lg text-sm">{error}</div>}

      {showForm && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Enviar Duvida para Suporte</h3>
            <button onClick={() => { setShowForm(false); setForm({ subject: '', message: '', category: 'geral' }); }} className="text-gray-400 hover:text-gray-600">
              <AlertCircle size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Categoria</label>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="geral">Geral / Duvida</option>
                <option value="tecnico">Problema Tecnico</option>
                <option value="cobranca">Cobranca / Assinatura</option>
                <option value="sugestao">Sugestao / Melhoria</option>
                <option value="bug">Reportar Bug</option>
              </select>
            </div>
            <div>
              <label className="label">Assunto</label>
              <input type="text" className="input" placeholder="Resumo da sua duvida" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} required maxLength={100} />
            </div>
            <div>
              <label className="label">Mensagem</label>
              <textarea className="input" rows={5} placeholder="Descreva sua duvida ou problema com detalhes..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required maxLength={2000} />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => { setShowForm(false); setForm({ subject: '', message: '', category: 'geral' }); }} className="btn-secondary">Cancelar</button>
              <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2 disabled:opacity-50">
                {submitting ? 'Enviando...' : <><Send size={18} /> Enviar</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeDoc && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{docs.find(d => d.id === activeDoc)?.title}</h3>
            <button onClick={() => setActiveDoc(null)} className="text-gray-400 hover:text-gray-600">
              <AlertCircle size={20} />
            </button>
          </div>
          <div className="prose dark:prose-invert max-w-none text-sm">
            {activeDoc === 'manual' && (
              <>
                <h4>Manual do Usuario - FinanceApp</h4>
                <p>Guia completo com todas as funcionalidades:</p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li><strong>Dashboard:</strong> Visao geral com saldos, graficos e alertas</li>
                  <li><strong>Transacoes:</strong> Despesas, receitas, transferencias, parceladas, recorrentes</li>
                  <li><strong>Contas:</strong> Carteira, conta corrente, poupanca, investimento</li>
                  <li><strong>Cartoes de Credito:</strong> Faturas automaticas, limite disponivel, pagamento</li>
                  <li><strong>Orcamentos:</strong> Limites por categoria, alertas 80%/100%</li>
                  <li><strong>Metas:</strong> Progresso automatico, status ativo/pausado/concluido</li>
                  <li><strong>Relatorios:</strong> Fluxo de caixa, por categoria, patrimonio (Premium+)</li>
                  <li><strong>Categorias:</strong> Padrao do sistema + personalizadas</li>
                  <li><strong>Backup:</strong> Manual (Premium) / Automatico diario (PRO)</li>
                  <li><strong>Planos:</strong> Free (50 trans/mes), Premium (R$ 14,90), PRO (R$ 29,90)</li>
                </ul>
                <p className="mt-4 text-sm text-gray-500">Documento completo: MANUAL_USUARIO.md</p>
              </>
            )}
            {activeDoc === 'onboarding' && (
              <>
                <h4>Guia de Inicio Rapido</h4>
                <p>Configure sua conta em 4 passos:</p>
                <ol className="list-decimal list-inside space-y-3 mt-2">
                  <li><strong>Cadastro:</strong> Email/senha ou Google OAuth</li>
                  <li><strong>Nome:</strong> Como quer ser chamado no app</li>
                  <li><strong>Primeira conta:</strong> Tipo, nome, saldo inicial (vira conta principal)</li>
                  <li><strong>Primeira transacao:</strong> Opcional - receita ou despesa de exemplo</li>
                  <li><strong>Plano:</strong> Free, Premium ou PRO (pode pular e ficar no Free)</li>
                </ol>
                <p className="mt-4"><strong>Checklist primeira semana:</strong> Contas reais, cartoes, orcamentos, metas, relatorios, backup, convidar familia</p>
                <p className="mt-2 text-sm text-gray-500">Documento completo: GUIA_ONBOARDING.md</p>
              </>
            )}
            {activeDoc === 'faq' && (
              <>
                <h4>Perguntas Frequentes (Top 10)</h4>
                <dl className="space-y-4 mt-2">
                  <dt className="font-semibold">O app e gratis?</dt><dd className="text-gray-600 dark:text-gray-400">Sim, plano Free para sempre com limites.</dd>
                  <dt className="font-semibold">Funciona offline?</dt><dd className="text-gray-600 dark:text-gray-400">Sim como PWA instalado - visualiza e cria transacoes offline.</dd>
                  <dt className="font-semibold">Dados somem se trocar de celular?</dt><dd className="text-gray-600 dark:text-gray-400">Nao, tudo na nuvem. So logar no novo dispositivo.</dd>
                  <dt className="font-semibold">Como convido familia?</dt><dd className="text-gray-600 dark:text-gray-400">Master convida em Configuracoes &gt; Usuarios. Papel: Comum ou Admin.</dd>
                  <dt className="font-semibold">Limite de 50 transacoes no Free?</dt><dd className="text-gray-600 dark:text-gray-400">Fica somente leitura. Upgrade libera na hora.</dd>
                  <dt className="font-semibold">Backup no Free?</dt><dd className="text-gray-600 dark:text-gray-400">Nao. Premium: manual. PRO: automatico diario.</dd>
                  <dt className="font-semibold">Sincronizacao bancaria?</dt><dd className="text-gray-600 dark:text-gray-400">Nao na v1. Prevista para 2027 via Open Banking.</dd>
                  <dt className="font-semibold">Reembolso?</dt><dd className="text-gray-600 dark:text-gray-400">So anual nos 7 primeiros dias (CDC Art. 49).</dd>
                  <dt className="font-semibold">LGPD / Exclusao dados?</dt><dd className="text-gray-600 dark:text-gray-400">Configuracoes &gt; Dados e Privacidade &gt; Solicitar exclusao.</dd>
                </dl>
                <p className="mt-4 text-sm text-gray-500">100+ perguntas no documento completo: FAQ.md</p>
              </>
            )}
            {activeDoc === 'master' && (
              <>
                <h4>Guia do Usuario Master</h4>
                <p>Controle total do workspace:</p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li><strong>Dashboard Master:</strong> Metricas agregadas, alertas, atividade recente</li>
                  <li><strong>Usuarios:</strong> Convidar, ativar/desativar, alterar papel, redefinir senha, remover</li>
                  <li><strong>Assinatura:</strong> Upgrade/downgrade, cancelar, atualizar pagamento, grace period 30d</li>
                  <li><strong>Backups:</strong> Criar manual, restaurar (substitui tudo), pre-restore automatico</li>
                  <li><strong>Metricas:</strong> Volume financeiro, uso modulos, export PDF/CSV</li>
                  <li><strong>Cenarios:</strong> Convidar conjuge, filhos, contador, upgrade viagem, restore erro</li>
                </ul>
                <p className="mt-4 text-sm text-gray-500">Documento completo: GUIA_MASTER.md</p>
              </>
            )}
            {activeDoc === 'politicas' && (
              <>
                <h4>Politicas e Termos Principais</h4>
                <ul className="list-disc list-inside space-y-3 mt-2">
                  <li><strong>Termos de Uso:</strong> Elegibilidade 18+, uso licito, responsabilidade dados</li>
                  <li><strong>Privacidade (LGPD):</strong> Dados seus, nao vendidos, criptografia AES-256, direitos titular</li>
                  <li><strong>Cancelamento:</strong> 90 dias retencao somente leitura, depois arquivamento</li>
                  <li><strong>Downgrade:</strong> Dados preservados, grace period 30 dias, depois so leitura</li>
                  <li><strong>Inadimplencia:</strong> 3d bloqueio modulos, 10d cancelamento auto</li>
                  <li><strong>Reembolso:</strong> So plano anual nos 7 primeiros dias (CDC)</li>
                  <li><strong>SLA:</strong> Premium 99.5%, PRO 99.9%</li>
                  <li><strong>DPO:</strong> Lucas Silva - dpo@financeapp.com.br</li>
                </ul>
                <p className="mt-4 text-sm text-gray-500">Documento completo: POLITICAS.md</p>
              </>
            )}
          </div>
        </div>
      )}

      {!showForm && !activeDoc && (
        <>
          <div className="card">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Documentacao</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {docs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setActiveDoc(doc.id)}
                  className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary/50 bg-gray-50 dark:bg-gray-800/50 text-left transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                      <doc.icon size={20} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{doc.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{doc.desc}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {helpTickets.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Suas Solicitacoes</h3>
              <div className="space-y-3">
                {helpTickets.slice(0, 5).map((ticket) => (
                  <div key={ticket.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{ticket.subject}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {ticket.category} · {new Date(ticket.createdAt).toLocaleDateString('pt-BR')} ·{' '}
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            ticket.status === 'open' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                            ticket.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                            ticket.status === 'resolved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                            'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {ticket.status === 'open' ? 'Aberto' : ticket.status === 'in_progress' ? 'Em andamento' : ticket.status === 'resolved' ? 'Resolvido' : 'Fechado'}
                          </span>
                        </p>
                      </div>
                    </div>
                    {ticket.adminResponse && (
                      <div className="mt-2 p-2 bg-primary/5 rounded-lg border border-primary/20">
                        <p className="text-xs font-medium text-primary mb-1">Resposta do Suporte:</p>
                        <p className="text-xs text-gray-700 dark:text-gray-300">{ticket.adminResponse}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{new Date(ticket.respondedAt || ticket.updatedAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                    )}
                  </div>
                ))}
                {helpTickets.length > 5 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2">+ {helpTickets.length - 5} solicitacoes anteriores</p>
                )}
              </div>
            </div>
          )}

          {helpTickets.length === 0 && !helpTicketsLoading && (
            <div className="card text-center py-8">
              <MessageSquare size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">Nenhuma solicitacao enviada ainda</p>
              <button onClick={() => setShowForm(true)} className="btn-primary mt-4 inline-flex items-center gap-2">
                <MessageSquare size={18} />
                Enviar primeira duvida
              </button>
            </div>
          )}

          {helpTicketsLoading && (
            <div className="card text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">Carregando suas solicitacoes...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}