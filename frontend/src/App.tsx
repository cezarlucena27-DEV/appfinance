import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useStore } from './store/useStore';
import { ThemeProvider } from './components/ThemeProvider';
import api from './lib/api';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Accounts } from './pages/Accounts';
import { Cards } from './pages/Cards';
import { Categories } from './pages/Categories';
import { Budgets } from './pages/Budgets';
import { Goals } from './pages/Goals';
import { MasterDashboard } from './pages/MasterDashboard';
import { Onboarding } from './pages/Onboarding';
import { Subscription } from './pages/Subscription';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Admin } from './pages/Admin';
import { NotFound } from './pages/NotFound';
import { ForgotPassword } from './pages/ForgotPassword';
import { Layout } from './components/Layout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const user = useStore((state) => state.user);
  const authLoading = useStore((state) => state.authLoading);
  const location = useLocation();
  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950"><div className="text-gray-500 dark:text-gray-400">Carregando...</div></div>;
  if (!user) return <Navigate to="/login" />;
  if (!user.onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" />;
  }
  return <>{children}</>;
}

function MasterRoute({ children }: { children: React.ReactNode }) {
  const user = useStore((state) => state.user);
  if (user?.role === 'member') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function Heartbeat() {
  const user = useStore((state) => state.user);

  useEffect(() => {
    if (!user) return;
    const ping = () => { api.post('/auth/heartbeat').catch(() => {}); };
    ping();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') ping();
    }, 60000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') ping();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [user?.id]);

  return null;
}

function App() {
  const checkAuth = useStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <ThemeProvider>
      <Heartbeat />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin" element={
            <PrivateRoute><Layout /></PrivateRoute>
          }>
            <Route index element={<Admin />} />
          </Route>
          <Route path="/onboarding" element={
            <PrivateRoute><Onboarding /></PrivateRoute>
          } />
          <Route path="/" element={
            <PrivateRoute><Layout /></PrivateRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="accounts" element={<Accounts />} />
            <Route path="cards" element={<Cards />} />
            <Route path="categories" element={<Categories />} />
            <Route path="budgets" element={<Budgets />} />
            <Route path="goals" element={<Goals />} />
            <Route path="master" element={<MasterDashboard />} />
            <Route path="subscription" element={<MasterRoute><Subscription /></MasterRoute>} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
