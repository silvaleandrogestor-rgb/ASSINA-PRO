import React from 'react';
import Card from '../components/ui/Card';
import { ShieldCheck } from 'lucide-react';

const AssinaturasPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-soft-black mb-6">Minhas Assinaturas e Planos</h1>
      <Card>
        <div className="flex flex-col items-center text-center">
            <ShieldCheck size={48} className="text-brand-green mb-4" />
            <h2 className="text-xl font-bold text-soft-black">Gerenciamento de Planos</h2>
            <p className="text-gray-600 mt-2 max-w-md">
                Em breve, aqui você poderá gerenciar sua assinatura mensal, visualizar o histórico de pagamentos e alterar seu plano.
            </p>
        </div>
      </Card>
    </div>
  );
};

export default AssinaturasPage;
