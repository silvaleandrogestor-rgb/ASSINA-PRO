import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useNavigate } from 'react-router-dom';

const TermsOfServicePage: React.FC = () => {
    const navigate = useNavigate();
    // A dummy handler since Header expects one, though it's less relevant on a static page.
    const handleSignUpClick = () => navigate('/');

    return (
        <div className="bg-white">
            <Header onSignUpClick={handleSignUpClick} forceScrolled />
            <main className="pt-24 pb-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto prose lg:prose-lg">
                        <h1>Termos de Serviço</h1>
                        <p className="lead">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

                        <h2>1. Aceitação dos Termos</h2>
                        <p>
                            Ao acessar e usar a plataforma Assina Pro ("Plataforma"), você concorda em cumprir e estar vinculado a estes Termos de Serviço. Se você não concorda com estes termos, não deve usar nossos serviços.
                        </p>

                        <h2>2. Descrição do Serviço</h2>
                        <p>
                            A Assina Pro fornece uma plataforma SaaS para criação de contratos e orçamentos com auxílio de Inteligência Artificial, assinatura digital de documentos com validade jurídica e gerenciamento de documentos.
                        </p>

                        <h2>3. Contas de Usuário</h2>
                        <p>
                            Para acessar a maioria dos recursos, você must se registrar e manter uma conta ativa. Você é responsável por todas as atividades que ocorrem em sua conta e concorda em manter a segurança e o sigilo de seu nome de usuário e senha.
                        </p>

                        <h2>4. Planos e Pagamentos</h2>
                        <p>
                            Oferecemos planos de assinatura mensais e serviços avulsos. Os pagamentos são devidos no início de cada ciclo de faturamento. As taxas são não reembolsáveis, exceto quando exigido por lei.
                        </p>

                        <h2>5. Uso Aceitável</h2>
                        <p>
                            Você concorda em não usar a Plataforma para qualquer finalidade ilegal ou proibida por estes termos. Você não pode usar os serviços de qualquer maneira que possa danificar, desabilitar, sobrecarregar ou prejudicar nossos servidores ou redes.
                        </p>
                        
                        <h2>6. Limitação de Responsabilidade</h2>
                        <p>
                            A Assina Pro não será responsável por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo, sem limitação, perda de lucros, dados ou outras perdas intangíveis.
                        </p>

                        <h2>7. Alterações nos Termos</h2>
                        <p>
                            Reservamo-nos o direito de modificar estes termos a qualquer momento. Notificaremos sobre quaisquer alterações, publicando os novos termos na Plataforma. Seu uso continuado dos serviços após tais alterações constitui sua aceitação dos novos Termos de Serviço.
                        </p>

                        <h2>8. Contato</h2>
                        <p>
                            Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco através da seção "Contato" em nossa página inicial.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default TermsOfServicePage;