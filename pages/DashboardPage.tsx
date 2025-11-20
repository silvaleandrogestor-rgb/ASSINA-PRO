
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { FileClock, CheckCircle, FileSignature, Sparkles, CreditCard, Zap, PlusCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getContratosPorStatus, getOrcamentosEnviadosCount, getUserProfile, getRecentHistory } from '../lib/api';
import { useAppContext } from '../contexts/AppContext';
import { HistoryItem } from '../types';
import FloatingChatWidget from '../components/ui/FloatingChatWidget';

const MetricCard: React.FC<{title: string, value: string, icon: React.ReactElement, color: string}> = ({ title, value, icon, color }) => (
    <Card className="flex items-start">
        <div className={`p-3 rounded-lg mr-4`} style={{backgroundColor: color + '1A'}}>
          <div style={{ color }}>{icon}</div>
        </div>
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-soft-black">{value}</p>
        </div>
    </Card>
);

const PlanStatusCard: React.FC = () => {
    const { wallet, subscription } = useAppContext();
    const navigate = useNavigate();

    if (subscription && subscription.status === 'ativo') {
        return (
             <Card className="flex items-start bg-green-50 border-green-200">
                <div className="p-3 rounded-lg mr-4 bg-green-100 text-green-500"><Zap /></div>
                <div>
                    <p className="text-green-600 text-sm font-medium">Status do Plano</p>
                    <p className="text-xl font-bold text-green-800">Plano Mensal Ativo</p>
                    <p className="text-sm text-green-700 mt-1">Você tem acesso ilimitado a todos os recursos.</p>
                </div>
            </Card>
        );
    }
    if (wallet?.trial_ativo) {
        return (
            <Card className="flex flex-col justify-between bg-amber-50 border-amber-200">
                <div>
                    <div className="flex items-start">
                        <div className="p-3 rounded-lg mr-4 bg-amber-100 text-amber-500"><Sparkles /></div>
                        <div>
                            <p className="text-amber-600 text-sm font-medium">Status do Plano</p>
                            <p className="text-xl font-bold text-amber-800">Período de Teste</p>
                        </div>
                    </div>
                    <p className="text-sm text-amber-700 mt-2">Você pode criar 1 contrato e 1 orçamento gratuitamente.</p>
                </div>
                <Button size="sm" className="w-full mt-4" onClick={() => navigate('/planos')}>Fazer Upgrade</Button>
            </Card>
        );
    }
    if (wallet && wallet.creditos > 0) {
         return (
             <Card className="flex flex-col justify-between">
                 <div>
                    <div className="flex items-start">
                        <div className="p-3 rounded-lg mr-4 bg-blue-100 text-blue-500"><CreditCard /></div>
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Status do Plano</p>
                            <p className="text-3xl font-bold text-soft-black">{wallet.creditos}</p>
                            <p className="text-sm text-gray-500">Créditos restantes</p>
                        </div>
                    </div>
                </div>
                <Button size="sm" variant="secondary" className="w-full mt-4" onClick={() => navigate('/planos')}>Comprar Mais Créditos</Button>
            </Card>
        );
    }
    
    return (
        <Card className="flex flex-col justify-between bg-red-100 border-red-300 text-red-800">
            <div>
                <p className="text-red-600 text-sm font-medium">Status do Plano</p>
                <p className="text-xl font-bold">Sem Acesso</p>
                <p className="text-sm text-red-700 mt-2">Seu trial acabou e você não tem créditos.</p>
            </div>
            <Button size="sm" className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white" onClick={() => navigate('/planos')}>Ver Planos</Button>
        </Card>
    );
};


const DashboardPage: React.FC = () => {
  const [metricsData, setMetricsData] = useState({
    pendingContracts: '0',
    signedContracts: '0',
    sentQuotes: '0',
  });
  const [userName, setUserName] = useState('');
  const [recentHistory, setRecentHistory] = useState<HistoryItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await getUserProfile(user.id);
        if (profile) setUserName(profile.nome?.split(' ')[0] || '');

        const { count: pendingCount } = await getContratosPorStatus(user.id, 'pending');
        const { count: signedCount } = await getContratosPorStatus(user.id, 'signed');
        const { count: quotesCount } = await getOrcamentosEnviadosCount(user.id);
        const { data: history } = await getRecentHistory(user.id);

        setMetricsData({
          pendingContracts: pendingCount?.toString() || '0',
          signedContracts: signedCount?.toString() || '0',
          sentQuotes: quotesCount?.toString() || '0',
        });

        if (history) {
            setRecentHistory(history);
        }
      }
    };
    fetchDashboardData();
  }, []);

  const metrics = [
    { title: 'Contratos Pendentes', value: metricsData.pendingContracts, icon: <FileClock />, color: '#F59E0B' },
    { title: 'Contratos Assinados', value: metricsData.signedContracts, icon: <CheckCircle />, color: '#10B981' },
    { title: 'Orçamentos Enviados', value: metricsData.sentQuotes, icon: <FileSignature />, color: '#3B82F6' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-soft-black mb-2">Olá, {userName || 'Usuário'}!</h1>
      <p className="text-gray-600 mb-8">Bem-vindo(a) de volta ao seu painel.</p>

        <div className="mb-8">
            <h2 className="text-xl font-bold text-soft-black mb-4">Ações Rápidas</h2>
            <div className="flex flex-wrap items-center gap-4">
                <Button onClick={() => navigate('/contratos')}>
                    <PlusCircle size={18} className="mr-2"/>
                    Criar Contrato
                </Button>
                <Button variant="secondary" onClick={() => navigate('/orcamentos')}>
                    <PlusCircle size={18} className="mr-2"/>
                    Gerar Orçamento
                </Button>
                 <Button variant="outline" onClick={() => navigate('/contratos')}>
                    <FileSignature size={18} className="mr-2"/>
                    Gerar Assinatura
                </Button>
            </div>
        </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {metrics.map(metric => (
          <MetricCard
            key={metric.title}
            {...metric}
          />
        ))}
      </div>

      <div className="mb-8">
          <PlanStatusCard />
      </div>

      <div className="mt-8">
        <Card>
            <h2 className="text-xl font-bold text-soft-black mb-4">Atividade Recente</h2>
            {recentHistory.length > 0 ? (
                <ul className="space-y-3">
                    {recentHistory.map(item => (
                        <li key={item.id} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50">
                            <div className="flex items-center">
                                <CheckCircle size={16} className="text-gray-400 mr-3"/>
                                <div>
                                    <p className="font-medium text-soft-black capitalize">{item.acao.replace(/_/g, ' ')}</p>
                                    <p className="text-xs text-gray-500">{item.contrato?.titulo || item.valor}</p>
                                </div>
                            </div>
                            <span className="text-xs text-gray-400">{new Date(item.data).toLocaleDateString()}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-600">Ainda não há atividades recentes para exibir.</p>
            )}
        </Card>
      </div>
      <FloatingChatWidget />
    </div>
  );
};

export default DashboardPage;
