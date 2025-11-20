import React, { useState } from 'react';
import Header from '../components/layout/Header';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { iniciarCheckoutPagSeguro } from '../lib/api';
import { ArrowLeft } from 'lucide-react';

const PlansPage: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState<'mensal' | 'creditos' | null>(null);

    const handleCheckout = async (type: 'mensal' | 'creditos') => {
        setIsLoading(type);
        if (type === 'mensal') {
            await iniciarCheckoutPagSeguro('mensal', 29.90, 'Assinatura Mensal AssinaPro');
        } else {
            await iniciarCheckoutPagSeguro('creditos', 39.90, 'Pacote de 5 Créditos Avulsos AssinaPro');
        }
        // If the redirect doesn't happen (e.g., edge function fails), reset loading state.
        setIsLoading(null);
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header onSignUpClick={() => navigate('/')} forceScrolled />
            <main className="flex-1 flex flex-col items-center justify-center pt-24 pb-12 px-4">
                <div className="w-full max-w-3xl text-center">
                    <h1 className="text-2xl font-semibold text-gray-800 mb-10">Escolha seu plano para continuar.</h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Monthly Plan Card */}
                        <Card className="text-center flex flex-col justify-between p-8 h-full">
                            <p className="text-gray-600 flex-grow flex items-center justify-center min-h-[100px]">Acesso ilimitado a todos os recursos da plataforma.</p>
                            <Button 
                                className="mt-8 w-full !py-3 !text-base border-2 border-green-600 hover:bg-green-600" 
                                onClick={() => handleCheckout('mensal')}
                                disabled={!!isLoading}
                            >
                                {isLoading === 'mensal' ? 'Iniciando...' : 'Assinar Plano Mensal'}
                            </Button>
                        </Card>
                        
                        {/* Credits Card */}
                        <Card className="text-center flex flex-col justify-between p-8 h-full">
                            <p className="text-gray-600 flex-grow flex items-center justify-center min-h-[100px]">Compre 5 créditos para usar em ações individuais, como criar contratos ou orçamentos.</p>
                            <Button 
                                className="mt-8 w-full !py-3 !text-base border-2 border-green-600 hover:bg-green-600" 
                                onClick={() => handleCheckout('creditos')}
                                disabled={!!isLoading}
                            >
                                {isLoading === 'creditos' ? 'Iniciando...' : 'Comprar 5 Créditos'}
                            </Button>
                        </Card>
                    </div>

                     <div className="text-center mt-12">
                        <Button variant="ghost" onClick={() => navigate('/dashboard')} disabled={!!isLoading}>
                            <ArrowLeft size={16} className="mr-2" />
                            Voltar para o Dashboard
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PlansPage;