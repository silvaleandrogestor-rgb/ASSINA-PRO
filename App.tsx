

import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import ContractsPage from './pages/ContractsPage';
import QuotesPage from './pages/QuotesPage';
import ImageEditorPage from './pages/ImageEditorPage';
import TranscriptionPage from './pages/TranscriptionPage';
import SettingsPage from './pages/SettingsPage';
import PublicSignaturePage from './pages/PublicSignaturePage';
import AppLayout from './components/layout/AppLayout';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import LoginPage from './pages/LoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';
import { salvarPerfilUsuario, atualizarUltimoAcesso, checkUserProfileExists, getCreditWallet, getAssinaturaAtiva, criarCarteiraInicial, iniciarCheckoutPagSeguro } from './lib/api';
import { AppProvider, useAppContext } from './contexts/AppContext';
import PlansPage from './pages/PlansPage';

const AppRoutes: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { setWallet, setSubscription } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthChange = async (event: string, session: Session | null) => {
      setSession(session);
      setLoading(true); // Start loading on any auth change

      // Fix: Handle session on both SIGNED_IN and INITIAL_SESSION events
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        const user = session.user;
        const profileExists = await checkUserProfileExists(user.id);
        
        if (!profileExists) {
            const fullName = user.user_metadata?.full_name || user.email;
            await salvarPerfilUsuario(user.id, { email: user.email!, nome: fullName! });
            await criarCarteiraInicial(user.id);
        } else {
            await atualizarUltimoAcesso(user.id);
        }
        
        const { data: wallet } = await getCreditWallet(user.id);
        const { data: activeSubscription } = await getAssinaturaAtiva(user.id);
        setWallet(wallet);
        setSubscription(activeSubscription);

        const pendingPlanJSON = localStorage.getItem('plano_pendente');
        if (pendingPlanJSON) {
            localStorage.removeItem('plano_pendente');
            const pendingPlan = JSON.parse(pendingPlanJSON);
            navigate('/planos'); // Redirect to checkout page to confirm
        } else {
             // On manual login or session restore, go to dashboard
            // FIX: The error on this line is resolved by the parent if-condition change.
            // This condition now correctly prevents navigation on initial session load.
            if (event !== 'INITIAL_SESSION') {
                 navigate('/dashboard');
            }
        }

      } else if (event === 'SIGNED_OUT') {
        setWallet(null);
        setSubscription(null);
        navigate('/');
      }
      setLoading(false);
    };
    
    // NOTE: Removed explicit getSession() call. 
    // onAuthStateChange handles the 'INITIAL_SESSION' event automatically upon initialization,
    // which simplifies the logic and prevents potential race conditions.

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        handleAuthChange(_event, session);
    });

    return () => subscription.unsubscribe();
  }, [setWallet, setSubscription, navigate]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><p className="text-lg font-semibold">Carregando...</p></div>;
  }

  return (
      <Routes>
        <Route path="/assinatura/:id" element={<PublicSignaturePage />} />
        <Route path="/termos-de-servico" element={<TermsOfServicePage />} />
        <Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />
        
        {session ? (
          <>
            <Route path="/planos" element={<PlansPage />} />
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="contratos" element={<ContractsPage />} />
              <Route path="orcamentos" element={<QuotesPage />} />
              <Route path="editor-imagem" element={<ImageEditorPage />} />
              <Route path="transcricao" element={<TranscriptionPage />} />
              <Route path="configuracoes" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" />} />
            </Route>
            <Route path="/login" element={<Navigate to="/dashboard" />} />
            <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
          </>
        ) : (
          <>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/redefinir-senha" element={<ResetPasswordPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
  );
};

const AppContent: React.FC = () => (
  <HashRouter>
    <AppRoutes />
  </HashRouter>
);

const App: React.FC = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;