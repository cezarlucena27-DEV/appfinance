import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Wallet, Eye, EyeOff, MailCheck } from 'lucide-react';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [codeInfo, setCodeInfo] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const register = useStore((state) => state.register);
  const navigate = useNavigate();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const startCooldown = () => {
    setCooldown(60);
    timerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1 && timerRef.current) clearInterval(timerRef.current);
        return c - 1;
      });
    }, 1000);
  };

  const handleSendCode = async () => {
    setError('');
    setCodeInfo('');
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError('Digite um e-mail valido para receber o codigo');
      return;
    }
    setSendingCode(true);
    try {
      const api = (await import('../lib/api')).default;
      const { data } = await api.post('/auth/verify-email/send', { email: email.trim().toLowerCase() });
      setCodeSent(true);
      startCooldown();
      setCodeInfo(
        data.channel === 'fallback'
          ? `Modo fallback (SMTP nao configurado). Codigo: ${data.devCode}`
          : 'Codigo enviado! Verifique sua caixa de entrada (e spam).',
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao enviar codigo');
    } finally {
      setSendingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(name, email.trim().toLowerCase(), password, code);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <Wallet size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">FinanceApp</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Comece a controlar suas financas</p>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Criar conta</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-danger rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Nome</label>
              <input
                type="text"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="label">E-mail</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  className="input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={sendingCode || cooldown > 0}
                  className="btn-secondary whitespace-nowrap text-sm shrink-0"
                  title="Enviar codigo de verificacao para este e-mail"
                >
                  {cooldown > 0 ? `${cooldown}s` : sendingCode ? 'Enviando...' : codeSent ? 'Reenviar' : 'Enviar codigo'}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Codigo de verificacao</label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  className="input pr-10 tracking-[8px] font-mono"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  required
                />
                <MailCheck size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              </div>
              {codeInfo && (
                <p className={`text-xs mt-1 ${codeInfo.startsWith('Modo fallback') ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                  {codeInfo}
                </p>
              )}
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
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Minimo 8 caracteres
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Criar conta'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Ja tem conta?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
