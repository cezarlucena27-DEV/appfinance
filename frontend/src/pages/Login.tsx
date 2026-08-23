import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import api from '../lib/api';
import { Wallet, Eye, EyeOff, AlertTriangle, X, HelpCircle, FileText, BookOpen, Copy, Check, Mail, ShieldCheck } from 'lucide-react';

type HelpTab = 'comprovante' | 'guias' | 'faq' | 'politicas';

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
    steps: [
      'Crie sua conta gratuita com nome, e-mail e senha.',
      'Cadastre suas contas bancarias/carteiras na aba Contas.',
      'Crie categorias personalizadas ou use as padroes.',
      'Registre sua primeira receita ou despesa em Transacoes.',
    ],
  },
  {
    title: 'Transacoes',
    steps: [
      'Nova transacao: escolha despesa, receita ou transferencia.',
      'Use transacoes recorrentes para contas fixas (aluguel, assinaturas).',
      'Despesas parceladas criam automaticamente as proximas parcelas.',
      'Anexe comprovantes nas transacoes (Premium/PRO).',
    ],
  },
  {
    title: 'Orcamentos e metas',
    steps: [
      'Defina limites de gasto por categoria em Orcamentos.',
      'Receba alertas ao atingir 80% e 100% do orcamento.',
      'Crie metas financeiras vinculadas a uma conta para acompanhar o progresso.',
    ],
  },
  {
    title: 'Relatorios e dashboard',
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => setHelpOpen(false)}>
          <div
            className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[88vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 p-5 border-b border-gray-200 dark:border-gray-700">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <FileText size={22} className="text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Central de Ajuda</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Estamos aqui para ajudar</p>
              </div>
              <button onClick={() => setHelpOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0">
                <X size={20} />
              </button>
            </div>

            <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
              {([
                { id: 'guias', label: 'Guias', icon: BookOpen },
                { id: 'faq', label: 'FAQ', icon: HelpCircle },
                { id: 'politicas', label: 'Políticas', icon: ShieldCheck },
                { id: 'comprovante', label: 'Comprovante', icon: FileText },
              ] as const).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setHelpTab(id)}
                  className={`shrink-0 px-5 flex items-center justify-center gap-1.5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    helpTab === id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon size={15} />
                  {label}
                </button>
              ))}
            </div>

            <div className="p-5 overflow-y-auto text-base text-gray-700 dark:text-gray-300">
              {helpTab === 'comprovante' && (
                <div className="space-y-5">
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100">Liberar meu acesso</h4>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Se o seu acesso estiver temporariamente bloqueado, envie o comprovante de pagamento para nossa equipe analisar.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      'Realize o pagamento via PIX usando a chave abaixo',
                      'Envie o comprovante para a equipe financeira',
                      'Aguarde a confirmacao - o acesso sera liberado em seguida',
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span className="pt-1">{step}</span>
                      </div>
                    ))}
                  </div>

                  {paymentInfo.pixKey && (
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2">
                      <div className="min-w-0">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Chave PIX</p>
                        <p className="font-mono font-medium text-gray-900 dark:text-gray-100 truncate">{paymentInfo.pixKey}</p>
                      </div>
                      <button
                        onClick={copyPixKey}
                        className="ml-auto shrink-0 flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>
                  )}

                  <div>
                    {hasFinanceEmail ? (
                      <>
                        <a
                          href={mailtoHref}
                          className="w-full btn-primary flex items-center justify-center gap-2 no-underline"
                        >
                          <Mail size={16} />
                          Enviar comprovante
                        </a>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                          O comprovante sera enviado para a equipe financeira
                        </p>
                      </>
                    ) : (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-center">
                        <p className="font-medium text-gray-900 dark:text-gray-100">Enviar comprovante</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Apos o pagamento, entre em contato com o <strong>administrador</strong> do sistema para enviar o comprovante e liberar seu acesso.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {helpTab === 'guias' && (
                <div className="space-y-4">
                  {GUIAS.map((guia) => (
                    <div key={guia.title}>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1.5">{guia.title}</h4>
                      <ul className="space-y-1 ml-1">
                        {guia.steps.map((step, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-primary shrink-0">{i + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {helpTab === 'politicas' && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1.5 flex items-center gap-1.5">
                      <ShieldCheck size={15} className="text-primary" /> Privacidade e seguranca
                    </h4>
                    <ul className="space-y-1 ml-1 list-disc list-inside">
                      <li>Seus dados sao protegidos com criptografia em transito (TLS) e em repouso.</li>
                      <li>Senhas sao armazenadas com hash bcrypt — ninguem tem acesso a elas, nem a equipe.</li>
                      <li>Nao vendemos nem compartilhamos seus dados com terceiros para marketing.</li>
                      <li>Em conformidade com a LGPD: voce pode exportar ou solicitar a exclusao dos seus dados quando quiser.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1.5">Termos de uso</h4>
                    <ul className="space-y-1 ml-1 list-disc list-inside">
                      <li>Cada cadastro cria um workspace individual vinculado ao seu e-mail.</li>
                      <li>O plano Free e gratuito; planos pagos renovam automaticamente ate o cancelamento.</li>
                      <li>Ao cancelar, o acesso aos recursos pagos permanece ate o fim do periodo ja pago.</li>
                      <li>Uso indevido do sistema (fraude, tentativa de invasao) implica bloqueio da conta.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1.5">Informacoes e suporte</h4>
                    <ul className="space-y-1 ml-1 list-disc list-inside">
                      <li>Financeiro/pagamentos: use a aba Comprovante da Central de Ajuda</li>
                      <li>Atendimento em horario comercial: seg-sex, 9h as 18h</li>
                      <li>Pagamentos processados pelo Asaas — seus dados de cartao nunca passam pelos nossos servidores</li>
                      <li>Duvidas rapidas: veja a aba FAQ ou os Guias</li>
                    </ul>
                  </div>
                </div>
              )}

              {helpTab === 'faq' && (
                <div className="space-y-2">
                  {FAQ_ITEMS.map((item, i) => (
                    <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-center justify-between gap-2 p-3 text-left font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        {item.q}
                        <span className={`text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>▾</span>
                      </button>
                      {openFaq === i && (
                        <p className="px-3 pb-3 text-gray-600 dark:text-gray-400">{item.a}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
              <Link
                to="/forgot-password"
                onClick={() => setHelpOpen(false)}
                className="inline-flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
              >
                Nao consegue acessar? Recuperar conta
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
