

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Logo from '../components/ui/Logo';
import { CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ResetPasswordPage: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Supabase handles the session recovery from the URL fragment.
        // The onAuthStateChange listener in App.tsx will detect the 'USER_UPDATED' or 'SIGNED_IN' event
        // which gives us the session needed to update the password.
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 8) {
            setError('A senha deve ter no mínimo 8 caracteres.');
            return;
        }
        if (password !== confirmPassword) {
            setError('As senhas não coincidem.');
            return;
        }
        setError('');
        setLoading(true);

        const { error: updateError } = await supabase.auth.updateUser({ password });

        if (updateError) {
            setError(`Erro ao redefinir a senha: ${updateError.message}`);
        } else {
            setIsSuccess(true);
        }
        setLoading(false);
    };

    if (isSuccess) {
        return (
             <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
                <Card className="max-w-md w-full text-center">
                    <CheckCircle size={48} className="mx-auto text-brand-green" />
                    <h1 className="text-2xl font-bold mt-4">Senha Redefinida!</h1>
                    <p className="text-gray-600 mt-2">Sua senha foi alterada com sucesso. Agora você já pode acessar sua conta.</p>
                    <Button onClick={() => navigate('/login')} className="mt-6 w-full">
                        Ir para o Login
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-brand-blue p-4">
            <Card className="max-w-md w-full">
                 <div className="text-center mb-8">
                    <Link to="/">
                        <Logo className="h-12 justify-center" />
                    </Link>
                    <h1 className="mt-6 text-2xl font-bold text-soft-black">Crie sua nova senha</h1>
                    <p className="text-gray-600">Escolha uma senha forte e segura.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nova Senha"
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        required
                        disabled={loading}
                    />
                    <Input
                        label="Confirmar Nova Senha"
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repita a nova senha"
                        required
                        disabled={loading}
                    />
                    {error && <p className="text-sm text-red-600">{error}</p>}
                    <Button type="submit" size="lg" className="w-full" disabled={loading}>
                        {loading ? 'Redefinindo...' : 'Redefinir Senha'}
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default ResetPasswordPage;