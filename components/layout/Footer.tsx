import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../ui/Logo';
import { ShieldCheck, Lock } from 'lucide-react';

const Footer: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        e.preventDefault();
        
        // If we're on a different page, navigate to the homepage first,
        // passing the scroll target in the state.
        if (location.pathname !== '/') {
            navigate('/', { state: { scrollTo: targetId } });
        } else {
            // If we're already on the homepage, just scroll smoothly.
            document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <footer className="bg-brand-blue text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Logo and About */}
                    <div className="md:col-span-1">
                        <Link to="/">
                            <Logo textColor="text-white" iconColor="#FFFFFF" />
                        </Link>
                        <p className="mt-4 text-sm text-blue-200">
                            A forma moderna de fechar negócios. Simples, rápido e seguro.
                        </p>
                    </div>

                    {/* Navigation Links */}
                    <div>
                        <h3 className="font-bold tracking-wider uppercase">Navegação</h3>
                        <nav className="mt-4 space-y-2">
                            <a href="#planos" onClick={(e) => handleNavClick(e, 'planos')} className="block text-blue-200 hover:text-white transition-colors">Planos</a>
                            <a href="#faq" onClick={(e) => handleNavClick(e, 'faq')} className="block text-blue-200 hover:text-white transition-colors">Perguntas Frequentes</a>
                            <a href="#contato" onClick={(e) => handleNavClick(e, 'contato')} className="block text-blue-200 hover:text-white transition-colors">Contato</a>
                        </nav>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="font-bold tracking-wider uppercase">Legal</h3>
                        <nav className="mt-4 space-y-2">
                            <Link to="/termos-de-servico" className="block text-blue-200 hover:text-white transition-colors">Termos de Serviço</Link>
                            <Link to="/politica-de-privacidade" className="block text-blue-200 hover:text-white transition-colors">Política de Privacidade</Link>
                        </nav>
                    </div>
                    
                    {/* Security Seals */}
                    <div>
                        <h3 className="font-bold tracking-wider uppercase">Segurança</h3>
                        <div className="mt-4 space-y-3">
                            <div className="flex items-center">
                                <ShieldCheck size={20} className="mr-2 text-brand-green" />
                                <span className="text-sm text-blue-200">Ambiente Seguro</span>
                            </div>
                             <div className="flex items-center">
                                <Lock size={20} className="mr-2 text-brand-green" />
                                <span className="text-sm text-blue-200">Certificado SSL</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-t border-blue-700 pt-8 text-center text-sm text-blue-200">
                    <p>&copy; {new Date().getFullYear()} Assina Pro. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;