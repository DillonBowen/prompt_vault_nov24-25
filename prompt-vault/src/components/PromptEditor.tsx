import React, { useState } from 'react';
import { Prompt } from '../types/prompt';

interface PromptEditorProps {
    initialPrompt?: Prompt;
    onSave: (prompt: Omit<Prompt, 'id' | 'usageCount' | 'isFavorite'>) => void;
    onClose: () => void;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({ initialPrompt, onSave, onClose }) => {
    const [act, setAct] = useState(initialPrompt?.act || '');
    const [promptContent, setPromptContent] = useState(initialPrompt?.prompt || '');
    const [tags, setTags] = useState(initialPrompt?.tags.join(', ') || '');
    const [icon, setIcon] = useState(initialPrompt?.icon || '✨');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            act,
            prompt: promptContent,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            icon,
            category: 'Custom'
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-[#0a192f]/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 transform transition-all scale-100">
                <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                            {initialPrompt ? 'Edit Persona' : 'Create New Persona'}
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">Define the behavior and identity of your AI agent.</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-4 gap-6">
                        <div className="col-span-3 group">
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-cyan-400 transition-colors">Persona Name (Act)</label>
                            <input
                                required
                                type="text"
                                value={act}
                                onChange={(e) => setAct(e.target.value)}
                                placeholder="e.g. Senior React Developer"
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent transition-all placeholder-slate-600"
                            />
                        </div>
                        <div className="group">
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-cyan-400 transition-colors">Icon</label>
                            <input
                                type="text"
                                value={icon}
                                onChange={(e) => setIcon(e.target.value)}
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-center text-2xl focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <div className="group">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-cyan-400 transition-colors">System Prompt</label>
                        <div className="relative">
                            <textarea
                                required
                                value={promptContent}
                                onChange={(e) => setPromptContent(e.target.value)}
                                rows={8}
                                placeholder="I want you to act as..."
                                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent transition-all resize-none placeholder-slate-600 leading-relaxed"
                            />
                            <div className="absolute bottom-3 right-3 text-[10px] text-slate-600 bg-black/40 px-2 py-1 rounded">
                                {promptContent.length} chars
                            </div>
                        </div>
                    </div>

                    <div className="group">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 group-focus-within:text-cyan-400 transition-colors">Tags (comma separated)</label>
                        <input
                            type="text"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="coding, react, web"
                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent transition-all placeholder-slate-600"
                        />
                    </div>

                    <div className="flex justify-end space-x-4 pt-6 border-t border-white/10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl text-slate-300 hover:bg-white/5 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-105 active:scale-95"
                        >
                            {initialPrompt ? 'Save Changes' : 'Create Persona'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

