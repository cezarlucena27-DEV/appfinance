import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import api from '../lib/api';
import { Wallet, Eye, EyeOff, AlertTriangle, X, HelpCircle, FileText, BookOpen, Copy, Check, Mail, ShieldCheck, Rocket, ArrowLeftRight, Target, BarChart3, LifeBuoy, ChevronDown, KeyRound } from 'lucide-react';

type HelpTab = 'guias' | 'faq' | 'politicas' | 'comprovante';

const HELP_TABS = [
  { id: 'guias', label: 'Guias', icon: BookOpen },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
  { id: 'politicas', label: 'Politicas', icon: ShieldCheck },
  { id: 'comprovante', label: 'Comprovante', icon: FileText },
] as const;

const GUIA_ICONS = { Rocket, ArrowLeftRight, Target, BarChart3 };

const FAQ_ITEMS = [
  {
    q: 'O FinanceApp e gratuito?',
    a: 'Sim! O plano Free e gratis para sempre (ate 50 transacoes/mes). Os planos Premium (R$ 29,90/mes) e PRO (R$ 49,90/mes) liberam mais contas, usuarios e recursos avancados.',
  },
  {
    q: 'Esqueci minha senha. E agora?',
    a: 'Na tela de login clique em "Esqueci minha senha" e informe seu e-mail de cadastro. Voce recebera um link para criar uma nova senha.',
  },
  {
    q: 'Meus pagamentos estao em dia mas o acesso esta bloqueado',
    a: 'Envie o comprovante de pagamento para o financeiro (aba Comprovante) informando o e-mail do seu cadastro. O acesso sera liberado assim que confirmado.',
  },
  {
    q: 'Funciona no celular?',
    a: 'Sim! O sistema e 100% responsivo. Acesse pelo navegador do celular com o mesmo login usado no computador.',
  },
  {
    q: 'Quantas contas posso cadastrar?',
    a: 'Free: 1 conta | Premium: 3 contas | PRO: ilimitado. O mesmo vale para usuarios convidados no workspace.',
  },
  {
    q: 'Como cancelo minha assinatura?',
    a: 'Logado, va em Assinatura e clique em Cancelar. O acesso aos recursos pagos permanece ate o fim do periodo ja pago.',
  },
];

