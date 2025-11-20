import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import SignaturePad from '../components/SignaturePad';
import Input from '../components/ui/Input';
import { Check, Download, Edit, Loader } from 'lucide-react';
import { getContratoById, salvarAssinatura, registrarHistorico } from '../lib/api';
import { Contract } from '../types';

const PublicSignaturePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [contract, setContract] = useState<Contract | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isSigning, setIsSigning] = useState(false);
    const [signatureType, setSignatureType] = useState<'draw' | 'type'>('draw');
    const [typedSignature, setTypedSignature] = useState('');
    const [isSigned, setIsSigned] = useState(false);

    useEffect(() => {
        if (id) {
            getContratoById(id).then(({ data, error }) => {
                if (error || !data) {
                    setError('Contrato não encontrado ou você não tem permissão para vê-lo.');
                } else {
                    setContract(data);
                    if (data.status === 'signed' && data.assinatura_cliente) {
                        setIsSigned(true);
                    }
                }
                setLoading(false);
            });
        } else {
            setError('ID do contrato inválido.');
            setLoading(false);
        }
    }, [id]);

    const handleSign = async (signatureData: string) => {
        if (!id) return;
        
        const { error } = await salvarAssinatura(id, signatureData);
        if (error) {
            alert("Erro ao salvar a assinatura.");
        } else {
            // Log as an anonymous action since we don't have a user session here
            await registrarHistorico(null, id, "assinatura_sem_login", "Assinatura recebida com sucesso");
            setIsSigned(true);
        }
    };
    
    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader className="animate-spin" /></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center"><p className="text-red-500">{error}</p></div>;

    if (isSigned) {
        return (
             <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <Card className="max-w-xl text-center">
                    <Check size={48} className="mx-auto text-brand-green bg-green-100 rounded-full p-2" />
                    <h1 className="text-2xl font-bold mt-4">Documento Assinado!</h1>
                    <p className="text-gray-600 mt-2">Uma cópia foi enviada para as partes envolvidas.</p>
                    <Button className="mt-6">
                        <Download size={18} className="mr-2" />
                        Baixar Cópia
                    </Button>
                </Card>
            </div>
        );
    }

  return (
    <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                <Logo />
                <div className="text-right">
                    <p className="font-semibold text-soft-black">ID do Documento: {id}</p>
                </div>
            </div>
        </header>
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-4">{contract?.titulo}</h1>
                <div className="prose max-w-none text-gray-700 border-t border-b py-6 my-6">
                    <p>{contract?.texto}</p>
                </div>
                
                {isSigning ? (
                     <Card className="bg-gray-50">
                        <h2 className="text-xl font-bold mb-4">Assine o Documento</h2>
                        <div className="flex items-center gap-4 mb-4">
                             <button onClick={() => setSignatureType('draw')} className={`px-4 py-2 rounded-md font-medium ${signatureType === 'draw' ? 'bg-brand-blue text-white' : 'bg-white border'}`}>Desenhar</button>
                             <button onClick={() => setSignatureType('type')} className={`px-4 py-2 rounded-md font-medium ${signatureType === 'type' ? 'bg-brand-blue text-white' : 'bg-white border'}`}>Digitar</button>
                        </div>

                        {signatureType === 'draw' ? (
                            <SignaturePad onSave={handleSign}/>
                        ) : (
                            <div>
                                <Input label="Digite seu nome completo para assinar" value={typedSignature} onChange={(e) => setTypedSignature(e.target.value)} />
                                <p className="mt-2 text-2xl font-serif text-gray-800">{typedSignature || "Sua assinatura aqui..."}</p>
                                <Button className="mt-4" onClick={() => handleSign(typedSignature)} disabled={!typedSignature}>Confirmar Assinatura</Button>
                            </div>
                        )}
                        <p className="text-xs text-gray-500 mt-4">Ao assinar, você concorda com os termos. Serão registrados seu endereço IP, data, hora e navegador.</p>

                    </Card>
                ) : (
                    <div className="text-center">
                        <Button size="lg" onClick={() => setIsSigning(true)}>
                            <Edit size={20} className="mr-2"/>
                            Assinar Documento
                        </Button>
                    </div>
                )}
            </div>
        </main>
    </div>
  );
};

export default PublicSignaturePage;