import React, { useState, useRef, useEffect } from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Mic, MicOff, Copy } from 'lucide-react';
import { GoogleGenAI, LiveSession, LiveServerMessage, Blob, Modality } from '@google/genai';

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

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


const TranscriptionPage: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [finalTranscription, setFinalTranscription] = useState('');

  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const transcriptionRef = useRef('');

  const startRecording = async () => {
    if (!ai) {
      alert("Funcionalidade de IA desativada. Verifique a configuração da chave de API.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      setIsRecording(true);
      setFinalTranscription('');
      setTranscription('');
      transcriptionRef.current = '';

      sessionPromiseRef.current = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            console.log('Live session opened');
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            const source = audioContextRef.current.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob: Blob = createBlob(inputData);
              sessionPromiseRef.current?.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current.destination);
            scriptProcessorRef.current = scriptProcessor;
          },
          onmessage: (message: LiveServerMessage) => {
            if (message.serverContent?.inputTranscription) {
              const text = message.serverContent.inputTranscription.text;
              transcriptionRef.current += text;
              setTranscription(transcriptionRef.current);
            }
            if (message.serverContent?.turnComplete) {
              setFinalTranscription(prev => prev + transcriptionRef.current + ' ');
              transcriptionRef.current = '';
              setTranscription('');
            }
          },
          onerror: (e: ErrorEvent) => {
            console.error('Live session error:', e);
            alert('Ocorreu um erro na conexão. Tente novamente.');
            stopRecording();
          },
          onclose: (e: CloseEvent) => {
            console.log('Live session closed');
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
        },
      });

    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Não foi possível acessar o microfone. Por favor, verifique suas permissões.");
    }
  };

  const stopRecording = () => {
    if (!isRecording) return;
    setIsRecording(false);

    sessionPromiseRef.current?.then(session => session.close());
    sessionPromiseRef.current = null;

    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    mediaStreamRef.current = null;

    scriptProcessorRef.current?.disconnect();
    scriptProcessorRef.current = null;
    audioContextRef.current?.close().catch(console.error);
    audioContextRef.current = null;

    if (transcriptionRef.current) {
        setFinalTranscription(prev => prev + transcriptionRef.current);
    }
    transcriptionRef.current = '';
    setTranscription('');
  };
  
  const createBlob = (data: Float32Array): Blob => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
        int16[i] = data[i] * 32768;
    }
    return {
        data: encode(new Uint8Array(int16.buffer)),
        mimeType: 'audio/pcm;rate=16000',
    };
  }

  const handleCopy = () => {
    const textToCopy = finalTranscription + transcription;
    navigator.clipboard.writeText(textToCopy);
    alert('Transcrição copiada!');
  }

  useEffect(() => {
    // Cleanup on component unmount
    return () => {
      stopRecording();
    };
  }, []);

  const currentTranscript = finalTranscription + transcription;

  return (
    <div>
      <h1 className="text-3xl font-bold text-soft-black mb-6">Transcrição Rápida com IA</h1>
      <Card className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center">
          <Button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-24 h-24 rounded-full text-white ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-brand-green hover:bg-green-600'}`}
            disabled={!ai}
          >
            {isRecording ? <MicOff size={40} /> : <Mic size={40} />}
          </Button>
          <p className="mt-4 font-semibold text-lg">{isRecording ? 'Gravando...' : 'Clique para iniciar a gravação'}</p>
          <p className="text-sm text-gray-500">{ai ? 'Sua fala será convertida em texto aqui.' : 'Funcionalidade de IA indisponível.'}</p>

          <div className="w-full mt-8 p-4 bg-gray-100 rounded-md min-h-[150px] relative">
            <p className="text-gray-800 whitespace-pre-wrap">
                {currentTranscript}
                {isRecording && <span className="inline-block w-2 h-5 bg-brand-blue animate-pulse ml-1" />}
            </p>
            {currentTranscript && (
                <button onClick={handleCopy} className="absolute top-2 right-2 p-2 rounded-md hover:bg-gray-200">
                    <Copy size={18} className="text-gray-600"/>
                </button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TranscriptionPage;