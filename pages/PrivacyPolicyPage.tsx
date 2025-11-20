import React from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicyPage: React.FC = () => {
    const navigate = useNavigate();
    const handleSignUpClick = () => navigate('/');

    return (
        <div className="bg-white">
            <Header onSignUpClick={handleSignUpClick} forceScrolled />
            <main className="pt-24 pb-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto prose lg:prose-lg">
                        <h1>Política de Privacidade</h1>
                        <p className="lead">Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>

                        <h2>1. Introdução</h2>
                        <p>
                            A sua privacidade é importante para nós. Esta Política de Privacidade explica como a Assina Pro coleta, usa, compartilha e protege suas informações pessoais quando você utiliza nossa plataforma.
                        </p>

                        <h2>2. Coleta de Informações</h2>
                        <p>
                            Coletamos informações que você nos fornece diretamente, como quando você cria uma conta (nome, e-mail, telefone, senha), bem como informações geradas pelo uso de nossos serviços, como dados de contratos, assinaturas e logs de acesso (endereço IP, tipo de navegador).
                        </p>

                        <h2>3. Uso das Informações</h2>
                        <p>
                            Utilizamos suas informações para:
                        </p>
                        <ul>
                            <li>Fornecer, operar e manter nossos serviços;</li>
                            <li>Processar transações e enviar informações relacionadas, como confirmações e faturas;</li>
                            <li>Melhorar e personalizar sua experiência;</li>
                            <li>Comunicar com você sobre produtos, serviços, ofertas e eventos;</li>
                            <li>Garantir a segurança e a integridade de nossa plataforma.</li>
                        </ul>

                        <h2>4. Compartilhamento de Informações</h2>
                        <p>
                            Não compartilhamos suas informações pessoais com terceiros, exceto nas seguintes circunstâncias:
                        </p>
                         <ul>
                            <li>Com seu consentimento explícito;</li>
                            <li>Para cumprir com obrigações legais ou solicitações governamentais;</li>
                            <li>Com provedores de serviços que atuam em nosso nome (ex: processadores de pagamento), que estão contratualmente obrigados a proteger suas informações;</li>
                            <li>Para proteger os direitos, a propriedade ou a segurança da Assina Pro, de nossos usuários ou do público.</li>
                        </ul>

                        <h2>5. Segurança dos Dados</h2>
                        <p>
                           Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações contra acesso, alteração, divulgação ou destruição não autorizada. No entanto, nenhum sistema é 100% seguro, e não podemos garantir segurança absoluta.
                        </p>
                        
                        <h2>6. Seus Direitos</h2>
                        <p>
                            Você tem o direito de acessar, corrigir ou excluir suas informações pessoais. Você pode gerenciar as informações da sua conta através das configurações da plataforma ou entrando em contato conosco.
                        </p>

                        <h2>7. Alterações nesta Política</h2>
                        <p>
                            Podemos atualizar esta Política de Privacidade de tempos em tempos. Notificaremos sobre quaisquer alterações publicando a nova política em nosso site.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PrivacyPolicyPage;