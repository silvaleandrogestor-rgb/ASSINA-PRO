import React, { useState, useEffect } from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Plus, Bot, BrainCircuit } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { criarContrato, listarContratos, registrarHistorico } from '../lib/api';
import { Contract } from '../types';
import { GoogleGenAI } from '@google/genai';
import { useAppContext } from '../contexts/AppContext';

function getApiKey(): string | undefined {
  return process.env.API_KEY;
}

let ai: GoogleGenAI | undefined;
if (getApiKey()) {
  ai = new GoogleGenAI({ apiKey: getApiKey()! });
} else {
  console.warn("Chave da API do Google não encontrada. As funcionalidades de IA estão desativadas.");
}

const ContractModal = ({
    prompt, setPrompt, isLoading, generatedContract, handleGenerate, handleSave, setIsModalOpen
}: {
    prompt: string; setPrompt: (value: string) => void; isLoading: boolean;
    generatedContract: string; handleGenerate: (useAdvancedModel: boolean) => void;
    handleSave: () => Promise<any>; setIsModalOpen: (isOpen: boolean) => void;
}) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Criar Contrato com IA</h2>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Descreva o tipo de contrato que você precisa..."
                className="w-full h-32 p-3 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                disabled={isLoading}
            />
            {isLoading && <div className="text-center p-4 bg-gray-100 rounded-md"><p>Gerando seu contrato...</p></div>}
            {generatedContract && <textarea value={generatedContract} readOnly className="w-full h-48 p-3 bg-gray-50 border rounded-md"/>}
            <div className="flex justify-end items-center gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                {generatedContract && ai ? (
                    <Button variant="primary" onClick={handleSave} disabled={isLoading}>Salvar Contrato</Button>
                ) : (
                    <>
                        <Button onClick={() => handleGenerate(false)} disabled={isLoading || !prompt || !ai}><Bot size={18}/> Gerar Rápido</Button>
                        <Button variant="secondary" onClick={() => handleGenerate(true)} disabled={isLoading || !prompt || !ai}><BrainCircuit size={18}/> Gerar com IA Avançada</Button>
                    </>
                )}
            </div>
        </Card>
    </div>
);

const ContractsPage: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedContract, setGeneratedContract] = useState('');
    const [contracts, setContracts] = useState<Contract[]>([]);
    const { checkPermissionAndAct } = useAppContext();

    const fetchContracts = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data } = await listarContratos(user.id);
            if (data) setContracts(data);
        }
    };

    useEffect(() => {
        fetchContracts();
    }, []);

    const handleGenerate = async (useAdvancedModel: boolean) => {
        if (!prompt || !ai) return;
        setIsLoading(true);
        setGeneratedContract('');
        const modelName = useAdvancedModel ? 'gemini-3-pro-preview' : 'gemini-2.5-flash';
        try {
            const response = await ai.models.generateContent({ model: modelName, contents: `Gere um contrato para: ${prompt}` });
            if (response.text) setGeneratedContract(response.text);
            else setGeneratedContract("Não foi possível gerar o contrato.");
        } catch (error) {
            console.error(error);
            setGeneratedContract("Erro ao gerar o contrato.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && generatedContract) {
            const title = prompt.substring(0, 50);
            
            // The action to be executed if permission is granted
            const saveAction = async () => {
                const { data: newContract, error } = await criarContrato(user.id, title, generatedContract);
                if (newContract && !error) {
                    await registrarHistorico(user.id, newContract.id, "criou_contrato", null);
                    alert('Contrato salvo!');
                    setIsModalOpen(false);
                    setPrompt('');
                    setGeneratedContract('');
                    fetchContracts();
                }
                return { error };
            };

            // Check permission before saving
            checkPermissionAndAct(saveAction, 'criar_contrato');
        }
    };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-soft-black">Contratos</h1>
        <Button onClick={() => checkPermissionAndAct(() => { setIsModalOpen(true); return Promise.resolve({ error: null }); }, 'criar_contrato')}>
            <Plus size={18} className="mr-2" />
            Criar Contrato
        </Button>
      </div>
      <Card>
          {contracts.length > 0 ? (
            <div className="space-y-4">
              {contracts.map(contract => (
                <div key={contract.id} className="p-4 border rounded-md hover:bg-gray-50 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold">{contract.titulo}</h3>
                        <p className="text-sm text-gray-500">Status: <span className="font-medium capitalize">{contract.status}</span></p>
                    </div>
                    <Button variant="outline" size="sm">Ver Detalhes</Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Nenhum contrato encontrado.</p>
          )}
      </Card>
      {isModalOpen && (
        <ContractModal 
            prompt={prompt} setPrompt={setPrompt} isLoading={isLoading} generatedContract={generatedContract}
            handleGenerate={handleGenerate} handleSave={handleSave} setIsModalOpen={setIsModalOpen}
        />
      )}
    </div>
  );
};

export default ContractsPage;