import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="text-center">
        <AlertTriangle size={64} className="mx-auto mb-4 text-yellow-500" />
        <h1 className="text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Pagina nao encontrada</p>
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          <Home size={20} />
          Voltar ao inicio
        </Link>
      </div>
    </div>
  );
}
