import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Logo from '../components/ui/Logo';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { Mail, CheckCircle, X, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { loginUser, loginWithGoogle } from '../lib/api';

const ForgotPasswordModal = ({ onClose, onSend }: { onClose: () => void, onSend: (email: string) => Promise<void> }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await onSend(email);
        setLoading(false);
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={20} />
                </button>
                <h2 className="text-xl font-bold text-soft-black mb-2">Recuperar Senha</h2>
                <p className="text-gray-600 mb-6">Digite seu e-mail e enviaremos um link para você redefinir sua senha.</p>
                <form onSubmit={handleSend} className="space-y-4">
                    <Input 
                        label="E-mail"
                        id="reset-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seuemail@exemplo.com"
                        required
                        disabled={loading}
                    />
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Enviando...' : (
                            <>
                                <Mail size={18} className="mr-2" />
                                Enviar link de recuperação
                            </>
                        )}
                    </Button>
                </form>
            </Card>
        </div>
    );
};

const EmailSentModal = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
        <Card className="max-w-md w-full text-center">
             <CheckCircle size={48} className="mx-auto text-brand-green" />
             <h2 className="text-xl font-bold text-soft-black mt-4">E-mail Enviado!</h2>
             <p className="text-gray-600 mt-2">Verifique sua caixa de entrada (e a pasta de spam) e siga as instruções para redefinir sua senha.</p>
             <Button onClick={onClose} className="mt-6 w-full">
                OK
            </Button>
        </Card>
    </div>
);


const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
    const [isEmailSent, setIsEmailSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await loginUser(email, password);

        if (error) {
            setError(error.message);
        } else {
            // Supabase onAuthStateChange in App.tsx will handle navigation
        }
        setLoading(false);
    };
    
    const handleSignUpClick = () => {
        navigate('/', { state: { scrollTo: 'signup' } });
    };

    const handleSendRecoveryEmail = async (recoveryEmail: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
            redirectTo: `${window.location.origin}/#/redefinir-senha`,
        });

        if (error) {
            alert(`Erro ao enviar e-mail: ${error.message}`);
        } else {
            setIsForgotModalOpen(false);
            setIsEmailSent(true);
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Header onSignUpClick={handleSignUpClick} forceScrolled />
            <main className="flex-1 flex items-center justify-center bg-brand-blue p-4 py-28">
                <Card className="max-w-md w-full">
                    <div className="text-center mb-8">
                        <Link to="/">
                            <Logo className="h-12 justify-center" />
                        </Link>
                        <h1 className="mt-6 text-2xl font-bold text-soft-black">Acesse sua conta</h1>
                        <p className="text-gray-600">Bem-vindo de volta!</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-md bg-red-100 text-red-800 flex items-center gap-3">
                                <AlertCircle size={20} />
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}
                        <Input
                            label="E-mail"
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seuemail@exemplo.com"
                            required
                        />
                        <Input
                            label="Senha"
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Sua senha"
                            required
                        />
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-brand-green focus:ring-brand-green border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-gray-700">
                                    Manter-me logado
                                </label>
                            </div>
                            <button type="button" onClick={() => setIsForgotModalOpen(true)} className="font-medium text-brand-blue hover:text-blue-700">
                                Esqueceu a senha?
                            </button>
                        </div>
                        <Button type="submit" size="lg" className="w-full" disabled={loading}>
                            {loading ? 'Entrando...' : 'Entrar'}
                        </Button>
                    </form>
                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-400 mb-2">ou entre com</p>
                        <Button variant="outline" className="w-full" onClick={loginWithGoogle}>
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" className="w-5 h-5 mr-2" />
                            Entrar com Google
                        </Button>
                    </div>
                    <p className="mt-6 text-center text-sm text-gray-600">
                        Não tem uma conta?{' '}
                        <Link to="/" state={{ scrollTo: 'signup' }} className="font-medium text-brand-green hover:text-green-600">
                            Crie uma conta
                        </Link>
                    </p>
                </Card>
            </main>
            <Footer />

            {isForgotModalOpen && <ForgotPasswordModal onSend={handleSendRecoveryEmail} onClose={() => setIsForgotModalOpen(false)} />}
            {isEmailSent && <EmailSentModal onClose={() => setIsEmailSent(false)} />}
        </div>
    );
};

export default LoginPage;