const GUIAS = [
  {
    title: 'Primeiros passos',
    icon: 'Rocket',
    steps: [
      'Crie sua conta gratuita com nome, e-mail e senha.',
      'Cadastre suas contas bancarias/carteiras na aba Contas.',
      'Crie categorias personalizadas ou use as padroes.',
      'Registre sua primeira receita ou despesa em Transacoes.',
    ],
  },
  {
    title: 'Transacoes',
    icon: 'ArrowLeftRight',
    steps: [
      'Nova transacao: escolha despesa, receita ou transferencia.',
      'Use transacoes recorrentes para contas fixas (aluguel, assinaturas).',
      'Despesas parceladas criam automaticamente as proximas parcelas.',
      'Anexe comprovantes nas transacoes (Premium/PRO).',
    ],
  },
  {
    title: 'Orcamentos e metas',
    icon: 'Target',
    steps: [
      'Defina limites de gasto por categoria em Orcamentos.',
      'Receba alertas ao atingir 80% e 100% do orcamento.',
      'Crie metas financeiras vinculadas a uma conta para acompanhar o progresso.',
    ],
  },
  {
    title: 'Relatorios e dashboard',
    icon: 'BarChart3',
    steps: [
      'Acompanhe saldo consolidado e fluxo de caixa no Dashboard.',
      'Analise despesas por categoria em graficos nos Relatorios.',
      'Premium/PRO: relatorios avancados e exportacao PDF.',
    ],
  },
];

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpTab, setHelpTab] = useState<HelpTab>('guias');
  const [paymentInfo, setPaymentInfo] = useState<{ pixKey: string; financeEmail: string }>({ pixKey: '', financeEmail: '' });
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const login = useStore((state) => state.login);
  const navigate = useNavigate();

  useEffect(() => {
    const msg = sessionStorage.getItem('loginError');
    if (msg) {
      sessionStorage.removeItem('loginError');
      setError(msg);
    }
  }, []);

  useEffect(() => {
    if (helpOpen && !paymentInfo.pixKey) {
      api
        .get('/public/payment-info')
        .then(({ data }) => setPaymentInfo(data))
        .catch(() => {});
    }
  }, [helpOpen, paymentInfo.pixKey]);

  const copyPixKey = async () => {
    try {
      await navigator.clipboard.writeText(paymentInfo.pixKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  const hasFinanceEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paymentInfo.financeEmail);
  const mailtoHref = `mailto:${paymentInfo.financeEmail}?subject=${encodeURIComponent('Comprovante de pagamento - FinanceApp')}&body=${encodeURIComponent(`Ola!\n\nSegue em anexo o comprovante do pagamento.\n\nE-mail do cadastro: ${email}\nPlano: \nValor pago: R$ \nData do pagamento: \n\nObrigado!`)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <button
        type="button"
        onClick={() => setHelpOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-1.5 bg-primary text-white py-4 px-2 rounded-l-xl shadow-lg hover:bg-primary/90 transition-colors"
        title="Central de Ajuda"
      >
        <HelpCircle size={20} />
        <span className="text-xs font-medium" style={{ writingMode: 'vertical-rl' }}>Ajuda</span>
      </button>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <Wallet size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">FinanceApp</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Controle suas financas</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Entrar</h2>
          
{error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-danger rounded-lg text-sm flex items-start gap-2">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">E-mail</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          <div className="text-right -mt-2">
              <Link to="/forgot-password" className="text-sm text-primary font-medium hover:underline">
                Esqueci minha senha
              </Link>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Nao tem conta?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Criar conta
            </Link>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setHelpOpen(true)}
          className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
        >
          <HelpCircle size={16} />
          Precisa de ajuda? Comprovante, guias e FAQ
        </button>
      </div>

      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4" onClick={() => setHelpOpen(false)}>
          <div
            className="bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabecalho */}
            <div className="relative bg-gradient-to-br from-primary/15 via-primary/5 to-transparent px-5 sm:px-6 pt-6 pb-4">
              <button
                onClick={() => setHelpOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
              <div className="flex items-center gap-4 pr-10">
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shrink-0">
                  <HelpCircle size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Central de Ajuda</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Estamos aqui para ajudar</p>
                </div>
              </div>

              {/* Abas tipo pill */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                {HELP_TABS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setHelpTab(id)}
                    className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-sm font-medium transition-all ${
                      helpTab === id
                        ? 'bg-primary text-white shadow'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={15} />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Conteudo */}
            <div className="px-4 sm:px-6 py-5 overflow-y-auto text-base text-gray-700 dark:text-gray-300 space-y-4">

              {helpTab === 'guias' && GUIAS.map((guia) => {
                const GuiaIcon = GUIA_ICONS[guia.icon as keyof typeof GUIA_ICONS] || BookOpen;
                return (
                  <div key={guia.title} className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <GuiaIcon size={19} className="text-primary" />
                      </div>
                      <h4 className="font-semibold text-base text-gray-900 dark:text-gray-100">{guia.title}</h4>
                    </div>
                    <ol className="space-y-3 ml-[19px] border-l-2 border-gray-100 dark:border-gray-700">
                      {guia.steps.map((step, i) => (
                        <li key={i} className="pl-4 relative">
                          <span className="absolute -left-[11px] top-0.5 w-[18px] h-[18px] rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                            {i + 1}
                          </span>
                          <span className="text-sm leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                );
              })}

              {helpTab === 'comprovante' && (
                <>
                  <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-4 sm:p-5 text-center">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100">Liberar meu acesso</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                      Se o seu acesso estiver temporariamente bloqueado, envie o comprovante de pagamento para nossa equipe analisar.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3">Como funciona</p>
                    <ol className="space-y-3 ml-[19px] border-l-2 border-gray-100 dark:border-gray-700">
                      {[
                        'Realize o pagamento via PIX usando a chave abaixo',
                        'Envie o comprovante para a equipe financeira',
                        'Aguarde a confirmacao - o acesso sera liberado em seguida',
                      ].map((step, i) => (
                        <li key={i} className="pl-4 relative">
                          <span className="absolute -left-[11px] top-0.5 w-[18px] h-[18px] rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                            {i + 1}
                          </span>
                          <span className="text-sm leading-relaxed">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {paymentInfo.pixKey && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-400 mb-0.5">Chave PIX</p>
                        <p className="font-mono font-medium text-gray-900 dark:text-gray-100 truncate text-sm sm:text-base">{paymentInfo.pixKey}</p>
                      </div>
                      <button
                        onClick={copyPixKey}
                        className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                          copied
                            ? 'bg-green-600 text-white'
                            : 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-700'
                        }`}
                      >
                        {copied ? <Check size={15} /> : <Copy size={15} />}
                        {copied ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  )}

                  {hasFinanceEmail ? (
                    <div>
                      <a href={mailtoHref} className="w-full btn-primary flex items-center justify-center gap-2 no-underline py-3">
                        <Mail size={16} />
                        Enviar comprovante
                      </a>
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                        O comprovante sera enviado para a equipe financeira
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 sm:p-5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 mx-auto flex items-center justify-center mb-2">
                        <LifeBuoy size={20} className="text-blue-600 dark:text-blue-300" />
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">Enviar comprovante</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                        Apos o pagamento, entre em contato com o <strong>administrador</strong> do sistema para enviar o comprovante e liberar seu acesso.
                      </p>
                    </div>
                  )}
                </>
              )}

              {helpTab === 'politicas' && (
                <>
                  {[
                    {
                      icon: ShieldCheck,
                      title: 'Privacidade e seguranca',
                      items: [
                        'Seus dados sao protegidos com criptografia em transito (TLS) e em repouso.',
                        'Senhas sao armazenadas com hash bcrypt — ninguem tem acesso a elas, nem a equipe.',
                        'Nao vendemos nem compartilhamos seus dados com terceiros para marketing.',
                        'Em conformidade com a LGPD: voce pode exportar ou solicitar a exclusao dos seus dados quando quiser.',
                      ],
                    },
                    {
                      icon: FileText,
                      title: 'Termos de uso',
                      items: [
                        'Cada cadastro cria um workspace individual vinculado ao seu e-mail.',
                        'O plano Free e gratuito; planos pagos renovam automaticamente ate o cancelamento.',
                        'Ao cancelar, o acesso aos recursos pagos permanece ate o fim do periodo ja pago.',
                        'Uso indevido do sistema (fraude, tentativa de invasao) implica bloqueio da conta.',
                      ],
                    },
                    {
                      icon: LifeBuoy,
                      title: 'Informacoes e suporte',
                      items: [
                        'Financeiro/pagamentos: use a aba Comprovante da Central de Ajuda',
                        'Atendimento em horario comercial: seg-sex, 9h as 18h',
                        'Pagamentos processados pelo Asaas — seus dados de cartao nunca passam pelos nossos servidores',
                        'Duvidas rapidas: veja a aba FAQ ou os Guias',
                      ],
                    },
                  ].map((sec) => (
                    <div key={sec.title} className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <sec.icon size={19} className="text-primary" />
                        </div>
                        <h4 className="font-semibold text-base text-gray-900 dark:text-gray-100">{sec.title}</h4>
                      </div>
                      <ul className="space-y-2">
                        {sec.items.map((item, i) => (
                          <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </>
              )}

              {helpTab === 'faq' && (
                <div className="space-y-2.5">
                  {FAQ_ITEMS.map((item, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-center justify-between gap-3 p-4 text-left font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        {item.q}
                        <ChevronDown size={18} className={`shrink-0 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                      </button>
                      {openFaq === i && (
                        <p className="px-4 pb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{item.a}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rodape */}
            <div className="px-6 py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 text-center">
              <Link
                to="/forgot-password"
                onClick={() => setHelpOpen(false)}
                className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
              >
                <KeyRound size={15} />
                Nao consegue acessar? Recuperar conta
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
