import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertTriangle, KeyRound } from 'lucide-react';
import api from '../lib/api';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setResult(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao recuperar senha');
    }
    setLoading(false);
  };

  if (result?.isMaster) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <div className="w-full max-w-md text-center">
          <CheckCircle size={64} className="mx-auto mb-4 text-success" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Senha redefinida</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{result.message}</p>
          <div className="card mb-4">
            <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
              <KeyRound size={16} />
              <span className="text-sm">Sua nova senha</span>
            </div>
            <p className="text-2xl font-bold text-primary break-all">{result.tempPassword}</p>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Copie a senha e use para entrar. Recomendamos altera-la depois em Configuracoes.</p>
          <Link to="/login" className="btn-primary inline-block">Ir para o login</Link>
        </div>
      </div>
    );
  }

  if (result) {
    const isError = !result.registered || !result.active;
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <div className="w-full max-w-md text-center">
          <AlertTriangle size={64} className={`mx-auto mb-4 ${isError ? 'text-danger' : 'text-warning'}`} />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{result.registered ? (result.active === false ? 'Conta desativada' : 'Conta comum') : 'Email nao encontrado'}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{result.message}</p>
          <Link to="/login" className="text-primary font-medium hover:underline">Voltar ao login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <Mail size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Recuperar senha</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Informe o email cadastrado no sistema</p>
        </div>

        <div className="card">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 text-danger rounded-lg text-sm">{error}</div>
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
                placeholder="seu@email.com"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? 'Verificando...' : 'Recuperar senha'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <Link to="/login" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
              <ArrowLeft size={14} />
              Voltar ao login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}