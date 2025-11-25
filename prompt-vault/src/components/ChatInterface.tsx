import React, { useState, useEffect, useRef } from 'react';
import { Prompt } from '../types/prompt';

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
}

interface ChatInterfaceProps {
    prompt: Prompt;
    onClose: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ prompt, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'system-1',
            role: 'system',
            content: `System: ${prompt.prompt}`,
            timestamp: Date.now()
        },
        {
            id: 'intro',
            role: 'assistant',
            content: `Hello! I am ready to act as ${prompt.act}. How can I help you today?`,
            timestamp: Date.now() + 1
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate AI processing
        setTimeout(() => {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `[Simulated Response from ${prompt.act}]\n\nI understand you said: "${userMsg.content}". \n\nSince I am a demo agent without a live LLM connection, I can't generate a real response yet, but this interface is ready to be connected to an API like OpenAI or Anthropic!`,
                timestamp: Date.now() + 1
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-4xl h-[80vh] bg-[#0a192f] border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-md">
                    <div className="flex items-center space-x-3">
                        <span className="text-3xl">{prompt.icon}</span>
                        <div>
                            <h3 className="text-xl font-bold text-slate-100">{prompt.act}</h3>
                            <p className="text-xs text-slate-400">AI Agent Session</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user'
                                    ? 'bg-cyan-600/20 border border-cyan-500/30 text-slate-100 rounded-tr-none'
                                    : msg.role === 'system'
                                        ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-200/80 text-sm font-mono w-full max-w-full'
                                        : 'bg-white/10 border border-white/10 text-slate-200 rounded-tl-none'
                                }`}>
                                {msg.role === 'system' && <div className="text-xs uppercase tracking-wider opacity-50 mb-1">System Instruction</div>}
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white/10 border border-white/10 rounded-2xl rounded-tl-none p-4 flex space-x-2 items-center">
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-md">
                    <div className="flex space-x-4">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type a message to the agent..."
                            className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                            autoFocus
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                            className="bg-cyan-500 hover:bg-cyan-400 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            <span>Send</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
