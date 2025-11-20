import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Logo from '../components/ui/Logo';
import { DISCOVERY_OPTIONS } from '../constants';
import { ChevronDown, Bot, ShieldCheck, Send, DollarSign, Star, CheckCircle, AlertCircle } from 'lucide-react';
import Footer from '../components/layout/Footer';
import { registerUser, loginWithGoogle } from '../lib/api';
// FIX: Import supabase client
import { supabase } from '../lib/supabase';

const faqData = [
    {
      question: 'A assinatura digital tem validade jurídica?',
      answer: 'Sim! Nossas assinaturas eletrônicas seguem a legislação brasileira (Lei nº 14.063/2020) e são legalmente válidas para a grande maioria dos documentos.',
    },
    {
      question: 'Preciso instalar algum programa?',
      answer: 'Não! A Assina Pro é 100% online. Você e seus clientes podem assinar de qualquer dispositivo com acesso à internet, seja computador, tablet ou celular.',
    },
    {
      question: 'Meus dados estão seguros?',
      answer: 'Sim. Utilizamos criptografia de ponta e as melhores práticas de segurança do mercado para garantir a integridade e a confidencialidade dos seus documentos.',
    },
    {
        question: 'O que acontece se eu cancelar meu plano?',
        answer: 'Você poderá acessar e baixar todos os documentos que já foram assinados. No entanto, não será mais possível criar ou enviar novos contratos e orçamentos ilimitados.',
    }
];

const benefits = [
    {
        icon: <Bot size={32} className="text-brand-blue" />,
        title: 'IA Inteligente',
        description: 'Crie contratos e orçamentos profissionais em segundos, com cláusulas e formatação geradas por inteligência artificial.'
    },
    {
        icon: <ShieldCheck size={32} className="text-brand-green" />,
        title: 'Validade Jurídica',
        description: 'Assine digitalmente com total segurança e conformidade com a legislação brasileira, garantindo a validade dos seus documentos.'
    },
    {
        icon: <Send size={32} className="text-indigo-500" />,
        title: 'Simplicidade Total',
        description: 'Envie documentos para assinatura via WhatsApp ou link direto. Seus clientes assinam de qualquer lugar, sem precisar de cadastro.'
    },
    {
        icon: <DollarSign size={32} className="text-amber-500" />,
        title: 'O Melhor Custo-Benefício',
        description: 'Acesse recursos ilimitados com o plano mais acessível do Brasil. Sem pegadinhas e sem surpresas na fatura.'
    }
];

const testimonials = [
  {
    name: 'Júlia Mendes',
    title: 'Advogada',
    image: 'https://i.pravatar.cc/150?img=1',
    quote: 'A Assina Pro transformou a gestão de contratos no meu escritório. O plano mensal com recursos ilimitados é o melhor custo-benefício que já encontrei. Economizo horas toda semana!',
    rating: 5,
  },
   {
    name: 'Carlos Andrade',
    title: 'CEO de Startup',
    image: 'https://i.pravatar.cc/150?img=12',
    quote: 'Resolver orçamentos, contratos e assinaturas em uma única plataforma é incrível. A interface é limpa e o processo de assinatura para o cliente é super simples e rápido.',
    rating: 5,
  },
  {
    name: 'Fernanda Lima',
    title: 'Fotógrafa Freelancer',
    image: 'https://i.pravatar.cc/150?img=5',
    quote: 'Finalmente uma ferramenta que não complica! Envio meus contratos e orçamentos pelo WhatsApp e recebo a assinatura em minutos. O preço ilimitado é perfeito para mim.',
    rating: 5,
  },
];

const plans = [
  {
    id: 'creditos',
    name: 'Contrato Avulso',
    description: 'Para uma necessidade pontual.',
    price: '39,90',
    frequency: 'única',
    features: [
      '1 Contrato com IA',
      '1 Assinatura digital',
      'Validade jurídica',
      'Envio por link',
    ],
    popular: false,
    buttonText: 'Começar Agora',
    type: 'creditos',
    value: 39.90,
    desc: 'Compra de 5 créditos'
  },
  {
    id: 'mensal',
    name: 'Plano Mensal',
    description: 'Acesso total e ilimitado.',
    price: '29,90',
    frequency: 'mês',
    features: [
      'Contratos ILIMITADOS',
      'Orçamentos ILIMITADOS',
      'Assinaturas ILIMITADAS',
      'IA ilimitada',
      'Suporte prioritário',
    ],
    popular: true,
    buttonText: 'Assinar Plano',
    type: 'mensal',
    value: 29.90,
    desc: 'Assinatura Mensal AssinaPro'
  },
  {
    id: 'creditos_orcamento',
    name: 'Orçamento Avulso',
    description: 'Gere um orçamento profissional.',
    price: '1,90',
    frequency: 'única',
    features: [
      '1 Orçamento com IA',
      'Layout profissional',
      'Baixar em PDF',
      'Envio por WhatsApp',
    ],
    popular: false,
    buttonText: 'Começar Agora',
    type: 'creditos',
    value: 1.90,
    desc: 'Compra de 1 crédito para orçamento'
  },
];


