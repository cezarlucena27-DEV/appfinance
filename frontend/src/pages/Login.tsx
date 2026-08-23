import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import api from '../lib/api';
import { Wallet, Eye, EyeOff, AlertTriangle, X, HelpCircle, FileText, BookOpen, Copy, Check, Mail, ShieldCheck, Rocket, ArrowLeftRight, Target, BarChart3, LifeBuoy, ChevronDown, KeyRound, Upload, Loader2, Paperclip, CheckCircle2, Send, User as UserIcon } from 'lucide-react';

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
  const [receiptForm, setReceiptForm] = useState({ senderName: '', senderEmail: '', note: '' });
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptSending, setReceiptSending] = useState(false);
  const [receiptSent, setReceiptSent] = useState(false);
  const [receiptError, setReceiptError] = useState('');
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
    const text = paymentInfo.pixKey;
    if (!text) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // fallback para contextos nao seguros (http) onde navigator.clipboard nao existe
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  const receiptEmailValue = receiptForm.senderEmail !== '' ? receiptForm.senderEmail : email;

  const handleReceiptFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setReceiptFile(file);
    setReceiptError('');
  };

  const handleReceiptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!receiptFile) {
      setReceiptError('Selecione o arquivo do comprovante (JPG, PNG ou PDF)');
      return;
    }
    setReceiptError('');
    setReceiptSending(true);
    try {
      const fd = new FormData();
      fd.append('file', receiptFile);
      fd.append('senderName', receiptForm.senderName);
      fd.append('senderEmail', receiptEmailValue);
      fd.append('note', receiptForm.note);
      // fetch nativo garante multipart com boundary correto (axios pode
      // reutilizar o Content-Type application/json default da instancia)
      const res = await fetch('/api/public/payment-receipts', { method: 'POST', body: fd });
      if (!res.ok) {
        let msg = '';
        try {
          const j = await res.json();
          msg = Array.isArray(j.message) ? j.message[0] : j.message || '';
        } catch {}
        throw new Error(msg || 'Erro ao enviar comprovante. Tente novamente.');
      }
      setReceiptSent(true);
    } catch (err: any) {
      setReceiptError(err?.message || 'Erro ao enviar comprovante. Tente novamente.');
    } finally {
      setReceiptSending(false);
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
                        'Envie o comprovante pelo formulario no fim desta aba',
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

                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-400">Chave PIX</p>
                      <span className="text-[11px] text-green-700/70 dark:text-green-400/70 font-medium">Copia e cola no app do banco</span>
                    </div>
                    {paymentInfo.pixKey ? (
                      <>
                        <button
                          type="button"
                          onClick={copyPixKey}
                          className="w-full text-left bg-white dark:bg-green-900/40 border border-green-300 dark:border-green-700 rounded-lg px-4 py-3 hover:border-green-500 transition-colors group"
                          title="Clique para copiar"
                        >
                          <span className="block font-mono font-semibold text-gray-900 dark:text-gray-100 text-base sm:text-lg break-all select-all leading-snug">
                            {paymentInfo.pixKey}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={copyPixKey}
                          className={`mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm sm:text-base font-semibold transition-colors ${
                            copied
                              ? 'bg-green-600 text-white'
                              : 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-100 hover:bg-green-200 dark:hover:bg-green-700'
                          }`}
                        >
                          {copied ? <Check size={17} /> : <Copy size={17} />}
                          {copied ? 'Chave copiada!' : 'Copiar chave PIX'}
                        </button>
                      </>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
                        A chave PIX sera exibida aqui assim que o administrador configurar o pagamento.
                      </p>
                    )}
                  </div>

                  <div className="bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Upload size={19} className="text-primary" />
                      </div>
                      <h4 className="font-semibold text-base text-gray-900 dark:text-gray-100">Enviar comprovante</h4>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 ml-[52px] -mt-1">
                      Anexe a foto ou PDF do comprovante do PIX. A equipe administradora visualiza direto no painel.
                    </p>

                    {receiptSent ? (
                      <div className="text-center py-4">
                        <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 mx-auto flex items-center justify-center mb-3">
                          <CheckCircle2 size={26} className="text-green-600 dark:text-green-400" />
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">Comprovante enviado com sucesso!</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                          A equipe financeira vai analisar e liberar seu acesso em breve.
                        </p>
                        <button
                          type="button"
                          onClick={() => { setReceiptSent(false); setReceiptFile(null); setReceiptForm({ senderName: '', senderEmail: '', note: '' }); }}
                          className="mt-4 text-sm text-primary font-medium hover:underline"
                        >
                          Enviar outro comprovante
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleReceiptSubmit} className="space-y-3">
                        <div>
                          <label className="label">Seu nome</label>
                          <input
                            type="text"
                            className="input"
                            value={receiptForm.senderName}
                            onChange={(e) => setReceiptForm({ ...receiptForm, senderName: e.target.value })}
                            placeholder="Nome completo (opcional)"
                          />
                        </div>
                        <div>
                          <label className="label">E-mail do cadastro *</label>
                          <div className="relative">
                            <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <input
                              type="email"
                              required
                              className="input pl-9"
                              value={receiptEmailValue}
                              onChange={(e) => setReceiptForm({ ...receiptForm, senderEmail: e.target.value })}
                              placeholder="E-mail usado no sistema"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="label">Comprovante * <span className="font-normal text-gray-400">(JPG, PNG ou PDF ate 5MB)</span></label>
                          <label
                            htmlFor="receipt-file-input"
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                              receiptFile
                                ? 'border-green-400 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                                : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/60 hover:border-primary/60'
                            }`}
                          >
                            <Paperclip size={18} className={receiptFile ? 'text-green-600 dark:text-green-400 shrink-0' : 'text-gray-400 shrink-0'} />
                            <span className={`text-sm truncate ${receiptFile ? 'text-gray-900 dark:text-gray-100 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                              {receiptFile ? receiptFile.name : 'Toque para escolher o arquivo'}
                            </span>
                          </label>
                          <input
                            id="receipt-file-input"
                            type="file"
                            accept="image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf"
                            className="hidden"
                            onChange={handleReceiptFileChange}
                          />
                        </div>
                        <div>
                          <label className="label">Observacao</label>
                          <textarea
                            rows={2}
                            className="input resize-none"
                            value={receiptForm.note}
                            onChange={(e) => setReceiptForm({ ...receiptForm, note: e.target.value })}
                            placeholder="Ex: paguei o plano Premium hoje as 14h (opcional)"
                          />
                        </div>

                        {receiptError && (
                          <div className="p-2.5 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-danger rounded-lg text-xs flex items-start gap-2">
                            <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                            <span>{receiptError}</span>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={receiptSending || !receiptEmailValue}
                          className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {receiptSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                          {receiptSending ? 'Enviando...' : 'Enviar comprovante'}
                        </button>
                      </form>
                    )}
                  </div>

                  {hasFinanceEmail && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Prefere por e-mail?{' '}
                      <a href={mailtoHref} className="text-primary font-medium hover:underline inline-flex items-center gap-1">
                        <Mail size={13} />
                        Enviar para o financeiro
                      </a>
                    </p>
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
