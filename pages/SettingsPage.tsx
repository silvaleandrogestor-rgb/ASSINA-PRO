import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
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
    });
    const [loading, setLoading] = useState(true);
    
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await getPerfilEmpresa(user.id);
                if (data) {
                    setProfile(data);
                    if (data.logo_url) {
                        setLogoPreview(data.logo_url);
                    }
                }
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await salvarPerfilEmpresa(user.id, { ...profile, logoFile });
            alert('Perfil salvo com sucesso!');
        }
    };
    
    if (loading) {
        return <p>Carregando configurações...</p>;
    }

  return (
    <div>
        <h1 className="text-3xl font-bold text-soft-black mb-6">Configurações</h1>

        <Card>
            <h2 className="text-xl font-bold text-soft-black mb-4">Dados da Empresa</h2>
            <form className="space-y-4" onSubmit={handleSaveProfile}>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo da Empresa</label>
                    <div className="mt-1 flex items-center space-x-6">
                        <div className="shrink-0">
                            {logoPreview ? (
                                <img className="h-16 w-16 object-cover rounded-full" src={logoPreview} alt="Logo preview" />
                            ) : (
                                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                    <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        <label htmlFor="logo-upload">
                            <span className="cursor-pointer rounded-md border border-gray-300 bg-white py-2 px-3 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50">
                                Alterar
                            </span>
                            <input id="logo-upload" name="logo-upload" type="file" className="sr-only" onChange={handleLogoChange} accept="image/png, image/jpeg" />
                        </label>
                    </div>
                </div>
                <Input label="Nome da empresa" name="nome_empresa" value={profile.nome_empresa || ''} onChange={handleProfileChange} />
                <Input label="CNPJ / CPF" name="identificador" value={profile.identificador || ''} onChange={handleProfileChange} />
                <Input label="Endereço" name="endereco" value={profile.endereco || ''} onChange={handleProfileChange} />
                <Input label="Telefone" name="telefone" value={profile.telefone || ''} onChange={handleProfileChange} />
                <div className="pt-2">
                    <Button type="submit">Salvar Alterações</Button>
                </div>
            </form>
        </Card>
    </div>
  );
};

export default SettingsPage;