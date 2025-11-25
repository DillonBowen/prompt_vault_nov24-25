import React from 'react';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    role: 'admin' | 'user';
    onSwitchRole: (role: 'admin' | 'user') => void;
    stats: {
        favorites: number;
        usage: number;
    };
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, role, onSwitchRole, stats }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#0a192f]/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8 transform transition-all scale-100">
                <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        {role === 'admin' ? 'Admin Console' : 'User Profile'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="space-y-8">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-4 border-4 shadow-xl ${role === 'admin' ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' : 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'}`}>
                            {role === 'admin' ? '🛡️' : '👤'}
                        </div>
                        <h3 className="text-xl font-bold text-slate-100">{role === 'admin' ? 'System Administrator' : 'Standard User'}</h3>
                        <p className="text-sm text-slate-400">{role === 'admin' ? 'Full System Access' : 'View & Chat Access Only'}</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-white mb-1">{stats.favorites}</div>
                            <div className="text-xs text-slate-400 uppercase tracking-wider">Favorites</div>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold text-white mb-1">{stats.usage}</div>
                            <div className="text-xs text-slate-400 uppercase tracking-wider">Prompts Used</div>
                        </div>
                    </div>

                    {/* Role Switcher (For Demo) */}
                    <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Switch Role (Demo)</label>
                        <div className="flex bg-black/40 rounded-lg p-1">
                            <button
                                onClick={() => onSwitchRole('user')}
                                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${role === 'user' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                User
                            </button>
                            <button
                                onClick={() => onSwitchRole('admin')}
                                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${role === 'admin' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                Admin
                            </button>
                        </div>
                    </div>

                    {role === 'admin' && (
                        <div className="pt-4 border-t border-white/10">
                            <h4 className="text-sm font-bold text-slate-300 mb-3">Admin Actions</h4>
                            <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                                System Settings
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
