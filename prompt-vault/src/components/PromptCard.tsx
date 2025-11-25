import React, { useState } from 'react';
import { Prompt } from '../types/prompt';

interface PromptCardProps {
    prompt: Prompt;
    onChat: (p: Prompt) => void;
    onCopy: (p: Prompt) => void;
    onToggleFavorite: (p: Prompt) => void;
    onDelete?: (p: Prompt) => void;
    onEdit?: (p: Prompt) => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({
    prompt,
    onChat,
    onCopy,
    onToggleFavorite,
    onDelete,
    onEdit
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        onCopy(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFavorite = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleFavorite(prompt);
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit?.(prompt);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this persona?')) {
            onDelete?.(prompt);
        }
    };

    const isCustom = prompt.id.startsWith('custom-');
    const isVip = prompt.isVip;

    return (
        <div
            onClick={() => onChat(prompt)}
            className={`group relative backdrop-blur-lg border rounded-2xl p-6 flex flex-col h-full transition-all duration-300 cursor-pointer overflow-hidden
                ${isVip
                    ? 'bg-gradient-to-br from-amber-900/20 to-black/40 border-amber-500/30 hover:border-amber-400/60 hover:shadow-2xl hover:shadow-amber-900/20'
                    : 'bg-white/5 border-white/10 hover:border-cyan-400/50 hover:bg-white/10 hover:shadow-2xl hover:shadow-cyan-900/20'
                }
            `}
        >
            <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500
                ${isVip ? 'from-amber-500/0 via-amber-500/0 to-amber-500/10' : 'from-cyan-500/0 via-cyan-500/0 to-cyan-500/5'}
            `} />

            {isVip && (
                <div className="absolute top-0 right-0 bg-gradient-to-bl from-amber-500 to-yellow-600 text-black text-[10px] font-bold px-3 py-1 rounded-bl-xl z-20 shadow-lg">
                    VIP
                </div>
            )}

            <div className="relative z-10 flex items-start justify-between mb-4">
                <div className="text-5xl filter drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">{prompt.icon}</div>
                <div className="flex items-center space-x-1">
                    {isCustom && (
                        <>
                            <button
                                onClick={handleEdit}
                                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-cyan-400 transition-colors opacity-0 group-hover:opacity-100"
                                title="Edit"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                            </button>
                            <button
                                onClick={handleDelete}
                                className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                title="Delete"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </>
                    )}
                    <button
                        onClick={handleFavorite}
                        className={`p-2 rounded-full hover:bg-white/10 transition-colors ${prompt.isFavorite ? 'text-yellow-400 opacity-100' : 'text-slate-400 opacity-0 group-hover:opacity-100 hover:text-yellow-400'}`}
                        title="Favorite"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    </button>
                    <button
                        onClick={handleCopy}
                        className="p-2 rounded-full bg-white/5 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400 transition-all opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0"
                        title="Copy Prompt"
                    >
                        {copied ?
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            : <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        }
                    </button>
                </div>
            </div>
            <h3 className="relative z-10 text-xl font-bold text-slate-100 mb-2 group-hover:text-cyan-300 transition-colors">{prompt.act}</h3>
            <p className="relative z-10 text-slate-400 text-sm flex-grow line-clamp-4 leading-relaxed group-hover:text-slate-300 transition-colors">{prompt.prompt}</p>
            <div className="relative z-10 mt-4 flex flex-wrap gap-2">
                {prompt.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 rounded-full bg-white/5 text-slate-500 border border-white/5 group-hover:border-cyan-500/30 group-hover:text-cyan-400 transition-colors">#{tag}</span>
                ))}
            </div>
            {prompt.usageCount > 0 && (
                <div className="absolute bottom-6 right-6 text-xs text-slate-600 group-hover:text-cyan-500/50 transition-colors">
                    Used {prompt.usageCount} times
                </div>
            )}
        </div>
    );
};
