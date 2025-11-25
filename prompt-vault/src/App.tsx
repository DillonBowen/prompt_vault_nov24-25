import { useState, useMemo, useEffect } from 'react';
import { Prompt } from './types/prompt';
import { ChatInterface } from './components/ChatInterface';
import { PromptEditor } from './components/PromptEditor';
import { PromptCard } from './components/PromptCard';

// --- Main App Component ---
function App() {
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [activePrompt, setActivePrompt] = useState<Prompt | null>(null);
    const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Filters & Sorting
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [showVipOnly, setShowVipOnly] = useState(false);
    const [sortBy, setSortBy] = useState<'newest' | 'usage' | 'alpha'>('newest');

    // Metadata State (Favorites & Usage)
    const [favorites, setFavorites] = useState<Set<string>>(new Set());
    const [usageCounts, setUsageCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await fetch('/api/prompts');
                if (!response.ok) throw new Error('Failed to fetch prompts');
                const data = await response.json();
                setPrompts(data);
            } catch (error) {
                console.error("Failed to load prompts:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // --- Actions ---

    const handleSavePrompt = async (promptData: Omit<Prompt, 'id' | 'usageCount' | 'isFavorite'>) => {
        try {
            if (editingPrompt) {
                // Update existing
                const response = await fetch(`/api/prompts/${editingPrompt.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(promptData)
                });
                const updatedPrompt = await response.json();

                setPrompts(prev => prev.map(p => p.id === updatedPrompt.id ? updatedPrompt : p));
            } else {
                // Create new
                const newPromptPayload = {
                    ...promptData,
                    id: `custom-${Date.now()}`,
                    isFavorite: false,
                    usageCount: 0,
                    isVip: false
                };

                const response = await fetch('/api/prompts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newPromptPayload)
                });
                const newPrompt = await response.json();

                setPrompts(prev => [newPrompt, ...prev]);
            }

            setEditingPrompt(null);
            setIsCreating(false);
        } catch (error) {
            console.error("Failed to save prompt:", error);
            alert("Failed to save prompt. Please try again.");
        }
    };

    const handleDeletePrompt = async (prompt: Prompt) => {
        try {
            const response = await fetch(`/api/prompts/${prompt.id}`, { method: 'DELETE' });
            if (response.ok) {
                setPrompts(prev => prev.filter(p => p.id !== prompt.id));
            }
        } catch (error) {
            console.error("Failed to delete prompt:", error);
        }
    };

    const handleToggleFavorite = async (prompt: Prompt) => {
        try {
            // Optimistic update
            const isFav = favorites.has(prompt.id);
            const newFavorites = new Set(favorites);
            if (isFav) newFavorites.delete(prompt.id);
            else newFavorites.add(prompt.id);
            setFavorites(newFavorites);

            await fetch('/api/favorites', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: prompt.id })
            });
        } catch (error) {
            console.error("Failed to toggle favorite:", error);
        }
    };

    const handleIncrementUsage = async (prompt: Prompt) => {
        navigator.clipboard.writeText(prompt.prompt);

        try {
            // Optimistic update
            const newCounts = { ...usageCounts, [prompt.id]: (usageCounts[prompt.id] || 0) + 1 };
            setUsageCounts(newCounts);

            await fetch('/api/usage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: prompt.id })
            });
        } catch (error) {
            console.error("Failed to increment usage:", error);
        }
    };

    // --- Derived State ---

    const categories = useMemo(() => {
        const cats = new Set(prompts.map(p => p.category));
        return ['All', ...Array.from(cats).sort()];
    }, [prompts]);

    const processedPrompts = useMemo(() => {
        let result = prompts.map(p => ({
            ...p,
            isFavorite: favorites.has(p.id),
            usageCount: usageCounts[p.id] || 0,
            isVip: p.id.startsWith('vip-')
        }));

        // Search
        const query = searchQuery.toLowerCase();
        if (query) {
            result = result.filter(p =>
                p.act.toLowerCase().includes(query) ||
                p.prompt.toLowerCase().includes(query) ||
                p.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // Category Filter
        if (selectedCategory !== 'All') {
            result = result.filter(p => p.category === selectedCategory);
        }

        // Favorites Filter
        if (showFavoritesOnly) {
            result = result.filter(p => p.isFavorite);
        }

        // VIP Filter
        if (showVipOnly) {
            result = result.filter(p => p.isVip);
        }

        // Sorting
        result.sort((a, b) => {
            // VIPs always on top unless sorting by something else specific? 
            // Let's keep VIPs on top for 'newest' and 'alpha' but respect 'usage'
            if (sortBy !== 'usage') {
                if (a.isVip && !b.isVip) return -1;
                if (!a.isVip && b.isVip) return 1;
            }

            if (sortBy === 'usage') return b.usageCount - a.usageCount;
            if (sortBy === 'alpha') return a.act.localeCompare(b.act);

            // Newest (Custom prompts first, then by ID/Index)
            if (a.id.startsWith('custom-') && !b.id.startsWith('custom-')) return -1;
            if (!a.id.startsWith('custom-') && b.id.startsWith('custom-')) return 1;
            return 0;
        });

        return result;
    }, [prompts, searchQuery, selectedCategory, showFavoritesOnly, showVipOnly, sortBy, favorites, usageCounts]);

    return (
        <div className="min-h-screen text-slate-100 font-sans p-4 sm:p-8 selection:bg-cyan-500/30">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-center mb-8 pt-8 gap-6">
                    <div className="text-center md:text-left">
                        <h1 className="text-5xl font-extrabold tracking-tight mb-2">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient-x">
                                Prompt Vault
                            </span>
                        </h1>
                        <p className="text-slate-400 font-light">
                            Unlock the power of AI with expert personas.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsCreating(true)}
                            className="bg-cyan-500 hover:bg-cyan-400 text-white px-6 py-3 rounded-full font-semibold transition-all flex items-center space-x-2 shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                            <span>New Persona</span>
                        </button>
                    </div>
                </header>

                {/* Controls Bar */}
                <div className="mb-8 space-y-4">
                    {/* Search */}
                    <div className="max-w-3xl mx-auto relative group z-30">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 blur"></div>
                        <div className="relative bg-[#0a192f]/90 backdrop-blur-xl rounded-full flex items-center shadow-2xl">
                            <div className="pl-6 pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search for a persona, role, or task..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent text-lg text-slate-100 placeholder-slate-500 rounded-full py-4 pl-4 pr-6 focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Filters & Sort */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 custom-scrollbar">
                            <button
                                onClick={() => setShowVipOnly(!showVipOnly)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all border ${showVipOnly ? 'bg-amber-500/20 border-amber-500/50 text-amber-200' : 'bg-transparent border-white/10 text-slate-400 hover:bg-white/10'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                <span>VIP</span>
                            </button>
                            <button
                                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all border ${showFavoritesOnly ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200' : 'bg-transparent border-white/10 text-slate-400 hover:bg-white/10'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                <span>Favorites</span>
                            </button>
                            <div className="h-6 w-px bg-white/10 mx-2"></div>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="bg-[#0a192f] border border-white/20 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                            >
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-500">Sort by:</span>
                            <div className="flex bg-[#0a192f] rounded-lg p-1 border border-white/10">
                                <button
                                    onClick={() => setSortBy('newest')}
                                    className={`px-3 py-1.5 rounded-md text-sm transition-all ${sortBy === 'newest' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Newest
                                </button>
                                <button
                                    onClick={() => setSortBy('usage')}
                                    className={`px-3 py-1.5 rounded-md text-sm transition-all ${sortBy === 'usage' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                >
                                    Most Used
                                </button>
                                <button
                                    onClick={() => setSortBy('alpha')}
                                    className={`px-3 py-1.5 rounded-md text-sm transition-all ${sortBy === 'alpha' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                                >
                                    A-Z
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Grid */}
                <main>
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {processedPrompts.map(prompt => (
                                    <PromptCard
                                        key={prompt.id}
                                        prompt={prompt}
                                        onChat={setActivePrompt}
                                        onCopy={handleIncrementUsage}
                                        onToggleFavorite={handleToggleFavorite}
                                        onDelete={handleDeletePrompt}
                                        onEdit={setEditingPrompt}
                                    />
                                ))}
                            </div>
                            {processedPrompts.length === 0 && (
                                <div className="text-center py-16">
                                    <div className="text-6xl mb-4">🔍</div>
                                    <p className="text-slate-400 text-xl">No prompts found matching your criteria.</p>
                                    <button
                                        onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setShowFavoritesOnly(false); }}
                                        className="mt-4 text-cyan-400 hover:underline"
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </main>

                <footer className="text-center mt-20 pb-8 text-slate-500 text-sm">
                    <p>© 2025 Prompt Vault. Engineered for Excellence.</p>
                </footer>
            </div>

            {/* Modals */}
            {activePrompt && (
                <ChatInterface prompt={activePrompt} onClose={() => setActivePrompt(null)} />
            )}

            {(isCreating || editingPrompt) && (
                <PromptEditor
                    initialPrompt={editingPrompt || undefined}
                    onSave={handleSavePrompt}
                    onClose={() => { setIsCreating(false); setEditingPrompt(null); }}
                />
            )}
        </div>
    );
}

export default App;
