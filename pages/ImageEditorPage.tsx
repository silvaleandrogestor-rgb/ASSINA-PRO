import React, { useState, useRef } from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { UploadCloud, Wand2 } from 'lucide-react';
import { GoogleGenAI, Modality } from '@google/genai';

// This function provides a robust way to get the API key, preventing build-time errors.
function getApiKey(): string | undefined {
  // This placeholder is meant to be replaced by the build environment.
  // If it's replaced with nothing, the function will correctly return undefined.
  return process.env.API_KEY;
}

// Safely initialize the GoogleGenAI client.
const apiKey = getApiKey();
let ai: GoogleGenAI | undefined;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
} else {
  console.warn("Chave da API do Google não encontrada. As funcionalidades de IA estão desativadas.");
}

const ImageEditorPage: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!image || !prompt) return;

    if (!ai) {
      alert("Funcionalidade de IA desativada. Verifique a configuração da chave de API.");
      return;
    }
    
    setIsLoading(true);

    try {
        const base64ImageData = image.split(',')[1];
        const mimeType = image.match(/data:(.*);base64,/)?.[1] || 'image/jpeg';

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
                setImage(imageUrl);
                break; // Assuming only one image is returned
            }
        }
    } catch (err) {
        console.error("Error editing image with Gemini:", err);
        alert('Ocorreu um erro ao editar a imagem. Verifique o console para mais detalhes.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-soft-black mb-6">Editor de Imagem (Nano Banana)</h1>
      <Card>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg h-96 bg-gray-50">
            {image ? (
              <img src={image} alt="Uploaded" className="max-h-full max-w-full object-contain rounded-md" />
            ) : (
              <div className="text-center">
                <UploadCloud size={48} className="mx-auto text-gray-400" />
                <p className="mt-2 text-gray-600">Faça o upload de uma imagem</p>
                <Button size="sm" className="mt-4" onClick={() => fileInputRef.current?.click()}>
                  Selecionar arquivo
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            )}
          </div>
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Edite com a IA</h2>
            <p className="text-gray-600">Descreva as alterações que você deseja fazer na imagem. Por exemplo: "Adicione um filtro retrô" ou "Remova a pessoa no fundo".</p>
            <Input
              label="Comando de edição"
              placeholder="Ex: Adicione um chapéu de sol na pessoa"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={!image || isLoading}
            />
            <Button
              onClick={handleEdit}
              disabled={!image || !prompt || isLoading || !ai}
              className="w-full"
            >
              {isLoading ? 'Editando...' : (
                <>
                  <Wand2 size={18} className="mr-2" />
                  Aplicar Edição
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ImageEditorPage;