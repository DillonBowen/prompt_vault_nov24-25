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
    const [showSettings, setShowSettings] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async (text: string = input) => {
        if (!text.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate AI processing with variable delay
        const delay = Math.random() * 1000 + 1000; // 1-2 seconds
        setTimeout(() => {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `[Simulated Response from ${prompt.act}]\n\nI understand you said: "${text}". \n\nSince I am a demo agent without a live LLM connection, I can't generate a real response yet, but this interface is ready to be connected to an API like OpenAI or Anthropic!`,
                timestamp: Date.now() + 1
            };
            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, delay);
    };

    const quickReplies = [
        "Tell me more about your role.",
        "What are your key strengths?",
        "Can you give me an example task?",
        "Let's start a new project."
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-5xl h-[85vh] bg-[#0a192f] border border-white/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative">
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-md z-10">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center text-2xl border border-white/10 shadow-inner">
                            {prompt.icon}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                                {prompt.act}
                                {prompt.isVip && <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">VIP</span>}
                            </h3>
                            <div className="flex items-center space-x-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                <p className="text-xs text-slate-400">Online • AI Agent Session</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-cyan-500/20 text-cyan-400' : 'hover:bg-white/10 text-slate-400 hover:text-white'}`}
                            title="Settings"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-red-500/20 rounded-full transition-colors text-slate-400 hover:text-red-400"
                            title="Close Chat"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                {/* Settings Panel */}
                {showSettings && (
                    <div className="bg-black/40 backdrop-blur-md border-b border-white/10 p-4 animate-in slide-in-from-top-2">
                        <h4 className="text-sm font-semibold text-slate-300 mb-2">Model Settings</h4>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="text-xs text-slate-500 block mb-1">API Provider</label>
                                <select className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500">
                                    <option>Simulated (Demo)</option>
                                    <option disabled>OpenAI (Coming Soon)</option>
                                    <option disabled>Anthropic (Coming Soon)</option>
                                    <option disabled>Gemini (Coming Soon)</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="text-xs text-slate-500 block mb-1">Temperature</label>
                                <input type="range" min="0" max="1" step="0.1" className="w-full accent-cyan-500" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-black/20">
                    {messages.filter(msg => msg.role !== 'system').map((msg) => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                            <div className={`max-w-[80%] rounded-2xl p-4 shadow-lg ${msg.role === 'user'
                                ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-tr-none'
                                : 'bg-white/10 border border-white/5 text-slate-100 rounded-tl-none backdrop-blur-sm'
                                }`}>
                                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                                <div className={`text-[10px] mt-2 opacity-40 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start animate-in fade-in">
                            <div className="bg-white/5 border border-white/5 rounded-2xl rounded-tl-none p-4 flex space-x-2 items-center shadow-lg">
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Replies */}
                {!isTyping && messages.length < 4 && (
                    <div className="px-6 py-2 flex gap-2 overflow-x-auto custom-scrollbar">
                        {quickReplies.map((reply, i) => (
                            <button
                                key={i}
                                onClick={() => handleSend(reply)}
                                className="whitespace-nowrap px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-slate-400 hover:bg-cyan-500/10 hover:text-cyan-300 hover:border-cyan-500/30 transition-all"
                            >
                                {reply}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input Area */}
                <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-md">
                    <div className="flex space-x-4 relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={`Message ${prompt.act}...`}
                            className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-4 pl-5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 transition-all shadow-inner"
                            autoFocus
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isTyping}
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                        </button>
                    </div>
                    <div className="text-center mt-2">
                        <p className="text-[10px] text-slate-600">AI can make mistakes. Verify important information.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

