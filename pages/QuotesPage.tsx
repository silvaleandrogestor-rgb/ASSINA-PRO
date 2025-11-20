import React, { useState, useEffect } from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { Plus, Bot } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { criarOrcamento, listarOrcamentos, registrarHistorico } from '../lib/api';
import { Quote } from '../types';
import { GoogleGenAI } from '@google/genai';
import { useAppContext } from '../contexts/AppContext';

function getApiKey(): string | undefined {
  return process.env.API_KEY;
}

let ai: GoogleGenAI | undefined;
if (getApiKey()) {
  ai = new GoogleGenAI({ apiKey: getApiKey()! });
} else {
  console.warn("Chave da API do Google não encontrada para Orçamentos.");
}

const QuoteModal = ({ 
  onClose, onSave 
}: { 
  onClose: () => void; onSave: () => void;
}) => {
  const [formData, setFormData] = useState({ nome_cliente: '', produto_servico: '', prazos: '', valor: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const { checkPermissionAndAct } = useAppContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
  };

  const handleCreateQuote = async () => {
    const action = async () => {
        if (!ai) {
            alert("IA não disponível.");
            return { error: { message: "IA não disponível." } };
        }
        setIsLoading(true);
        let result = { error: null };
        const prompt = `Crie uma descrição detalhada e profissional para um orçamento com as seguintes informações: Cliente: ${formData.nome_cliente}, Produto/Serviço: ${formData.produto_servico}, Prazos: ${formData.prazos}, Valor: R$ ${formData.valor}.`;
        try {
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            if (!response.text) throw new Error("A IA não retornou uma descrição.");
            
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { error } = await criarOrcamento(user.id, {
                    nome_cliente: formData.nome_cliente,
                    produto_servico: formData.produto_servico,
                    detalhes: response.text,
                    valor: formData.valor,
                });
                if(error) throw error;
                await registrarHistorico(user.id, null, 'criou_orcamento', `Cliente: ${formData.nome_cliente}`);
                alert('Orçamento criado com sucesso!');
                onSave();
                onClose();
            }
        } catch (error: any) {
            console.error(error);
            alert("Ocorreu um erro ao gerar o orçamento.");
            result.error = error;
        } finally {
            setIsLoading(false);
        }
        return result;
    };
    
    checkPermissionAndAct(action, 'orcamento');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">Gerar Orçamento com IA</h2>
        <form onSubmit={(e) => { e.preventDefault(); handleCreateQuote(); }} className="space-y-4">
          <Input name="nome_cliente" label="Nome do cliente" onChange={handleChange} required disabled={isLoading} />
          <Input name="produto_servico" label="Produto/Serviço" onChange={handleChange} required disabled={isLoading} />
          <Input name="prazos" label="Prazos" onChange={handleChange} required disabled={isLoading} />
          <Input name="valor" label="Valor estimado (R$)" type="number" onChange={handleChange} required disabled={isLoading} />
          <div className="flex justify-end items-center gap-2 mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Cancelar</Button>
            <Button type="submit" className="flex items-center gap-2" disabled={isLoading || !ai}>
              {isLoading ? 'Gerando...' : <><Bot size={18} /> Gerar Orçamento</>}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const QuotesPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const { checkPermissionAndAct } = useAppContext();

  const fetchQuotes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await listarOrcamentos(user.id);
      if (data) setQuotes(data);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const openQuoteModal = () => {
      checkPermissionAndAct(() => {
          setIsModalOpen(true);
          return Promise.resolve({ error: null });
      }, 'orcamento');
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-soft-black">Orçamentos</h1>
        <Button onClick={openQuoteModal}>
          <Plus size={18} className="mr-2" />
          Gerar Orçamento com IA
        </Button>
      </div>
      <Card>
        {quotes.length > 0 ? (
          <div className="space-y-4">
            {quotes.map(quote => (
              <div key={quote.id} className="p-4 border rounded-md hover:bg-gray-50 flex justify-between items-center">
                <div>
                  <h3 className="font-bold">{quote.produto_servico} para {quote.nome_cliente}</h3>
                  <p className="text-sm text-gray-500">Valor: R$ {quote.valor.toFixed(2)}</p>
                </div>
                <Button variant="outline" size="sm">Ver Detalhes</Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Nenhum orçamento encontrado.</p>
        )}
      </Card>
      {isModalOpen && <QuoteModal onClose={() => setIsModalOpen(false)} onSave={fetchQuotes} />}
    </div>
  );
};

export default QuotesPage;