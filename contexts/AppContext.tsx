import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { CreditWallet, Subscription } from '../types';
import { verificarPermissao, gastarCredito, usarTrial, registrarHistorico } from '../lib/api';
import { supabase } from '../lib/supabase';
import UpgradeModal from '../components/ui/UpgradeModal';

interface AppContextType {
  wallet: CreditWallet | null;
  setWallet: (wallet: CreditWallet | null) => void;
  subscription: Subscription | null;
  setSubscription: (subscription: Subscription | null) => void;
  checkPermissionAndAct: (action: () => Promise<any>, actionType: 'criar_contrato' | 'assinatura' | 'orcamento') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wallet, setWallet] = useState<CreditWallet | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');

  const checkPermissionAndAct = useCallback(async (action: () => Promise<any>, actionType: 'criar_contrato' | 'assinatura' | 'orcamento') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Você precisa estar logado para realizar esta ação.");
      return;
    }

    const { permitido, motivo, modo } = await verificarPermissao(user.id, actionType);

    if (permitido) {
      // Execute the main action first
      const actionResult = await action();
      
      // Only debit if the action was successful
      if(actionResult && actionResult.error) {
        console.error("A ação principal falhou, o custo não será debitado.", actionResult.error);
        alert(`Ocorreu um erro: ${actionResult.error.message}`);
        return;
      }

      // Debit cost after successful action
      if (modo === 'trial') {
        const { data: updatedWallet } = await usarTrial(user.id);
        if (updatedWallet) setWallet(updatedWallet);
      } else if (modo === 'credito') {
        const { data: updatedWallet } = await gastarCredito(user.id, 1, `Uso para ${actionType}`);
        if (updatedWallet) setWallet(updatedWallet);
      }
      // If modo is 'plano_mensal', no debit is needed.
    } else {
      setUpgradeReason(motivo || "Você não tem permissão para realizar esta ação.");
      setIsUpgradeModalOpen(true);
      await registrarHistorico(user.id, null, 'tentativa_bloqueada', `Ação: ${actionType}, Motivo: ${motivo}`);
    }
  }, [wallet, subscription]);

  return (
    <AppContext.Provider value={{ wallet, setWallet, subscription, setSubscription, checkPermissionAndAct }}>
      {children}
      {isUpgradeModalOpen && (
        <UpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
          reason={upgradeReason}
        />
      )}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};