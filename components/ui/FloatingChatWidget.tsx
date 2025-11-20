import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import Button from './Button';

const FloatingChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ sender: 'user' | 'bot'; text: string }[]>([]);
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() === '') return;

        const newMessages = [...messages, { sender: 'user' as 'user', text: inputValue }];
        setMessages(newMessages);
        setInputValue('');

        // Simulate bot response
        setTimeout(() => {
            setMessages(prev => [...prev, { sender: 'bot' as 'bot', text: 'Olá! Sou o assistente virtual. Em que posso ajudar?' }]);
        }, 1500);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen ? (
                <div className="w-80 h-[450px] bg-white rounded-xl shadow-2xl flex flex-col border border-gray-200">
                    <header className="bg-brand-blue text-white p-4 rounded-t-xl flex justify-between items-center">
                        <h3 className="font-bold">Suporte Assina Pro</h3>
                        <button onClick={() => setIsOpen(false)} className="text-blue-200 hover:text-white">
                            <X size={20} />
                        </button>
                    </header>
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                        {messages.length === 0 && (
                             <div className="text-center text-sm text-gray-500 mt-4">
                                Inicie uma conversa.
                            </div>
                        )}
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`py-2 px-3 rounded-lg max-w-[80%] ${msg.sender === 'user' ? 'bg-brand-blue text-white' : 'bg-gray-200 text-soft-black'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                         <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="p-4 border-t flex items-center">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Digite sua mensagem..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        />
                        <Button type="submit" size="sm" className="ml-2">
                            <Send size={16} />
                        </Button>
                    </form>
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-16 h-16 bg-brand-blue text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-800 transition-transform duration-200 hover:scale-110"
                    aria-label="Abrir chat de suporte"
                >
                    <MessageSquare size={32} />
                </button>
            )}
        </div>
    );
};

export default FloatingChatWidget;