const HomePage: React.FC = () => {
  const signUpRef = useRef<HTMLDivElement>(null);
  const benefitsRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (location.state?.scrollTo) {
        const targetId = location.state.scrollTo;
        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            window.history.replaceState({}, document.title);
        }
    }
  }, [location]);


  const handleFaqToggle = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const handleSignUpClick = () => {
    signUpRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBenefitsClick = () => {
    benefitsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMessage(null);
    const form = e.currentTarget;

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries()) as { [key: string]: string };

    if (data.password !== data.confirmPassword) {
      setFormMessage({ type: 'error', text: 'As senhas não coincidem.' });
      setIsSubmitting(false);
      return;
    }
    
    // On successful registration, onAuthStateChange in App.tsx will handle
    // profile/wallet creation and redirect the user.
    const { error } = await registerUser(data);

    if (error) {
      setFormMessage({ type: 'error', text: `Erro no cadastro: ${error.message}` });
    }
    // No success message here because App.tsx will redirect.
    setIsSubmitting(false);
  };

  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert('Mensagem enviada com sucesso! Entraremos em contato em breve.');
    e.currentTarget.reset();
  };

  const handlePlanClick = async (plan: typeof plans[0]) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        navigate('/planos');
    } else {
        const planDetails = {
            type: plan.type,
            price: plan.value,
            description: plan.desc
        };
        localStorage.setItem('plano_pendente', JSON.stringify(planDetails));
        signUpRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-white">
      <Header onSignUpClick={handleSignUpClick} />
      <main>
        {/* Hero Section */}
        <section className="relative bg-brand-blue pt-20 pb-20 lg:pt-32 lg:pb-32">
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl lg:text-6xl font-extrabold text-white font-poppins leading-tight">
              A plataforma mais barata do Brasil para criar e assinar contratos com validade jurídica.
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg lg:text-xl text-gray-200">
              Gere contratos profissionais com IA, assine digitalmente e envie pelo WhatsApp em segundos.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button size="lg" variant="primary" onClick={handleSignUpClick}>Criar Conta</Button>
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/20" onClick={handleBenefitsClick}>Conhecer a Plataforma</Button>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section ref={benefitsRef} id="benefits" className="py-20 bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-soft-black font-poppins">Por que escolher a Assina Pro?</h2>
              <p className="mt-4 text-lg text-gray-600">
                Simplificamos a burocracia para que você possa focar no que realmente importa: seu negócio.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="bg-gray-100 p-4 rounded-full animate-float transition-transform duration-300 hover:scale-110">
                    {benefit.icon}
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-soft-black">{benefit.title}</h3>
                  <p className="mt-2 text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof Section */}
        <section id="testimonials" className="py-20 bg-brand-blue">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-white font-poppins">O que nossos clientes dizem</h2>
                    <p className="mt-4 text-lg text-blue-200">
                        Junte-se a milhares de profissionais que confiam na Assina Pro para otimizar seus negócios.
                    </p>
                </div>
                <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col">
                            <div className="flex items-center mb-4">
                                <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" />
                                <div>
                                    <p className="font-bold text-soft-black">{testimonial.name}</p>
                                    <p className="text-sm text-gray-500">{testimonial.title}</p>
                                </div>
                            </div>
                            <div className="flex mb-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} size={16} className={i < testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />
                                ))}
                            </div>
                            <p className="text-gray-600 flex-1">"{testimonial.quote}"</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Plans Section */}
        <section id="planos" className="py-20 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-soft-black font-poppins">Planos pensados para o seu negócio</h2>
                    <p className="mt-4 text-lg text-gray-600">
                        Escolha o plano ideal para crescer. Sem asteriscos, sem limitações.
                    </p>
                </div>
                <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
                    {plans.map((plan) => {
                        const isPopular = plan.popular;
                        
                        return (
                            <div key={plan.name} className={`relative p-8 rounded-xl flex flex-col text-white shadow-lg transition-all duration-300 ${isPopular ? 'bg-brand-green transform lg:scale-110 shadow-2xl' : 'bg-brand-blue'}`}>
                                {isPopular && (
                                    <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-amber-400 text-soft-black font-bold text-xs py-1 px-3 rounded-full uppercase tracking-wider">
                                        Mais Popular
                                    </div>
                                )}
                                <div className="flex-grow">
                                    <h3 className={`text-2xl font-bold font-poppins text-white`}>{plan.name}</h3>
                                    <p className={`mt-2 text-sm ${isPopular ? 'text-green-100' : 'text-blue-200'}`}>{plan.description}</p>
                                    <div className="my-8">
                                        <span className={`text-5xl font-extrabold text-white`}>{`R$${plan.price}`}</span>
                                        <span className={`text-lg ml-1 ${isPopular ? 'text-green-100' : 'text-blue-200'}`}>/{plan.frequency}</span>
                                    </div>
                                    <ul className="space-y-4 text-left">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-center transition-transform duration-200 hover:scale-105">
                                                <CheckCircle size={20} className="mr-3 flex-shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <Button 
                                    onClick={() => handlePlanClick(plan as any)}
                                    size="lg" 
                                    className={`w-full mt-8 font-bold shadow-lg transition-transform duration-200 hover:-translate-y-1 ${isPopular ? 'bg-brand-blue text-white' : 'border border-white text-white bg-transparent hover:bg-white/20'}`}
                                >
                                    {plan.buttonText}
                                </Button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>

        {/* Signup Form Section */}
        <section ref={signUpRef} id="signup" className="py-20 bg-brand-blue">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                <div className="text-center mb-8">
                    <Logo className="h-12 justify-center" />
                    <h2 className="mt-4 text-3xl font-bold text-soft-black">Pronto para começar?</h2>
                    <p className="mt-2 text-gray-600">Crie sua conta e otimize seus negócios hoje mesmo.</p>
                </div>
                <form className="space-y-4" onSubmit={handleFormSubmit}>
                    {formMessage && (
                      <div className={`p-4 rounded-md flex items-center gap-3 ${formMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {formMessage.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        <p className="text-sm font-medium">{formMessage.text}</p>
                      </div>
                    )}
                    <Input name="fullName" label="Nome completo" placeholder="Seu nome completo" required />
                    <Input name="profissao" label="Profissão" placeholder="Sua profissão" required />
                    <Input name="telefone" label="Telefone WhatsApp" placeholder="(00) 00000-0000" type="tel" required/>
                    <Input name="email" label="E-mail" placeholder="seuemail@exemplo.com" type="email" required/>
                    <Input name="confirmPassword" label="Confirmar E-mail" placeholder="Confirme seu e-mail" type="email" required/>
                    <Input name="password" label="Crie sua senha" placeholder="Mínimo 8 caracteres" type="password" minLength={8} required/>
                    <div className="grid grid-cols-2 gap-4">
                      <Input name="idade" label="Idade" placeholder="Sua idade" type="number" required />
                      <div>
                        <label htmlFor="sexo" className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
                        <select id="sexo" name="sexo" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-blue text-soft-black" defaultValue="">
                          <option value="" disabled>Selecione...</option>
                          <option value="masculino">Masculino</option>
                          <option value="feminino">Feminino</option>
                          <option value="nao-informar">Prefiro não informar</option>
                        </select>
                      </div>
                    </div>
                    
                    <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? 'Criando conta...' : 'Criar minha conta grátis'}
                    </Button>
                </form>
                 <div className="mt-4 text-center">
                    <p className="text-sm text-gray-400 mb-2">ou entre com</p>
                    <Button variant="outline" className="w-full" onClick={loginWithGoogle}>
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" className="w-5 h-5 mr-2" />
                        Entrar com Google
                    </Button>
                </div>
            </div>
          </div>
        </section>
        
        <section id="faq" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-soft-black">Perguntas Frequentes</h2>
              <p className="mt-4 text-lg text-gray-600">
                Tudo o que você precisa saber sobre a Assina Pro.
              </p>
            </div>
            <div className="mt-12 max-w-3xl mx-auto">
              {faqData.map((item, index) => (
                <div key={index} className="border-b border-gray-200">
                  <button
                    onClick={() => handleFaqToggle(index)}
                    className="w-full text-left py-4 flex justify-between items-center"
                  >
                    <span className="text-lg font-medium text-soft-black">{item.question}</span>
                    <ChevronDown
                      className={`transform transition-transform duration-300 ${activeIndex === index ? 'rotate-180' : ''}`}
                      size={20}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      activeIndex === index ? 'max-h-96' : 'max-h-0'
                    }`}
                  >
                    <div className="p-4 bg-white my-2 rounded-md border-l-4 border-brand-green">
                        <p className="text-gray-600">{item.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        <section id="contato" className="py-20 bg-brand-blue">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-white">Entre em Contato</h2>
                        <p className="mt-4 text-lg text-blue-200">
                            Tem alguma dúvida ou sugestão? Envie uma mensagem para nós!
                        </p>
                    </div>
                    <form className="mt-12 bg-white p-8 rounded-xl shadow-lg border border-gray-200 space-y-4" onSubmit={handleContactSubmit}>
                        <Input id="contactName" label="Seu nome" placeholder="Nome completo" required />
                        <Input id="contactEmail" label="Seu e-mail" placeholder="seuemail@exemplo.com" type="email" required />
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Sua mensagem</label>
                            <textarea
                                id="message"
                                rows={5}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue bg-white text-soft-black"
                                placeholder="Escreva sua mensagem aqui..."
                                required
                            ></textarea>
                        </div>
                        <Button type="submit" size="lg" className="w-full">Enviar Mensagem</Button>
                    </form>
                </div>
            </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;