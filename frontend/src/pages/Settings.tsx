import { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { useTheme } from '../components/ThemeProvider';
import { roleLabels, translateLabel } from '../lib/translations';
import { Settings as SettingsIcon, Lock, Palette, LogOut, Save, Shield, Puzzle, ArrowLeftRight, Wallet, CreditCard, Tag, PieChart, Target, FileText, Briefcase,
  Car, Laptop, Code, Camera, Dumbbell, Scissors, Sparkles,
  Heart, Scale, Calculator, BookOpen, Stethoscope, Activity,
  ShoppingBag, Truck, ChefHat, Zap, Droplets, Hammer,
  Flower2, Brain, Apple, Ruler, Globe, MessageCircle
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
                  onClick={async () => { await logout(); window.location.href = '/login'; }}
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

