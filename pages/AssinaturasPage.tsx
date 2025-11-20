
import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import SignaturePad from '../components/SignaturePad';
import Input from '../components/ui/Input';
import { getPerfilEmpresa, salvarPerfilEmpresa } from '../lib/api';
import { supabase } from '../lib/supabase';
import { CompanyProfile } from '../types';

const AssinaturasPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'draw' | 'type' | 'stamp'>('draw');
    const [typedName, setTypedName] = useState('');
    const [profile, setProfile] = useState<Partial<CompanyProfile> | null>(null);
    const [loading, setLoading] = useState(true);

    const typedCanvasRef = useRef<HTMLCanvasElement>(null);

    const fetchProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await getPerfilEmpresa(user.id);
            setProfile(data);
            if (data?.tipo_assinatura) {
                setActiveTab(data.tipo_assinatura);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        if (activeTab === 'type' && typedCanvasRef.current) {
            const canvas = typedCanvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = 'black';
                ctx.font = '60px Parisienne';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(typedName || 'Sua assinatura', canvas.width / 2, canvas.height / 2);
            }
        }
    }, [typedName, activeTab]);

    const handleSaveSignature = async (signatureData: string, type: 'draw' | 'type' | 'stamp') => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const newProfile = { 
                ...profile, 
                assinatura_padrao: signatureData,
                tipo_assinatura: type,
            };
            const { error } = await salvarPerfilEmpresa(user.id, newProfile);
            if (error) {
                alert('Erro ao salvar assinatura.');
            } else {
                alert('Assinatura padrão salva com sucesso!');
                fetchProfile();
            }
        }
    };
    
    const saveTypedSignature = () => {
        if (typedCanvasRef.current) {
            const dataUrl = typedCanvasRef.current.toDataURL('image/png');
            handleSaveSignature(dataUrl, 'type');
        }
    };
    
    const saveLogoAsSignature = () => {
        if (profile?.logo_url) {
            handleSaveSignature('logo', 'stamp');
        } else {
            alert("Você precisa primeiro fazer o upload de um logo nas Configurações > Perfil da Empresa.");
        }
    };

    if (loading) {
        return <p>Carregando...</p>;
    }

    return (
        <div>
            <h1 className="text-3xl font-bold text-soft-black mb-6">Minha Assinatura</h1>
            <Card>
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => setActiveTab('draw')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'draw' ? 'border-brand-green text-brand-green' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Desenhar</button>
                        <button onClick={() => setActiveTab('type')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'type' ? 'border-brand-green text-brand-green' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Digitar</button>
                        <button onClick={() => setActiveTab('stamp')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'stamp' ? 'border-brand-green text-brand-green' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Carimbo (Logo)</button>
                    </nav>
                </div>

                <div>
                    {activeTab === 'draw' && (
                        <div>
                            <h3 className="font-semibold mb-2">Desenhe sua assinatura:</h3>
                            <SignaturePad onSave={(sig) => handleSaveSignature(sig, 'draw')} />
                        </div>
                    )}
                    {activeTab === 'type' && (
                        <div>
                             <h3 className="font-semibold mb-2">Digite seu nome completo:</h3>
                             <Input value={typedName} onChange={(e) => setTypedName(e.target.value)} placeholder="Seu nome aqui" />
                             <canvas ref={typedCanvasRef} width={500} height={150} className="border rounded-md mt-4 bg-white" />
                             <div className="flex justify-end mt-2">
                                <Button onClick={saveTypedSignature} disabled={!typedName}>Salvar Assinatura</Button>
                             </div>
                        </div>
                    )}
                     {activeTab === 'stamp' && (
                        <div>
                             <h3 className="font-semibold mb-2">Usar o logo da empresa como carimbo:</h3>
                             <div className="p-4 border rounded-md bg-gray-50 flex flex-col items-center">
                                {profile?.logo_url ? (
                                    <img src={profile.logo_url} alt="Logo da empresa" className="max-h-24" />
                                ) : (
                                    <p className="text-gray-500">Nenhum logo encontrado. Faça o upload em "Configurações".</p>
                                )}
                             </div>
                             <div className="flex justify-end mt-4">
                                <Button onClick={saveLogoAsSignature} disabled={!profile?.logo_url}>Usar Logo como Assinatura</Button>
                             </div>
                        </div>
                    )}
                </div>
                
                 {profile?.assinatura_padrao && (
                    <div className="mt-8 border-t pt-6">
                        <h3 className="font-semibold mb-2">Assinatura Padrão Salva:</h3>
                        <div className="p-4 border rounded-md bg-white inline-block">
                            {profile.tipo_assinatura === 'stamp' && profile.logo_url ? (
                                <img src={profile.logo_url} alt="Assinatura de Carimbo" className="max-h-20" />
                            ) : profile.assinatura_padrao !== 'logo' ? (
                                <img src={profile.assinatura_padrao} alt="Assinatura Salva" className="max-h-20" />
                            ) : null}
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AssinaturasPage;
