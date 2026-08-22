import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Wallet, 
  CreditCard, 
  Tag, 
  PieChart, 
  Target,
  Crown,
  Shield,
  LogOut,
  Menu,
  X,
  User,
  FileText,
  Settings,
  Users,
  BarChart3,
  History,
  UserCog,
  MessageSquare,
  Lock,
  Banknote,
  Bell,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../lib/api';

const userNavItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/accounts', label: 'Contas', icon: Wallet },
  { path: '/categories', label: 'Categorias', icon: Tag },
  { path: '/transactions', label: 'Transacoes', icon: ArrowLeftRight },
  { path: '/cards', label: 'Cartoes', icon: CreditCard },
  { path: '/budgets', label: 'Orcamentos', icon: PieChart },
  { path: '/goals', label: 'Metas', icon: Target },
  { path: '/reports', label: 'Relatorios', icon: FileText },
  { path: '/subscription', label: 'Assinatura', icon: CreditCard },
  { path: '/settings', label: 'Configuracoes', icon: Settings },
];

const adminNavItems = [
  { path: '/admin?tab=overview', label: 'Visao Geral', icon: BarChart3 },
  { path: '/admin?tab=financeiro', label: 'Financeiro', icon: Banknote },
  { path: '/admin?tab=report', label: 'Relatorios', icon: FileText },
  { path: '/admin?tab=users', label: 'Usuarios', icon: Users },
  { path: '/admin?tab=transactions', label: 'Transacoes', icon: ArrowLeftRight },
  { path: '/admin?tab=accounts', label: 'Contas', icon: Wallet },
  { path: '/admin?tab=cards', label: 'Cartoes', icon: CreditCard },
  { path: '/admin?tab=categories', label: 'Categorias', icon: Tag },
  { path: '/admin?tab=budgets', label: 'Orcamentos', icon: PieChart },
  { path: '/admin?tab=goals', label: 'Metas', icon: Target },
  { path: '/admin?tab=logs', label: 'Auditoria', icon: History },
  { path: '/admin?tab=help', label: 'Suporte', icon: MessageSquare },
  { path: '/admin?tab=admins', label: 'Gerenciar Admins', icon: UserCog },
  { path: '/admin?tab=configs', label: 'Configuracoes', icon: Settings },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, enabledModules, fetchProfile } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [billingReminder, setBillingReminder] = useState<{ daysUntilDue: number; dueDate: string; planName: string } | null>(null);
  const [reminderDismissed, setReminderDismissed] = useState(false);

  useEffect(() => {
    if (user) fetchProfile();
  }, [location.pathname]);

  useEffect(() => {
    if (!user || user.globalRole === 'platform_admin') return;
    api.get('/subscriptions/reminder')
      .then(({ data }) => { if (data.show) setBillingReminder(data); })
      .catch(() => {});
  }, []);

  const isAdmin = user?.globalRole === 'platform_admin';

  const getNavItems = () => {
    if (isAdmin) {
      const isSuper = user?.email === 'cezar.lucena27@gmail.com';
      let allowedPanels: string[] = [];
      try {
        if (isSuper) {
          return adminNavItems;
        }
        if (!user?.adminPanels || user.adminPanels === 'all') {
          return adminNavItems.filter((item) => item.path.split('tab=')[1] !== 'admins');
        }
        allowedPanels = JSON.parse(user.adminPanels || '[]');
      } catch {
        return adminNavItems.filter((item) => item.path.split('tab=')[1] !== 'admins');
      }
      return adminNavItems.filter((item) => {
        const tab = item.path.split('tab=')[1];
        if (tab === 'admins') return false;
        return allowedPanels.includes(tab);
      });
    }
    return [
      userNavItems[0],
      ...userNavItems.slice(1, -1).filter((item) => {
        const moduleId = item.path.replace('/', '');
        if (item.path === '/subscription' && user?.role === 'member') return false;
        return enabledModules.includes(moduleId);
      }),
      ...(user?.role === 'master' ? [{ path: '/master', label: 'Painel Mestre', icon: Crown }] : []),

      userNavItems[userNavItems.length - 1],
    ];
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (user?.subscriptionBlocked && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <div className="card max-w-md w-full text-center p-8">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock size={32} className="text-danger" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Conta bloqueada</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Bloqueado por falta de pagamento.
          </p>
          {user?.accessUntil && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Acesso liberado ate:{' '}
              {new Date(user.accessUntil).toLocaleDateString('pt-BR')}
            </p>
          )}
          <button onClick={handleLogout} className="btn-primary w-full">
            Sair
          </button>
        </div>
      </div>
    );
  }

  const handleNavClick = (path: string) => {
    setSidebarOpen(false);
    if (path.includes('?')) {
      const [base, query] = path.split('?');
      const params = new URLSearchParams(query);
      const tab = params.get('tab');
      navigate(base, { state: { tab } });
    } else {
      navigate(path);
    }
  };

  return (
    <div className="min-h-screen flex">
      {billingReminder && !reminderDismissed && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-yellow-400 dark:bg-yellow-500 text-gray-900 px-4 py-2.5 flex items-center justify-center gap-3 shadow-md">
          <Bell size={18} className="shrink-0" />
          <p className="text-sm font-medium text-center">
            {billingReminder.daysUntilDue === 0
              ? `Seu pagamento vence HOJE! Nao esqueca de realizar o pagamento do ${billingReminder.planName}.`
              : `Faltam ${billingReminder.daysUntilDue} dias para o vencimento da sua assinatura (${new Date(billingReminder.dueDate).toLocaleDateString('pt-BR')}). Nao esqueca de realizar o pagamento!`}
          </p>
          <button onClick={() => setReminderDismissed(true)} className="absolute right-3 hover:opacity-70">
            <X size={18} />
          </button>
        </div>
      )}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
        transform transition-transform duration-200 ease-in-out
        flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        overflow-hidden
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-xl font-bold text-primary">
              {isAdmin ? 'FinanceApp Admin' : 'FinanceApp'}
            </h1>
            <button 
              className="lg:hidden text-gray-600 dark:text-gray-400"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {isAdmin && (
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
                <Shield size={16} className="text-primary" />
                <span className="text-sm font-medium text-primary">Modo Administrador</span>
              </div>
            </div>
          )}

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto" aria-label="Navegação principal">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isCurrentPage = item.path.includes('?')
                ? location.pathname === item.path.split('?')[0] && location.search.includes(item.path.split('?')[1])
                : location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left
                    ${isCurrentPage 
                      ? 'bg-primary text-white' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}
                    truncate
                  `}
                >
                  <Icon size={20} className="flex-shrink-0" aria-hidden="true" />
                  <span className="font-medium truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <header className="lg:hidden flex items-center h-16 px-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <Menu size={24} />
          </button>
          <h1 className="ml-3 text-xl font-bold text-primary truncate">
            {isAdmin ? 'FinanceApp Admin' : 'FinanceApp'}
          </h1>
        </header>

        <main className={`flex-1 overflow-auto min-w-0 ${billingReminder && !reminderDismissed ? 'pt-11' : ''}`}>
          <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
