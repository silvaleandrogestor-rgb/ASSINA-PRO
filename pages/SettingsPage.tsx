import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import SignaturePad from '../components/SignaturePad';
import { CompanyProfile } from '../types';
import { supabase } from '../lib/supabase';
import { getPerfilEmpresa, salvarPerfilEmpresa } from '../lib/api';

const SettingsPage: React.FC = () => {
    const [profile, setProfile] = useState<Partial<CompanyProfile>>({
        nome_empresa: '',
        identificador: '',
        endereco: '',
        telefone: '',
        logo_url: undefined,
        assinatura_padrao: undefined,
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'profile' | 'signature'>('profile');

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await getPerfilEmpresa(user.id);
                if (data) {
                    setProfile(data);
                }
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };
    
    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await salvarPerfilEmpresa(user.id, profile);
            alert('Perfil salvo com sucesso!');
        }
    };

    const handleSaveSignature = async (signature: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const newProfile = { ...profile, assinatura_padrao: signature };
            setProfile(newProfile);
            await salvarPerfilEmpresa(user.id, newProfile);
            alert('Assinatura salva com sucesso!');
            setActiveTab('profile');
        }
    }
    
    if (loading) {
        return <p>Carregando configurações...</p>;
    }

  return (
    <div>
        <h1 className="text-3xl font-bold text-soft-black mb-6">Configurações</h1>

        <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'profile' ? 'border-brand-green text-brand-green' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                    Perfil da Empresa
                </button>
                <button
                    onClick={() => setActiveTab('signature')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'signature' ? 'border-brand-green text-brand-green' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                >
                    Minha Assinatura
                </button>
            </nav>
        </div>

        {activeTab === 'profile' && (
            <Card>
                <h2 className="text-xl font-bold text-soft-black mb-4">Dados da Empresa</h2>
                <form className="space-y-4" onSubmit={handleSaveProfile}>
                    <Input label="Nome da empresa" name="nome_empresa" value={profile.nome_empresa || ''} onChange={handleProfileChange} />
                    <Input label="CNPJ / CPF" name="identificador" value={profile.identificador || ''} onChange={handleProfileChange} />
                    <Input label="Endereço" name="endereco" value={profile.endereco || ''} onChange={handleProfileChange} />
                    <Input label="Telefone" name="telefone" value={profile.telefone || ''} onChange={handleProfileChange} />
                    <div className="pt-2">
                        <Button type="submit">Salvar Alterações</Button>
                    </div>
                </form>
            </Card>
        )}
        
        {activeTab === 'signature' && (
             <Card>
                <h2 className="text-xl font-bold text-soft-black mb-4">Assinatura Digital Padrão</h2>
                <p className="text-gray-600 mb-4">Crie sua assinatura padrão que será usada nos contratos que você assinar.</p>
                <div className="flex flex-col md:flex-row gap-4 items-start">
                    <div className="flex-1">
                        <h3 className="font-semibold mb-2">Desenhe sua assinatura:</h3>
                         <SignaturePad onSave={handleSaveSignature} />
                    </div>
                    {profile.assinatura_padrao && (
                        <div className="md:w-1/3">
                            <h3 className="font-semibold mb-2">Assinatura Salva:</h3>
                            <div className="p-4 border rounded-md bg-white">
                                <img src={profile.assinatura_padrao} alt="Saved signature" className="mx-auto" />
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        )}
    </div>
  );
};

export default SettingsPage;