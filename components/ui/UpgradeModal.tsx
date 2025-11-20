import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './Card';
import Button from './Button';
import { Zap, X } from 'lucide-react';
import { iniciarCheckoutPagSeguro } from '../../lib/api';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: string;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, reason }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckout = async (type: 'mensal' | 'creditos') => {
    onClose();
    if (type === 'mensal') {
      await iniciarCheckoutPagSeguro('mensal', 29.90, 'Assinatura Mensal AssinaPro');
    } else {
      await iniciarCheckoutPagSeguro('creditos', 39.90, 'Pacote de 5 Créditos Avulsos AssinaPro');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4">
      <Card className="max-w-md w-full text-center relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
            <X size={20} />
        </button>
        <Zap size={48} className="mx-auto text-amber-500" />
        <h2 className="text-2xl font-bold mt-4 text-soft-black">Faça um Upgrade</h2>
        <p className="text-gray-600 mt-2 mb-6">
          {reason === 'upgrade' 
            ? 'Seu período de teste acabou ou você não tem créditos suficientes. Assine um plano ou compre créditos para continuar.'
            : reason}
        </p>
        <div className="space-y-3">
            <Button onClick={() => handleCheckout('mensal')} size="lg" className="w-full">
            Assinatura mensal ilimitada
            </Button>
            <Button onClick={() => handleCheckout('creditos')} size="lg" variant="secondary" className="w-full">
            Comprar créditos avulsos
            </Button>
        </div>
      </Card>
    </div>
  );
};

export default UpgradeModal;